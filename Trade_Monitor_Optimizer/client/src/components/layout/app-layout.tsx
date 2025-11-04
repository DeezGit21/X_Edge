import Sidebar from "@/components/dashboard/sidebar";
import { useWebSocket } from "@/hooks/use-websocket";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isConnected } = useWebSocket();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isConnected={isConnected} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}