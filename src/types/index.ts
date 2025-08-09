export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: string;
  code: string;
  status: "WAITING" | "PLAYING" | "FINISHED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  finishedAt?: string;
  players: GamePlayer[];
  rounds: Round[];
  scores: GameScore[];
}

export interface GamePlayer {
  id: string;
  gameId: string;
  userId: string;
  score: number;
  joinedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

// Tipo para jugadores enviados por sockets (backend)
export interface SocketPlayer {
  id: string;
  username: string;
  socketId: string;
  score: number;
}

export interface Round {
  id: string;
  gameId: string;
  roundNumber: number;
  letter: string;
  startTime: string;
  endTime?: string;
  answers: RoundAnswer[];
}

export interface RoundAnswer {
  id: string;
  roundId: string;
  userId: string;
  answers: Record<string, string>;
  score: number;
  finishedAt: string;
  user: {
    id: string;
    username: string;
  };
}

export interface GameScore {
  id: string;
  gameId: string;
  userId: string;
  score: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
}

// Tipo para juegos del usuario (respuesta del backend)
export interface UserGame {
  id: string;
  code: string;
  status: "WAITING" | "PLAYING" | "FINISHED" | "CANCELLED";
  playerCount: number;
  createdAt: string;
  players: Array<{
    id: string;
    username: string;
  }>;
}

export interface GameState {
  currentRound: number;
  letter: string;
  timeLeft: number;
  isPlaying: boolean;
  players: GamePlayer[];
  scores: Record<string, number>;
}

export interface SocketEvents {
  // Cliente → Servidor
  join_game: { gameCode: string; username: string };
  start_game: { gameCode: string; username: string };
  start_next_round: { gameCode: string; username: string };
  player_ready: { gameCode: string; username: string };
  tuti_fruti_finished: {
    gameCode: string;
    username: string;
    answers: Record<string, string>;
  };
  vote_answer: { gameCode: string; voter: string; target: string; category: string; points: number };

  // Servidor → Cliente
  joined_game: { gameCode: string; username: string };
  player_list: SocketPlayer[];
  test_event: { message: string; players: number };
  game_ready_to_start: {
    timeLeft: number;
    totalPlayers: number;
    isNewRound: boolean;
  };
  game_started: {
    letter: string;
    autoStarted: boolean;
    roundNumber: number;
    isNewRound: boolean;
  };
  player_confirmed: { username: string; confirmedPlayers: string[] };
  round_finished: {
    finishedBy: string;
    answersByPlayer: Record<string, Record<string, string>>;
    letter?: string;
    scores: Record<string, number>;
    roundNumber: number;
  };
  round_points_updated: {
    roundNumber: number;
    roundPoints: Record<string, number>;
    votes: Record<string, Record<string, Record<string, number>>>;
  };
  player_left: { username: string; message: string };
  error: { message: string };
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// Tipos específicos para respuestas de API
export interface CreateRoundResponse {
  id: string;
  gameId: string;
  roundNumber: number;
  letter: string;
  startTime: string;
  endTime?: string;
}

export interface SaveRoundAnswerResponse {
  id: string;
  roundId: string;
  userId: string;
  answers: Record<string, string>;
  score: number;
  finishedAt: string;
  user: {
    id: string;
    username: string;
  };
}

export interface RoundDetailsResponse {
  id: string;
  gameId: string;
  roundNumber: number;
  letter: string;
  startTime: string;
  endTime?: string;
  answers: RoundAnswer[];
}

export interface FinishRoundResponse {
  id: string;
  gameId: string;
  roundNumber: number;
  letter: string;
  startTime: string;
  endTime: string;
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number";
  placeholder?: string;
  required?: boolean;
  validation?: (value: string) => string | undefined;
}

export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export interface InputProps {
  name: string;
  label?: string;
  type?: "text" | "email" | "password" | "number";
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "error";
  className?: string;
}

export interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

// ===== CONFIGURACIÓN DE JUEGO =====

export interface GameConfig {
  maxRounds: number;
  roundTimeSeconds: number;
  autoStartDelay: number;
  minPlayers: number;
  maxPlayers: number;
  categories: string[];
  pointsPerWin: number;
  pointsPerUniqueAnswer: number;
}

export interface GameSettings {
  id: string;
  name: string;
  description: string;
  config: GameConfig;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GameConfigResponse {
  success: boolean;
  settings: GameSettings[];
}

export interface GameConfigValidation {
  success: boolean;
  isValid: boolean;
  errors: string[];
}
