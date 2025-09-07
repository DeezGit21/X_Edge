import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useState } from "react";

interface TimeframeSelectorProps {
  onTimeframeChange: (timeframe: string) => void;
  selectedTimeframe: string;
}

export default function TimeframeSelector({ onTimeframeChange, selectedTimeframe }: TimeframeSelectorProps) {
  const timeframes = [
    { value: '5s', label: '5s' },
    { value: '10s', label: '10s' },
    { value: '15s', label: '15s' },
    { value: '30s', label: '30s' },
    { value: '1m', label: '1m' },
    { value: '2m', label: '2m' },
    { value: '3m', label: '3m' },
    { value: '5m', label: '5m' },
    { value: '10m', label: '10m' },
    { value: '15m', label: '15m' },
    { value: '30m', label: '30m' },
    { value: '1h', label: '1h' },
    { value: '4h', label: '4h' },
    { value: '1d', label: '1d' }
  ];

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Current Candle Timeframe</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select the timeframe you're currently using on your trading platform
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.value}
              onClick={() => onTimeframeChange(timeframe.value)}
              className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                selectedTimeframe === timeframe.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary/50 hover:bg-secondary border-border text-foreground hover:text-foreground'
              }`}
              data-testid={`timeframe-${timeframe.value}`}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Currently Set: {timeframes.find(t => t.value === selectedTimeframe)?.label || 'None'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            All detected trades will be recorded with this timeframe
          </p>
        </div>
      </CardContent>
    </Card>
  );
}