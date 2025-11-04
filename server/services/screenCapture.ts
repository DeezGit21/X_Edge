import { type InsertTrade, type InsertTradeSample } from "@shared/schema";
import { createWorker } from 'tesseract.js';
import { Jimp } from 'jimp';
import { createRequire } from 'module';
import { randomUUID } from 'crypto';

const require = createRequire(import.meta.url);
const screenshot = require('screenshot-desktop');

interface DetectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ActiveTrade {
  id: string; // Database ID
  platformTradeId: string; // Asset_Timestamp_UUID
  startTime: Date;
  duration: string; // "1m", "5m", etc. - the trade duration
  asset: string;
  tradeType: 'CALL' | 'PUT';
  amount: number;
  samplesCollected: TradeColorSample[];
}

interface TradeColorSample {
  timeElapsed: number; // seconds since trade started
  chartColor: 'green' | 'red' | 'neutral';
  confidence: number;
  timestamp: Date;
}

interface CaptureConfig {
  onTradeDetected: (platformTradeId: string) => Promise<string>;
  onSampleCollected: (tradeId: string, sample: InsertTradeSample) => Promise<void>;
  onTradeCompleted?: (tradeId: string) => void;
  onAnalysisUpdate: (analysis: any) => void;
  selectedTimeframe?: string;
  onStatusUpdate?: (status: any) => void;
  detectionArea?: DetectionArea;
  platform?: string;
  refreshRate?: number;
}

interface CaptureStatus {
  isActive: boolean;
  chartDetection: boolean;
  tradeDetection: boolean;
  timerDetection: boolean;
  resultDetection: boolean;
  lastCapture?: Date;
}

class ScreenCaptureService {
  private isActive = false;
  private config?: CaptureConfig;
  private activeTrades: Map<string, ActiveTrade> = new Map();
  private lastTradeCheckTime: number = 0;
  private status: CaptureStatus = {
    isActive: false,
    chartDetection: false,
    tradeDetection: false,
    timerDetection: false,
    resultDetection: false,
  };

  async start(config: CaptureConfig): Promise<void> {
    this.config = config;
    this.isActive = true;
    this.status.isActive = true;
    
    console.log('Starting screen capture monitoring...');
    console.log('Note: Running in development mode - using mock screenshots in headless environment');
    
    this.startCapture();
  }

  async stop(): Promise<void> {
    this.isActive = false;
    this.status.isActive = false;
    this.status.chartDetection = false;
    this.status.tradeDetection = false;
    this.status.timerDetection = false;
    this.status.resultDetection = false;
    
    console.log('Stopping screen capture monitoring...');
  }

  getStatus(): CaptureStatus {
    return { ...this.status };
  }

  private async startCapture(): Promise<void> {
    if (!this.isActive || !this.config) return;

    try {
      // Perform real screen capture and analysis
      await this.performRealCapture();
      
      // Update detection status
      this.status.chartDetection = true;
      this.status.tradeDetection = true;
      this.status.timerDetection = true;
      this.status.resultDetection = true;
      this.status.lastCapture = new Date();
      
      // Adaptive sampling rate: fast when monitoring trades, slow when idle
      const hasActiveTrades = this.activeTrades.size > 0;
      const sampleRate = hasActiveTrades ? 1500 : 5000; // 1.5s when active, 5s when idle
      
      console.log(`📊 Active trades: ${this.activeTrades.size} | Next sample in ${sampleRate}ms`);
      setTimeout(() => this.startCapture(), sampleRate);
    } catch (error) {
      console.error('Screen capture error:', error);
      // Retry after delay - use idle rate on error
      setTimeout(() => this.startCapture(), 5000);
    }
  }

  private async performRealCapture(): Promise<void> {
    try {
      // Step 1: Capture screenshot of the entire screen
      const screenshotBuffer = await this.captureScreen();
      
      // Step 2: Analyze the screenshot for Binary Baseline trade status
      const detectedData = await this.analyzeScreenshot(screenshotBuffer);
      
      if (detectedData.timeframeDetected) {
        console.log(`Detected timeframe: ${detectedData.currentTimeframe}`);
        console.log(`Detected asset: ${detectedData.currentAsset}`);
        console.log(`Color analysis: ${detectedData.colorAnalysis?.dominantColor} (${detectedData.colorAnalysis?.confidence}% confidence)`);
        
        // Update detection status
        this.status.chartDetection = true;
        this.status.tradeDetection = detectedData.tradeExecuted;
        this.status.timerDetection = detectedData.timerVisible;
        this.status.resultDetection = detectedData.resultVisible;
        
        // Send real-time status update via WebSocket if configured
        if (this.config?.onStatusUpdate) {
          this.config.onStatusUpdate({
            colors: detectedData.colorAnalysis,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // Check for NEW trade starts (timer appearing, countdown starting)
      const newTradeDetected = this.detectNewTradeStart(detectedData);
      if (newTradeDetected) {
        await this.handleNewTrade(detectedData);
      }
      
      // Update all active trades with current chart color
      await this.updateActiveTrades(detectedData.colorAnalysis);

    } catch (error) {
      console.error('Screen detection error:', error);
      this.status.chartDetection = false;
      this.status.tradeDetection = false;
    }
  }

  private async captureScreen(): Promise<Buffer> {
    try {
      // Capture the entire screen
      const img = await screenshot({ format: 'png' });
      return img;
    } catch (error) {
      console.error('Screenshot capture failed (likely headless environment):', error);
      // In headless environments (like Replit), create a mock screenshot for development
      return this.createMockScreenshot();
    }
  }

  private async createMockScreenshot(): Promise<Buffer> {
    try {
      // Create a simple mock image for development/testing
      const mockImage = new Jimp({ width: 1920, height: 1080, color: 0x000000ff });
      
      // Randomly place colored areas at the top (simulating trade status)
      const hasRed = Math.random() > 0.5;
      const hasGreen = Math.random() > 0.5;
      
      // Manually set pixel colors to create colored rectangles
      if (hasRed) {
        // Create red rectangle from x:100-300, y:20-70
        for (let x = 100; x < 300; x++) {
          for (let y = 20; y < 70; y++) {
            mockImage.setPixelColor(0xff0000ff, x, y);
          }
        }
      }
      
      if (hasGreen) {
        // Create green rectangle from x:400-600, y:20-70
        for (let x = 400; x < 600; x++) {
          for (let y = 20; y < 70; y++) {
            mockImage.setPixelColor(0x00ff00ff, x, y);
          }
        }
      }
      
      const buffer = await mockImage.getBuffer('image/png');
      return buffer;
    } catch (error) {
      console.error('Mock screenshot creation failed:', error);
      // Return minimal 1x1 pixel buffer if everything fails
      const fallbackImage = new Jimp({ width: 1, height: 1, color: 0x000000ff });
      return await fallbackImage.getBuffer('image/png');
    }
  }

  private async analyzeScreenshot(screenshotBuffer: Buffer): Promise<any> {
    try {
      // Load the screenshot with Jimp for image processing
      const image = await Jimp.read(screenshotBuffer);
      
      // Get image dimensions
      const width = image.width;
      const height = image.height;
      
      // Define the region to scan for trade status
      // Use custom detection area if provided, otherwise default to top portion
      const detectionArea = this.config?.detectionArea || { x: 0, y: 0, width: width, height: Math.min(100, Math.floor(height * 0.1)) };
      
      // Ensure detection area is within image bounds
      const cropX = Math.max(0, Math.min(detectionArea.x, width - 1));
      const cropY = Math.max(0, Math.min(detectionArea.y, height - 1));
      const cropWidth = Math.min(detectionArea.width, width - cropX);
      const cropHeight = Math.min(detectionArea.height, height - cropY);
      
      const detectionRegion = image.clone().crop({ x: cropX, y: cropY, w: cropWidth, h: cropHeight });
      
      // Analyze colors in the detection region
      const colorAnalysis = await this.analyzeTradeColors(detectionRegion);
      
      // Detect any text/numbers for additional context
      const ocrResults = await this.performOCR(screenshotBuffer);
      
      return {
        timeframeDetected: true, // User sets this manually
        currentTimeframe: this.config?.selectedTimeframe || '1m',
        currentAsset: this.extractAssetFromOCR(ocrResults) || 'EUR/USD',
        expirationTime: this.extractTimeFromOCR(ocrResults) || '00:01:00',
        tradeExecuted: colorAnalysis.tradesDetected > 0,
        tradeResult: colorAnalysis.winningTrades > colorAnalysis.losingTrades ? 'win' : 
                    colorAnalysis.losingTrades > colorAnalysis.winningTrades ? 'loss' : null,
        tradeAmount: this.extractAmountFromOCR(ocrResults) || '20',
        isDemo: true,
        confidence: colorAnalysis.confidence,
        platform: 'binary_baseline',
        detectionRegion: 'top_screen_region',
        timerVisible: ocrResults.text.includes(':'),
        resultVisible: colorAnalysis.tradesDetected > 0,
        colorAnalysis: colorAnalysis,
        screenDimensions: { width, height }
      };
    } catch (error) {
      console.error('Screenshot analysis failed:', error);
      return this.getDefaultDetectionResult();
    }
  }

  private async analyzeTradeColors(topRegion: any): Promise<any> {
    try {
      let redPixels = 0;
      let greenPixels = 0;
      let brightGreenPixels = 0;
      let darkRedPixels = 0;
      let totalPixels = 0;
      
      const width = topRegion.width;
      const height = topRegion.height;
      
      // Scan through pixels looking for red and green areas with more flexible thresholds
      topRegion.scan(0, 0, width, height, function (this: any, x: number, y: number, idx: number) {
        const red = this.bitmap.data[idx];
        const green = this.bitmap.data[idx + 1];
        const blue = this.bitmap.data[idx + 2];
        
        // More flexible green detection for PocketOption charts
        // Bright green candles (winning trend)
        if (green > 120 && green > red + 30 && green > blue + 20) {
          greenPixels++;
          if (green > 180) brightGreenPixels++;
        }
        
        // Red detection for losing trends  
        if (red > 120 && red > green + 30 && red > blue + 20) {
          redPixels++;
          if (red > 180) darkRedPixels++;
        }
        
        totalPixels++;
      });
      
      const redPercentage = (redPixels / totalPixels) * 100;
      const greenPercentage = (greenPixels / totalPixels) * 100;
      
      // Lower thresholds for detection - even small amounts of color matter
      const colorDetected = redPixels > 10 || greenPixels > 10;
      const confidence = colorDetected ? Math.min(95, Math.max(redPixels, greenPixels) / 5) : 0;
      
      // Determine dominant color with preference for strong signals
      let dominantColor = 'neutral';
      if (brightGreenPixels > 20 || greenPixels > redPixels * 1.5) {
        dominantColor = 'green';
      } else if (darkRedPixels > 20 || redPixels > greenPixels * 1.5) {
        dominantColor = 'red';
      } else if (greenPixels > redPixels) {
        dominantColor = 'green';
      } else if (redPixels > greenPixels) {
        dominantColor = 'red';
      }
      
      console.log(`🎨 COLOR ANALYSIS: Green=${greenPixels} (${greenPercentage.toFixed(1)}%), Red=${redPixels} (${redPercentage.toFixed(1)}%) → ${dominantColor.toUpperCase()}`);
      
      return {
        tradesDetected: colorDetected ? 1 : 0,
        winningTrades: dominantColor === 'green' ? 1 : 0,
        losingTrades: dominantColor === 'red' ? 1 : 0,
        redPixels,
        greenPixels,
        brightGreenPixels,
        darkRedPixels,
        redPercentage: redPercentage.toFixed(2),
        greenPercentage: greenPercentage.toFixed(2),
        confidence: confidence.toFixed(0),
        dominantColor
      };
    } catch (error) {
      console.error('Color analysis failed:', error);
      return {
        tradesDetected: 0,
        winningTrades: 0,
        losingTrades: 0,
        confidence: 0,
        dominantColor: 'neutral'
      };
    }
  }

  private async performOCR(screenshotBuffer: Buffer): Promise<any> {
    try {
      // Use Tesseract.js for OCR
      const worker = await createWorker('eng');
      const { data } = await worker.recognize(screenshotBuffer);
      await worker.terminate();
      
      return {
        text: data.text || '',
        confidence: data.confidence || 0,
        words: (data as any).words || []
      };
    } catch (error) {
      console.error('OCR failed:', error);
      return {
        text: '',
        confidence: 0,
        words: []
      };
    }
  }

  private extractAssetFromOCR(ocrResults: any): string | null {
    // Enhanced currency pair detection with common trading pairs
    const text = ocrResults.text.toUpperCase();
    
    // Look for standard forex pairs
    const currencyPairRegex = /([A-Z]{3})[\/\s]([A-Z]{3})/g;
    const matches = text.match(currencyPairRegex);
    
    if (matches && matches.length > 0) {
      // Clean up the match and format properly
      const pair = matches[0].replace(/\s/g, '/');
      console.log(`💱 ASSET DETECTED: ${pair} from OCR text: "${text.substring(0, 100)}"`);
      return pair;
    }
    
    // Fallback: look for common pairs mentioned in text
    const commonPairs = ['AUD/CHF', 'EUR/USD', 'GBP/JPY', 'USD/JPY', 'EUR/GBP', 'AUD/USD', 'CAD/CHF', 'BHD/CNY'];
    for (const pair of commonPairs) {
      if (text.includes(pair.replace('/', ''))) {
        console.log(`💱 ASSET DETECTED (fallback): ${pair}`);
        return pair;
      }
    }
    
    console.log(`❌ NO ASSET DETECTED from OCR: "${text.substring(0, 100)}"`);
    return 'AUD/CHF'; // Default to what user is trading
  }

  private extractTimeFromOCR(ocrResults: any): string | null {
    // Look for time patterns like 00:01:30, 1:30, etc.
    const timeRegex = /\d{1,2}:\d{2}(?::\d{2})?/g;
    const matches = ocrResults.text.match(timeRegex);
    return matches ? matches[0] : null;
  }

  private extractAmountFromOCR(ocrResults: any): string | null {
    // Look for money amounts like $20, 50.00, etc.
    const amountRegex = /\$?\d+(?:\.\d{2})?/g;
    const matches = ocrResults.text.match(amountRegex);
    return matches ? matches[0].replace('$', '') : null;
  }

  private getDefaultDetectionResult(): any {
    return {
      timeframeDetected: true,
      currentTimeframe: this.config?.selectedTimeframe || '1m',
      currentAsset: 'EUR/USD',
      expirationTime: '00:01:00',
      tradeExecuted: false,
      tradeResult: null,
      tradeAmount: '20',
      isDemo: true,
      confidence: '0',
      platform: 'binary_baseline',
      detectionRegion: 'screen_capture_failed',
      timerVisible: false,
      resultVisible: false,
      newTradeDetected: false // Added for new trade detection
    };
  }

  private async handleNewTrade(detectedData: any): Promise<void> {
    const platformTradeId = `${detectedData.currentAsset}_${Date.now()}_${randomUUID()}`;
    const tradeType: 'CALL' | 'PUT' = 'CALL'; // TODO: Detect from button click
    
    const activeTrade: ActiveTrade = {
      id: '', // Will be set after database insertion
      platformTradeId,
      startTime: new Date(),
      duration: detectedData.currentTimeframe,
      asset: detectedData.currentAsset,
      tradeType,
      amount: parseFloat(detectedData.tradeAmount || '0'),
      samplesCollected: []
    };
    
    // Notify the config callback to create the trade in the database and get the ID
    if (this.config?.onTradeDetected) {
      const createdTradeId = await this.config.onTradeDetected(platformTradeId);
      activeTrade.id = createdTradeId;
      
      // Only add to active trades AFTER DB ID is set to avoid race conditions
      this.activeTrades.set(platformTradeId, activeTrade);
      console.log(`📊 NEW TRADE DETECTED: ${activeTrade.duration} ${activeTrade.asset} (${platformTradeId}) - DB ID: ${activeTrade.id}`);
    }
  }

  private async updateActiveTrades(colorAnalysis: any): Promise<void> {
    const now = new Date();
    
    for (const [platformTradeId, activeTrade] of Array.from(this.activeTrades.entries())) {
      const timeElapsed = Math.floor((now.getTime() - activeTrade.startTime.getTime()) / 1000);
      
      // Convert duration to seconds for comparison
      const durationInSeconds = this.getDurationInSeconds(activeTrade.duration);
      
      if (timeElapsed >= durationInSeconds) {
        // Trade completed - no more samples needed
        console.log(`✅ TRADE COMPLETED: ${platformTradeId} - Collected ${activeTrade.samplesCollected.length} samples`);
        
        // Notify completion
        if (this.config?.onTradeCompleted && activeTrade.id) {
          this.config.onTradeCompleted(activeTrade.id);
        }
        
        this.activeTrades.delete(platformTradeId);
        continue;
      }
      
      // Add color sample at this time point
      if (colorAnalysis && colorAnalysis.dominantColor) {
        const statusColor = colorAnalysis.dominantColor === 'green' ? 'GREEN' : 'RED';
        const sample: TradeColorSample = {
          timeElapsed,
          chartColor: colorAnalysis.dominantColor,
          confidence: parseFloat(colorAnalysis.confidence) || 0,
          timestamp: now
        };
        
        activeTrade.samplesCollected.push(sample);
        
        // Store sample in database via callback
        if (this.config?.onSampleCollected && activeTrade.id) {
          const tradeSample: InsertTradeSample = {
            tradeId: activeTrade.id,
            timeElapsed,
            statusColor,
            profitLossAmount: null,
            confidence: colorAnalysis.confidence
          };
          
          await this.config.onSampleCollected(activeTrade.id, tradeSample);
        }
        
        console.log(`📈 Trade ${platformTradeId} at ${timeElapsed}s: Status ${statusColor} (${sample.confidence}% confidence)`);
      }
    }
  }

  private getDurationInSeconds(duration: string): number {
    switch (duration) {
      case '30sec': return 30;
      case '1m': return 60;
      case '5m': return 300;
      case '15m': return 900;
      case '30m': return 1800;
      default: return 60;
    }
  }

  // Note: completeActiveTrade is no longer needed - samples are stored in real-time

  private findClosestSample(samples: TradeColorSample[], targetTime: number): TradeColorSample | null {
    if (samples.length === 0) return null;
    
    return samples.reduce((closest, current) => {
      const currentDiff = Math.abs(current.timeElapsed - targetTime);
      const closestDiff = Math.abs(closest.timeElapsed - targetTime);
      return currentDiff < closestDiff ? current : closest;
    });
  }

  private detectNewTradeStart(detectedData: any): boolean {
    // Detect new trade based on several indicators:
    // 1. Timer visibility change (timer just appeared)
    // 2. Time-based detection (avoid duplicate detections)
    // 3. OCR text changes indicating trade placement
    
    const now = Date.now();
    const timeSinceLastCheck = now - this.lastTradeCheckTime;
    
    // Only check for new trades every 10+ seconds to avoid duplicates
    if (timeSinceLastCheck < 10000) {
      return false;
    }
    
    // Look for timer indicators that suggest a new trade started
    const hasTimer = detectedData.timerVisible;
    const hasValidTimeframe = detectedData.currentTimeframe && detectedData.currentTimeframe !== 'unknown';
    const hasAsset = detectedData.currentAsset && detectedData.currentAsset !== 'Unknown';
    
    // Check if we already have an active trade for this asset/timeframe combination
    const hasExistingTrade = Array.from(this.activeTrades.values()).some(trade => 
      trade.asset === detectedData.currentAsset && 
      trade.duration === detectedData.currentTimeframe
    );
    
    // Detect new trade if:
    // 1. Timer is visible AND we have valid data AND no existing trade for this combination
    const newTradeDetected = hasTimer && hasValidTimeframe && hasAsset && !hasExistingTrade;
    
    if (newTradeDetected) {
      this.lastTradeCheckTime = now;
      console.log(`🚨 NEW TRADE START DETECTED: ${detectedData.currentTimeframe} ${detectedData.currentAsset}`);
    }
    
    return newTradeDetected;
  }

}

export const screenCapture = new ScreenCaptureService();
