import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AnalysisTableProps {
  isDemo: boolean;
}

export default function AnalysisTable({ isDemo }: AnalysisTableProps) {
  const { data: analysisResults } = useQuery({
    queryKey: ['/api/analysis'],
    refetchInterval: 10000,
  });

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log('Exporting analysis data...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recommended':
        return 'bg-green-500/10 text-green-500';
      case 'good':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'testing':
        return 'bg-blue-500/10 text-blue-500';
      case 'avoid':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card className="bg-card border border-border">
      <CardHeader className="flex items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Timeframe × Expiration Analysis
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary hover:text-primary/80"
          onClick={handleExport}
          data-testid="button-export-analysis"
        >
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Timeframe</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Expiration</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Win Rate</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Trades</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Confidence</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {analysisResults?.map((result: any) => (
                <tr 
                  key={`${result.timeframe}-${result.expiration}`} 
                  className="hover:bg-muted/50 transition-colors"
                  data-testid={`row-analysis-${result.timeframe}-${result.expiration}`}
                >
                  <td className="py-3 px-2 font-mono text-foreground">{result.timeframe}</td>
                  <td className="py-3 px-2 font-mono text-foreground">{result.expiration}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`font-semibold ${parseFloat(result.winRate) >= 80 ? 'text-green-500' : parseFloat(result.winRate) >= 70 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {result.winRate}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center text-muted-foreground">{result.totalTrades}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={getConfidenceColor(result.confidence)}>
                      {result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <Badge className={getStatusColor(result.status)}>
                      {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))}
              {(!analysisResults || analysisResults.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No analysis data available. Start monitoring to collect data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
