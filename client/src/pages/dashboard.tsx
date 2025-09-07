import { useState } from "react";
import StatsCards from "@/components/dashboard/stats-cards";
import PerformanceChart from "@/components/dashboard/performance-chart";
import ExpirationChart from "@/components/dashboard/expiration-chart";
import AnalysisTable from "@/components/dashboard/analysis-table";
import ActivityFeed from "@/components/dashboard/activity-feed";
import MonitorSection from "@/components/dashboard/monitor-section";
import TimeframeSelector from "@/components/dashboard/timeframe-selector";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const [isDemo, setIsDemo] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
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
            detectionEnabled: true
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
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-foreground">Timeframe Analysis Dashboard</h2>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-500'}`}></div>
            <span>{isMonitoring ? 'Live Monitoring Active' : 'Monitoring Inactive'}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Mode Toggle */}
          <div className="flex items-center space-x-2 bg-secondary rounded-lg p-1">
            <Button
              size="sm"
              variant={isDemo ? "default" : "ghost"}
              className="text-xs font-medium"
              onClick={() => setIsDemo(true)}
              data-testid="button-demo-mode"
            >
              Demo Mode
            </Button>
            <Button
              size="sm"
              variant={!isDemo ? "default" : "ghost"}
              className="text-xs font-medium"
              onClick={() => setIsDemo(false)}
              data-testid="button-live-mode"
            >
              Live Mode
            </Button>
          </div>
          
          {/* Start/Stop Button */}
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
              {isMonitoring ? 'Stop Analysis' : 'Start Analysis'}
            </span>
          </Button>
        </div>
      </div>

      {/* Dashboard Content */}
      <TimeframeSelector 
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
      />
      
      <StatsCards isDemo={isDemo} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PerformanceChart />
        <ExpirationChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <AnalysisTable isDemo={isDemo} />
        </div>
        <ActivityFeed />
      </div>

      <MonitorSection isMonitoring={isMonitoring} />
    </div>
  );
}
