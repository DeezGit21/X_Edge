import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export default function ExpirationChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { data: trades } = useQuery({
    queryKey: ['/api/trades'],
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (!canvasRef.current || !trades) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Calculate expiration performance for 1min timeframe
    const expirations = ['5sec', '10sec', '15sec', '30sec', '1min', '2min', '5min'];
    const data = expirations.map(expiration => {
      const filteredTrades = trades.filter((t: any) => t.timeframe === '1min' && t.expiration === expiration);
      const wins = filteredTrades.filter((t: any) => t.outcome === 'win').length;
      return filteredTrades.length > 0 ? (wins / filteredTrades.length) * 100 : 0;
    });

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // Chart dimensions
    const padding = 40;
    const chartWidth = canvas.offsetWidth - 2 * padding;
    const chartHeight = canvas.offsetHeight - 2 * padding;

    // Draw line chart
    if (data.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;

      data.forEach((value, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = canvas.offsetHeight - padding - (value / 100) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();

      // Draw points
      data.forEach((value, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = canvas.offsetHeight - padding - (value / 100) * chartHeight;
        
        ctx.beginPath();
        ctx.fillStyle = '#3B82F6';
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Labels
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(expirations[index], x, canvas.offsetHeight - 10);
        
        // Values
        ctx.fillStyle = '#F9FAFB';
        ctx.fillText(`${value.toFixed(1)}%`, x, y - 10);
      });
    }

  }, [trades]);

  return (
    <Card className="bg-card border border-border">
      <CardHeader className="flex items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">Expiration Performance</CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Current: 1 Min Candles</span>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-64">
          <canvas 
            ref={canvasRef}
            className="w-full h-full"
            data-testid="canvas-expiration-chart"
          />
        </div>
      </CardContent>
    </Card>
  );
}
