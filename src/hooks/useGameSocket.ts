import { useState, useEffect, useCallback } from "react";
import {
  initializeSocket,
  getSocket,
  disconnectSocket,
  emitEvent,
  onEvent,
  offEvent,
} from "@/lib/socket";
import { GameEventType } from "@/lib/gameEvents";
import { CardType, CardRank, CardSuit } from "@/components/game/Card";
import {
  SERVER_URL,
  generateMockData,
  generateRoomCode,
  findValidSets,
} from "@/server/gameServer";

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  cardCount: number;
  isCurrentTurn: boolean;
}

export interface GameEvent {
  id: string;
  message: string;
  timestamp: Date;
}

interface UseGameSocketProps {
  serverUrl?: string;
}

export function useGameSocket({
  serverUrl = SERVER_URL,
}: UseGameSocketProps = {}) {
  // Game state
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<
    "landing" | "lobby" | "playing" | "gameOver"
  >("landing");
  const [error, setError] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>("");
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [hand, setHand] = useState<CardType[]>([]);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const [requestsRemaining, setRequestsRemaining] = useState(2);
  const [matchedSets, setMatchedSets] = useState<CardType[][]>([]);

  // Initialize socket connection
  useEffect(() => {
    try {
      // Only attempt to connect if we have a server URL
      if (serverUrl) {
        const socket = initializeSocket(serverUrl);

        socket.on("connect", () => {
          setConnected(true);
          setError(null);
          console.log("Connected to game server");
        });

        socket.on("disconnect", () => {
          setConnected(false);
          console.log("Disconnected from game server");
        });

        socket.on("connect_error", (err) => {
          setConnected(false);
          setError(`Connection error: ${err.message}`);
          console.warn("Socket connection failed, using mock data instead");
        });

        return () => {
          disconnectSocket();
        };
      } else {
        // No server URL provided, use mock data
        setConnected(false);
        setError("No server URL provided. Using mock data for development.");
        console.info("No server URL provided, using mock data for development");
        return () => {};
      }
    } catch (err) {
      setError(`Socket initialization error: ${err.message}`);
      console.error("Socket initialization error:", err);
      return () => {};
    }
  }, [serverUrl]);

  // Set up event listeners
  useEffect(() => {
    if (!connected) return;

    // Player joined event
    onEvent(GameEventType.PLAYER_JOINED, (data) => {
      setPlayers((prev) => [
        ...prev,
        {
          id: data.playerId,
          name: data.playerName,
          isHost: data.isHost,
          cardCount: 0,
          isCurrentTurn: false,
        },
      ]);

      addGameEvent(`${data.playerName} joined the game`);
    });

    // Player left event
    onEvent(GameEventType.PLAYER_LEFT, (data) => {
      setPlayers((prev) =>
        prev.filter((player) => player.id !== data.playerId),
      );
      addGameEvent(`${data.playerName} left the game`);
    });

    // Game started event
    onEvent(GameEventType.GAME_STARTED, (data) => {
      setGameState("playing");
      setHand(data.initialHand as CardType[]);
      setPlayers(data.players as Player[]);
      addGameEvent("Game started");
    });

    // Turn changed event
    onEvent(GameEventType.TURN_CHANGED, (data) => {
      setPlayers((prev) =>
        prev.map((player) => ({
          ...player,
          isCurrentTurn: player.id === data.currentPlayerId,
        })),
      );

      const currentPlayer = players.find((p) => p.id === data.currentPlayerId);
      if (currentPlayer) {
        addGameEvent(`It's ${currentPlayer.name}'s turn`);
      }

      // Reset requests remaining if it's the current player's turn
      if (data.currentPlayerId === playerId) {
        setRequestsRemaining(2);
      }
    });

    // Card passed event
    onEvent(GameEventType.CARD_PASSED, (data) => {
      const fromPlayer = players.find((p) => p.id === data.fromPlayerId);
      const toPlayer = players.find((p) => p.id === data.toPlayerId);

      if (fromPlayer && toPlayer) {
        addGameEvent(`${fromPlayer.name} passed a card to ${toPlayer.name}`);
      }

      // If the card is being passed to the current player, add it to their hand
      if (data.toPlayerId === playerId && data.card) {
        setHand((prev) => [...prev, data.card as CardType]);
      }

      // If the card is being passed from the current player, remove it from their hand
      if (data.fromPlayerId === playerId) {
        setHand((prev) => prev.filter((card) => card.id !== data.cardId));
      }

      // Update card counts
      setPlayers((prev) =>
        prev.map((player) => {
          if (player.id === data.fromPlayerId) {
            return { ...player, cardCount: (player.cardCount || 0) - 1 };
          }
          if (player.id === data.toPlayerId) {
            return { ...player, cardCount: (player.cardCount || 0) + 1 };
          }
          return player;
        }),
      );
    });

    // Card requested event
    onEvent(GameEventType.CARD_REQUESTED, (data) => {
      const requestingPlayer = players.find(
        (p) => p.id === data.requestingPlayerId,
      );

      if (requestingPlayer) {
        addGameEvent(`${requestingPlayer.name} requested ${data.rank}s`);

        if (data.success) {
          addGameEvent(`${requestingPlayer.name} received a ${data.rank}`);
        } else {
          addGameEvent(`No player had a ${data.rank}`);
        }
      }

      // If the current player made the request, update their requests remaining
      if (data.requestingPlayerId === playerId) {
        setRequestsRemaining((prev) => prev - 1);

        // If the request was successful, add the card to the player's hand
        if (data.success && data.card) {
          setHand((prev) => [...prev, data.card as CardType]);
        }
      }
    });

    // Set completed event
    onEvent(GameEventType.SET_COMPLETED, (data) => {
      const player = players.find((p) => p.id === data.playerId);

      if (player) {
        addGameEvent(`${player.name} completed a set!`);
      }

      // If the current player completed the set, update their matched sets
      if (data.playerId === playerId) {
        setMatchedSets((prev) => [...prev, data.set as CardType[]]);

        // Remove the cards in the set from the player's hand
        const setCardIds = data.set.map((card: CardType) => card.id);
        setHand((prev) => prev.filter((card) => !setCardIds.includes(card.id)));
      }
    });

    // Game over event
    onEvent(GameEventType.GAME_OVER, (data) => {
      setGameState("gameOver");
      addGameEvent(`Game over! ${data.winner.playerName} wins!`);
    });

    // Error event
    onEvent(GameEventType.ERROR, (data) => {
      setError(data.message);
      addGameEvent(`Error: ${data.message}`);
    });

    return () => {
      // Clean up event listeners
      offEvent(GameEventType.PLAYER_JOINED);
      offEvent(GameEventType.PLAYER_LEFT);
      offEvent(GameEventType.GAME_STARTED);
      offEvent(GameEventType.TURN_CHANGED);
      offEvent(GameEventType.CARD_PASSED);
      offEvent(GameEventType.CARD_REQUESTED);
      offEvent(GameEventType.SET_COMPLETED);
      offEvent(GameEventType.GAME_OVER);
      offEvent(GameEventType.ERROR);
    };
  }, [connected, playerId, players]);

  // Helper function to add a game event
  const addGameEvent = useCallback((message: string) => {
    setGameEvents((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        message,
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Game actions
  const createGame = useCallback(
    (name: string) => {
      setPlayerName(name);

      if (connected) {
        emitEvent(GameEventType.CREATE_GAME, { playerName: name });
      } else {
        // Mock implementation for development
        const playerId = `player-${Date.now()}`;
        const roomCode = generateRoomCode();

        setPlayerId(playerId);
        setRoomCode(roomCode);
        setIsHost(true);
        setGameState("lobby");
        setPlayers([
          {
            id: playerId,
            name,
            isHost: true,
            cardCount: 0,
            isCurrentTurn: true,
          },
        ]);

        console.log(`Created mock game with room code: ${roomCode}`);
        addGameEvent(`Game room created with code: ${roomCode}`);
      }
    },
    [connected],
  );

  const joinGame = useCallback(
    (name: string, code: string) => {
      setPlayerName(name);
      setRoomCode(code);

      if (connected) {
        emitEvent(GameEventType.JOIN_GAME, {
          playerName: name,
          roomCode: code,
        });
      } else {
        // Mock implementation for development
        const playerId = `player-${Date.now()}`;

        setPlayerId(playerId);
        setIsHost(false);
        setGameState("lobby");

        // Create mock players including the host and this player
        setPlayers([
          {
            id: "host-player",
            name: "Game Host",
            isHost: true,
            cardCount: 7,
            isCurrentTurn: false,
          },
          {
            id: playerId,
            name,
            isHost: false,
            cardCount: 7,
            isCurrentTurn: false,
          },
          {
            id: "ai-player-1",
            name: "AI Player 1",
            isHost: false,
            cardCount: 7,
            isCurrentTurn: false,
          },
        ]);

        console.log(`Joined mock game with room code: ${code}`);
        addGameEvent(`Joined game room with code: ${code}`);
        addGameEvent(`Waiting for host to start the game...`);
      }
    },
    [connected],
  );

  const startGame = useCallback(() => {
    if (connected) {
      emitEvent(GameEventType.START_GAME, { roomCode });
    } else {
      // Mock implementation for development
      setGameState("playing");

      // Get mock data from our helper function
      const { mockCards, mockPlayers, mockEvents } = generateMockData();

      // Update player names and IDs to match current game
      const updatedPlayers = mockPlayers.map((player, index) => {
        if (index === 0) {
          // First player is the current user
          return { ...player, id: playerId, name: playerName };
        }
        return player;
      });

      setHand(mockCards);
      setPlayers(updatedPlayers);
      setGameEvents([
        ...mockEvents,
        {
          id: Date.now().toString(),
          message: "Game started",
          timestamp: new Date(),
        },
      ]);
      setRequestsRemaining(2);

      // Check for any initial sets
      const initialSets = findValidSets(mockCards);
      if (initialSets.length > 0) {
        setMatchedSets(initialSets);

        // Remove matched cards from hand
        const matchedCardIds = initialSets.flat().map((card) => card.id);
        const newHand = mockCards.filter(
          (card) => !matchedCardIds.includes(card.id),
        );
        setHand(newHand);

        addGameEvent(
          `You completed ${initialSets.length} set(s) automatically!`,
        );
      }

      console.log("Started mock game");
    }
  }, [connected, roomCode, playerName, playerId]);

  const passCard = useCallback(
    (cardId: string, targetPlayerId: string) => {
      if (connected) {
        emitEvent(GameEventType.PASS_CARD, {
          cardId,
          targetPlayerId,
          roomCode,
        });
      } else {
        // Mock implementation for development
        const targetPlayer = players.find((p) => p.id === targetPlayerId);
        const cardToPass = hand.find((card) => card.id === cardId);

        if (!cardToPass || !targetPlayer) return;

        // Remove card from hand
        setHand((prev) => prev.filter((card) => card.id !== cardId));

        // Add event to game log
        addGameEvent(`You passed a ${cardToPass.rank} to ${targetPlayer.name}`);

        // Update player card counts
        setPlayers((prev) =>
          prev.map((player) => {
            if (player.id === playerId) {
              return {
                ...player,
                cardCount: (player.cardCount || hand.length) - 1,
                isCurrentTurn: false,
              };
            }
            if (player.id === targetPlayerId) {
              return {
                ...player,
                cardCount: (player.cardCount || 0) + 1,
                isCurrentTurn: true,
              };
            }
            return { ...player, isCurrentTurn: false };
          }),
        );

        // Simulate AI response after a short delay
        setTimeout(() => {
          // AI player's turn logic
          const currentTurnPlayer = players.find(
            (p) => p.id === targetPlayerId,
          );
          if (currentTurnPlayer) {
            addGameEvent(`${currentTurnPlayer.name}'s turn`);

            // 50% chance AI will pass a card back
            if (Math.random() > 0.5) {
              const ranks = [
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
              ] as const;
              const suits = ["hearts", "diamonds", "clubs", "spades"] as const;
              const randomCard: CardType = {
                id: `ai-card-${Date.now()}`,
                rank: ranks[
                  Math.floor(Math.random() * ranks.length)
                ] as CardRank,
                suit: suits[
                  Math.floor(Math.random() * suits.length)
                ] as CardSuit,
              };

              addGameEvent(`${currentTurnPlayer.name} passed a card to you`);
              setHand((prev) => [...prev, randomCard]);

              // Check for sets after receiving a card
              const newHand = [...hand, randomCard];
              const newSets = findValidSets(newHand);

              if (newSets.length > 0) {
                setMatchedSets((prev) => [...prev, ...newSets]);
                const matchedCardIds = newSets.flat().map((card) => card.id);
                setHand(
                  newHand.filter((card) => !matchedCardIds.includes(card.id)),
                );
                addGameEvent(`You completed a set!`);
              }
            }

            // Update turns
            setPlayers((prev) =>
              prev.map((player) => ({
                ...player,
                isCurrentTurn: player.id === playerId,
              })),
            );

            setRequestsRemaining(2);
            addGameEvent(`It's your turn again`);
          }
        }, 1500);
      }
    },
    [connected, roomCode, players, playerId, hand, addGameEvent],
  );

  const requestCard = useCallback(
    (rank: string) => {
      if (connected) {
        emitEvent(GameEventType.REQUEST_CARD, { rank, roomCode });
      } else {
        // Mock implementation for development
        setRequestsRemaining((prev) => prev - 1);

        // Add event to game log
        addGameEvent(`You requested ${rank}s`);

        // Find a random player to potentially give a card
        const otherPlayers = players.filter((p) => p.id !== playerId);
        const randomPlayer =
          otherPlayers[Math.floor(Math.random() * otherPlayers.length)];

        // 60% chance of getting a card
        if (Math.random() > 0.4) {
          const suits = ["hearts", "diamonds", "clubs", "spades"] as const;
          const newCard: CardType = {
            id: `new-${Date.now()}`,
            rank: rank as CardRank,
            suit: suits[Math.floor(Math.random() * suits.length)] as CardSuit,
          };

          setHand((prev) => [...prev, newCard]);
          addGameEvent(`${randomPlayer.name} gave you a ${rank}`);

          // Update player card counts
          setPlayers((prev) =>
            prev.map((player) => {
              if (player.id === randomPlayer.id) {
                return {
                  ...player,
                  cardCount: Math.max(1, (player.cardCount || 5) - 1),
                };
              }
              return player;
            }),
          );

          // Check for sets
          const newHand = [...hand, newCard];
          const rankCards = newHand.filter((card) => card.rank === rank);

          if (rankCards.length >= 4) {
            const set = rankCards.slice(0, 4);
            setMatchedSets((prev) => [...prev, set]);

            // Remove the cards in the set from the hand
            const setCardIds = set.map((card) => card.id);
            setHand(newHand.filter((card) => !setCardIds.includes(card.id)));

            addGameEvent(`You completed a set of ${rank}s!`);

            // Check if game should end (e.g., if player has no cards left)
            const remainingCards = newHand.filter(
              (card) => !setCardIds.includes(card.id),
            );
            if (remainingCards.length === 0) {
              addGameEvent(`You have no cards left!`);
              setTimeout(() => setGameState("gameOver"), 1500);
            }
          }

          // If this was the last request, end turn after a delay
          if (requestsRemaining <= 1) {
            setTimeout(() => {
              // End player's turn and move to next player
              const currentPlayerIndex = players.findIndex(
                (p) => p.id === playerId,
              );
              const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;

              setPlayers((prev) =>
                prev.map((player, idx) => ({
                  ...player,
                  isCurrentTurn: idx === nextPlayerIndex,
                })),
              );

              const nextPlayer = players[nextPlayerIndex];
              addGameEvent(`${nextPlayer.name}'s turn`);

              // If it's an AI player, simulate their turn after a delay
              if (nextPlayer.id !== playerId) {
                simulateAITurn(nextPlayer);
              }
            }, 1000);
          }
        } else {
          addGameEvent(`No player had a ${rank}`);

          // If this was the last request, end turn immediately
          if (requestsRemaining <= 1) {
            setTimeout(() => {
              // End player's turn and move to next player
              const currentPlayerIndex = players.findIndex(
                (p) => p.id === playerId,
              );
              const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;

              setPlayers((prev) =>
                prev.map((player, idx) => ({
                  ...player,
                  isCurrentTurn: idx === nextPlayerIndex,
                })),
              );

              const nextPlayer = players[nextPlayerIndex];
              addGameEvent(`${nextPlayer.name}'s turn`);

              // If it's an AI player, simulate their turn after a delay
              if (nextPlayer.id !== playerId) {
                simulateAITurn(nextPlayer);
              }
            }, 1000);
          }
        }
      }
    },
    [
      connected,
      roomCode,
      hand,
      players,
      playerId,
      requestsRemaining,
      addGameEvent,
    ],
  );

  // Helper function to simulate AI player turns
  const simulateAITurn = useCallback(
    (aiPlayer) => {
      setTimeout(() => {
        // AI makes a random decision: 50% chance to request a card, 50% to pass
        if (Math.random() > 0.5) {
          // AI requests a card
          const ranks = [
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
          ];
          const randomRank = ranks[Math.floor(Math.random() * ranks.length)];

          addGameEvent(`${aiPlayer.name} requested ${randomRank}s`);

          // 30% chance player has the requested card
          if (
            Math.random() < 0.3 &&
            hand.some((card) => card.rank === randomRank)
          ) {
            // Find a card of the requested rank in player's hand
            const cardToGive = hand.find((card) => card.rank === randomRank);

            if (cardToGive) {
              addGameEvent(`You gave ${aiPlayer.name} a ${randomRank}`);

              // Remove card from player's hand
              setHand((prev) =>
                prev.filter((card) => card.id !== cardToGive.id),
              );

              // Update player card counts
              setPlayers((prev) =>
                prev.map((player) => {
                  if (player.id === aiPlayer.id) {
                    return {
                      ...player,
                      cardCount: (player.cardCount || 0) + 1,
                    };
                  } else if (player.id === playerId) {
                    return {
                      ...player,
                      cardCount: hand.length - 1,
                    };
                  }
                  return player;
                }),
              );

              // 25% chance AI completes a set
              if (Math.random() < 0.25) {
                addGameEvent(
                  `${aiPlayer.name} completed a set of ${randomRank}s!`,
                );

                // Update AI player's card count
                setPlayers((prev) =>
                  prev.map((player) => {
                    if (player.id === aiPlayer.id) {
                      return {
                        ...player,
                        cardCount: Math.max(0, (player.cardCount || 0) - 3), // Remove 4 cards for the set, but added 1 earlier
                      };
                    }
                    return player;
                  }),
                );
              }
            }
          } else {
            addGameEvent(`No player had a ${randomRank}`);
          }
        } else {
          // AI passes a card to player
          const ranks = [
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
          ] as const;
          const suits = ["hearts", "diamonds", "clubs", "spades"] as const;
          const randomCard: CardType = {
            id: `ai-card-${Date.now()}`,
            rank: ranks[Math.floor(Math.random() * ranks.length)] as CardRank,
            suit: suits[Math.floor(Math.random() * suits.length)] as CardSuit,
          };

          addGameEvent(`${aiPlayer.name} passed a card to you`);
          setHand((prev) => [...prev, randomCard]);

          // Update player card counts
          setPlayers((prev) =>
            prev.map((player) => {
              if (player.id === aiPlayer.id) {
                return {
                  ...player,
                  cardCount: Math.max(1, (player.cardCount || 0) - 1),
                };
              } else if (player.id === playerId) {
                return {
                  ...player,
                  cardCount: hand.length + 1,
                };
              }
              return player;
            }),
          );

          // Check for sets after receiving a card
          const newHand = [...hand, randomCard];
          const newSets = findValidSets(newHand);

          if (newSets.length > 0) {
            setMatchedSets((prev) => [...prev, ...newSets]);
            const matchedCardIds = newSets.flat().map((card) => card.id);
            setHand(
              newHand.filter((card) => !matchedCardIds.includes(card.id)),
            );
            addGameEvent(`You completed a set!`);
          }
        }

        // End AI turn and give turn back to player
        setTimeout(() => {
          setPlayers((prev) =>
            prev.map((player) => ({
              ...player,
              isCurrentTurn: player.id === playerId,
            })),
          );

          setRequestsRemaining(2);
          addGameEvent(`It's your turn`);
        }, 1500);
      }, 1500);
    },
    [hand, playerId, addGameEvent],
  );

  return {
    connected,
    error,
    gameState,
    playerId,
    playerName,
    roomCode,
    isHost,
    players,
    hand,
    gameEvents,
    requestsRemaining,
    matchedSets,
    actions: {
      createGame,
      joinGame,
      startGame,
      passCard,
      requestCard,
    },
  };
}
