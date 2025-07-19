import React, { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

interface Category {
  key: string;
  label: string;
}

const CATEGORIES: Category[] = [
  { key: "name", label: "Nombre" },
  { key: "country", label: "País" },
  { key: "animal", label: "Animal" },
  { key: "thing", label: "Cosa" },
];

interface GameStartedData {
  letter?: string;
  autoStarted?: boolean;
  roundNumber?: number;
  isNewRound?: boolean;
  [key: string]: unknown;
}

interface GameProps {
  username: string;
  gameCode: string;
  isHost: boolean; // le pasamos si es host
  gameData: GameStartedData;
}

export const Game: React.FC<GameProps> = ({
  username, // Se usará para identificar al jugador
  gameCode, // Se usará para enviar respuestas
  isHost, // Se usará para funcionalidades del host
  gameData,
}) => {
  const socketRef = useSocket();
  const [letter, setLetter] = useState<string>(gameData.letter || "");
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(!!gameData.letter);
  const [finishedBy, setFinishedBy] = useState<string>("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [currentRound, setCurrentRound] = useState<number>(1);

  useEffect(() => {
    if (!socketRef.current) {
      console.log("Socket no disponible en Game");
      return;
    }

    const socket = socketRef.current;
    console.log("Socket conectado en Game, gameCode:", gameCode);

    // Asegurar que estamos en la sala correcta
    socket.emit("join_game", { gameCode, username });

    // Escucha el evento game_started con la letra sorteada
    socket.on("game_started", (data: GameStartedData) => {
      console.log("Juego iniciado desde Game:", data);
      setLetter(data.letter || "");
      setStarted(true);
      setCurrentRound(data.roundNumber || 1);

      if (data.autoStarted) {
        console.log("Juego iniciado automáticamente por timeout");
      }

      if (data.isNewRound) {
        console.log("Nueva ronda iniciada:", data.roundNumber);
      }
    });

    // Escucha cuando alguien termina la ronda
    socket.on(
      "round_finished",
      (data: {
        finishedBy: string;
        answers: Record<string, string>;
        scores: Record<string, number>;
        roundNumber: number;
      }) => {
        console.log("Ronda terminada por:", data.finishedBy);
        console.log("Puntuaciones actualizadas:", data.scores);
        setFinishedBy(data.finishedBy);
        setScores(data.scores);
        setFinished(true);
      }
    );

    return () => {
      socket.off("game_started");
      socket.off("round_finished");
    };
  }, [gameCode, socketRef, username]);

  useEffect(() => {
    if (!started) return;
    if (finished) return;
    if (timeLeft === 0) {
      setFinished(true);
      // Aquí deberías enviar las respuestas por socket
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [started, timeLeft, finished]);

  const handleChange = (cat: string, value: string) => {
    if (value && value[0].toUpperCase() !== letter) return;
    setInputs((prev) => ({ ...prev, [cat]: value }));
  };

  const handleFinish = () => {
    console.log("Enviando tuti_fruti_finished con datos:", {
      gameCode,
      username,
      answers: inputs,
    });

    setFinished(true);
    setFinishedBy(username); // Marcar que terminé yo

    // Enviar las respuestas al servidor
    socketRef.current?.emit("tuti_fruti_finished", {
      gameCode,
      username,
      answers: inputs,
    });

    console.log(`Jugador ${username} terminó en sala ${gameCode}`);
    alert("¡Tuti Fruti enviado!");
  };

  const handleNextRound = () => {
    console.log("Iniciando siguiente ronda desde Game");
    console.log("Datos enviados:", { gameCode, username });
    socketRef.current?.emit("start_next_round", { gameCode, username });
  };

  if (!started) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
        Esperando a que inicie la ronda... {isHost ? "(Eres el host)" : ""}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <h2>Tuti Fruti - Ronda {currentRound}</h2>
      <p>
        <b>Letra sorteada:</b> <span style={{ fontSize: 24 }}>{letter}</span>
      </p>
      <p>
        <b>Tiempo restante:</b> {timeLeft} seg
      </p>
      <table
        border={1}
        cellPadding={8}
        style={{ width: "100%", marginBottom: 20 }}
      >
        <thead>
          <tr>
            {CATEGORIES.map((cat) => (
              <th key={cat.key}>{cat.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {CATEGORIES.map((cat) => (
              <td key={cat.key}>
                <input
                  type="text"
                  value={inputs[cat.key] || ""}
                  maxLength={20}
                  disabled={finished}
                  onChange={(e) =>
                    handleChange(cat.key, e.target.value.toUpperCase())
                  }
                  style={{ width: "95%" }}
                  placeholder={`Con ${letter}`}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      {!finished ? (
        <button onClick={handleFinish}>¡Tuti Fruti!</button>
      ) : (
        <div>
          <p>¡Ronda {currentRound} terminada!</p>
          {finishedBy && (
            <p>
              {finishedBy === username
                ? "¡Terminaste primero! Los demás no pueden seguir escribiendo."
                : `Terminada por: ${finishedBy}`}
            </p>
          )}
          {Object.keys(scores).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3>Puntuaciones:</h3>
              {Object.entries(scores)
                .sort(([, a], [, b]) => b - a)
                .map(([player, score]) => (
                  <p key={player}>
                    {player}: {score} puntos {player === username && "(vos)"}
                  </p>
                ))}
            </div>
          )}
          {isHost && (
            <button
              onClick={handleNextRound}
              style={{
                marginTop: 16,
                backgroundColor: "#3498db",
                color: "white",
                padding: "12px 24px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Siguiente Ronda
            </button>
          )}
        </div>
      )}
    </div>
  );
};
