import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import PlayingCard, { CardType } from "./Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Player {
  id: string;
  name: string;
  cardCount: number;
  isCurrentTurn: boolean;
}

interface GameEvent {
  id: string;
  message: string;
  timestamp: Date;
}

interface GameBoardProps {
  players: Player[];
  currentPlayer: Player;
  hand: CardType[];
  gameEvents: GameEvent[];
  onPassCard: (cardId: string, targetPlayerId: string) => void;
  onRequestCard: (rank: string) => void;
  requestsRemaining: number;
  matchedSets: CardType[][];
}

export default function GameBoard({
  players,
  currentPlayer,
  hand,
  gameEvents,
  onPassCard,
  onRequestCard,
  requestsRemaining,
  matchedSets,
}: GameBoardProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [targetPlayer, setTargetPlayer] = useState<string>("");
  const [requestRank, setRequestRank] = useState<string>("");

  const isMyTurn = currentPlayer.isCurrentTurn;
  const otherPlayers = players.filter((p) => p.id !== currentPlayer.id);

  const handleCardClick = (cardId: string) => {
    if (isMyTurn) {
      setSelectedCard(cardId === selectedCard ? null : cardId);
    }
  };

  const handlePassCard = () => {
    if (selectedCard && targetPlayer) {
      onPassCard(selectedCard, targetPlayer);
      setSelectedCard(null);
      setTargetPlayer("");
    }
  };

  const handleRequestCard = () => {
    if (requestRank) {
      onRequestCard(requestRank);
      setRequestRank("");
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col h-screen max-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow overflow-hidden">
        {/* Left column - Other players */}
        <div className="space-y-4 overflow-auto">
          <h2 className="text-xl font-bold">Players</h2>
          {otherPlayers.map((player) => (
            <Card
              key={player.id}
              className={`${player.isCurrentTurn ? "border-primary" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{player.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {player.cardCount} cards
                    </p>
                  </div>
                  {player.isCurrentTurn && <Badge>Current Turn</Badge>}
                </div>
                <div className="mt-2 flex justify-center">
                  {Array(Math.min(player.cardCount, 5))
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="-ml-4 first:ml-0">
                        <PlayingCard
                          card={{ id: `dummy-${i}`, rank: "A", suit: "hearts" }}
                          faceDown
                          className="w-12 h-18 transform scale-75"
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Middle column - Game board and actions */}
        <div className="flex flex-col space-y-4 overflow-auto">
          <div className="bg-muted p-4 rounded-lg flex-grow">
            <h2 className="text-xl font-bold mb-4">Game Board</h2>

            {/* Matched sets display */}
            {matchedSets.length > 0 && (
              <div className="mb-4">
                <h3 className="text-md font-medium mb-2">Your Matched Sets</h3>
                <div className="space-y-2">
                  {matchedSets.map((set, index) => (
                    <div key={index} className="flex justify-center space-x-1">
                      {set.map((card) => (
                        <PlayingCard
                          key={card.id}
                          card={card}
                          className="w-12 h-18 transform scale-75"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Game actions */}
            <div className="bg-card p-4 rounded-lg">
              <h3 className="text-md font-medium mb-2">Actions</h3>
              {isMyTurn ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Pass a Card</h4>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select
                        value={targetPlayer}
                        onValueChange={setTargetPlayer}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select player" />
                        </SelectTrigger>
                        <SelectContent>
                          {otherPlayers.map((player) => (
                            <SelectItem key={player.id} value={player.id}>
                              {player.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handlePassCard}
                        disabled={!selectedCard || !targetPlayer}
                      >
                        Pass Card
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">
                      Request a Card ({requestsRemaining} remaining)
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select
                        value={requestRank}
                        onValueChange={setRequestRank}
                        disabled={requestsRemaining <= 0}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select rank" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "A",
                            "2",
                            "3",
                            "4",
                            "5",
                            "6",
                            "7",
                            "8",
                            "9",
                            "10",
                            "J",
                            "Q",
                            "K",
                          ].map((rank) => (
                            <SelectItem key={rank} value={rank}>
                              {rank}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleRequestCard}
                        disabled={!requestRank || requestsRemaining <= 0}
                      >
                        Request
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 bg-muted rounded-md">
                  Waiting for your turn...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Game events */}
        <div className="space-y-4 overflow-auto">
          <h2 className="text-xl font-bold">Game Log</h2>
          <Card>
            <CardContent className="p-4">
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {gameEvents.map((event) => (
                    <div
                      key={event.id}
                      className="text-sm border-b pb-1 last:border-0"
                    >
                      <span className="text-muted-foreground text-xs">
                        {event.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <p>{event.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom area - Player's hand */}
      <div className="mt-4 p-4 bg-muted rounded-lg">
        <h2 className="text-xl font-bold mb-2">Your Hand</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {hand.map((card) => (
            <PlayingCard
              key={card.id}
              card={card}
              isSelected={card.id === selectedCard}
              isSelectable={isMyTurn}
              onClick={() => handleCardClick(card.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
