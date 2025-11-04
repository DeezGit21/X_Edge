import { type Trade, type TradeSample, type AnalysisResult } from "@shared/schema";
import { storage } from "../storage";

interface TradingStats {
  currentWinRate: number;
  bestTimeframe: string;
  bestExpiration: number;
  tradesAnalyzed: number;
  recommendedAction: string;
  confidence: number;
}

class TradeAnalysisService {
  async updateAnalysis(timeframe: string, expiration: number): Promise<void> {
    // Get all samples for this timeframe at this expiration time
    const samples = await storage.getTradeSamplesByTimeframe(timeframe, expiration);
    
    if (samples.length === 0) return;
    
    // Calculate win rate based on GREEN samples
    const wins = samples.filter(s => s.statusColor === 'GREEN').length;
    const winRate = (wins / samples.length) * 100;
    
    // Determine confidence level based on sample size
    let confidence: 'high' | 'medium' | 'low';
    if (samples.length >= 50 && winRate >= 80) {
      confidence = 'high';
    } else if (samples.length >= 20 && winRate >= 70) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }
    
    // Determine status
    let status: 'recommended' | 'good' | 'testing' | 'avoid';
    if (winRate >= 85 && confidence === 'high') {
      status = 'recommended';
    } else if (winRate >= 75) {
      status = 'good';
    } else if (winRate >= 65) {
      status = 'testing';
    } else {
      status = 'avoid';
    }
    
    // Update or create analysis result
    const existing = await storage.updateAnalysisResult(timeframe, expiration, {
      winRate: winRate.toFixed(1),
      totalTrades: samples.length,
      confidence,
      status,
      isDemo: true
    });
    
    if (!existing) {
      await storage.createAnalysisResult({
        timeframe,
        expiration,
        winRate: winRate.toFixed(1),
        totalTrades: samples.length,
        confidence,
        status,
        isDemo: true
      });
    }
  }

  calculateStats(trades: Trade[], analysisResults: AnalysisResult[]): TradingStats {
    if (trades.length === 0) {
      return {
        currentWinRate: 0,
        bestTimeframe: '1m',
        bestExpiration: 15,
        tradesAnalyzed: 0,
        recommendedAction: 'Start Trading',
        confidence: 0
      };
    }

    // Calculate overall win rate from analysis results
    const totalSamples = analysisResults.reduce((sum, r) => sum + r.totalTrades, 0);
    const weightedWinRate = analysisResults.reduce((sum, r) => {
      return sum + (parseFloat(r.winRate) * r.totalTrades);
    }, 0) / (totalSamples || 1);

    // Find best performing combination
    const bestResult = analysisResults
      .filter(r => r.totalTrades >= 10)
      .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate))[0];

    const bestTimeframe = bestResult?.timeframe || '1m';
    const bestExpiration = bestResult?.expiration || 15;

    // Determine recommended action
    let recommendedAction = 'Start Trading';
    let confidence = 0;

    if (bestResult) {
      const bestWinRate = parseFloat(bestResult.winRate);
      if (bestWinRate >= 85 && bestResult.confidence === 'high') {
        recommendedAction = 'Go Live';
        confidence = 94;
      } else if (bestWinRate >= 75 && bestResult.totalTrades >= 20) {
        recommendedAction = 'Continue Testing';
        confidence = 78;
      } else if (bestWinRate >= 65) {
        recommendedAction = 'Test More';
        confidence = 62;
      } else {
        recommendedAction = 'Adjust Strategy';
        confidence = 45;
      }
    }

    return {
      currentWinRate: Math.round(weightedWinRate * 10) / 10,
      bestTimeframe,
      bestExpiration,
      tradesAnalyzed: trades.length,
      recommendedAction,
      confidence
    };
  }

  getTimeframePerformance(trades: Trade[]): Array<{ timeframe: string; winRate: number; trades: number }> {
    const timeframes = ['1m', '5m', '15m', '30m'];
    
    return timeframes.map(timeframe => {
      const timeframeTrades = trades.filter(t => t.timeframe === timeframe);
      
      return {
        timeframe,
        winRate: 0, // Will be calculated from samples
        trades: timeframeTrades.length
      };
    });
  }

  getExpirationPerformance(trades: Trade[], timeframe: string): Array<{ expiration: number; winRate: number; trades: number }> {
    const expirations = [5, 10, 15, 30, 45, 60];
    
    return expirations.map(expiration => {
      return {
        expiration,
        winRate: 0, // Will be calculated from samples
        trades: 0
      };
    });
  }
}

export const tradeAnalysis = new TradeAnalysisService();
