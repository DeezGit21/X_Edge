import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Activity } from "lucide-react";
import { useState, useEffect } from "react";

interface ColorAnalysis {
  tradesDetected: number;
  winningTrades: number;
  losingTrades: number;
  redPixels: number;
  greenPixels: number;
  redPercentage: string;
  greenPercentage: string;
  confidence: string;
  dominantColor: string;
}

interface ColorDetectionDisplayProps {
  isMonitoring: boolean;
}

export default function ColorDetectionDisplay({ isMonitoring }: ColorDetectionDisplayProps) {
  const [colorAnalysis, setColorAnalysis] = useState<ColorAnalysis | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    if (!isMonitoring) {
      setColorAnalysis(null);
      setLastUpdate('');
      return;
    }

    // WebSocket connection for real-time updates
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'color_status_update') {
          setColorAnalysis(data.data.colors);
          setLastUpdate(new Date().toLocaleTimeString());
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, [isMonitoring]);

  if (!isMonitoring) {
    return (
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Live Color Detection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-muted-foreground">Start monitoring to see live color detection</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Live Color Detection</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </CardTitle>
        {lastUpdate && (
          <p className="text-xs text-muted-foreground">
            Last update: {lastUpdate}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {colorAnalysis ? (
          <>
            {/* Color Status Indicator */}
            <div className="flex items-center justify-center space-x-4 py-4">
              <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-white font-bold text-lg ${
                colorAnalysis.dominantColor === 'red' ? 'bg-red-500 border-red-400' :
                colorAnalysis.dominantColor === 'green' ? 'bg-green-500 border-green-400' :
                'bg-gray-500 border-gray-400'
              }`}>
                {colorAnalysis.dominantColor === 'red' ? 'L' : 
                 colorAnalysis.dominantColor === 'green' ? 'W' : '?'}
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {colorAnalysis.dominantColor === 'red' ? 'Losing Trade' :
                   colorAnalysis.dominantColor === 'green' ? 'Winning Trade' :
                   'No Trade Detected'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Confidence: {colorAnalysis.confidence}%
                </p>
              </div>
            </div>

            {/* Color Analysis Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">Red Pixels</span>
                </div>
                <p className="text-lg font-bold text-red-600">{colorAnalysis.redPixels.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{colorAnalysis.redPercentage}% of scan area</p>
              </div>

              <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Green Pixels</span>
                </div>
                <p className="text-lg font-bold text-green-600">{colorAnalysis.greenPixels.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{colorAnalysis.greenPercentage}% of scan area</p>
              </div>
            </div>

            {/* Trade Detection Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Trades Detected:</span>
                <span className="font-medium">{colorAnalysis.tradesDetected}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Winning Trades:</span>
                <span className="font-medium text-green-600">{colorAnalysis.winningTrades}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Losing Trades:</span>
                <span className="font-medium text-red-600">{colorAnalysis.losingTrades}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-muted-foreground">Analyzing screen colors...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}