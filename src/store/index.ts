import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { User, SocketPlayer } from "../types";

// Tipos para el estado global
export interface GameState {
  code: string;
  players: SocketPlayer[];
  currentRound: number;
  isActive: boolean;
  letter?: string;
  scores: Record<string, number>;
  readyPlayers: string[];
  finishedBy?: string;
}

export interface GameData {
  letter: string;
  autoStarted: boolean;
  roundNumber: number;
  isNewRound: boolean;
  hostUsername: string;
  [key: string]: unknown;
}

// Estado global de la aplicación
interface AppState {
  // Usuario actual
  currentUser: User | null;

  // Juego actual
  currentGame: GameState | null;
  gameData: GameData | null;
  isHost: boolean;

  // Estado de conexión
  isConnected: boolean;
  isConnecting: boolean;

  // Acciones para usuario
  setCurrentUser: (user: User | null) => void;
  logout: () => void;

  // Acciones para juego
  setCurrentGame: (game: GameState | null) => void;
  setGameData: (data: GameData | null) => void;
  setIsHost: (isHost: boolean) => void;

  // Acciones para jugadores
  updatePlayers: (players: SocketPlayer[]) => void;
  addPlayer: (player: SocketPlayer) => void;
  removePlayer: (socketId: string) => void;
  updatePlayerScore: (username: string, score: number) => void;

  // Acciones para estado del juego
  setLetter: (letter: string) => void;
  setCurrentRound: (round: number) => void;
  setGameActive: (active: boolean) => void;

  // Acciones para jugadores listos
  setReadyPlayers: (players: string[]) => void;
  addReadyPlayer: (username: string) => void;
  clearReadyPlayers: () => void;

  // Acciones para puntuaciones
  updateScores: (scores: Record<string, number>) => void;
  setFinishedBy: (username: string | undefined) => void;

  // Acciones para conexión
  setConnectionStatus: (connected: boolean, connecting: boolean) => void;

  // Acciones de limpieza
  resetGame: () => void;
  resetAll: () => void;
}

// Store principal
export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Estado inicial
      currentUser: null,
      currentGame: null,
      gameData: null,
      isHost: false,
      isConnected: false,
      isConnecting: false,

      // Acciones para usuario
      setCurrentUser: (user) => set({ currentUser: user }),
      logout: () =>
        set({
          currentUser: null,
          currentGame: null,
          gameData: null,
          isHost: false,
        }),

      // Acciones para juego
      setCurrentGame: (game) => set({ currentGame: game }),
      setGameData: (data) => set({ gameData: data }),
      setIsHost: (isHost) => set({ isHost }),

      // Acciones para jugadores
      updatePlayers: (players) =>
        set((state) => ({
          currentGame: state.currentGame
            ? {
                ...state.currentGame,
                players,
              }
            : null,
        })),

      addPlayer: (player) =>
        set((state) => ({
          currentGame: state.currentGame
            ? {
                ...state.currentGame,
                players: [...state.currentGame.players, player],
              }
            : null,
        })),

      removePlayer: (socketId) =>
        set((state) => ({
          currentGame: state.currentGame
            ? {
                ...state.currentGame,
                players: state.currentGame.players.filter(
                  (p) => p.socketId !== socketId
                ),
              }
            : null,
        })),

      updatePlayerScore: (username, score) =>
        set((state) => ({
          currentGame: state.currentGame
            ? {
                ...state.currentGame,
                players: state.currentGame.players.map((p) =>
                  p.username === username ? { ...p, score } : p
                ),
                scores: {
                  ...state.currentGame.scores,
                  [username]: score,
                },
              }
            : null,
        })),

      // Acciones para estado del juego
      setLetter: (letter) =>
        set((state) => ({
          currentGame: state.currentGame
            ? {
                ...state.currentGame,
                letter,
              }
            : null,
        })),

      setCurrentRound: (round) =>
        set((state) => ({
          currentGame: state.currentGame
            ? {
                ...state.currentGame,
                currentRound: round,
              }
            : null,
        })),

      setGameActive: (active) =>
        set((state) => ({
          currentGame: state.currentGame
            ? {
                ...state.currentGame,
                isActive: active,
              }
            : null,
        })),

      // Acciones para jugadores listos
      setReadyPlayers: (players) =>
        set((state) => ({
          currentGame: state.currentGame
            ? {
                ...state.currentGame,
                readyPlayers: players,
              }
            : null,
        })),

      addReadyPlayer: (username) =>
        set((state) => ({
          currentGame: state.currentGame
            ? {
                ...state.currentGame,
                readyPlayers: [...state.currentGame.readyPlayers, username],
              }
            : null,
        })),

      clearReadyPlayers: () =>
        set((state) => ({
          currentGame: state.currentGame
            ? {
                ...state.currentGame,
                readyPlayers: [],
              }
            : null,
        })),

      // Acciones para puntuaciones
      updateScores: (scores) =>
        set((state) => ({
          currentGame: state.currentGame
            ? {
                ...state.currentGame,
                scores,
              }
            : null,
        })),

      setFinishedBy: (username) =>
        set((state) => ({
          currentGame: state.currentGame
            ? {
                ...state.currentGame,
                finishedBy: username,
              }
            : null,
        })),

      // Acciones para conexión
      setConnectionStatus: (connected, connecting) =>
        set({
          isConnected: connected,
          isConnecting: connecting,
        }),

      // Acciones de limpieza
      resetGame: () =>
        set({
          currentGame: null,
          gameData: null,
          isHost: false,
        }),

      resetAll: () =>
        set({
          currentUser: null,
          currentGame: null,
          gameData: null,
          isHost: false,
          isConnected: false,
          isConnecting: false,
        }),
    }),
    {
      name: "tutifruti-store",
    }
  )
);
