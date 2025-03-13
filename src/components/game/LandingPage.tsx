import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameRules from "./GameRules";
import { motion } from "framer-motion";

export default function LandingPage({
  onJoinGame,
  onCreateGame,
}: {
  onJoinGame: (name: string, roomCode: string) => void;
  onCreateGame: (name: string) => void;
}) {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [activeTab, setActiveTab] = useState("join");

  const handleJoinGame = () => {
    if (playerName.trim()) {
      onJoinGame(playerName, roomCode);
    }
  };

  const handleCreateGame = () => {
    if (playerName.trim()) {
      onCreateGame(playerName);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 relative overflow-hidden">
      {/* Animated background cards */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: -100,
              rotate: Math.random() * 180 - 90,
              scale: 0.5 + Math.random() * 0.5,
            }}
            animate={{
              y: window.innerHeight + 100,
              rotate: Math.random() * 360 - 180,
            }}
            transition={{
              duration: 15 + Math.random() * 20,
              repeat: Infinity,
              delay: i * 2,
              ease: "linear",
            }}
            style={{ opacity: 0.05 + Math.random() * 0.1 }}
          >
            <div className="w-32 h-48 bg-primary/10 rounded-lg border-2 border-primary/20 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary/20">
                {["♠", "♥", "♦", "♣"][Math.floor(Math.random() * 4)]}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md relative z-10 shadow-xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CardTitle className="text-3xl font-bold">
                Joker Card Game
              </CardTitle>
              <CardDescription>Play with friends online</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="join">Join Game</TabsTrigger>
                <TabsTrigger value="create">Create Game</TabsTrigger>
              </TabsList>
              <TabsContent value="join" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomCode">Room Code</Label>
                  <Input
                    id="roomCode"
                    placeholder="Enter room code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={4}
                    className="font-mono uppercase"
                  />
                </div>
              </TabsContent>
              <TabsContent value="create" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="createName">Your Name</Label>
                  <Input
                    id="createName"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                  />
                </div>
                <div className="text-sm text-muted-foreground mt-4">
                  Create a new game room and invite friends to join using the
                  room code.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            {activeTab === "join" ? (
              <Button
                className="w-full"
                onClick={handleJoinGame}
                disabled={!playerName.trim() || !roomCode.trim()}
              >
                Join Game
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleCreateGame}
                disabled={!playerName.trim()}
              >
                Create Game
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>

      <GameRules />
    </div>
  );
}
