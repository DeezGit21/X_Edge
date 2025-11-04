import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export default function ExpirationChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { data: analysisResults } = useQuery({
    queryKey: ['/api/analysis'],
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!canvasRef.current || !analysisResults) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Time-series expiration intervals in seconds
    const expirations = [5, 10, 15, 30, 45, 60];
    const expirationLabels = ['5s', '10s', '15s', '30s', '45s', '1m'];
    
    // Get win rates for 1m timeframe at each expiration point
    const data = expirations.map(expiration => {
      const result = analysisResults.find((r: any) => 
        r.timeframe === '1m' && r.expiration === expiration
      );
      return result ? parseFloat(result.winRate) : 0;
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
        ctx.fillText(expirationLabels[index], x, canvas.offsetHeight - 10);
        
        // Values
        ctx.fillStyle = '#F9FAFB';
        ctx.fillText(`${value.toFixed(1)}%`, x, y - 10);
      });
    }

  }, [analysisResults]);

  return (
    <Card className="bg-card border border-border">
      <CardHeader className="flex items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">Time-Series Win Rate Analysis</CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Timeframe: 1m</span>
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
