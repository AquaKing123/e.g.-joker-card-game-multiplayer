import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Share2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import GameRules from "./GameRules";

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

interface GameLobbyProps {
  roomCode: string;
  players: Player[];
  currentPlayer: Player;
  onStartGame: () => void;
  onCopyRoomCode: () => void;
}

export default function GameLobby({
  roomCode,
  players,
  currentPlayer,
  onStartGame,
  onCopyRoomCode,
}: GameLobbyProps) {
  const isHost = currentPlayer.isHost;
  const { toast } = useToast();

  const handleCopyRoomCode = () => {
    onCopyRoomCode();
    toast({
      title: "Room code copied!",
      description: "Share this code with your friends to join the game.",
      duration: 3000,
    });
  };

  const handleShareGame = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Joker Card Game!",
          text: `Join my game with room code: ${roomCode}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      handleCopyRoomCode();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Game Lobby</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1">
                  Room Code:{" "}
                  <span className="font-mono font-bold">{roomCode}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyRoomCode}
                  className="h-8 gap-1"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:text-xs">
                    Copy
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareGame}
                  className="h-8 gap-1"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:text-xs">
                    Share
                  </span>
                </Button>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">
                    Players ({players.length})
                  </h3>
                </div>
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  <div className="space-y-2">
                    {players.map((player, index) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{player.name}</span>
                          {player.id === currentPlayer.id && (
                            <Badge variant="outline" className="ml-1 text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        {player.isHost && <Badge>Host</Badge>}
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <motion.div
                className="text-center text-sm text-muted-foreground p-3 bg-muted/50 rounded-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {isHost
                  ? players.length < 2
                    ? "Invite at least one more player to start the game"
                    : "You can start the game when everyone has joined"
                  : "Waiting for the host to start the game"}
              </motion.div>
            </div>
          </CardContent>
          <CardFooter>
            {isHost ? (
              <Button
                className="w-full"
                onClick={onStartGame}
                disabled={players.length < 2}
              >
                Start Game
              </Button>
            ) : (
              <div className="w-full text-center p-2 bg-muted rounded-md">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  Waiting for host to start...
                </motion.div>
              </div>
            )}
          </CardFooter>
        </Card>
      </motion.div>

      <GameRules />
    </div>
  );
}
