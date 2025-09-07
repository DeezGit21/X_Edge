import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface MonitorSectionProps {
  isMonitoring: boolean;
}

export default function MonitorSection({ isMonitoring }: MonitorSectionProps) {
  const { data: monitoringStatus } = useQuery({
    queryKey: ['/api/monitoring/status'],
    refetchInterval: 5000,
  });

  const detectionItems = [
    { icon: '📈', name: 'Chart Detection', key: 'chartDetection' },
    { icon: '💲', name: 'Trade Detection', key: 'tradeDetection' },
    { icon: '⏰', name: 'Timer Detection', key: 'timerDetection' },
    { icon: '🏆', name: 'Result Detection', key: 'resultDetection' },
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
          <Button 
            variant="secondary" 
            size="sm"
            data-testid="button-configure-capture"
          >
            <Settings className="w-4 h-4 mr-1" />
            Configure
          </Button>
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
                  {isMonitoring ? 'Binary Baseline interface detected' : 'Waiting for capture...'}
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
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                  data-testid={`status-${item.key}`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{item.icon}</span>
                    <span className="text-sm text-foreground">{item.name}</span>
                  </div>
                  <span className={`text-xs font-medium ${
                    isMonitoring ? 'text-green-500' : 'text-gray-500'
                  }`}>
                    {isMonitoring ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
