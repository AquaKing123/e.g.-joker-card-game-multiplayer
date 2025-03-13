import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

export default function GameRules() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Game Rules</DialogTitle>
          <DialogDescription>How to play the Joker Card Game</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-bold mb-1">Objective</h3>
            <p>
              Collect as many matching sets of four cards as possible while
              avoiding ending up with the Joker card.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-1">Setup</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>2-6 players can participate</li>
              <li>Each player is dealt 7 cards</li>
              <li>One Joker card is included in the deck</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-1">Gameplay</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                On your turn, you can either pass a card to another player or
                request cards of a specific rank
              </li>
              <li>
                When you pass a card, select the card and the player to receive
                it
              </li>
              <li>
                When you request cards, you can ask for a specific rank (e.g.,
                "Do any players have any Kings?")
              </li>
              <li>You can make up to 2 requests per turn</li>
              <li>
                If a player has the requested card, they must give it to you
              </li>
              <li>If no player has the requested card, your turn ends</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-1">Matching Sets</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                A matching set consists of 4 cards of the same rank (e.g., four
                Kings)
              </li>
              <li>
                When you complete a set, it is removed from your hand and you
                score a point
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-1">The Joker</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>The Joker cannot be part of any set</li>
              <li>
                Players try to avoid ending up with the Joker by passing it to
                others
              </li>
              <li>The Joker can be passed like any other card</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-1">Game End</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>The game ends when all possible sets have been collected</li>
              <li>The player with the most sets wins</li>
              <li>If there's a tie, the player without the Joker wins</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
