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
  platformTradeId: text("platform_trade_id").notNull().unique(), // Asset_Timestamp_UUID for multi-trade handling
  userId: varchar("user_id"), // Foreign key to users (optional for now)
  asset: text("asset").notNull(), // "EUR/USD", "LBP/USD OTC", etc. (OCR'd from panel)
  tradeType: text("trade_type").notNull(), // "CALL" | "PUT"
  entryPrice: decimal("entry_price", { precision: 10, scale: 4 }), // Optional: OCR'd price at trade start
  startTime: timestamp("start_time").notNull().defaultNow(), // Time trade row was detected
  actualDuration: integer("actual_duration").notNull(), // Duration in seconds (e.g., 60)
  timeframe: text("timeframe").notNull(), // Chart timeframe: "1m", "5m", etc.
  isDemo: boolean("is_demo").notNull().default(true),
  amount: decimal("amount", { precision: 10, scale: 2 }), // Trade amount
  conditions: text("conditions"), // JSON string of market conditions
});

export const tradeSamples = pgTable("trade_samples", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tradeId: varchar("trade_id").notNull(), // Foreign key to trades.id
  timeElapsed: integer("time_elapsed").notNull(), // Seconds since trade start (1s, 2s, 5s, etc.)
  statusColor: text("status_color").notNull(), // "GREEN" | "RED" from panel indicator
  profitLossAmount: decimal("profit_loss_amount", { precision: 10, scale: 2 }), // Optional: OCR'd +$1.70, -$2
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // Detection confidence 0-100
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const analysisResults = pgTable("analysis_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timeframe: text("timeframe").notNull(), // Chart timeframe: "1m", "5m", etc.
  expiration: integer("expiration").notNull(), // Hypothetical exit time in seconds: 5, 10, 15, 30
  winRate: decimal("win_rate", { precision: 5, scale: 2 }).notNull(), // Calculated from samples
  totalTrades: integer("total_trades").notNull(), // Number of trades sampled
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
  startTime: true,
});

export const insertTradeSampleSchema = createInsertSchema(tradeSamples).omit({
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
export type InsertTradeSample = z.infer<typeof insertTradeSampleSchema>;
export type TradeSample = typeof tradeSamples.$inferSelect;
export type InsertAnalysisResult = z.infer<typeof insertAnalysisResultSchema>;
export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertMonitoringSession = z.infer<typeof insertMonitoringSessionSchema>;
export type MonitoringSession = typeof monitoringSessions.$inferSelect;
