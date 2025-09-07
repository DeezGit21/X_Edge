import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import { useEffect, useState } from "react";

interface ActivityItem {
  id: string;
  type: 'WIN' | 'LOSS' | 'ANALYSIS';
  message: string;
  timestamp: string;
  color: string;
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const { lastMessage } = useWebSocket();

  const { data: trades } = useQuery({
    queryKey: ['/api/trades'],
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage);
      
      if (data.type === 'trade_created' || data.type === 'trade_detected') {
        const trade = data.data;
        const newActivity: ActivityItem = {
          id: trade.id,
          type: trade.outcome === 'win' ? 'WIN' : 'LOSS',
          message: `${trade.asset} - ${trade.timeframe}/${trade.expiration}`,
          timestamp: new Date(trade.timestamp).toLocaleTimeString(),
          color: trade.outcome === 'win' ? 'green' : 'red'
        };

        setActivities(prev => [newActivity, ...prev].slice(0, 20));
      } else if (data.type === 'analysis_update') {
        const newActivity: ActivityItem = {
          id: Date.now().toString(),
          type: 'ANALYSIS',
          message: 'New pattern detected',
          timestamp: new Date().toLocaleTimeString(),
          color: 'blue'
        };

        setActivities(prev => [newActivity, ...prev].slice(0, 20));
      }
    }
  }, [lastMessage]);

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Live Analysis Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto" data-testid="container-activity-feed">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start space-x-3 p-3 bg-secondary/30 rounded-lg"
              data-testid={`activity-${activity.type.toLowerCase()}-${activity.id}`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 ${
                activity.color === 'green' ? 'bg-green-500 animate-pulse' : 
                activity.color === 'red' ? 'bg-red-500' :
                'bg-blue-500 animate-pulse'
              }`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className={`font-medium ${
                    activity.color === 'green' ? 'text-green-500' :
                    activity.color === 'red' ? 'text-red-500' :
                    'text-blue-500'
                  }`}>
                    {activity.type}
                  </span> - {activity.message}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {activity.timestamp} - Trade analyzed
                </p>
              </div>
            </div>
          ))}
          
          {activities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activity</p>
              <p className="text-xs mt-1">Start monitoring to see live updates</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
