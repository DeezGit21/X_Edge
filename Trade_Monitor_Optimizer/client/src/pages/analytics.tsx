import PerformanceChart from "@/components/dashboard/performance-chart";
import ExpirationChart from "@/components/dashboard/expiration-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Target, Activity, Zap } from "lucide-react";

export default function Analytics() {
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 5000,
  });

  const { data: trades } = useQuery({
    queryKey: ['/api/trades'],
    refetchInterval: 10000,
  });

  const getTimeframeStats = () => {
    if (!trades || !Array.isArray(trades)) return [];
    
    const timeframes = ['30sec', '1min', '5min', '15min', '30min'];
    return timeframes.map(timeframe => {
      const timeframeTrades = trades.filter((t: any) => t.timeframe === timeframe);
      const wins = timeframeTrades.filter((t: any) => t.outcome === 'win').length;
      const winRate = timeframeTrades.length > 0 ? (wins / timeframeTrades.length) * 100 : 0;
      
      return {
        timeframe,
        trades: timeframeTrades.length,
        wins,
        winRate: Math.round(winRate * 10) / 10,
      };
    });
  };

  const timeframeStats = getTimeframeStats();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Detailed performance analysis and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Trades</p>
                <p className="text-3xl font-bold text-foreground" data-testid="text-total-trades">
                  {trades && Array.isArray(trades) ? trades.length : 0}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Win Rate</p>
                <p className="text-3xl font-bold text-green-500" data-testid="text-best-win-rate">
                  {timeframeStats.length > 0 ? `${Math.max(...timeframeStats.map(s => s.winRate))}%` : '0%'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Most Active</p>
                <p className="text-3xl font-bold text-foreground" data-testid="text-most-active">
                  {timeframeStats.length > 0 ? 
                    timeframeStats.reduce((prev, current) => (prev.trades > current.trades) ? prev : current).timeframe 
                    : 'N/A'}
                </p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                <p className="text-3xl font-bold text-primary" data-testid="text-confidence">
                  {stats && typeof stats === 'object' && 'confidence' in stats ? stats.confidence : 0}%
                </p>
              </div>
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart />
        <ExpirationChart />
      </div>

      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle>Detailed Timeframe Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Timeframe</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Top Asset</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Total Trades</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Wins</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Win Rate</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {timeframeStats.map((stat) => (
                  <tr key={stat.timeframe} className="hover:bg-muted/50 transition-colors" data-testid={`row-timeframe-${stat.timeframe}`}>
                    <td className="py-3 px-2 font-mono text-foreground">{stat.timeframe}</td>
                    <td className="py-3 px-2 text-center text-primary font-semibold">EUR/USD</td>
                    <td className="py-3 px-2 text-center text-foreground">{stat.trades}</td>
                    <td className="py-3 px-2 text-center text-green-500">{stat.wins}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`font-semibold ${stat.winRate >= 80 ? 'text-green-500' : stat.winRate >= 70 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {stat.winRate}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`text-xs px-2 py-1 rounded ${
                        stat.winRate >= 80 ? 'bg-green-500/10 text-green-500' :
                        stat.winRate >= 70 ? 'bg-yellow-500/10 text-yellow-500' :
                        stat.winRate >= 60 ? 'bg-blue-500/10 text-blue-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {stat.winRate >= 80 ? 'Excellent' : stat.winRate >= 70 ? 'Good' : stat.winRate >= 60 ? 'Fair' : 'Poor'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}