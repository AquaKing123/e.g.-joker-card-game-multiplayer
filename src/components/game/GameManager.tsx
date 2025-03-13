import { useState } from "react";
import LandingPage from "./LandingPage";
import GameLobby from "./GameLobby";
import GameBoard from "./GameBoard";
import GameOver from "./GameOver";
import SetAnimation from "./SetAnimation";
import ConnectionStatus from "./ConnectionStatus";
import MultiplayerInfo from "./MultiplayerInfo";
import { useGameSocket } from "@/hooks/useGameSocket";

import { SERVER_URL } from "@/server/gameServer";

export default function GameManager() {
  const [showSetAnimation, setShowSetAnimation] = useState(false);
  const [completedSet, setCompletedSet] = useState<any>(null);

  const {
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
    actions,
  } = useGameSocket({ serverUrl: SERVER_URL });

  // Handle set completion animation
  const handleSetCompleted = (set: any) => {
    setCompletedSet(set);
    setShowSetAnimation(true);
  };

  // Handle copying room code
  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    // Toast notification is handled in the GameLobby component
  };

  // Render the appropriate component based on game state
  switch (gameState) {
    case "landing":
      return (
        <>
          <LandingPage
            onJoinGame={actions.joinGame}
            onCreateGame={actions.createGame}
          />
          <ConnectionStatus connected={connected} error={error} />
        </>
      );

    case "lobby":
      return (
        <>
          <GameLobby
            roomCode={roomCode}
            players={
              players.length > 0
                ? players
                : [
                    { id: playerId, name: playerName, isHost },
                    { id: "mock1", name: "Waiting...", isHost: false },
                    { id: "mock2", name: "Waiting...", isHost: false },
                  ]
            }
            currentPlayer={{ id: playerId, name: playerName, isHost }}
            onStartGame={actions.startGame}
            onCopyRoomCode={handleCopyRoomCode}
          />
          <MultiplayerInfo
            roomCode={roomCode}
            playerCount={players.length}
            connected={connected}
          />
          <ConnectionStatus connected={connected} error={error} />
        </>
      );

    case "playing":
      return (
        <>
          <GameBoard
            players={players}
            currentPlayer={
              players.find((p) => p.id === playerId) || {
                id: playerId,
                name: playerName,
                cardCount: hand.length,
                isCurrentTurn: false,
              }
            }
            hand={hand}
            gameEvents={gameEvents}
            onPassCard={actions.passCard}
            onRequestCard={actions.requestCard}
            requestsRemaining={requestsRemaining}
            matchedSets={matchedSets}
          />
          {showSetAnimation && completedSet && (
            <SetAnimation
              set={completedSet}
              onComplete={() => setShowSetAnimation(false)}
            />
          )}
          <MultiplayerInfo
            roomCode={roomCode}
            playerCount={players.length}
            connected={connected}
          />
          <ConnectionStatus connected={connected} error={error} />
        </>
      );

    case "gameOver":
      return (
        <>
          <GameOver
            winner={{
              id: playerId,
              name: playerName,
              score: matchedSets.length,
            }}
            scores={[
              { id: playerId, name: playerName, score: matchedSets.length },
              ...players
                .filter((p) => p.id !== playerId)
                .map((p, i) => ({
                  id: p.id,
                  name: p.name,
                  score: Math.max(0, matchedSets.length - (i + 1)),
                })),
            ]}
            onPlayAgain={() => actions.createGame(playerName)}
            onExit={() => window.location.reload()}
          />
          <MultiplayerInfo
            roomCode={roomCode}
            playerCount={players.length}
            connected={connected}
          />
          <ConnectionStatus connected={connected} error={error} />
        </>
      );

    default:
      return <div>Loading...</div>;
  }
}
