import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ConnectionStatusProps {
  connected: boolean;
  error: string | null;
}

export default function ConnectionStatus({
  connected,
  error,
}: ConnectionStatusProps) {
  if (connected) {
    return (
      <div className="fixed bottom-4 right-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
        <Wifi className="h-4 w-4" />
        <span>Connected</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="destructive"
        className="fixed bottom-4 right-4 w-auto max-w-md"
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Connection Error</AlertTitle>
        <AlertDescription>
          {error}
          <div className="text-xs mt-1">Using mock data for development</div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
      <WifiOff className="h-4 w-4" />
      <span>Offline (using mock data)</span>
    </div>
  );
}
