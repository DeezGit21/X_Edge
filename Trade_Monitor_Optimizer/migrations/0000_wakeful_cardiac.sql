CREATE TABLE "analysis_results" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timeframe" text NOT NULL,
	"expiration" integer NOT NULL,
	"win_rate" numeric(5, 2) NOT NULL,
	"total_trades" integer NOT NULL,
	"confidence" text NOT NULL,
	"status" text NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"is_demo" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monitoring_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"capture_config" text,
	"detection_status" text
);
--> statement-breakpoint
CREATE TABLE "trade_samples" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trade_id" varchar NOT NULL,
	"time_elapsed" integer NOT NULL,
	"status_color" text NOT NULL,
	"profit_loss_amount" numeric(10, 2),
	"confidence" numeric(5, 2),
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform_trade_id" text NOT NULL,
	"user_id" varchar,
	"asset" text NOT NULL,
	"trade_type" text NOT NULL,
	"entry_price" numeric(10, 4),
	"start_time" timestamp DEFAULT now() NOT NULL,
	"actual_duration" integer NOT NULL,
	"timeframe" text NOT NULL,
	"is_demo" boolean DEFAULT true NOT NULL,
	"amount" numeric(10, 2),
	"conditions" text,
	CONSTRAINT "trades_platform_trade_id_unique" UNIQUE("platform_trade_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
