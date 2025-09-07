import { type InsertTrade } from "@shared/schema";
import screenshot from 'screenshot-desktop';
import { createWorker } from 'tesseract.js';
import * as Jimp from 'jimp';

interface CaptureConfig {
  onTradeDetected: (trade: InsertTrade) => Promise<void>;
  onAnalysisUpdate: (analysis: any) => void;
  selectedTimeframe?: string;
  onStatusUpdate?: (status: any) => void;
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
    
    // Simulate screen capture initialization
    // In a real implementation, this would use libraries like:
    // - screenshot-desktop for screen capture
    // - opencv4nodejs for computer vision
    // - jimp for image processing
    
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
      
      // Schedule next capture
      setTimeout(() => this.startCapture(), 1000);
    } catch (error) {
      console.error('Screen capture error:', error);
      // Retry after delay
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
      
      // Only create trades when actual trade execution is detected
      if (detectedData.tradeExecuted && detectedData.tradeResult) {
        const detectedTrade: InsertTrade = {
          timeframe: detectedData.currentTimeframe,
          expiration: detectedData.expirationTime,
          amount: detectedData.tradeAmount,
          outcome: detectedData.tradeResult,
          asset: detectedData.currentAsset,
          isDemo: detectedData.isDemo,
          confidence: detectedData.confidence,
          conditions: JSON.stringify({
            platform: detectedData.platform,
            detectionMethod: 'real_screen_capture',
            screenRegion: detectedData.detectionRegion,
            colorAnalysis: detectedData.colorAnalysis
          })
        };

        await this.config?.onTradeDetected(detectedTrade);
      }

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
      console.error('Screenshot capture failed:', error);
      throw new Error('Failed to capture screen');
    }
  }

  private async analyzeScreenshot(screenshotBuffer: Buffer): Promise<any> {
    try {
      // Load the screenshot with Jimp for image processing
      const image = await Jimp.read(screenshotBuffer);
      
      // Get image dimensions
      const width = image.getWidth();
      const height = image.getHeight();
      
      // Define the region to scan for trade status (top portion of screen)
      // Binary Baseline shows trade status across the top
      const topRegionHeight = Math.min(100, Math.floor(height * 0.1)); // Top 10% or 100px max
      const topRegion = image.clone().crop(0, 0, width, topRegionHeight);
      
      // Analyze colors in the top region
      const colorAnalysis = await this.analyzeTradeColors(topRegion);
      
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
      let totalPixels = 0;
      
      const width = topRegion.getWidth();
      const height = topRegion.getHeight();
      
      // Scan through pixels looking for red and green areas
      topRegion.scan(0, 0, width, height, function (x: number, y: number, idx: number) {
        const red = this.bitmap.data[idx];
        const green = this.bitmap.data[idx + 1];
        const blue = this.bitmap.data[idx + 2];
        
        // Check for red color (losing trades)
        // Look for strong red with low green/blue
        if (red > 180 && green < 100 && blue < 100) {
          redPixels++;
        }
        
        // Check for green color (winning trades)
        // Look for strong green with lower red/blue
        if (green > 180 && red < 100 && blue < 100) {
          greenPixels++;
        }
        
        totalPixels++;
      });
      
      const redPercentage = (redPixels / totalPixels) * 100;
      const greenPercentage = (greenPixels / totalPixels) * 100;
      
      // Determine confidence based on color detection
      const colorDetected = redPixels > 50 || greenPixels > 50;
      const confidence = colorDetected ? Math.min(95, (redPixels + greenPixels) / 10) : 0;
      
      return {
        tradesDetected: colorDetected ? 1 : 0,
        winningTrades: greenPixels > 50 ? 1 : 0,
        losingTrades: redPixels > 50 ? 1 : 0,
        redPixels,
        greenPixels,
        redPercentage: redPercentage.toFixed(2),
        greenPercentage: greenPercentage.toFixed(2),
        confidence: confidence.toFixed(0),
        dominantColor: redPixels > greenPixels ? 'red' : greenPixels > redPixels ? 'green' : 'neutral'
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
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data } = await worker.recognize(screenshotBuffer);
      await worker.terminate();
      
      return {
        text: data.text,
        confidence: data.confidence,
        words: data.words
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
    // Look for currency pairs like EUR/USD, GBP/JPY, etc.
    const currencyPairRegex = /[A-Z]{3}\/[A-Z]{3}/g;
    const matches = ocrResults.text.match(currencyPairRegex);
    return matches ? matches[0] : null;
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
      resultVisible: false
    };
  }

}

export const screenCapture = new ScreenCaptureService();
