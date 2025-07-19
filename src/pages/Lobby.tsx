import React, { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { Game } from "./Game";

interface Player {
  username: string;
  socketId: string;
}

interface GameStartedData {
  letter?: string;
  autoStarted?: boolean;
  [key: string]: unknown;
}

interface GameReadyData {
  timeLeft: number;
  totalPlayers: number;
  isNewRound?: boolean;
}

interface PlayerConfirmedData {
  username: string;
  confirmedPlayers: string[];
}

interface LobbyProps {
  username: string;
  gameCode: string;
}

export const Lobby: React.FC<LobbyProps> = ({ username, gameCode }) => {
  const socketRef = useSocket();
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [gameData, setGameData] = useState<GameStartedData>({});
  const [waitingForConfirmations, setWaitingForConfirmations] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [confirmedPlayers, setConfirmedPlayers] = useState<string[]>([]);
  const [showGameComponent, setShowGameComponent] = useState(false);

  // El primer jugador que entra a la sala es el "host"
  const isHost = players.length > 0 && players[0].username === username;

  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;
    socket.emit("join_game", { gameCode, username });

    // Recibe lista de jugadores actualizada
    socket.on("player_list", (list: Player[]) => {
      setPlayers(list);
    });

    // Escucha cuando el juego está listo para comenzar
    socket.on("game_ready_to_start", (data: GameReadyData) => {
      console.log("Juego listo para comenzar:", data);
      setWaitingForConfirmations(true);
      setTimeLeft(data.timeLeft);
      setConfirmedPlayers([]);
      setShowGameComponent(false); // Ocultar componente Game para mostrar confirmación

      if (data.isNewRound) {
        console.log("Esperando confirmaciones para nueva ronda");
      }
    });

    // Escucha cuando un jugador confirma
    socket.on("player_confirmed", (data: PlayerConfirmedData) => {
      console.log("Jugador confirmó:", data);
      setConfirmedPlayers(data.confirmedPlayers);
    });

    // Escucha cuando el juego inicia
    socket.on("game_started", (data: GameStartedData) => {
      console.log("Juego iniciado desde Lobby:", data);
      setGameData(data);
      setGameStarted(true);
      setShowGame(true);
      setShowGameComponent(true);
      setWaitingForConfirmations(false);
    });

    return () => {
      socket.off("player_list");
      socket.off("game_ready_to_start");
      socket.off("player_confirmed");
      socket.off("game_started");
    };
  }, [gameCode, username, socketRef]);

  // Timer para actualizar el tiempo restante
  useEffect(() => {
    if (!waitingForConfirmations || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [waitingForConfirmations, timeLeft]);

  const handleStartGame = () => {
    console.log("Emite start_game desde Lobby");
    socketRef.current?.emit("start_game", { gameCode, username });
  };

  const handleConfirmReady = () => {
    console.log("Emite player_ready desde Lobby");
    socketRef.current?.emit("player_ready", { gameCode, username });
  };

  if (showGame && showGameComponent && !waitingForConfirmations) {
    return (
      <Game
        username={username}
        gameCode={gameCode}
        isHost={isHost}
        gameData={gameData}
      />
    );
  }

  // Si estamos esperando confirmaciones, siempre mostrar el Lobby
  if (waitingForConfirmations) {
    return (
      <div style={{ maxWidth: 400, margin: "0 auto", padding: 24 }}>
        <h2>Sala de espera: {gameCode}</h2>
        <ul>
          {players.map((p) => (
            <li key={p.socketId}>
              {p.username}
              {p.username === username && " (vos)"}
              {players[0]?.username === p.username && " (host)"}
              {confirmedPlayers.includes(p.username) && " ✅"}
            </li>
          ))}
        </ul>

        <div>
          <h3>🔄 Nueva Ronda</h3>
          <p>⏰ Tiempo restante: {timeLeft} segundos</p>
          <p>
            Esperando confirmaciones: {confirmedPlayers.length}/{players.length}
          </p>
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            {confirmedPlayers.length === 0
              ? "Iniciando nueva ronda..."
              : "Esperando que todos confirmen..."}
          </p>
          {!confirmedPlayers.includes(username) && (
            <button
              onClick={handleConfirmReady}
              style={{
                marginTop: 16,
                backgroundColor: "#27ae60",
                color: "white",
                padding: "12px 24px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              ¡Listo!
            </button>
          )}
          {confirmedPlayers.includes(username) && (
            <p style={{ color: "#27ae60", fontWeight: "bold" }}>
              ✅ Ya confirmaste
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 24 }}>
      <h2>Sala de espera: {gameCode}</h2>
      <ul>
        {players.map((p) => (
          <li key={p.socketId}>
            {p.username}
            {p.username === username && " (vos)"}
            {players[0]?.username === p.username && " (host)"}
            {confirmedPlayers.includes(p.username) && " ✅"}
          </li>
        ))}
      </ul>

      <div>
        <p>
          {players.length < 2
            ? "Esperando más jugadores..."
            : "Listos para empezar"}
        </p>
        {isHost && players.length > 1 && !gameStarted && (
          <button onClick={handleStartGame} style={{ marginTop: 16 }}>
            Iniciar partida
          </button>
        )}
      </div>
    </div>
  );
};
