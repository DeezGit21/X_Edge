# X_Edge - Binary Options Trading Analyzer

Automated trading analysis for PocketOption binary options trades. Monitor your trades in real-time, track win rates across different timeframes, and optimize your exit strategies.

## 🚀 Quick Start (Local Development)

### Windows
```bash
start.bat
```

### Mac/Linux
```bash
./start.sh
```

That's it! The app will automatically:
- Install dependencies if needed
- Create .env file if missing
- Sync database schema
- Start on http://localhost:5000

## 📋 Requirements

- **Node.js** 18+ ([Download here](https://nodejs.org/))
- **PostgreSQL Database** (get free from [Neon](https://neon.tech) or [Supabase](https://supabase.com))

## ⚙️ Configuration

1. **Database Setup**: Update `.env` with your database URL:
   ```
   DATABASE_URL=postgresql://user:password@host/database
   ```

2. **Detection Area**: In the app, go to Dashboard → Configure → Use "**PocketOption Open Trades Panel**" preset

3. **Start Monitoring**: Click "Start Analysis" and place trades on PocketOption

## 📊 How It Works

1. **Captures** your PocketOption "Open Trades Panel" every 1-2 seconds
2. **Detects** new trades by color changes (green/red profit indicators)
3. **Samples** the status color throughout the trade duration
4. **Analyzes** optimal exit times: "If I exited at 5s, 10s, 15s... would I win?"

## 🎯 Key Features

- **Real-time Trade Detection** - Automatically detects when you place a trade
- **Color Sampling** - Tracks profit/loss status every 1-2 seconds
- **OTC Currency Support** - Distinguishes between regular and OTC pairs
- **Timeframe Analysis** - Compare win rates across M1, M5, M15, M30
- **Exit Time Optimization** - See which exit times have highest win rates

## 📁 Project Structure

```
X_Edge/
├── client/           # React frontend
├── server/           # Express backend
├── shared/           # Shared types & database schema
├── start.sh          # Mac/Linux startup
├── start.bat         # Windows startup
└── TESTING_GUIDE.md  # Detailed testing instructions
```

## 🔧 Manual Commands

If you prefer running commands manually:

```bash
# Install dependencies
npm install

# Sync database schema
npm run db:push

# Start development server
PORT=5000 npm run dev
```

## 📖 Documentation

- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Detailed setup and troubleshooting
- **Database Schema** - See `shared/schema.ts`
- **API Routes** - See `server/routes.ts`

## 🐛 Troubleshooting

**Not detecting trades?**
- Use "PocketOption Open Trades Panel" preset (X:600, Y:150, W:300, H:400)
- Make sure detection area is set to the right-side trades panel

**Database errors?**
- Run `npm run db:push --force` to sync schema
- Check DATABASE_URL in .env is correct

**OTC currencies not showing?**
- Update to latest version (OTC detection added in v1.1)

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please open an issue first to discuss changes.

---

**Note**: This tool is for educational purposes. Always verify trading decisions independently.
