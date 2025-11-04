import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Move, Activity, Eye, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface FloatingStatusProps {
  isOpen: boolean;
  onClose: () => void;
  isMonitoring: boolean;
}

interface StatusData {
  chartColor: 'green' | 'red' | 'neutral';
  confidence: number;
  lastUpdate: string;
  tradesDetected: number;
  currentAsset: string;
  activeTradeCount: number;
}

export default function FloatingStatusWindow({ isOpen, onClose, isMonitoring }: FloatingStatusProps) {
  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [statusData, setStatusData] = useState<StatusData>({
    chartColor: 'neutral',
    confidence: 0,
    lastUpdate: '',
    tradesDetected: 0,
    currentAsset: 'AUD/CHF',
    activeTradeCount: 0
  });
  
  const windowRef = useRef<HTMLDivElement>(null);

  // Get monitoring status
  const { data: monitoringStatus } = useQuery({
    queryKey: ['/api/monitoring/status'],
    refetchInterval: 2000,
    enabled: isMonitoring
  });

  // Get trade count
  const { data: trades } = useQuery({
    queryKey: ['/api/trades'],
    refetchInterval: 5000,
    enabled: isMonitoring
  });

  // Reset active trade count when monitoring stops
  useEffect(() => {
    if (!isMonitoring) {
      setStatusData(prev => ({ ...prev, activeTradeCount: 0 }));
    }
  }, [isMonitoring]);

  // WebSocket for real-time updates
  useEffect(() => {
    if (!isMonitoring || !isOpen) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    let activeTradeIds = new Set<string>();

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'color_status_update') {
          setStatusData(prev => ({
            ...prev,
            chartColor: data.data.colors?.dominantColor || 'neutral',
            confidence: parseFloat(data.data.colors?.confidence || '0'),
            lastUpdate: new Date().toLocaleTimeString()
          }));
        } else if (data.type === 'trade_created' || data.type === 'trade_detected') {
          // Track new active trade
          activeTradeIds.add(data.data.id);
          setStatusData(prev => ({
            ...prev,
            activeTradeCount: activeTradeIds.size
          }));
        } else if (data.type === 'sample_collected') {
          // Update live during sample collection
          setStatusData(prev => ({
            ...prev,
            lastUpdate: new Date().toLocaleTimeString()
          }));
        } else if (data.type === 'trade_completed') {
          // Remove completed trade
          activeTradeIds.delete(data.data.id);
          setStatusData(prev => ({
            ...prev,
            activeTradeCount: activeTradeIds.size
          }));
        }
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    };

    return () => {
      socket.close();
      activeTradeIds.clear();
    };
  }, [isMonitoring, isOpen]);

  // Update trade count
  useEffect(() => {
    if (trades && Array.isArray(trades)) {
      setStatusData(prev => ({
        ...prev,
        tradesDetected: trades.length
      }));
    }
  }, [trades]);

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 300, e.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - 200, e.clientY - dragOffset.y))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  const getStatusColor = () => {
    if (!isMonitoring) return 'text-gray-500';
    return statusData.chartColor === 'green' ? 'text-green-500' : 
           statusData.chartColor === 'red' ? 'text-red-500' : 'text-yellow-500';
  };

  const getStatusIcon = () => {
    if (!isMonitoring) return '⏸️';
    return statusData.chartColor === 'green' ? '🟢' : 
           statusData.chartColor === 'red' ? '🔴' : '🟡';
  };

  return (
    <div
      ref={windowRef}
      className="fixed z-[9999] bg-background border-2 border-border rounded-lg shadow-2xl"
      style={{
        left: position.x,
        top: position.y,
        width: '280px',
        userSelect: isDragging ? 'none' : 'auto'
      }}
      onMouseDown={handleMouseDown}
    >
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-2 pt-3 px-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 drag-handle cursor-move">
              <Move className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Trade Monitor</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="px-3 pb-3 space-y-3">
          {/* Monitoring Status */}
          <div className="flex items-center justify-between p-2 bg-secondary/50 rounded">
            <div className="flex items-center space-x-2">
              <Activity className={`w-4 h-4 ${isMonitoring ? 'text-green-500' : 'text-gray-500'}`} />
              <span className="text-xs font-medium">
                {isMonitoring ? 'MONITORING' : 'STOPPED'}
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg">{getStatusIcon()}</div>
            </div>
          </div>

          {/* Chart Status */}
          {isMonitoring && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Chart Color:</span>
                <span className={`font-bold ${getStatusColor()}`}>
                  {statusData.chartColor.toUpperCase()}
                  {statusData.chartColor !== 'neutral' && 
                    ` (${statusData.confidence.toFixed(0)}%)`
                  }
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Asset:</span>
                <span className="font-mono">{statusData.currentAsset}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Active Trades:</span>
                <span className="font-bold text-blue-500">{statusData.activeTradeCount}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Analyzed:</span>
                <span className="font-bold text-purple-500">{statusData.tradesDetected}</span>
              </div>
              
              {statusData.lastUpdate && (
                <div className="text-center text-xs text-muted-foreground">
                  Last: {statusData.lastUpdate}
                </div>
              )}
            </div>
          )}

          {/* Not monitoring state */}
          {!isMonitoring && (
            <div className="text-center py-4">
              <Eye className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-xs text-muted-foreground">
                Start monitoring to see live status
              </p>
            </div>
          )}

          {/* Quick indicators */}
          {isMonitoring && (
            <div className="flex justify-center space-x-4 pt-2 border-t border-border">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">WIN</div>
                <div className="text-green-500 font-bold">
                  {statusData.chartColor === 'green' ? '✓' : '○'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">LOSS</div>
                <div className="text-red-500 font-bold">
                  {statusData.chartColor === 'red' ? '✓' : '○'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">SCANNING</div>
                <div className="text-yellow-500 font-bold">
                  {statusData.chartColor === 'neutral' ? '●' : '○'}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}