import { type Trade, type AnalysisResult } from "@shared/schema";
import { storage } from "../storage";

interface TradingStats {
  currentWinRate: number;
  bestTimeframe: string;
  bestExpiration: string;
  tradesAnalyzed: number;
  recommendedAction: string;
  confidence: number;
}

class TradeAnalysisService {
  async updateAnalysis(trade: Trade): Promise<void> {
    // Get existing trades for this combination
    const trades = await storage.getTradesByTimeframe(trade.timeframe, trade.expiration);
    
    // Calculate win rate
    const wins = trades.filter(t => t.outcome === 'win').length;
    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;
    
    // Determine confidence level
    let confidence: 'high' | 'medium' | 'low';
    if (trades.length >= 50 && winRate >= 80) {
      confidence = 'high';
    } else if (trades.length >= 20 && winRate >= 70) {
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
    const existing = await storage.updateAnalysisResult(trade.timeframe, trade.expiration, {
      winRate: winRate.toFixed(1),
      totalTrades: trades.length,
      confidence,
      status,
      isDemo: trade.isDemo
    });
    
    if (!existing) {
      await storage.createAnalysisResult({
        timeframe: trade.timeframe,
        expiration: trade.expiration,
        winRate: winRate.toFixed(1),
        totalTrades: trades.length,
        confidence,
        status,
        isDemo: trade.isDemo
      });
    }
  }

  calculateStats(trades: Trade[], analysisResults: AnalysisResult[]): TradingStats {
    if (trades.length === 0) {
      return {
        currentWinRate: 0,
        bestTimeframe: '1min',
        bestExpiration: '30sec',
        tradesAnalyzed: 0,
        recommendedAction: 'Start Trading',
        confidence: 0
      };
    }

    // Calculate overall win rate
    const wins = trades.filter(t => t.outcome === 'win').length;
    const currentWinRate = (wins / trades.length) * 100;

    // Find best performing combination
    const bestResult = analysisResults
      .filter(r => r.totalTrades >= 10)
      .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate))[0];

    const bestTimeframe = bestResult?.timeframe || '1min';
    const bestExpiration = bestResult?.expiration || '30sec';

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
      currentWinRate: Math.round(currentWinRate * 10) / 10,
      bestTimeframe,
      bestExpiration,
      tradesAnalyzed: trades.length,
      recommendedAction,
      confidence
    };
  }

  getTimeframePerformance(trades: Trade[]): Array<{ timeframe: string; winRate: number; trades: number }> {
    const timeframes = ['30sec', '1min', '5min', '15min', '30min'];
    
    return timeframes.map(timeframe => {
      const timeframeTrades = trades.filter(t => t.timeframe === timeframe);
      const wins = timeframeTrades.filter(t => t.outcome === 'win').length;
      const winRate = timeframeTrades.length > 0 ? (wins / timeframeTrades.length) * 100 : 0;
      
      return {
        timeframe,
        winRate: Math.round(winRate * 10) / 10,
        trades: timeframeTrades.length
      };
    });
  }

  getExpirationPerformance(trades: Trade[], timeframe: string): Array<{ expiration: string; winRate: number; trades: number }> {
    const expirations = ['5sec', '10sec', '15sec', '30sec', '1min', '2min', '5min'];
    
    return expirations.map(expiration => {
      const filteredTrades = trades.filter(t => t.timeframe === timeframe && t.expiration === expiration);
      const wins = filteredTrades.filter(t => t.outcome === 'win').length;
      const winRate = filteredTrades.length > 0 ? (wins / filteredTrades.length) * 100 : 0;
      
      return {
        expiration,
        winRate: Math.round(winRate * 10) / 10,
        trades: filteredTrades.length
      };
    });
  }
}

export const tradeAnalysis = new TradeAnalysisService();
