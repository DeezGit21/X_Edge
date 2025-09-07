import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

export default function PerformanceChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  
  const { data: trades } = useQuery({
    queryKey: ['/api/trades'],
    refetchInterval: 10000,
  });

  const getFilteredTrades = () => {
    if (!trades || !Array.isArray(trades)) return [];
    
    const now = new Date();
    let startDate: Date;
    
    switch (selectedPeriod) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        return trades;
    }
    
    return trades.filter((t: any) => new Date(t.timestamp) >= startDate);
  };

  useEffect(() => {
    if (!canvasRef.current || !trades) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Get filtered trades based on selected period
    const filteredTrades = getFilteredTrades();

    // Calculate timeframe performance
    const timeframes = ['30sec', '1min', '5min', '15min', '30min'];
    const data = timeframes.map(timeframe => {
      const timeframeTrades = filteredTrades.filter((t: any) => t.timeframe === timeframe);
      const wins = timeframeTrades.filter((t: any) => t.outcome === 'win').length;
      return timeframeTrades.length > 0 ? (wins / timeframeTrades.length) * 100 : 0;
    });

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // Chart dimensions
    const padding = 40;
    const chartWidth = canvas.offsetWidth - 2 * padding;
    const chartHeight = canvas.offsetHeight - 2 * padding;
    const barWidth = chartWidth / timeframes.length * 0.8;
    const spacing = chartWidth / timeframes.length * 0.2;

    // Draw bars
    data.forEach((value, index) => {
      const x = padding + index * (barWidth + spacing) + spacing / 2;
      const height = (value / 100) * chartHeight;
      const y = canvas.offsetHeight - padding - height;

      // Bar color based on performance
      const color = value >= 80 ? '#10b981' : value >= 70 ? '#f59e0b' : '#ef4444';
      
      ctx.fillStyle = color + '80'; // Add transparency
      ctx.fillRect(x, y, barWidth, height);
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth, height);

      // Labels
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(timeframes[index], x + barWidth / 2, canvas.offsetHeight - 10);
      
      // Values
      ctx.fillStyle = '#F9FAFB';
      ctx.fillText(`${value.toFixed(1)}%`, x + barWidth / 2, y - 5);
    });

  }, [trades, selectedPeriod]);

  return (
    <Card className="bg-card border border-border">
      <CardHeader className="flex items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">Win Rate by Timeframe</CardTitle>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32 bg-secondary border-border" data-testid="select-timeframe-period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-64">
          <canvas 
            ref={canvasRef}
            className="w-full h-full"
            data-testid="canvas-timeframe-chart"
          />
        </div>
      </CardContent>
    </Card>
  );
}
