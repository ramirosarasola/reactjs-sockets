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
  answersByPlayer: Record<string, Record<string, string>>;
  finishedBy: string;
  scores: Record<string, number>;
  timeLeft: number;
  roundPoints?: Record<string, number>;
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
  const [, setVotes] = useState<Record<string, Record<string, Record<string, number>>>>({});
  // const [hoveredCell, setHoveredCell] = useState<{ round: number; player: string; category: string } | null>(null);
  const [buttonClicked, setButtonClicked] = useState<{ key: string }[]>([]);

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

      // Asegurar consistencia de rondas: crear/actualizar entrada vacía de la ronda en curso
      setRounds((prev) => {
        const rn = data.roundNumber || 1;
        const idx = prev.findIndex((r) => r.roundNumber === rn);
        if (idx === -1) {
          return [
            ...prev,
            {
              roundNumber: rn,
              letter: data.letter || currentLetter,
              answersByPlayer: {},
              finishedBy: "",
              scores: {},
              timeLeft: 60,
              roundPoints: {},
            },
          ];
        }
        const copy = [...prev];
        copy[idx] = { ...copy[idx], roundNumber: rn, letter: data.letter || copy[idx].letter };
        return copy;
      });
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
    on("round_finished", (data: { finishedBy: string; answersByPlayer?: Record<string, Record<string, string>>; letter?: string; scores: Record<string, number>; roundNumber: number; answers?: Record<string, string> }) => {
      console.log("Ronda terminada por:", data.finishedBy);
      console.log("Puntuaciones actualizadas:", data.scores);

      // Construir/actualizar la ronda con todas las respuestas conocidas
      const fallbackAnswersByPlayer: Record<string, Record<string, string>> = data.answersByPlayer && Object.keys(data.answersByPlayer).length > 0 ? data.answersByPlayer : { [data.finishedBy]: data.answers || {} };

      const newRound: RoundData = {
        roundNumber: data.roundNumber,
        letter: data.letter || currentLetter,
        answersByPlayer: fallbackAnswersByPlayer,
        finishedBy: data.finishedBy,
        scores: data.scores,
        timeLeft: timeLeft,
        roundPoints: {},
      };

      setRounds((prev) => {
        const existingIndex = prev.findIndex((r) => r.roundNumber === newRound.roundNumber);
        if (existingIndex === -1) {
          return [...prev, newRound];
        }
        const existing = prev[existingIndex];
        const mergedAnswers: Record<string, Record<string, string>> = { ...existing.answersByPlayer };
        Object.entries(newRound.answersByPlayer).forEach(([player, ans]) => {
          mergedAnswers[player] = { ...(mergedAnswers[player] || {}), ...ans };
        });
        const updated: RoundData = {
          ...existing,
          answersByPlayer: mergedAnswers,
          letter: newRound.letter || existing.letter,
          scores: newRound.scores,
          finishedBy: existing.finishedBy || newRound.finishedBy,
        };
        const copy = [...prev];
        copy[existingIndex] = updated;
        return copy;
      });
      setCurrentScores(data.scores);
      setIsPlaying(false);
      // Sincronizar ronda/letra por seguridad (puede haber llegado antes de game_started)
      setCurrentRound(data.roundNumber || 1);
      if (data.letter) setCurrentLetter(data.letter);

      // Si yo no fui quien terminó y aún estaba jugando, envío mis respuestas parciales
      if (username !== data.finishedBy && isPlaying && Object.keys(currentInputs).length > 0) {
        emit("tuti_fruti_finished", {
          gameCode,
          username,
          answers: currentInputs,
        });
      }
    });

    // Actualización de puntos por votos
    on("round_points_updated", (data: { roundNumber: number; roundPoints: Record<string, number>; votes: Record<string, Record<string, Record<string, number>>> }) => {
      if (!data) return;
      setRounds((prev) => {
        const index = prev.findIndex((r) => r.roundNumber === data.roundNumber);
        if (index === -1) return prev;
        const updated = [...prev];
        updated[index] = { ...updated[index], roundPoints: data.roundPoints };
        return updated;
      });
      setVotes(data.votes || {});
    });

    return () => {
      off("game_started");
      off("game_ready_to_start");
      off("player_confirmed");
      off("round_finished");
      off("round_points_updated");
    };
  }, [socket, gameCode, username, currentLetter, isPlaying, gameData, isHost, currentRound, emit, on, off, timeLeft, currentInputs]);

  // Timer local para la ronda actual
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
                      Puntos Ronda
                    </th>
                  </tr>
                </thead>

                {/* Cuerpo de la tabla */}
                <tbody>
                  {/* Filas de rondas completadas */}
                  {rounds.flatMap((round, index) => {
                    const players = Object.keys(round.answersByPlayer || {});
                    return players.map((player, pIndex) => (
                      <tr
                        key={`${round.roundNumber}-${player}`}
                        style={{
                          borderBottom: "1px solid var(--gray-200)",
                          backgroundColor: (index + pIndex) % 2 === 0 ? "white" : "var(--gray-50)",
                          height: round.roundNumber === currentRound ? 84 : 40,
                        }}
                      >
                        <td
                          style={{
                            padding: round.roundNumber === currentRound ? "var(--space-3)" : "var(--space-2)",
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
                            padding: round.roundNumber === currentRound ? "var(--space-3)" : "var(--space-2)",
                            textAlign: "center",
                            fontWeight: "var(--font-weight-bold)",
                            color: "var(--primary-600)",
                            fontSize: "var(--font-size-lg)",
                            borderRight: "2px solid var(--gray-200)",
                          }}
                        >
                          {round.letter}
                        </td>
                        {CATEGORIES.map((cat,index) => {
                          const answer = round.answersByPlayer[player]?.[cat.key];
                          const canVote = !!answer;
                          return (
                            <td
                              key={`${cat.key}-${player}-${round.roundNumber}-${index}`}
                              style={{
                                padding: round.roundNumber === currentRound ? "var(--space-3)" : "var(--space-2)",
                                textAlign: "center",
                                borderRight: "1px solid var(--gray-200)",
                                fontSize: "var(--font-size-sm)",
                                color: canVote ? "var(--gray-700)" : "var(--gray-300)",
                                fontWeight: "var(--font-weight-medium)",
                                position: "relative",
                              }}
                            >
                              <div
                                style={{ position: "relative", display: "inline-block" }}
                                // onMouseEnter={() => setHoveredCell({ round: round.roundNumber, player, category: cat.key })} onMouseLeave={() => setHoveredCell((prev) => (prev && prev.round === round.roundNumber && prev.player === player && prev.category === cat.key ? null : prev))}
                              >
                                <span>{answer || "-"}</span>
                                {
                                  // canVote && round.roundNumber === currentRound && hoveredCell && hoveredCell.round === round.roundNumber && hoveredCell.player === player && hoveredCell.category === cat.key
                                  round.roundNumber === currentRound && canVote && (
                                    <div
                                      className="fade-in"
                                      style={{
                                        position: "relative",
                                        top: "100%",
                                        left: "0%",
                                        display: "flex",
                                        gap: 4,
                                        paddingTop: 6,
                                      }}
                                    >
                                      <Button size="sm" variant={`${buttonClicked.some((b) => b.key === `${cat.key}-${player}-${round.roundNumber}-${index}-error`) ? "primary" : "error"}`} onClick={() => {
                                        emit("vote_answer", { gameCode, voter: username, target: player, category: cat.key, points: 0, roundNumber: round.roundNumber });
                                        setButtonClicked((prev) => {
                                          // we can only have one button clicked at a time
                                          // so we need to remove the index-warning and index-success
                                          const addNew = [...prev, { key: `${cat.key}-${player}-${round.roundNumber}-${index}-error` }];
                                          // remove the index-warning and index-success
                                          const newButtonClicked = addNew.filter((b) => b.key !== `${cat.key}-${player}-${round.roundNumber}-${index}-warning` && b.key !== `${cat.key}-${player}-${round.roundNumber}-${index}-success`);
                                          return newButtonClicked;
                                        });
                                      }}
                                      >
                                        🥲
                                      </Button>
                                      <Button size="sm" variant={`${buttonClicked.some((b) => b.key === `${cat.key}-${player}-${round.roundNumber}-${index}-warning`) ? "primary" : "warning"}`} onClick={() => {
                                        emit("vote_answer", { gameCode, voter: username, target: player, category: cat.key, points: 5, roundNumber: round.roundNumber });
                                        setButtonClicked((prev) => {
                                          // we can only have one button clicked at a time
                                          // so we need to remove the index-error and index-success
                                          const addNew = [...prev, { key: `${cat.key}-${player}-${round.roundNumber}-${index}-warning` }];
                                          // remove the index-error and index-success
                                          const newButtonClicked = addNew.filter((b) => b.key !== `${cat.key}-${player}-${round.roundNumber}-${index}-error` && b.key !== `${cat.key}-${player}-${round.roundNumber}-${index}-success`);
                                          return newButtonClicked;
                                        });
                                      }}
                                      >
                                        🤔
                                      </Button>
                                      <Button size="sm" variant={`${buttonClicked.some((b) => b.key === `${cat.key}-${player}-${round.roundNumber}-${index}-success`) ? "primary" : "success"}`} onClick={() => {
                                        emit("vote_answer", { gameCode, voter: username, target: player, category: cat.key, points: 10, roundNumber: round.roundNumber });
                                        setButtonClicked((prev) => {
                                          // Add index-success but remove the index-error and index-warning
                                          const addNew = [...prev, { key: `${cat.key}-${player}-${round.roundNumber}-${index}-success` }];
                                          // remove the index-error and index-warning
                                          const newButtonClicked = addNew.filter((b) => b.key !== `${cat.key}-${player}-${round.roundNumber}-${index}-error` && b.key !== `${cat.key}-${player}-${round.roundNumber}-${index}-warning`);
                                          return newButtonClicked;
                                        });
                                      }}
                                      >
                                        🤩
                                      </Button>
                                    </div>
                                  )
                                }
                              </div>
                            </td>
                          );
                        })}
                        <td
                          style={{
                            padding: round.roundNumber === currentRound ? "var(--space-3)" : "var(--space-2)",
                            textAlign: "center",
                            fontWeight: "var(--font-weight-bold)",
                            color: "var(--success-700)",
                          }}
                        >
                          {round.roundPoints?.[player] ?? 0} pts
                        </td>
                      </tr>
                    ));
                  })}

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
            {isHost && !isPlaying && rounds.length > 0 && !isReadyPhase && (
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
