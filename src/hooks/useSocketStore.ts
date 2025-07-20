import { useEffect } from "react";
import { useSocket } from "./useSocket";
import { useSetConnectionStatus, useUpdatePlayers, useSetReadyPlayers, useUpdateScores, useSetFinishedBy, useSetLetter, useSetCurrentRound, useSetGameActive, useSetGameData } from "../store/hooks";
import type { SocketPlayer } from "../types";

export const useSocketStore = () => {
  const { socket, isConnected, isConnecting } = useSocket();
  const setConnectionStatus = useSetConnectionStatus();
  const updatePlayers = useUpdatePlayers();
  const setReadyPlayers = useSetReadyPlayers();
  const updateScores = useUpdateScores();
  const setFinishedBy = useSetFinishedBy();
  const setLetter = useSetLetter();
  const setCurrentRound = useSetCurrentRound();
  const setGameActive = useSetGameActive();
  const setGameData = useSetGameData();

  // Sincronizar estado de conexión
  useEffect(() => {
    setConnectionStatus(isConnected, isConnecting);
  }, [isConnected, isConnecting, setConnectionStatus]);

  // Configurar listeners de socket
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listener para lista de jugadores
    const handlePlayerList = (players: SocketPlayer[]) => {
      console.log("📋 LISTA DE JUGADORES RECIBIDA:", players);
      updatePlayers(players);
    };

    // Listener para jugador confirmado
    const handlePlayerConfirmed = (data: { username: string; confirmedPlayers: string[] }) => {
      console.log("✅ JUGADOR CONFIRMADO:", data);
      setReadyPlayers(data.confirmedPlayers);
    };

    // Listener para juego iniciado
    const handleGameStarted = (data: { letter: string; autoStarted: boolean; roundNumber: number; isNewRound: boolean }) => {
      console.log("🎮 JUEGO INICIADO:", data);
      setLetter(data.letter);
      setCurrentRound(data.roundNumber);
      setGameActive(true);
      setGameData({
        ...data,
        hostUsername: "unknown", // Se determinará después
      });
    };

    // Listener para ronda terminada
    const handleRoundFinished = (data: { finishedBy: string; scores: Record<string, number>; roundNumber: number }) => {
      console.log("🏁 RONDA TERMINADA:", data);
      setFinishedBy(data.finishedBy);
      updateScores(data.scores);
    };

    // Listener para puntuaciones actualizadas
    const handleScoresUpdated = (scores: Record<string, number>) => {
      console.log("📊 PUNTUACIONES ACTUALIZADAS:", scores);
      updateScores(scores);
    };

    // Configurar listeners
    socket.on("player_list", handlePlayerList);
    socket.on("player_confirmed", handlePlayerConfirmed);
    socket.on("game_started", handleGameStarted);
    socket.on("round_finished", handleRoundFinished);
    socket.on("scores_updated", handleScoresUpdated);

    // Cleanup
    return () => {
      socket.off("player_list", handlePlayerList);
      socket.off("player_confirmed", handlePlayerConfirmed);
      socket.off("game_started", handleGameStarted);
      socket.off("round_finished", handleRoundFinished);
      socket.off("scores_updated", handleScoresUpdated);
    };
  }, [socket, isConnected, updatePlayers, setReadyPlayers, setLetter, setCurrentRound, setGameActive, setGameData, setFinishedBy, updateScores]);

  return { socket, isConnected, isConnecting };
};
