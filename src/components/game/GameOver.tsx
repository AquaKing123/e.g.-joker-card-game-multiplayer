import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

interface PlayerScore {
  id: string;
  name: string;
  score: number;
}

interface GameOverProps {
  winner: PlayerScore;
  scores: PlayerScore[];
  onPlayAgain: () => void;
  onExit: () => void;
}

export default function GameOver({
  winner,
  scores,
  onPlayAgain,
  onExit,
}: GameOverProps) {
  // If no scores provided, create a default one
  if (!scores || scores.length === 0) {
    scores = [{ id: "winner1", name: "Player 1", score: 1 }];
  }

  // If no winner provided, use the first player from scores
  if (!winner && scores.length > 0) {
    winner = scores[0];
  }
  // Sort scores in descending order
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Game Over</CardTitle>
          <CardDescription>The game has ended</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{winner.name} Wins!</h3>
            <p className="text-muted-foreground">with {winner.score} points</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Final Scores</h3>
            <div className="space-y-1">
              {sortedScores.map((player, index) => (
                <div
                  key={player.id}
                  className="flex justify-between items-center p-2 rounded-md bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">#{index + 1}</span>
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <span>{player.score} points</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" onClick={onPlayAgain}>
            Play Again
          </Button>
          <Button variant="outline" className="w-full" onClick={onExit}>
            Exit to Main Menu
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
