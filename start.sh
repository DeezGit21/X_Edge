#!/bin/bash

# X_Edge - Binary Options Trading Analysis App
# Startup script for Mac/Linux

echo "🚀 Starting X_Edge Trading Analyzer..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Check for .env file
if [ ! -f ".env" ]; then
  echo "⚠️  No .env file found. Creating one..."
  echo "DATABASE_URL=your_database_url_here" > .env
  echo "✅ Created .env file. Please update it with your database URL."
  echo ""
fi

# Run database push to ensure schema is up to date
echo "🗄️  Syncing database schema..."
npm run db:push
echo ""

# Start the application
echo "✨ Starting application on http://localhost:5000"
echo "📊 Open your PocketOption platform and start monitoring!"
echo ""
PORT=5000 npm run dev
