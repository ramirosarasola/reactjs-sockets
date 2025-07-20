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

interface GameProps {
  username: string;
  gameCode: string;
  isHost: boolean; // le pasamos si es host
  gameData: GameStartedData;
  game?: any; // Para compatibilidad con el nuevo flujo
  user?: any; // Para compatibilidad con el nuevo flujo
  onBackToLobby?: () => void;
}

export const Game: React.FC<GameProps> = ({
  username, // Se usará para identificar al jugador
  gameCode, // Se usará para enviar respuestas
  isHost, // Se usará para funcionalidades del host
  gameData,
  onBackToLobby,
}) => {
  const { socket, emit, on, off } = useSocket();
  const [letter, setLetter] = useState<string>(gameData.letter || "");
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(
    !!gameData.letter || gameData.autoStarted
  );
  const [finishedBy, setFinishedBy] = useState<string>("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [currentRound, setCurrentRound] = useState<number>(
    gameData.roundNumber || 1
  );

  useEffect(() => {
    if (!socket) {
      console.log("Socket no disponible en Game");
      return;
    }

    console.log("🎮 Game.tsx - Estado inicial:");
    console.log("   Letter:", letter);
    console.log("   Started:", started);
    console.log("   GameData:", gameData);
    console.log("   IsHost:", isHost);
    console.log("   CurrentRound:", currentRound);

    console.log("Socket conectado en Game, gameCode:", gameCode);

    // Asegurar que estamos en la sala correcta
    emit("join_game", { gameCode, username });

    // Escucha el evento game_started con la letra sorteada
    on("game_started", (data: GameStartedData) => {
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
    on(
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
      off("game_started");
      off("round_finished");
    };
  }, [socket, gameCode, username, emit, on, off]);

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
    emit("tuti_fruti_finished", {
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
    emit("start_next_round", { gameCode, username });

    // Navegar de vuelta al lobby para la siguiente ronda
    if (onBackToLobby) {
      onBackToLobby();
    }
  };

  const handleBackToLobby = () => {
    if (onBackToLobby) {
      onBackToLobby();
    }
  };

  if (!started) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, var(--primary-50), var(--secondary-50))",
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
              {isHost
                ? "Eres el host - puedes iniciar cuando estés listo"
                : "El host iniciará la ronda pronto"}
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
        background:
          "linear-gradient(135deg, var(--primary-50), var(--secondary-50))",
        padding: "var(--space-4)",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <Card className="fade-in">
          {/* Header del juego */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "var(--space-8)",
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
                background:
                  "linear-gradient(135deg, var(--primary-600), var(--secondary-600))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Tuti Fruti - Ronda {currentRound}
            </h1>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "var(--space-8)",
                flexWrap: "wrap",
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
                  Letra sorteada
                </p>
                <span
                  style={{
                    fontSize: "var(--font-size-4xl)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--primary-600)",
                    textTransform: "uppercase",
                  }}
                >
                  {letter}
                </span>
              </div>

              <div
                style={{
                  textAlign: "center",
                  padding: "var(--space-4)",
                  backgroundColor:
                    timeLeft <= 10 ? "var(--error-100)" : "var(--warning-100)",
                  borderRadius: "var(--radius-lg)",
                  border: `2px solid ${
                    timeLeft <= 10 ? "var(--error-300)" : "var(--warning-300)"
                  }`,
                }}
              >
                <p
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color:
                      timeLeft <= 10
                        ? "var(--error-700)"
                        : "var(--warning-700)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Tiempo restante
                </p>
                <span
                  style={{
                    fontSize: "var(--font-size-2xl)",
                    fontWeight: "var(--font-weight-bold)",
                    color:
                      timeLeft <= 10
                        ? "var(--error-600)"
                        : "var(--warning-600)",
                  }}
                >
                  {timeLeft}s
                </span>
              </div>
            </div>
          </div>

          {/* Tabla de categorías */}
          <div style={{ marginBottom: "var(--space-8)" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "var(--space-4)",
                marginBottom: "var(--space-6)",
              }}
            >
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.key}
                  style={{
                    padding: "var(--space-4)",
                    backgroundColor: "var(--gray-50)",
                    borderRadius: "var(--radius-lg)",
                    border: "2px solid var(--gray-200)",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--gray-700)",
                      marginBottom: "var(--space-2)",
                      textTransform: "uppercase",
                    }}
                  >
                    {cat.label}
                  </label>
                  <input
                    type="text"
                    value={inputs[cat.key] || ""}
                    maxLength={20}
                    disabled={finished}
                    onChange={(e) =>
                      handleChange(cat.key, e.target.value.toUpperCase())
                    }
                    placeholder={`Con ${letter}`}
                    style={{
                      width: "100%",
                      padding: "var(--space-3)",
                      border: "2px solid var(--gray-200)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "var(--font-size-base)",
                      backgroundColor: finished ? "var(--gray-100)" : "white",
                      color: finished ? "var(--gray-500)" : "var(--gray-900)",
                      transition: "all var(--transition-normal)",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Botón de finalizar */}
            {!finished && (
              <div style={{ textAlign: "center" }}>
                <Button
                  onClick={handleFinish}
                  size="lg"
                  variant="success"
                  className="bounce-in"
                >
                  ¡Tuti Fruti!
                </Button>
              </div>
            )}
          </div>

          {/* Resultados */}
          {finished && (
            <div
              style={{
                padding: "var(--space-6)",
                backgroundColor: "var(--gray-50)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--gray-200)",
              }}
            >
              <h3
                style={{
                  fontSize: "var(--font-size-xl)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--gray-900)",
                  marginBottom: "var(--space-4)",
                  textAlign: "center",
                }}
              >
                ¡Ronda {currentRound} terminada!
              </h3>

              {finishedBy && (
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "var(--space-4)",
                    padding: "var(--space-4)",
                    backgroundColor:
                      finishedBy === username
                        ? "var(--success-100)"
                        : "var(--primary-100)",
                    borderRadius: "var(--radius-lg)",
                    border: `1px solid ${
                      finishedBy === username
                        ? "var(--success-300)"
                        : "var(--primary-300)"
                    }`,
                  }}
                >
                  <p
                    style={{
                      color:
                        finishedBy === username
                          ? "var(--success-700)"
                          : "var(--primary-700)",
                      fontWeight: "var(--font-weight-medium)",
                      fontSize: "var(--font-size-lg)",
                    }}
                  >
                    {finishedBy === username
                      ? "¡Terminaste primero! Los demás no pueden seguir escribiendo."
                      : `Terminada por: ${finishedBy}`}
                  </p>
                </div>
              )}

              {/* Puntuaciones */}
              {Object.keys(scores).length > 0 && (
                <div style={{ marginBottom: "var(--space-6)" }}>
                  <h4
                    style={{
                      fontSize: "var(--font-size-lg)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--gray-900)",
                      marginBottom: "var(--space-3)",
                      textAlign: "center",
                    }}
                  >
                    Puntuaciones
                  </h4>

                  {/* Mensaje especial para el ganador */}
                  {finishedBy && (
                    <div
                      style={{
                        textAlign: "center",
                        marginBottom: "var(--space-4)",
                        padding: "var(--space-3)",
                        backgroundColor: "var(--success-100)",
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--success-300)",
                      }}
                    >
                      <p
                        style={{
                          color: "var(--success-700)",
                          fontWeight: "var(--font-weight-medium)",
                          fontSize: "var(--font-size-base)",
                        }}
                      >
                        🏆 <strong>{finishedBy}</strong> ganó esta ronda y
                        recibió <strong>+10 puntos</strong>!
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--space-2)",
                    }}
                  >
                    {Object.entries(scores)
                      .sort(([, a], [, b]) => b - a)
                      .map(([player, score], index) => (
                        <div
                          key={player}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "var(--space-3)",
                            backgroundColor:
                              player === username
                                ? "var(--primary-100)"
                                : player === finishedBy
                                ? "var(--success-100)"
                                : "white",
                            borderRadius: "var(--radius-md)",
                            border: `1px solid ${
                              player === username
                                ? "var(--primary-300)"
                                : player === finishedBy
                                ? "var(--success-300)"
                                : "var(--gray-200)"
                            }`,
                          }}
                        >
                          <div
                            style={{
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
                                minWidth: "2rem",
                              }}
                            >
                              #{index + 1}
                            </span>
                            <span
                              style={{
                                fontSize: "var(--font-size-base)",
                                fontWeight: "var(--font-weight-medium)",
                                color: "var(--gray-900)",
                              }}
                            >
                              {player}
                            </span>
                            {player === username && (
                              <span
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  color: "var(--primary-600)",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                (tú)
                              </span>
                            )}
                            {player === finishedBy && (
                              <span
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  color: "var(--success-600)",
                                  fontWeight: "var(--font-weight-medium)",
                                }}
                              >
                                🏆 ganador
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: "var(--font-size-lg)",
                              fontWeight: "var(--font-weight-bold)",
                              color:
                                player === finishedBy
                                  ? "var(--success-600)"
                                  : "var(--primary-600)",
                            }}
                          >
                            {score} pts
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Botón siguiente ronda (solo para host) */}
              {isHost && (
                <div style={{ textAlign: "center" }}>
                  <Button onClick={handleNextRound} size="lg" variant="primary">
                    Siguiente Ronda
                  </Button>
                </div>
              )}

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
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
