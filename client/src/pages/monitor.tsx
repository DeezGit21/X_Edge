import MonitorSection from "@/components/dashboard/monitor-section";
import TimeframeSelector from "@/components/dashboard/timeframe-selector";
import ColorDetectionDisplay from "@/components/dashboard/color-detection-display";
import DetectionAreaConfig from "@/components/dashboard/detection-area-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Camera, Play, Square } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DetectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function Monitor() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [detectionArea, setDetectionArea] = useState<DetectionArea>({
    x: 0,
    y: 0,
    width: 1920,
    height: 100
  });
  const { toast } = useToast();

  const handleToggleMonitoring = async () => {
    try {
      if (isMonitoring) {
        await apiRequest('POST', '/api/monitoring/stop', {});
        setIsMonitoring(false);
        toast({
          title: "Monitoring Stopped",
          description: "Screen capture analysis has been stopped",
        });
      } else {
        await apiRequest('POST', '/api/monitoring/start', {
          captureConfig: JSON.stringify({
            platform: 'binary_baseline',
            refreshRate: 1000,
            detectionEnabled: true,
            detectionArea: detectionArea // Include detection area settings
          }),
          selectedTimeframe: selectedTimeframe, // Include selected timeframe
          isActive: true
        });
        setIsMonitoring(true);
        toast({
          title: "Monitoring Started",
          description: "Screen capture analysis is now active",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle monitoring",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Screen Monitor</h1>
          <p className="text-muted-foreground">Configure and monitor Binary Baseline screen capture</p>
        </div>
        <Button
          onClick={handleToggleMonitoring}
          className={`flex items-center space-x-2 ${
            isMonitoring 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
          data-testid="button-toggle-monitoring"
        >
          {isMonitoring ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeframeSelector 
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={setSelectedTimeframe}
        />
        
        <ColorDetectionDisplay isMonitoring={isMonitoring} />
      </div>
      
      <DetectionAreaConfig 
        currentArea={detectionArea}
        onAreaChange={setDetectionArea}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Capture Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Target Application</label>
              <select className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-foreground" data-testid="select-target-app">
                <option>Binary Baseline</option>
                <option>Pocket Option</option>
                <option>IQ Option</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Capture Rate</label>
              <select className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-foreground" data-testid="select-capture-rate">
                <option>1000ms (1 second)</option>
                <option>500ms (0.5 seconds)</option>
                <option>2000ms (2 seconds)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Detection Sensitivity</label>
              <select className="mt-1 w-full p-2 bg-secondary border border-border rounded-md text-foreground" data-testid="select-sensitivity">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Screen Detection Targets</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked data-testid="checkbox-timeframe-detection" />
                <span className="text-sm text-foreground">Timeframe Reading (M1, M5, M14, H1, etc.)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked data-testid="checkbox-asset-detection" />
                <span className="text-sm text-foreground">Asset Detection (EUR/USD, GBP/JPY, etc.)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked data-testid="checkbox-expiration-detection" />
                <span className="text-sm text-foreground">Expiration Timer Reading</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked data-testid="checkbox-trade-button-detection" />
                <span className="text-sm text-foreground">Buy/Sell Button Click Detection</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked data-testid="checkbox-result-detection" />
                <span className="text-sm text-foreground">Win/Loss Result Detection</span>
              </label>
            </div>
            
            <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">Manual Timeframe Selection</h4>
              <p className="text-xs text-muted-foreground">
                Set your timeframe manually using the selector above. All trades will be recorded with your selected timeframe for accurate analysis.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <MonitorSection isMonitoring={isMonitoring} />
    </div>
  );
}