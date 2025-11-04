import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function History() {
  const [filter, setFilter] = useState('all');
  
  const { data: trades } = useQuery({
    queryKey: ['/api/trades'],
    refetchInterval: 10000,
  });

  const handleExport = () => {
    console.log('Exporting trade history...');
  };

  const getFilteredTrades = () => {
    if (!trades || !Array.isArray(trades)) return [];
    
    switch (filter) {
      case 'wins':
        return trades.filter((t: any) => t.outcome === 'win');
      case 'losses':
        return trades.filter((t: any) => t.outcome === 'loss');
      case 'demo':
        return trades.filter((t: any) => t.isDemo === true);
      case 'live':
        return trades.filter((t: any) => t.isDemo === false);
      default:
        return trades;
    }
  };

  const filteredTrades = getFilteredTrades();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount: string) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trade History</h1>
          <p className="text-muted-foreground">Complete record of all trading activity</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-secondary rounded-lg p-1">
            <Button
              size="sm"
              variant={filter === 'all' ? "default" : "ghost"}
              className="text-xs font-medium"
              onClick={() => setFilter('all')}
              data-testid="filter-all"
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filter === 'wins' ? "default" : "ghost"}
              className="text-xs font-medium"
              onClick={() => setFilter('wins')}
              data-testid="filter-wins"
            >
              Wins
            </Button>
            <Button
              size="sm"
              variant={filter === 'losses' ? "default" : "ghost"}
              className="text-xs font-medium"
              onClick={() => setFilter('losses')}
              data-testid="filter-losses"
            >
              Losses
            </Button>
            <Button
              size="sm"
              variant={filter === 'demo' ? "default" : "ghost"}
              className="text-xs font-medium"
              onClick={() => setFilter('demo')}
              data-testid="filter-demo"
            >
              Demo
            </Button>
            <Button
              size="sm"
              variant={filter === 'live' ? "default" : "ghost"}
              className="text-xs font-medium"
              onClick={() => setFilter('live')}
              data-testid="filter-live"
            >
              Live
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-primary hover:text-primary/80"
            onClick={handleExport}
            data-testid="button-export-history"
          >
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Trading History ({filteredTrades.length} trades)</span>
            <Badge variant="secondary" data-testid="text-total-trades">
              {filteredTrades.length} Total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Date & Time</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Asset</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Timeframe</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Expiration</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Amount</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Outcome</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Mode</th>
                  <th className="text-center py-3 px-2 text-muted-foreground font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTrades.map((trade: any) => (
                  <tr 
                    key={trade.id} 
                    className="hover:bg-muted/50 transition-colors"
                    data-testid={`row-trade-${trade.id}`}
                  >
                    <td className="py-3 px-2 text-foreground font-mono text-xs">
                      {formatDate(trade.timestamp)}
                    </td>
                    <td className="py-3 px-2 font-mono text-foreground text-primary font-semibold">{trade.asset}</td>
                    <td className="py-3 px-2 font-mono text-foreground">{trade.timeframe}</td>
                    <td className="py-3 px-2 font-mono text-foreground">{trade.expiration}</td>
                    <td className="py-3 px-2 text-center text-foreground">
                      {formatAmount(trade.amount)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Badge 
                        className={
                          trade.outcome === 'win' 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-red-500/10 text-red-500'
                        }
                      >
                        {trade.outcome.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Badge variant={trade.isDemo ? "secondary" : "default"}>
                        {trade.isDemo ? 'DEMO' : 'LIVE'}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-center text-muted-foreground">
                      {trade.confidence ? `${trade.confidence}%` : 'N/A'}
                    </td>
                  </tr>
                ))}
                {filteredTrades.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No trades found for the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}