# Overview

This is **X_Edge** - a Timeframe Analyzer application designed for binary options trading analysis. The system provides real-time monitoring of trading platform screens, automated trade detection, performance analysis across different timeframes and expiration periods, and strategic recommendations based on win rate data. It features a modern React frontend with Express.js backend, real-time WebSocket communication, and PostgreSQL database storage using Drizzle ORM.

# Recent Changes (November 2025)

- **OTC Currency Support**: Added `isOTC` boolean field to trades schema to distinguish OTC pairs from regular currency pairs
- **Enhanced OCR**: Updated asset detection to recognize and extract "OTC" suffix from currency names (e.g., "EUR/USD OTC")
- **PocketOption Preset**: Added "Open Trades Panel" preset for easier configuration (X:600, Y:150, W:300, H:400)
- **Simplified Startup**: Created `start.bat` (Windows) and `start.sh` (Mac/Linux) scripts for one-command local setup
- **Documentation**: Added comprehensive README.md, TESTING_GUIDE.md, and DATABASE_SETUP.md

# User Preferences

Preferred communication style: Simple, everyday language.
Project name: X_Edge (renamed from previous name)

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript in single-page application (SPA) architecture
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Framework**: Shadcn/ui component library built on Radix UI primitives with Tailwind CSS styling
- **Styling**: Tailwind CSS with custom design tokens and dark theme support
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework using ES modules
- **API Design**: RESTful API with WebSocket support for real-time updates
- **Data Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Services**: Modular service architecture with screen capture analysis and trade analysis services
- **WebSocket**: Real-time communication for live trading updates and monitoring status

## Data Storage
- **Primary Database**: PostgreSQL with Drizzle ORM for schema management and queries
- **Schema Design**: Four main entities - users, trades, analysis results, and monitoring sessions
- **Data Types**: Support for decimal precision trading amounts, timestamps, and JSON configuration storage
- **Fallback Storage**: In-memory storage implementation for development and testing scenarios

## Real-time Communication
- **WebSocket Server**: Integrated with HTTP server for bidirectional communication
- **Message Types**: Trade detection, analysis updates, monitoring status changes
- **Client Management**: Connection pooling with automatic reconnection logic
- **Broadcasting**: Server-side message broadcasting to all connected clients

## Screen Capture and Analysis
- **Computer Vision**: Placeholder architecture for screenshot analysis and pattern recognition
- **Trading Platform Integration**: Designed for Binary Baseline platform compatibility
- **Detection Systems**: Multi-layered detection for charts, trades, timers, and results
- **Configuration**: Flexible capture settings with JSON-based configuration storage

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL provider using @neondatabase/serverless driver
- **Connection Management**: Environment-based database URL configuration with connection pooling

## UI and Component Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework with custom design system integration
- **Lucide React**: Modern icon library with consistent design language

## Development and Build Tools
- **Vite**: Fast build tool with HMR, TypeScript support, and optimized bundling
- **TypeScript**: Static type checking across client, server, and shared code
- **ESBuild**: High-performance JavaScript bundler for production builds

## Data Fetching and State Management
- **TanStack React Query**: Server state management with caching, background refetching, and optimistic updates
- **React Hook Form**: Form state management with validation support

## Development Environment
- **Replit Integration**: Development environment optimization with runtime error handling and cartographer support
- **Hot Module Replacement**: Fast development iteration with Vite HMR integration
- **Local Development**: Cross-platform startup scripts (start.bat/start.sh) for simplified local setup with automatic dependency installation and database syncing

# Trading Platform Integration

## Supported Platforms
- **PocketOption**: Primary platform with dedicated "Open Trades Panel" preset for optimal detection
- **Binary Baseline**: Legacy support with header area detection

## OTC Currency Detection
- Distinguishes between regular and OTC (Over-The-Counter) currency pairs
- Stores `isOTC` boolean flag in database for separate performance tracking
- OCR automatically detects "OTC" suffix in asset names during trade detection