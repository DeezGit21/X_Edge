import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertTradeSchema, insertAnalysisResultSchema, insertMonitoringSessionSchema } from "@shared/schema";
import { screenCapture } from "./services/screenCapture";
import { tradeAnalysis } from "./services/tradeAnalysis";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store connected clients
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast function for real-time updates
  const broadcast = (data: any) => {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // API Routes
  app.get('/api/trades', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const trades = await storage.getTrades(limit, offset);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch trades' });
    }
  });

  app.post('/api/trades', async (req, res) => {
    try {
      const tradeData = insertTradeSchema.parse(req.body);
      const trade = await storage.createTrade(tradeData);
      
      // Broadcast new trade to connected clients
      broadcast({
        type: 'trade_created',
        data: trade
      });

      // Update analysis results
      await tradeAnalysis.updateAnalysis(trade);
      
      res.status(201).json(trade);
    } catch (error) {
      res.status(400).json({ error: 'Invalid trade data' });
    }
  });

  app.get('/api/analysis', async (req, res) => {
    try {
      const results = await storage.getAnalysisResults();
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analysis results' });
    }
  });

  app.post('/api/analysis', async (req, res) => {
    try {
      const analysisData = insertAnalysisResultSchema.parse(req.body);
      const result = await storage.createAnalysisResult(analysisData);
      
      broadcast({
        type: 'analysis_updated',
        data: result
      });
      
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: 'Invalid analysis data' });
    }
  });

  app.get('/api/monitoring/status', async (req, res) => {
    try {
      const session = await storage.getActiveMonitoringSession();
      const status = screenCapture.getStatus();
      res.json({
        session,
        captureStatus: status
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch monitoring status' });
    }
  });

  app.post('/api/monitoring/start', async (req, res) => {
    try {
      const sessionData = insertMonitoringSessionSchema.parse(req.body);
      const session = await storage.createMonitoringSession(sessionData);
      
      // Start screen capture monitoring
      await screenCapture.start({
        onTradeDetected: async (trade) => {
          const newTrade = await storage.createTrade(trade);
          broadcast({
            type: 'trade_detected',
            data: newTrade
          });
          await tradeAnalysis.updateAnalysis(newTrade);
        },
        onAnalysisUpdate: (analysis) => {
          broadcast({
            type: 'analysis_update',
            data: analysis
          });
        }
      });
      
      broadcast({
        type: 'monitoring_started',
        data: session
      });
      
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ error: 'Failed to start monitoring' });
    }
  });

  app.post('/api/monitoring/stop', async (req, res) => {
    try {
      const session = await storage.getActiveMonitoringSession();
      if (session) {
        await storage.updateMonitoringSession(session.id, {
          isActive: false,
          endTime: new Date()
        });
        
        await screenCapture.stop();
        
        broadcast({
          type: 'monitoring_stopped',
          data: session
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to stop monitoring' });
    }
  });

  app.get('/api/stats', async (req, res) => {
    try {
      const trades = await storage.getTrades(1000);
      const analysis = await storage.getAnalysisResults();
      
      const stats = tradeAnalysis.calculateStats(trades, analysis);
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to calculate stats' });
    }
  });

  return httpServer;
}
