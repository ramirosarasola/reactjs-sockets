import React, { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { Button, Card } from "../components/ui";

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

interface RoundData {
  roundNumber: number;
  letter: string;
  answers: Record<string, string>;
  finishedBy: string;
  scores: Record<string, number>;
  timeLeft: number;
}

interface GameProps {
  username: string;
  gameCode: string;
  isHost: boolean;
  gameData: GameStartedData;
  game?: unknown;
  user?: unknown;
  onBackToLobby?: () => void;
}

export const Game: React.FC<GameProps> = ({ username, gameCode, isHost, gameData, onBackToLobby }) => {
  const { socket, emit, on, off } = useSocket();
  const [currentLetter, setCurrentLetter] = useState<string>(gameData.letter || "");
  const [currentInputs, setCurrentInputs] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [currentRound, setCurrentRound] = useState<number>(gameData.roundNumber || 1);
  const [isPlaying, setIsPlaying] = useState(!!gameData.letter || gameData.autoStarted);
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [currentScores, setCurrentScores] = useState<Record<string, number>>({});
  // Estado para la fase de confirmación entre rondas
  const [isReadyPhase, setIsReadyPhase] = useState<boolean>(false);
  const [readyPlayers, setReadyPlayers] = useState<string[]>([]);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [readyTimeLeft, setReadyTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!socket) {
      console.log("Socket no disponible en Game");
      return;
    }

    console.log("🎮 Game.tsx - Estado inicial:");
    console.log("   CurrentLetter:", currentLetter);
    console.log("   IsPlaying:", isPlaying);
    console.log("   GameData:", gameData);
    console.log("   IsHost:", isHost);
    console.log("   CurrentRound:", currentRound);

    console.log("Socket conectado en Game, gameCode:", gameCode);

    // Ensure we are in the correct room
    emit("join_game", { gameCode, username });

    // Listen to the game_started event with the letter drawn
    on("game_started", (data: GameStartedData) => {
      console.log("Juego iniciado desde Game:", data);
      setCurrentLetter(data.letter || "");
      setIsPlaying(true);
      setCurrentRound(data.roundNumber || 1);
      setTimeLeft(60);
      setCurrentInputs({});
      setIsReadyPhase(false);
      setReadyPlayers([]);
      setReadyTimeLeft(0);

      if (data.autoStarted) {
        console.log("Juego iniciado automáticamente por timeout");
      }

      if (data.isNewRound) {
        console.log("Nueva ronda iniciada:", data.roundNumber);
      }
    });

    // Fase de confirmación para nueva ronda
    on("game_ready_to_start", (data: { timeLeft: number; totalPlayers: number; isNewRound?: boolean }) => {
      console.log("Fase de preparación para nueva ronda:", data);
      setIsPlaying(false);
      setIsReadyPhase(true);
      setReadyPlayers([]);
      setTotalPlayers(data.totalPlayers || 0);
      setReadyTimeLeft(Math.max(0, Math.floor(data.timeLeft || 0)));
    });

    // Jugador confirmado
    on("player_confirmed", (data: { username: string; confirmedPlayers: string[] }) => {
      console.log("Jugador confirmó estar listo:", data);
      setReadyPlayers(data.confirmedPlayers || []);
    });

    // Listen when someone finishes the round
    on("round_finished", (data: { finishedBy: string; answers: Record<string, string>; scores: Record<string, number>; roundNumber: number }) => {
      console.log("Ronda terminada por:", data.finishedBy);
      console.log("Puntuaciones actualizadas:", data.scores);

      // Agregar la ronda completada a la tabla
      const newRound: RoundData = {
        roundNumber: data.roundNumber,
        letter: currentLetter,
        answers: data.answers,
        finishedBy: data.finishedBy,
        scores: data.scores,
        timeLeft: timeLeft,
      };

      setRounds((prev) => [...prev, newRound]);
      setCurrentScores(data.scores);
      setIsPlaying(false);
    });

    return () => {
      off("game_started");
      off("game_ready_to_start");
      off("player_confirmed");
      off("round_finished");
    };
  }, [socket, gameCode, username, currentLetter, isPlaying, gameData, isHost, currentRound, emit, on, off, timeLeft]);

  useEffect(() => {
    if (!isPlaying) return;
    if (timeLeft === 0) {
      setIsPlaying(false);
      emit("tuti_fruti_finished", {
        gameCode,
        username,
        answers: currentInputs,
      });
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, emit, gameCode, username, currentInputs]);

  // Temporizador local para la fase de preparación
  useEffect(() => {
    if (!isReadyPhase) return;
    if (readyTimeLeft <= 0) return;
    const timer = setTimeout(() => setReadyTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [isReadyPhase, readyTimeLeft]);

  const handleChange = (cat: string, value: string) => {
    if (value && value[0].toUpperCase() !== currentLetter) return;
    setCurrentInputs((prev) => ({ ...prev, [cat]: value }));
  };

  const handleFinish = () => {
    console.log("Sending tuti_fruti_finished with data:", {
      gameCode,
      username,
      answers: currentInputs,
    });

    setIsPlaying(false);

    // Send the answers to the server
    emit("tuti_fruti_finished", {
      gameCode,
      username,
      answers: currentInputs,
    });

    console.log(`Jugador ${username} terminó en sala ${gameCode}`);
  };

  const handleNextRound = () => {
    console.log("Iniciando siguiente ronda desde Game");
    console.log("Datos enviados:", { gameCode, username });
    emit("start_next_round", { gameCode, username });
  };

  const handlePlayerReady = () => {
    console.log("Confirmando listo para siguiente ronda", { gameCode, username });
    emit("player_ready", { gameCode, username });
  };

  const handleBackToLobby = () => {
    if (onBackToLobby) {
      onBackToLobby();
    }
  };

  // Si no hay letra actual y no se está jugando, mostrar pantalla de espera
  if (!currentLetter && !isPlaying && rounds.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, var(--primary-50), var(--secondary-50))",
          padding: "var(--space-4)",
        }}
      >
        <Card className="fade-in">
          <div className="text-center" style={{ padding: "var(--space-8)" }}>
            <h2
              style={{
                fontSize: "var(--font-size-2xl)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--gray-900)",
                marginBottom: "var(--space-4)",
              }}
            >
              Esperando inicio de ronda...
            </h2>
            <p
              style={{
                color: "var(--gray-600)",
                fontSize: "var(--font-size-lg)",
              }}
            >
              {isHost ? "Eres el host - puedes iniciar cuando estés listo" : "El host iniciará la ronda pronto"}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, var(--primary-50), var(--secondary-50))",
        padding: "var(--space-4)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Card className="fade-in">
          {/* Header del juego */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "var(--space-6)",
              padding: "var(--space-6)",
              borderBottom: "1px solid var(--gray-200)",
            }}
          >
            <h1
              style={{
                fontSize: "var(--font-size-3xl)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--gray-900)",
                marginBottom: "var(--space-4)",
                background: "linear-gradient(135deg, var(--primary-600), var(--secondary-600))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Tuti Fruti - Tabla de Juego
            </h1>

            {/* Fase de confirmación para iniciar la siguiente ronda */}
            {isReadyPhase && !isPlaying && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "var(--space-8)",
                  flexWrap: "wrap",
                  marginBottom: "var(--space-4)",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    padding: "var(--space-4)",
                    backgroundColor: "var(--primary-50)",
                    borderRadius: "var(--radius-lg)",
                    border: "2px solid var(--primary-200)",
                    minWidth: 280,
                  }}
                >
                  <p
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--primary-700)",
                      marginBottom: "var(--space-1)",
                    }}
                  >
                    Preparando siguiente ronda
                  </p>
                  <div style={{ fontSize: "var(--font-size-2xl)", fontWeight: "var(--font-weight-bold)", color: "var(--primary-600)" }}>{readyTimeLeft}s</div>
                  <div style={{ marginTop: "var(--space-2)", color: "var(--gray-600)", fontSize: "var(--font-size-sm)" }}>
                    Listos: {readyPlayers.length} / {totalPlayers}
                  </div>
                  {readyPlayers.length > 0 && <div style={{ marginTop: "var(--space-2)", color: "var(--gray-500)", fontSize: "var(--font-size-xs)" }}>{readyPlayers.join(", ")}</div>}
                  <div style={{ marginTop: "var(--space-4)" }}>
                    <Button onClick={handlePlayerReady} size="sm" variant="primary">
                      Estoy listo
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Información de la ronda actual */}
            {isPlaying && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "var(--space-8)",
                  flexWrap: "wrap",
                  marginBottom: "var(--space-4)",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    padding: "var(--space-4)",
                    backgroundColor: "var(--primary-100)",
                    borderRadius: "var(--radius-lg)",
                    border: "2px solid var(--primary-300)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--primary-700)",
                      marginBottom: "var(--space-1)",
                    }}
                  >
                    Ronda {currentRound} - Letra
                  </p>
                  <span
                    style={{
                      fontSize: "var(--font-size-4xl)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--primary-600)",
                      textTransform: "uppercase",
                    }}
                  >
                    {currentLetter}
                  </span>
                </div>

                <div
                  style={{
                    textAlign: "center",
                    padding: "var(--space-4)",
                    backgroundColor: timeLeft <= 10 ? "var(--error-100)" : "var(--warning-100)",
                    borderRadius: "var(--radius-lg)",
                    border: `2px solid ${timeLeft <= 10 ? "var(--error-300)" : "var(--warning-300)"}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: timeLeft <= 10 ? "var(--error-700)" : "var(--warning-700)",
                      marginBottom: "var(--space-1)",
                    }}
                  >
                    Tiempo restante
                  </p>
                  <span
                    style={{
                      fontSize: "var(--font-size-2xl)",
                      fontWeight: "var(--font-weight-bold)",
                      color: timeLeft <= 10 ? "var(--error-600)" : "var(--warning-600)",
                    }}
                  >
                    {timeLeft}s
                  </span>
                </div>
              </div>
            )}

            {/* Puntuaciones actuales */}
            {Object.keys(currentScores).length > 0 && (
              <div style={{ marginTop: "var(--space-4)" }}>
                <h3
                  style={{
                    fontSize: "var(--font-size-lg)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--gray-900)",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  Puntuaciones Totales
                </h3>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "var(--space-4)",
                    flexWrap: "wrap",
                  }}
                >
                  {Object.entries(currentScores)
                    .sort(([, a], [, b]) => b - a)
                    .map(([player, score], index) => (
                      <div
                        key={player}
                        style={{
                          padding: "var(--space-2) var(--space-4)",
                          backgroundColor: player === username ? "var(--primary-100)" : "var(--gray-100)",
                          borderRadius: "var(--radius-lg)",
                          border: `2px solid ${player === username ? "var(--primary-300)" : "var(--gray-300)"}`,
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-2)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "var(--font-size-sm)",
                            fontWeight: "var(--font-weight-bold)",
                            color: "var(--gray-500)",
                          }}
                        >
                          #{index + 1}
                        </span>
                        <span
                          style={{
                            fontSize: "var(--font-size-sm)",
                            fontWeight: "var(--font-weight-medium)",
                            color: "var(--gray-900)",
                          }}
                        >
                          {player}
                        </span>
                        <span
                          style={{
                            fontSize: "var(--font-size-sm)",
                            fontWeight: "var(--font-weight-bold)",
                            color: player === username ? "var(--primary-600)" : "var(--gray-600)",
                          }}
                        >
                          {score} pts
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Tabla de juego */}
          <div style={{ marginBottom: "var(--space-6)" }}>
            <div style={{ overflowX: "auto", border: "2px solid var(--gray-200)", borderRadius: "var(--radius-lg)", backgroundColor: "white" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                {/* Header de la tabla */}
                <thead>
                  <tr
                    style={{
                      backgroundColor: "var(--primary-50)",
                      borderBottom: "2px solid var(--primary-200)",
                    }}
                  >
                    <th
                      style={{
                        padding: "var(--space-4)",
                        textAlign: "center",
                        fontWeight: "var(--font-weight-bold)",
                        color: "var(--primary-700)",
                        fontSize: "var(--font-size-sm)",
                        borderRight: "2px solid var(--primary-200)",
                        minWidth: "80px",
                      }}
                    >
                      Ronda
                    </th>
                    <th
                      style={{
                        padding: "var(--space-4)",
                        textAlign: "center",
                        fontWeight: "var(--font-weight-bold)",
                        color: "var(--primary-700)",
                        fontSize: "var(--font-size-sm)",
                        borderRight: "2px solid var(--primary-200)",
                        minWidth: "80px",
                      }}
                    >
                      Letra
                    </th>
                    {CATEGORIES.map((cat) => (
                      <th
                        key={cat.key}
                        style={{
                          padding: "var(--space-4)",
                          textAlign: "center",
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--primary-700)",
                          fontSize: "var(--font-size-sm)",
                          borderRight: "2px solid var(--primary-200)",
                          minWidth: "120px",
                        }}
                      >
                        {cat.label}
                      </th>
                    ))}
                    <th
                      style={{
                        padding: "var(--space-4)",
                        textAlign: "center",
                        fontWeight: "var(--font-weight-bold)",
                        color: "var(--primary-700)",
                        fontSize: "var(--font-size-sm)",
                        minWidth: "120px",
                      }}
                    >
                      Ganador
                    </th>
                  </tr>
                </thead>

                {/* Cuerpo de la tabla */}
                <tbody>
                  {/* Filas de rondas completadas */}
                  {rounds.map((round, index) => (
                    <tr
                      key={round.roundNumber}
                      style={{
                        borderBottom: "1px solid var(--gray-200)",
                        backgroundColor: index % 2 === 0 ? "white" : "var(--gray-50)",
                      }}
                    >
                      <td
                        style={{
                          padding: "var(--space-3)",
                          textAlign: "center",
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--gray-700)",
                          borderRight: "2px solid var(--gray-200)",
                        }}
                      >
                        {round.roundNumber}
                      </td>
                      <td
                        style={{
                          padding: "var(--space-3)",
                          textAlign: "center",
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--primary-600)",
                          fontSize: "var(--font-size-lg)",
                          borderRight: "2px solid var(--gray-200)",
                        }}
                      >
                        {round.letter}
                      </td>
                      {CATEGORIES.map((cat) => (
                        <td
                          key={cat.key}
                          style={{
                            padding: "var(--space-3)",
                            textAlign: "center",
                            borderRight: "1px solid var(--gray-200)",
                            fontSize: "var(--font-size-sm)",
                            color: "var(--gray-700)",
                            fontWeight: "var(--font-weight-medium)",
                          }}
                        >
                          {round.answers[cat.key] || "-"}
                        </td>
                      ))}
                      <td
                        style={{
                          padding: "var(--space-3)",
                          textAlign: "center",
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--success-600)",
                        }}
                      >
                        {round.finishedBy}
                      </td>
                    </tr>
                  ))}

                  {/* Fila de la ronda actual (si está jugando) */}
                  {isPlaying && (
                    <tr style={{ backgroundColor: "var(--success-50)", borderBottom: "2px solid var(--success-200)" }}>
                      <td style={{ padding: "var(--space-3)", textAlign: "center", fontWeight: "var(--font-weight-bold)", color: "var(--success-700)", borderRight: "2px solid var(--success-200)" }}>{currentRound}</td>
                      <td style={{ padding: "var(--space-3)", textAlign: "center", fontWeight: "var(--font-weight-bold)", color: "var(--success-600)", fontSize: "var(--font-size-lg)", borderRight: "2px solid var(--success-200)" }}>{currentLetter}</td>
                      {CATEGORIES.map((cat) => (
                        <td key={cat.key} style={{ padding: "var(--space-3)", textAlign: "center", borderRight: "1px solid var(--success-200)" }}>
                          <input
                            type="text"
                            value={currentInputs[cat.key] || ""}
                            maxLength={20}
                            onChange={(e) => handleChange(cat.key, e.target.value.toUpperCase())}
                            placeholder={`Con ${currentLetter}`}
                            style={{ width: "100%", padding: "var(--space-2)", border: "2px solid var(--success-300)", borderRadius: "var(--radius-sm)", fontSize: "var(--font-size-sm)", backgroundColor: "white", color: "var(--gray-900)", textAlign: "center" }}
                          />
                        </td>
                      ))}
                      <td style={{ padding: "var(--space-3)", textAlign: "center", fontWeight: "var(--font-weight-bold)", color: "var(--success-600)" }}>En juego...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Botón de finalizar (solo cuando está jugando) */}
            {isPlaying && (
              <div style={{ textAlign: "center", marginTop: "var(--space-6)" }}>
                <Button onClick={handleFinish} size="lg" variant="success" className="bounce-in">
                  ¡Tuti Fruti!
                </Button>
              </div>
            )}

            {/* Botón siguiente ronda (solo para host cuando no está jugando) */}
            {isHost && !isPlaying && rounds.length > 0 && (
              <div style={{ textAlign: "center", marginTop: "var(--space-6)" }}>
                <Button onClick={handleNextRound} size="lg" variant="primary">
                  Siguiente Ronda
                </Button>
              </div>
            )}
          </div>

          {/* Botón para regresar al lobby */}
          <div
            style={{
              marginTop: "var(--space-4)",
              textAlign: "center",
            }}
          >
            <button
              type="button"
              onClick={handleBackToLobby}
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--gray-500)",
                textDecoration: "underline",
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              Volver al lobby
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
