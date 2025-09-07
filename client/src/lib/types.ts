export interface Trade {
  id: string;
  timestamp: Date;
  timeframe: string;
  expiration: string;
  amount: string;
  outcome: 'win' | 'loss';
  isDemo: boolean;
  confidence?: string;
  conditions?: string;
}

export interface AnalysisResult {
  id: string;
  timeframe: string;
  expiration: string;
  winRate: string;
  totalTrades: number;
  confidence: 'high' | 'medium' | 'low';
  status: 'recommended' | 'good' | 'testing' | 'avoid';
  lastUpdated: Date;
  isDemo: boolean;
}

export interface MonitoringSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  captureConfig?: string;
  detectionStatus?: string;
}

export interface TradingStats {
  currentWinRate: number;
  bestTimeframe: string;
  bestExpiration: string;
  tradesAnalyzed: number;
  recommendedAction: string;
  confidence: number;
}

export interface WebSocketMessage {
  type: 'trade_created' | 'trade_detected' | 'analysis_updated' | 'monitoring_started' | 'monitoring_stopped' | 'analysis_update';
  data: any;
}
