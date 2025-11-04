# PocketOption Trade Detection Testing Guide

## What Was Fixed

All the critical detection issues have been resolved:

1. ✅ **Real screen capture** now works locally (no more mock screenshots)
2. ✅ **Detection area** is properly cropped before OCR and color analysis  
3. ✅ **OCR performance** improved with reusable Tesseract worker
4. ✅ **Trade detection** now uses color confidence instead of unreliable OCR timer text
5. ✅ **Database persistence** confirmed working for trades and samples
6. ✅ **Type safety** fixed for confidence values

## Setup Instructions

### 1. Configure Detection Area

The most important step! You must point the app at PocketOption's "Open Trades Panel":

**Recommended coordinates for PocketOption:**
- **X**: 1400 (right side of screen where trades panel is)
- **Y**: 100 (below the header)
- **Width**: 500 (width of trades panel)
- **Height**: 600 (enough to capture multiple trades)

**How to configure:**
1. Open the app at http://localhost:PORT
2. Go to Dashboard or Screen Monitor tab
3. Click "Configure" button in Screen Capture Monitor section
4. Enter the coordinates above OR try the "PocketOption Top Bar" preset
5. Click "Apply Changes"

### 2. Start Monitoring

1. Make sure PocketOption is open and visible on your screen
2. In the app, click **"Start Analysis"** or **"Start Monitoring"**
3. Open your browser console (F12) to watch the detection logs

### 3. Place a Trade on PocketOption

1. Select an asset (e.g., AUD/CHF)
2. Select timeframe (e.g., M1 = 1 minute)
3. Choose amount ($50)
4. Click BUY or SELL
5. Watch the "Open Trades Panel" on the right - it should show your active trade

### 4. What to Look For

**In the console logs, you should see:**

```
📊 Active trades: 0 | Next sample in 5000ms
🎨 COLOR ANALYSIS: Green=X (X.X%), Red=X (X.X%) → GREEN
💱 ASSET DETECTED: AUD/CHF from OCR text: "..."
🚨 NEW TRADE START DETECTED: 1m AUD/CHF
📊 NEW TRADE DETECTED: 1m AUD/CHF (AUD/CHF_1234567890_uuid) - DB ID: abc123
📊 Active trades: 1 | Next sample in 1500ms
📈 Trade AUD/CHF_1234567890_uuid at 1s: Status GREEN (95% confidence)
📈 Trade AUD/CHF_1234567890_uuid at 3s: Status RED (87% confidence)
...
✅ TRADE COMPLETED: AUD/CHF_1234567890_uuid - Collected 20 samples
```

**In the app UI:**
- Dashboard should show the trade in "Trade History" section
- Analytics should update with win rate data
- Activity Feed should show "New trade detected" events

## Troubleshooting

### Issue: "Active trades: 0" constantly

**Possible causes:**
1. **Wrong detection area** - You're capturing the chart instead of the trades panel
   - Solution: Use coordinates X:1400, Y:100, Width:500, Height:600
   
2. **OCR not reading asset name** - Check console for "NO ASSET DETECTED from OCR"
   - Solution: Make sure the trades panel is visible and contains text
   
3. **Color confidence too low** - Check console for color percentages
   - Solution: Ensure there's red/green colors in the detection area

### Issue: Trades detected but data not in dashboard

1. Check database connection is working:
   ```bash
   npm run db:push
   ```
2. Check browser console for API errors
3. Restart the app

### Issue: Too many duplicate trades

1. Increase throttling in `detectNewTradeStart()` (currently 3 seconds)
2. Or use a more specific detection area

## Expected Behavior

**When working correctly:**
- New trades detected within 1-3 seconds of placement
- Color samples collected every 1.5 seconds for active trades
- Trades automatically marked complete when duration expires
- Win rate analytics update in real-time
- Dashboard shows all trades with their color history

## Testing Checklist

- [ ] Detection area configured to "Open Trades Panel"
- [ ] Console shows "🚨 NEW TRADE START DETECTED" when trade is placed
- [ ] Console shows "📈 Trade ... at Xs" color samples every 1-2 seconds
- [ ] Console shows "✅ TRADE COMPLETED" when trade expires
- [ ] Dashboard "Trade History" table shows the trade
- [ ] Analytics page shows updated win rates
- [ ] Multiple trades can be tracked simultaneously

## Next Steps

Once local testing works:
1. **Fine-tune detection area** for your specific screen resolution
2. **Optimize color thresholds** if false positives occur
3. **Build browser extension** (Option 3) for easier deployment
