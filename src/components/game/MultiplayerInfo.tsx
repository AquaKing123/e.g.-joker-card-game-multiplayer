import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MultiplayerInfoProps {
  roomCode: string;
  playerCount: number;
  connected: boolean;
}

export default function MultiplayerInfo({
  roomCode,
  playerCount,
  connected,
}: MultiplayerInfoProps) {
  return (
    <div className="fixed top-4 left-4 flex items-center gap-2 z-10">
      <div className="flex items-center gap-1.5">
        <Badge
          variant={connected ? "default" : "outline"}
          className={`${connected ? "bg-green-500" : "bg-amber-500/20 text-amber-700"}`}
        >
          {connected ? "Online" : "Offline Mode"}
        </Badge>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="inline-flex items-center justify-center rounded-full h-5 w-5 bg-muted/50">
                <Info className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">
                {connected
                  ? "Connected to game server"
                  : "Using mock data for development"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {roomCode && (
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="font-mono">
            Room: {roomCode}
          </Badge>
          <Badge variant="outline">Players: {playerCount}</Badge>
        </div>
      )}
    </div>
  );
}
