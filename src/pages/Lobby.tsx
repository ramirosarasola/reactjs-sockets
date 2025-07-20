import React, { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { Button, Card, Loading, Badge, Notification } from "../components/ui";
import type { User, SocketPlayer } from "../types";

interface LobbyProps {
  username: string;
  gameCode: string;
  currentUser?: User | null;
  onGameStart?: (gameData: { letter: string; autoStarted: boolean; roundNumber: number; isNewRound: boolean; hostUsername: string }) => void;
  onBackToGameManager?: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({ username, gameCode, onGameStart, onBackToGameManager }) => {
  const { socket, isConnected, isConnecting } = useSocket();
  const [players, setPlayers] = useState<SocketPlayer[]>([]);
  const [readyPlayers, setReadyPlayers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: "info" | "success" | "warning" | "error" }>>([]);
  const isHost = players.length > 0 && players[0]?.username === username;

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log("❌ Socket no disponible, esperando conexión...");
      return;
    }

    console.log("🔌 Configurando socket...");
    console.log("📝 Datos:", { gameCode, username });
    console.log("🔗 Socket conectado:", isConnected);
    console.log("🆔 Socket ID:", socket.id);

    // Limpiar estado de jugadores listos para nueva ronda
    setReadyPlayers([]);

    // Emitir join_game para asegurar que estamos en la sala
    console.log("🎮 Emitiendo join_game...");
    socket.emit("join_game", { gameCode, username });

    // Recibe lista de jugadores actualizada
    socket.on("player_list", (list: SocketPlayer[]) => {
      console.log("📋 LISTA DE JUGADORES RECIBIDA:");
      console.log("   Cantidad:", list.length);
      console.log(
        "   Jugadores:",
        list.map((p) => p.username)
      );
      console.log("   Datos completos:", list);
      console.log("   Timestamp:", new Date().toISOString());
      setPlayers(list);
    });

    // Escucha cuando se une exitosamente
    socket.on("joined_game", (data: { gameCode: string; username: string }) => {
      console.log("🎉 UNIDO EXITOSAMENTE AL JUEGO:");
      console.log("   Código:", data.gameCode);
      console.log("   Usuario:", data.username);
      console.log("   Timestamp:", new Date().toISOString());
    });

    // Evento de prueba para verificar comunicación
    socket.on("test_event", (data: { message: string; players: number }) => {
      console.log("🧪 EVENTO DE PRUEBA RECIBIDO:");
      console.log("   Mensaje:", data.message);
      console.log("   Jugadores:", data.players);
      console.log("   Timestamp:", new Date().toISOString());
    });

    // Escucha cuando el juego inicia automáticamente
    socket.on("game_started", (data: { letter: string; autoStarted: boolean; roundNumber: number; isNewRound: boolean }) => {
      console.log("🎮 JUEGO INICIADO AUTOMÁTICAMENTE:");
      console.log("   Letra:", data.letter);
      console.log("   Auto iniciado:", data.autoStarted);
      console.log("   Ronda:", data.roundNumber);
      console.log("   Nueva ronda:", data.isNewRound);
      console.log("   Timestamp:", new Date().toISOString());
      console.log("   onGameStart disponible:", !!onGameStart);

      // Navegar al juego con los datos
      if (onGameStart) {
        console.log("🚀 Llamando a onGameStart...");
        onGameStart({
          ...data,
          hostUsername: players.length > 0 ? players[0].username : username,
        });
        console.log("✅ onGameStart ejecutado");
      } else {
        console.error("❌ onGameStart no disponible");
      }
    });

    // Escucha cuando un jugador confirma que está listo
    socket.on("player_confirmed", (data: { username: string; confirmedPlayers: string[] }) => {
      console.log("✅ JUGADOR CONFIRMADO:");
      console.log("   Usuario:", data.username);
      console.log("   Jugadores confirmados:", data.confirmedPlayers);
      console.log("   Timestamp:", new Date().toISOString());

      // Actualizar el estado de jugadores listos
      setReadyPlayers(data.confirmedPlayers);
    });

    // Escucha cuando un jugador se va a otro juego
    socket.on("player_left", (data: { username: string; message: string }) => {
      console.log("👋 JUGADOR SE FUE A OTRO JUEGO:");
      console.log("   Usuario:", data.username);
      console.log("   Mensaje:", data.message);
      console.log("   Timestamp:", new Date().toISOString());

      // Agregar notificación
      const notificationId = Date.now().toString();
      setNotifications((prev) => [...prev, { id: notificationId, message: data.message, type: "info" }]);
    });

    // Escucha errores de socket
    socket.on("error", (data: { message: string }) => {
      console.error("❌ Error de socket:", data.message);
    });

    // Log adicional para verificar que los listeners están configurados
    console.log("🎧 Listeners configurados para: player_list, joined_game, test_event, game_started, player_confirmed, player_left, error");
    console.log("⏰ Timestamp de configuración:", new Date().toISOString());

    return () => {
      console.log("🧹 Limpiando listeners de socket");
      socket.off("player_list");
      socket.off("joined_game");
      socket.off("test_event");
      socket.off("game_started");
      socket.off("player_confirmed");
      socket.off("player_left");
      socket.off("error");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, isConnected, gameCode, username, onGameStart]);

  // const handleStartGame = () => {
  //   console.log("🎮 Emite start_game desde Lobby");
  //   console.log("   GameCode:", gameCode);
  //   console.log("   Username:", username);
  //   console.log("   Socket disponible:", !!socket);
  //   if (socket) {
  //     socket.emit("start_game", { gameCode, username });
  //     console.log("✅ Evento start_game emitido");
  //   } else {
  //     console.error("❌ Socket no disponible para emitir start_game");
  //   }
  //   // No llamar a onGameStart aquí, esperar al evento game_started del backend
  // };

  const handleConfirmReady = () => {
    console.log("Emite player_ready desde Lobby");
    if (socket) {
      socket.emit("player_ready", { gameCode, username });
    }
  };

  const handleBackToGameManager = () => {
    if (onBackToGameManager) {
      onBackToGameManager();
    }
  };

  return (
    <>
      {/* Notificaciones */}
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => {
            setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
          }}
        />
      ))}

      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, var(--primary-50), var(--secondary-50))",
          padding: "var(--space-4)",
        }}
      >
        <div style={{ width: "100%", maxWidth: "28rem" }}>
          <Card className="fade-in">
            <div className="text-center" style={{ marginBottom: "var(--space-6)" }}>
              <h2
                style={{
                  fontSize: "var(--font-size-2xl)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--gray-900)",
                  marginBottom: "var(--space-2)",
                }}
              >
                Sala de Espera
              </h2>
              <p style={{ color: "var(--gray-600)" }}>
                Código:{" "}
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--primary-600)",
                  }}
                >
                  {gameCode}
                </span>
              </p>
            </div>

            {/* Estado de conexión */}
            <div style={{ marginBottom: "var(--space-6)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
                <div style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", backgroundColor: isConnecting ? "var(--warning-500)" : isConnected ? "var(--success-500)" : "var(--error-500)" }} />
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--gray-600)" }}>{isConnecting ? "Conectando..." : isConnected ? "Conectado" : "Desconectado"}</span>
              </div>
            </div>

            {/* Lista de jugadores */}
            <div style={{ marginBottom: "var(--space-6)" }}>
              <h3
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--gray-900)",
                  marginBottom: "var(--space-3)",
                }}
              >
                Jugadores ({players.length})
              </h3>

              {/* Mensaje de estado de listos */}
              {players.length >= 2 && (
                <div
                  style={{
                    marginBottom: "var(--space-3)",
                    padding: "var(--space-2)",
                    backgroundColor: "var(--gray-50)",
                    borderRadius: "var(--radius-md)",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--gray-600)",
                    }}
                  >
                    {readyPlayers.length === players.length ? "¡Todos listos! Iniciando juego..." : readyPlayers.length > 0 ? `${readyPlayers.length} de ${players.length} jugadores listos` : "Marca 'Estoy Listo' cuando estés preparado para la siguiente ronda"}
                  </p>
                </div>
              )}
              {players.length === 0 ? (
                <div className="text-center" style={{ padding: "var(--space-8) 0" }}>
                  <Loading size="lg" className="mx-auto mb-4" />
                  <p style={{ color: "var(--gray-600)" }}>Esperando jugadores...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "var(--space-3)",
                        backgroundColor: "var(--gray-50)",
                        borderRadius: "var(--radius-lg)",
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
                            fontWeight: "var(--font-weight-medium)",
                            color: "var(--gray-900)",
                          }}
                        >
                          {player.username}
                        </span>
                        {player.username === username && <Badge variant="primary">Tú</Badge>}
                        {players.length > 0 && players[0].username === player.username && <Badge variant="warning">Host</Badge>}
                        {readyPlayers.includes(player.username) && <Badge variant="success">Listo</Badge>}
                      </div>
                      <div
                        style={{
                          fontSize: "var(--font-size-xs)",
                          color: "var(--gray-500)",
                        }}
                      >
                        {player.score} pts
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {/* Botón de inicio (solo para host) */}
              {/* {isHost && players.length >= 2 && (
              <Button onClick={handleStartGame} className="w-full" size="lg" variant="primary">
                Iniciar Juego
              </Button>
            )} */}

              {/* Botón para marcarse como listo (para todos los jugadores) */}
              {players.length >= 2 && (
                <Button onClick={handleConfirmReady} className="w-full" size="lg" variant={readyPlayers.includes(username) ? "success" : "primary"} disabled={readyPlayers.includes(username)}>
                  {readyPlayers.includes(username) ? "¡Listo!" : "Estoy Listo"}
                </Button>
              )}

              {/* Mensaje para host */}
              {isHost && players.length < 2 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "var(--space-4)",
                    backgroundColor: "var(--warning-50)",
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <p
                    style={{
                      color: "var(--warning-700)",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    Necesitas al menos 2 jugadores para iniciar
                  </p>
                </div>
              )}

              {/* Mensaje para jugadores */}
              {!isHost && readyPlayers.length >= 1 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "var(--space-4)",
                    backgroundColor: "var(--primary-50)",
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <p
                    style={{
                      color: "var(--primary-700)",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    Esperando que el host inicie el juego...
                  </p>
                </div>
              )}
            </div>

            {/* Botón para regresar al game manager */}
            <div
              style={{
                marginTop: "var(--space-4)",
                textAlign: "center",
              }}
            >
              <button
                type="button"
                onClick={handleBackToGameManager}
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
                Volver al menú principal
              </button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};
