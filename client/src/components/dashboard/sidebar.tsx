import { TrendingUp, Monitor, BarChart3, History, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  isConnected: boolean;
}

export default function Sidebar({ isConnected }: SidebarProps) {
  const [location] = useLocation();
  
  const isActiveLink = (path: string) => {
    if (path === '/' && (location === '/' || location === '/dashboard')) return true;
    return location === path;
  };
  
  const getLinkClass = (path: string) => {
    const baseClass = "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors";
    if (isActiveLink(path)) {
      return `${baseClass} bg-primary/10 text-primary border border-primary/20`;
    }
    return `${baseClass} text-muted-foreground hover:text-foreground hover:bg-muted`;
  };
  
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
        <Link 
          href="/"
          className={getLinkClass('/')}
          data-testid="link-dashboard"
        >
          <BarChart3 className="h-4 w-4" />
          <span className="text-sm font-medium">Dashboard</span>
        </Link>
        <Link 
          href="/monitor"
          className={getLinkClass('/monitor')}
          data-testid="link-monitor"
        >
          <Monitor className="h-4 w-4" />
          <span className="text-sm font-medium">Screen Monitor</span>
        </Link>
        <Link 
          href="/analytics"
          className={getLinkClass('/analytics')}
          data-testid="link-analytics"
        >
          <BarChart3 className="h-4 w-4" />
          <span className="text-sm font-medium">Analytics</span>
        </Link>
        <Link 
          href="/history"
          className={getLinkClass('/history')}
          data-testid="link-history"
        >
          <History className="h-4 w-4" />
          <span className="text-sm font-medium">Trade History</span>
        </Link>
        <Link 
          href="/settings"
          className={getLinkClass('/settings')}
          data-testid="link-settings"
        >
          <Settings className="h-4 w-4" />
          <span className="text-sm font-medium">Settings</span>
        </Link>
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
