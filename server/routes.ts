import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertTradeSchema, insertTradeSampleSchema, insertAnalysisResultSchema, insertMonitoringSessionSchema } from "@shared/schema";
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
      
      res.status(201).json(trade);
    } catch (error) {
      res.status(400).json({ error: 'Invalid trade data' });
    }
  });

  app.post('/api/trade-samples', async (req, res) => {
    try {
      const sampleData = insertTradeSampleSchema.parse(req.body);
      const sample = await storage.createTradeSample(sampleData);
      
      // Broadcast new sample to connected clients
      broadcast({
        type: 'sample_collected',
        data: sample
      });
      
      res.status(201).json(sample);
    } catch (error) {
      res.status(400).json({ error: 'Invalid sample data' });
    }
  });

  app.get('/api/trade-samples/:tradeId', async (req, res) => {
    try {
      const samples = await storage.getTradeSamples(req.params.tradeId);
      res.json(samples);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch samples' });
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
      const { selectedTimeframe, captureConfig } = req.body; // Extract selectedTimeframe and captureConfig from request
      const session = await storage.createMonitoringSession(sessionData);
      
      // Parse capture config if provided
      let parsedConfig: any = {};
      if (captureConfig) {
        try {
          parsedConfig = JSON.parse(captureConfig);
        } catch (e) {
          console.warn('Failed to parse capture config:', e);
        }
      }
      
      // Start screen capture monitoring
      await screenCapture.start({
        selectedTimeframe: selectedTimeframe || '1m',
        detectionArea: parsedConfig.detectionArea,
        platform: parsedConfig.platform || 'binary_baseline',
        refreshRate: parsedConfig.refreshRate || 1000,
        onTradeDetected: async (platformTradeId) => {
          // Create new trade in database
          const newTrade = await storage.createTrade({
            platformTradeId,
            userId: null,
            asset: 'Unknown', // Will be updated when detected
            tradeType: 'CALL',
            actualDuration: 60,
            timeframe: selectedTimeframe || '1m',
            isDemo: true,
            amount: '0',
            conditions: null,
            entryPrice: null
          });
          
          broadcast({
            type: 'trade_detected',
            data: newTrade
          });
        },
        onSampleCollected: async (tradeId, sample) => {
          // Store sample in database
          const newSample = await storage.createTradeSample(sample);
          
          broadcast({
            type: 'sample_collected',
            data: newSample
          });
          
          // Update analysis after each sample (for specific expirations)
          const commonExpirations = [5, 10, 15, 30, 45, 60];
          if (commonExpirations.includes(sample.timeElapsed)) {
            await tradeAnalysis.updateAnalysis(selectedTimeframe || '1m', sample.timeElapsed);
          }
        },
        onAnalysisUpdate: (analysis) => {
          broadcast({
            type: 'analysis_update',
            data: analysis
          });
        },
        onStatusUpdate: (status) => {
          broadcast({
            type: 'color_status_update',
            data: status
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
