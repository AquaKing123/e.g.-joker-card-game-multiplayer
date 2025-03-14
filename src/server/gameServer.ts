import { GameEventType } from "@/lib/gameEvents";
import { CardType } from "@/components/game/Card";

// Server URL configuration
export const SERVER_URL = import.meta.env.VITE_GAME_SERVER_URL || "";

// Mock data for local development when server is not available
export const generateMockData = () => {
  // Mock cards for player's hand
  const mockCards: CardType[] = [
    { id: "1", rank: "A", suit: "hearts" },
    { id: "2", rank: "A", suit: "diamonds" },
    { id: "3", rank: "K", suit: "clubs" },
    { id: "4", rank: "10", suit: "spades" },
    { id: "5", rank: "Q", suit: "hearts" },
    { id: "6", rank: "Joker", suit: "none" },
    { id: "7", rank: "7", suit: "diamonds" },
  ] as CardType[];

  // Mock players in the game
  const mockPlayers = [
    { id: "player1", name: "You", cardCount: 7, isCurrentTurn: true },
    { id: "player2", name: "Alice", cardCount: 5, isCurrentTurn: false },
    { id: "player3", name: "Bob", cardCount: 6, isCurrentTurn: false },
    { id: "player4", name: "Charlie", cardCount: 4, isCurrentTurn: false },
  ];

  // Mock game events for the log
  const mockEvents = [
    {
      id: "1",
      message: "Game started",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      message: "It's your turn",
      timestamp: new Date(Date.now() - 60000),
    },
  ];

  return { mockCards, mockPlayers, mockEvents };
};

// Generate a random room code
export const generateRoomCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate a unique player ID
export const generatePlayerId = (): string => {
  return `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// Check if a set of cards forms a valid set (4 cards of the same rank)
export const isValidSet = (cards: CardType[]): boolean => {
  if (cards.length !== 4) return false;

  // All cards must have the same rank
  const firstRank = cards[0].rank;
  return cards.every((card) => card.rank === firstRank);
};

// Find all valid sets in a hand
export const findValidSets = (hand: CardType[]): CardType[][] => {
  const sets: CardType[][] = [];
  const rankGroups: Record<string, CardType[]> = {};

  // Group cards by rank
  hand.forEach((card) => {
    if (card.rank === "Joker") return; // Joker can't be part of a set

    if (!rankGroups[card.rank]) {
      rankGroups[card.rank] = [];
    }
    rankGroups[card.rank].push(card);
  });

  // Find groups with exactly 4 cards
  Object.values(rankGroups).forEach((group) => {
    if (group.length === 4) {
      sets.push([...group]);
    }
  });

  return sets;
};
