import { cn } from "@/lib/utils";

export type CardRank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "Joker";
export type CardSuit = "hearts" | "diamonds" | "clubs" | "spades" | "none";

export interface CardType {
  id: string;
  rank: CardRank;
  suit: CardSuit;
}

interface PlayingCardProps {
  card: CardType;
  isSelected?: boolean;
  isSelectable?: boolean;
  onClick?: () => void;
  className?: string;
  faceDown?: boolean;
}

export default function PlayingCard({
  card,
  isSelected = false,
  isSelectable = false,
  onClick,
  className,
  faceDown = false,
}: PlayingCardProps) {
  const isRed = card.suit === "hearts" || card.suit === "diamonds";
  const isJoker = card.rank === "Joker";

  const getSuitSymbol = (suit: CardSuit) => {
    switch (suit) {
      case "hearts":
        return "♥";
      case "diamonds":
        return "♦";
      case "clubs":
        return "♣";
      case "spades":
        return "♠";
      default:
        return "";
    }
  };

  return (
    <div
      className={cn(
        "relative w-24 h-36 rounded-lg border bg-card text-card-foreground shadow-sm transition-all",
        isSelected && "ring-2 ring-primary transform -translate-y-2",
        isSelectable && "cursor-pointer hover:shadow-md hover:-translate-y-1",
        !isSelectable && "cursor-default",
        className,
      )}
      onClick={isSelectable ? onClick : undefined}
    >
      {faceDown ? (
        <div className="w-full h-full flex items-center justify-center rounded-lg bg-primary/10 border-2 border-primary/20">
          <div className="w-16 h-24 rounded bg-primary/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary/40">?</span>
          </div>
        </div>
      ) : (
        <div className="p-2 h-full flex flex-col">
          <div
            className={cn(
              "text-lg font-bold flex justify-between items-center",
              isRed && "text-red-500",
              isJoker && "text-purple-500",
            )}
          >
            <span>{card.rank}</span>
            {!isJoker && <span>{getSuitSymbol(card.suit)}</span>}
          </div>

          <div className="flex-grow flex items-center justify-center">
            {isJoker ? (
              <span className="text-4xl text-purple-500">🃏</span>
            ) : (
              <span className={cn("text-4xl", isRed && "text-red-500")}>
                {getSuitSymbol(card.suit)}
              </span>
            )}
          </div>

          <div
            className={cn(
              "text-lg font-bold flex justify-between items-center rotate-180",
              isRed && "text-red-500",
              isJoker && "text-purple-500",
            )}
          >
            <span>{card.rank}</span>
            {!isJoker && <span>{getSuitSymbol(card.suit)}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
