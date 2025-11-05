@echo off

REM X_Edge - Binary Options Trading Analysis App
REM Startup script for Windows

echo 🚀 Starting X_Edge Trading Analyzer...
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
  echo 📦 Installing dependencies...
  call npm install
  echo.
)

REM Check for .env file
if not exist ".env" (
  echo ⚠️  No .env file found. Creating one...
  echo DATABASE_URL=your_database_url_here > .env
  echo ✅ Created .env file. Please update it with your database URL.
  echo.
)

REM Run database push to ensure schema is up to date
echo 🗄️  Syncing database schema...
call npm run db:push
echo.

REM Start the application
echo ✨ Starting application on http://localhost:5000
echo 📊 Open your PocketOption platform and start monitoring!
echo.
set PORT=5000
call npm run dev
