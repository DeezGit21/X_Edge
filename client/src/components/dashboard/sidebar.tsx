import { TrendingUp, Monitor, BarChart3, History, Settings } from "lucide-react";

interface SidebarProps {
  isConnected: boolean;
}

export default function Sidebar({ isConnected }: SidebarProps) {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="text-primary-foreground h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Timeframe Analyzer</h1>
            <p className="text-xs text-muted-foreground">Binary Baseline Integration</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <a 
          href="#" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 transition-colors"
          data-testid="link-dashboard"
        >
          <BarChart3 className="h-4 w-4" />
          <span className="text-sm font-medium">Dashboard</span>
        </a>
        <a 
          href="#" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          data-testid="link-monitor"
        >
          <Monitor className="h-4 w-4" />
          <span className="text-sm font-medium">Screen Monitor</span>
        </a>
        <a 
          href="#" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          data-testid="link-analytics"
        >
          <BarChart3 className="h-4 w-4" />
          <span className="text-sm font-medium">Analytics</span>
        </a>
        <a 
          href="#" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          data-testid="link-history"
        >
          <History className="h-4 w-4" />
          <span className="text-sm font-medium">Trade History</span>
        </a>
        <a 
          href="#" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          data-testid="link-settings"
        >
          <Settings className="h-4 w-4" />
          <span className="text-sm font-medium">Settings</span>
        </a>
      </nav>

      {/* Connection Status */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
          <div>
            <p className="text-sm font-medium text-foreground">Binary Baseline</p>
            <p className="text-xs text-muted-foreground" data-testid="text-connection-status">
              {isConnected ? 'Connected & Active' : 'Disconnected'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
