import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import DetectionAreaConfig from "./detection-area-config";
import { useState } from "react";

interface DetectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MonitorSectionProps {
  isMonitoring: boolean;
  detectionArea?: DetectionArea;
  onAreaChange?: (area: DetectionArea) => void;
}

export default function MonitorSection({ 
  isMonitoring, 
  detectionArea = { x: 0, y: 0, width: 1920, height: 100 },
  onAreaChange 
}: MonitorSectionProps) {
  const [configOpen, setConfigOpen] = useState(false);
  const { data: monitoringStatus } = useQuery({
    queryKey: ['/api/monitoring/status'],
    refetchInterval: 5000,
  });

  const detectionItems = [
    { icon: '✅', name: 'Timeframe Set', key: 'chartDetection', expected: 'Manually selected', status: 'active' },
    { icon: '💱', name: 'Asset Detection', key: 'tradeDetection', expected: 'EUR/USD, GBP/JPY, etc.', status: 'scanning' },
    { icon: '⏰', name: 'Trade Timer', key: 'timerDetection', expected: 'Expiration countdown', status: 'scanning' },
    { icon: '⚡', name: 'Trade Execution', key: 'resultDetection', expected: 'Buy/Sell button clicks', status: 'waiting' },
  ];

  return (
    <Card className="bg-card border border-border">
      <CardHeader className="flex items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">Screen Capture Monitor</CardTitle>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Camera className={isMonitoring ? 'text-green-500' : 'text-gray-500'} size={16} />
            <span data-testid="text-capture-status">
              {isMonitoring ? 'Capturing: Trading Platform' : 'Capture Inactive'}
            </span>
          </div>
          <Dialog open={configOpen} onOpenChange={setConfigOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="secondary" 
                size="sm"
                data-testid="button-configure-capture"
              >
                <Settings className="w-4 h-4 mr-1" />
                Configure
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Screen Capture Configuration</DialogTitle>
              </DialogHeader>
              {onAreaChange && (
                <DetectionAreaConfig 
                  currentArea={detectionArea}
                  onAreaChange={(area) => {
                    onAreaChange(area);
                    setConfigOpen(false);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Live Capture Preview</h4>
            <div className="aspect-video bg-secondary/50 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-12 h-12 text-muted-foreground mb-3 mx-auto" />
                <p className="text-muted-foreground">Screen capture will appear here</p>
                <p className="text-xs text-muted-foreground mt-1" data-testid="text-detection-status">
                  {isMonitoring ? 'Scanning for PocketOption/Binary Baseline interface...' : 'Waiting for capture...'}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Detection Status</h4>
            <div className="space-y-3">
              {detectionItems.map((item) => (
                <div 
                  key={item.key} 
                  className="flex flex-col p-3 bg-secondary/50 rounded-lg space-y-2"
                  data-testid={`status-${item.key}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>{item.icon}</span>
                      <span className="text-sm text-foreground">{item.name}</span>
                    </div>
                    <span className={`text-xs font-medium ${
                      !isMonitoring ? 'text-gray-500' :
                      item.status === 'active' ? 'text-green-500' :
                      item.status === 'scanning' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`}>
                      {!isMonitoring ? 'Inactive' :
                       item.status === 'active' ? 'Ready' :
                       item.status === 'scanning' ? 'Scanning...' :
                       'Waiting...'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Looking for: {item.expected}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
