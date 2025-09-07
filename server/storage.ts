import { type User, type InsertUser, type Trade, type InsertTrade, type AnalysisResult, type InsertAnalysisResult, type MonitoringSession, type InsertMonitoringSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createTrade(trade: InsertTrade): Promise<Trade>;
  getTrades(limit?: number, offset?: number): Promise<Trade[]>;
  getTradesByTimeframe(timeframe: string, expiration: string): Promise<Trade[]>;
  
  createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
  getAnalysisResults(): Promise<AnalysisResult[]>;
  updateAnalysisResult(timeframe: string, expiration: string, updates: Partial<AnalysisResult>): Promise<AnalysisResult | undefined>;
  
  createMonitoringSession(session: InsertMonitoringSession): Promise<MonitoringSession>;
  getActiveMonitoringSession(): Promise<MonitoringSession | undefined>;
  updateMonitoringSession(id: string, updates: Partial<MonitoringSession>): Promise<MonitoringSession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private trades: Map<string, Trade>;
  private analysisResults: Map<string, AnalysisResult>;
  private monitoringSessions: Map<string, MonitoringSession>;

  constructor() {
    this.users = new Map();
    this.trades = new Map();
    this.analysisResults = new Map();
    this.monitoringSessions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const id = randomUUID();
    const trade: Trade = { 
      ...insertTrade, 
      id, 
      timestamp: new Date()
    };
    this.trades.set(id, trade);
    return trade;
  }

  async getTrades(limit = 100, offset = 0): Promise<Trade[]> {
    const allTrades = Array.from(this.trades.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return allTrades.slice(offset, offset + limit);
  }

  async getTradesByTimeframe(timeframe: string, expiration: string): Promise<Trade[]> {
    return Array.from(this.trades.values()).filter(
      trade => trade.timeframe === timeframe && trade.expiration === expiration
    );
  }

  async createAnalysisResult(insertResult: InsertAnalysisResult): Promise<AnalysisResult> {
    const id = randomUUID();
    const result: AnalysisResult = {
      ...insertResult,
      id,
      lastUpdated: new Date()
    };
    const key = `${result.timeframe}-${result.expiration}-${result.isDemo}`;
    this.analysisResults.set(key, result);
    return result;
  }

  async getAnalysisResults(): Promise<AnalysisResult[]> {
    return Array.from(this.analysisResults.values())
      .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));
  }

  async updateAnalysisResult(timeframe: string, expiration: string, updates: Partial<AnalysisResult>): Promise<AnalysisResult | undefined> {
    const key = `${timeframe}-${expiration}-${updates.isDemo || true}`;
    const existing = this.analysisResults.get(key);
    if (existing) {
      const updated = { ...existing, ...updates, lastUpdated: new Date() };
      this.analysisResults.set(key, updated);
      return updated;
    }
    return undefined;
  }

  async createMonitoringSession(insertSession: InsertMonitoringSession): Promise<MonitoringSession> {
    const id = randomUUID();
    const session: MonitoringSession = {
      ...insertSession,
      id,
      startTime: new Date()
    };
    this.monitoringSessions.set(id, session);
    return session;
  }

  async getActiveMonitoringSession(): Promise<MonitoringSession | undefined> {
    return Array.from(this.monitoringSessions.values()).find(
      session => session.isActive
    );
  }

  async updateMonitoringSession(id: string, updates: Partial<MonitoringSession>): Promise<MonitoringSession | undefined> {
    const existing = this.monitoringSessions.get(id);
    if (existing) {
      const updated = { ...existing, ...updates };
      this.monitoringSessions.set(id, updated);
      return updated;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
