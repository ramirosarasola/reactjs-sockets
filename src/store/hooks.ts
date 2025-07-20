import { useAppStore } from "./index";

// Hook simple para el usuario actual
export const useCurrentUser = () => {
  return useAppStore((state) => state.currentUser);
};

export const useSetCurrentUser = () => {
  return useAppStore((state) => state.setCurrentUser);
};

export const useLogout = () => {
  return useAppStore((state) => state.logout);
};

// Hook simple para el juego actual
export const useCurrentGame = () => {
  return useAppStore((state) => state.currentGame);
};

export const useSetCurrentGame = () => {
  return useAppStore((state) => state.setCurrentGame);
};

// Hook simple para los datos del juego
export const useGameData = () => {
  return useAppStore((state) => state.gameData);
};

export const useSetGameData = () => {
  return useAppStore((state) => state.setGameData);
};

// Hook simple para el estado de host
export const useIsHost = () => {
  return useAppStore((state) => state.isHost);
};

export const useSetIsHost = () => {
  return useAppStore((state) => state.setIsHost);
};

// Hook simple para los jugadores
export const usePlayers = () => {
  return useAppStore((state) => state.currentGame?.players || []);
};

export const useUpdatePlayers = () => {
  return useAppStore((state) => state.updatePlayers);
};

// Hook simple para jugadores listos
export const useReadyPlayers = () => {
  return useAppStore((state) => state.currentGame?.readyPlayers || []);
};

export const useSetReadyPlayers = () => {
  return useAppStore((state) => state.setReadyPlayers);
};

export const useClearReadyPlayers = () => {
  return useAppStore((state) => state.clearReadyPlayers);
};

// Hook simple para puntuaciones
export const useScores = () => {
  return useAppStore((state) => state.currentGame?.scores || {});
};

export const useUpdateScores = () => {
  return useAppStore((state) => state.updateScores);
};

// Hook simple para estado de conexión
export const useIsConnected = () => {
  return useAppStore((state) => state.isConnected);
};

export const useIsConnecting = () => {
  return useAppStore((state) => state.isConnecting);
};

export const useSetConnectionStatus = () => {
  return useAppStore((state) => state.setConnectionStatus);
};

// Hooks adicionales que faltan
export const useSetLetter = () => {
  return useAppStore((state) => state.setLetter);
};

export const useSetCurrentRound = () => {
  return useAppStore((state) => state.setCurrentRound);
};

export const useSetGameActive = () => {
  return useAppStore((state) => state.setGameActive);
};

export const useSetFinishedBy = () => {
  return useAppStore((state) => state.setFinishedBy);
};
