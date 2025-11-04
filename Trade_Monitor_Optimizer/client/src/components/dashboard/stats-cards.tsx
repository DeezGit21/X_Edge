import { Trophy, Clock, BarChart3, ThumbsUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface StatsCardsProps {
  isDemo: boolean;
}

export default function StatsCards({ isDemo }: StatsCardsProps) {
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 5000,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className="bg-card border border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Win Rate</p>
              <p className="text-3xl font-bold text-green-500" data-testid="text-win-rate">
                {stats?.currentWinRate ? `${stats.currentWinRate}%` : '0%'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Trophy className="text-green-500 h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500">↗ +2.1% from yesterday</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Best Timeframe</p>
              <p className="text-3xl font-bold text-foreground" data-testid="text-best-timeframe">
                {stats?.bestTimeframe || '1 Min'}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Clock className="text-primary h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-muted-foreground">
              {stats?.bestExpiration || '30sec'} expiration
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Trades Analyzed</p>
              <p className="text-3xl font-bold text-foreground" data-testid="text-trades-analyzed">
                {stats?.tradesAnalyzed || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-orange-500 h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-muted-foreground">Last 24 hours</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recommended Action</p>
              <p className="text-lg font-bold text-primary" data-testid="text-recommended-action">
                {stats?.recommendedAction || 'Start Trading'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <ThumbsUp className="text-green-500 h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500">
              Confidence: {stats?.confidence || 0}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
