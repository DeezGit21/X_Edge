import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const trades = pgTable("trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  timeframe: text("timeframe").notNull(), // "30sec", "1min", "5min", etc.
  expiration: text("expiration").notNull(), // "5sec", "10sec", "15sec", etc.
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  outcome: text("outcome").notNull(), // "win" | "loss"
  asset: text("asset").notNull(), // "EUR/USD", "GBP/JPY", "AUD/USD", etc.
  isDemo: boolean("is_demo").notNull().default(true),
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // 0-100
  conditions: text("conditions"), // JSON string of market conditions
});

export const analysisResults = pgTable("analysis_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timeframe: text("timeframe").notNull(),
  expiration: text("expiration").notNull(),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }).notNull(),
  totalTrades: integer("total_trades").notNull(),
  confidence: text("confidence").notNull(), // "high" | "medium" | "low"
  status: text("status").notNull(), // "recommended" | "good" | "testing" | "avoid"
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  isDemo: boolean("is_demo").notNull().default(true),
});

export const monitoringSessions = pgTable("monitoring_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  isActive: boolean("is_active").notNull().default(true),
  captureConfig: text("capture_config"), // JSON string of capture settings
  detectionStatus: text("detection_status"), // JSON string of detection statuses
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  timestamp: true,
});

export const insertAnalysisResultSchema = createInsertSchema(analysisResults).omit({
  id: true,
  lastUpdated: true,
});

export const insertMonitoringSessionSchema = createInsertSchema(monitoringSessions).omit({
  id: true,
  startTime: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;
export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;
export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertMonitoringSession = z.infer<typeof insertMonitoringSessionSchema>;
export type MonitoringSession = typeof monitoringSessions.$inferSelect;
