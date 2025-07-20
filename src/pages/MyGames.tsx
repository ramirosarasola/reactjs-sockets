import React, { useState, useEffect } from "react";
import { Button, Card, Loading } from "../components/ui";
import { useApi } from "../hooks/useApi";
import { apiService } from "../services/api";
import type { UserGame } from "../types";

interface MyGamesProps {
  userId: string;
  username: string;
  onJoinGame: (username: string, code: string, isNewGame: boolean) => Promise<void>;
  onBack: () => void;
}

export const MyGames: React.FC<MyGamesProps> = ({ userId, username, onJoinGame, onBack }) => {
  const [games, setGames] = useState<UserGame[]>([]);

  const { execute: fetchGames, loading: loadingGames } = useApi<{ games: UserGame[] }>({
    onSuccess: (data) => {
      setGames(data.games);
    },
    onError: (error) => {
      console.error("Error cargando juegos:", error);
    },
  });

  useEffect(() => {
    loadGames();
  }, [userId]);

  const loadGames = async () => {
    await fetchGames(() => apiService.getUserGames(userId));
  };

  const handleJoinGame = async (game: UserGame) => {
    // Simplemente navegar al lobby sin intentar unirse nuevamente
    onJoinGame(username, game.code, false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING":
        return "var(--warning-600)";
      case "PLAYING":
        return "var(--success-600)";
      case "FINISHED":
        return "var(--gray-600)";
      default:
        return "var(--gray-600)";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "WAITING":
        return "Esperando jugadores";
      case "PLAYING":
        return "En juego";
      case "FINISHED":
        return "Finalizado";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loadingGames) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
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
      <div style={{ maxWidth: "48rem", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--space-6)",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "var(--font-size-2xl)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--gray-900)",
                marginBottom: "var(--space-1)",
              }}
            >
              Mis Partidas
            </h1>
            <p
              style={{
                color: "var(--gray-600)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              Hola, {username} - Aquí están tus partidas activas
            </p>
          </div>
          <Button onClick={onBack} variant="secondary">
            Volver
          </Button>
        </div>

        {/* Games List */}
        {games.length === 0 ? (
          <Card>
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-8)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--font-size-4xl)",
                  marginBottom: "var(--space-4)",
                }}
              >
                🎮
              </div>
              <h3
                style={{
                  fontSize: "var(--font-size-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--gray-900)",
                  marginBottom: "var(--space-2)",
                }}
              >
                No tienes partidas activas
              </h3>
              <p
                style={{
                  color: "var(--gray-600)",
                  fontSize: "var(--font-size-sm)",
                  marginBottom: "var(--space-4)",
                }}
              >
                Crea una nueva partida o únete a una existente para comenzar a jugar
              </p>
              <Button onClick={onBack} size="lg">
                Crear nueva partida
              </Button>
            </div>
          </Card>
        ) : (
          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            {games.map((game) => (
              <Card key={game.id} className="hover:shadow-lg transition-shadow">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "var(--space-4)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-3)",
                        marginBottom: "var(--space-2)",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "var(--font-size-lg)",
                          fontWeight: "var(--font-weight-semibold)",
                          color: "var(--gray-900)",
                        }}
                      >
                        Código: {game.code}
                      </h3>
                      <span
                        style={{
                          padding: "var(--space-1) var(--space-2)",
                          backgroundColor: getStatusColor(game.status) + "20",
                          color: getStatusColor(game.status),
                          borderRadius: "var(--radius-sm)",
                          fontSize: "var(--font-size-xs)",
                          fontWeight: "var(--font-weight-medium)",
                        }}
                      >
                        {getStatusText(game.status)}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-4)",
                        fontSize: "var(--font-size-sm)",
                        color: "var(--gray-600)",
                      }}
                    >
                      <span>
                        👥 {game.playerCount} jugador{game.playerCount !== 1 ? "es" : ""}
                      </span>
                      <span>📅 {formatDate(game.createdAt)}</span>
                    </div>

                    {/* Players list */}
                    {game.players.length > 0 && (
                      <div
                        style={{
                          marginTop: "var(--space-2)",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "var(--space-1)",
                        }}
                      >
                        {game.players.map((player) => (
                          <span
                            key={player.id}
                            style={{
                              padding: "var(--space-1) var(--space-2)",
                              backgroundColor: "var(--primary-100)",
                              color: "var(--primary-700)",
                              borderRadius: "var(--radius-sm)",
                              fontSize: "var(--font-size-xs)",
                              fontWeight: "var(--font-weight-medium)",
                            }}
                          >
                            {player.username}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--space-2)",
                    }}
                  >
                    <Button onClick={() => handleJoinGame(game)} size="sm">
                      Unirse
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Refresh button */}
        {games.length > 0 && (
          <div
            style={{
              marginTop: "var(--space-6)",
              textAlign: "center",
            }}
          >
            <Button onClick={loadGames} loading={loadingGames} variant="secondary" size="sm">
              Actualizar lista
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
