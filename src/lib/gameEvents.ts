// Game event types
export enum GameEventType {
  JOIN_GAME = "join_game",
  CREATE_GAME = "create_game",
  START_GAME = "start_game",
  PASS_CARD = "pass_card",
  REQUEST_CARD = "request_card",
  PLAYER_JOINED = "player_joined",
  PLAYER_LEFT = "player_left",
  GAME_STARTED = "game_started",
  TURN_CHANGED = "turn_changed",
  CARD_PASSED = "card_passed",
  CARD_REQUESTED = "card_requested",
  SET_COMPLETED = "set_completed",
  GAME_OVER = "game_over",
  ERROR = "error",
}

// Game event interfaces
export interface JoinGameEvent {
  playerName: string;
  roomCode: string;
}

export interface CreateGameEvent {
  playerName: string;
}

export interface StartGameEvent {
  roomCode: string;
}

export interface PassCardEvent {
  cardId: string;
  targetPlayerId: string;
  roomCode: string;
}

export interface RequestCardEvent {
  rank: string;
  roomCode: string;
}

export interface PlayerJoinedEvent {
  playerId: string;
  playerName: string;
  isHost: boolean;
}

export interface PlayerLeftEvent {
  playerId: string;
  playerName: string;
}

export interface GameStartedEvent {
  players: any[];
  initialHand: any[];
}

export interface TurnChangedEvent {
  currentPlayerId: string;
}

export interface CardPassedEvent {
  fromPlayerId: string;
  toPlayerId: string;
  card?: any; // Only included if the card is being passed to the current player
}

export interface CardRequestedEvent {
  requestingPlayerId: string;
  rank: string;
  success: boolean;
  card?: any; // Only included if the request was successful and the card is for the current player
}

export interface SetCompletedEvent {
  playerId: string;
  set: any[];
}

export interface GameOverEvent {
  winner: {
    playerId: string;
    playerName: string;
  };
  finalScores: {
    playerId: string;
    playerName: string;
    score: number;
  }[];
}

export interface ErrorEvent {
  message: string;
  code: string;
}
