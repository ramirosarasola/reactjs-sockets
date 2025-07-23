import React, { useEffect, useState } from "react";
import { Button, Card, Input } from "../components/ui";
import { useApi } from "../hooks/useApi";
import { apiService } from "../services/api";
import type { User, Game } from "../types";

interface GameManagerProps {
  user: User;
  onJoinGame: (game: Game) => void;
  onLogout: () => void;
  onShowMyGames?: () => void;
  onShowConfigs?: () => void;
}

export const GameManager: React.FC<GameManagerProps> = ({ user, onJoinGame, onLogout, onShowMyGames, onShowConfigs }) => {
  const [gameCode, setGameCode] = useState("");
  const [isNewGame, setIsNewGame] = useState(true);
  const [game, setGame] = useState<Game | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { execute: createGame, loading: creatingGame } = useApi<Game>({
    onSuccess: (game) => {
      console.log("Juego creado exitosamente:", game);
      onJoinGame(game);
    },
    onError: (error) => {
      console.error("Error al crear juego:", error);
      setErrors({ general: error });
    },
  });

  const { execute: joinGame, loading: joiningGame } = useApi<Game>({
    onSuccess: (game) => {
      console.log("Juego unido exitosamente:", game);
      console.log("Tipo de game:", typeof game);
      console.log("Estructura de game:", JSON.stringify(game, null, 2));

      if (game && game.id && game.code) {
        onJoinGame(game);
      } else {
        console.error("Juego inválido recibido:", game);
        setErrors({ general: "Respuesta inválida del servidor" });
      }
    },
    onError: (error) => {
      console.error("Error al unirse al juego:", error);
      setErrors({ general: error });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isNewGame && !gameCode.trim()) {
      newErrors.gameCode = "El código del juego es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchGame = async (): Promise<void> => {
      const response = await apiService.getGameByCode(gameCode);
      if (response.data) {
        console.log(response.data);
        setGame(response.data);
      }
    };
    fetchGame();
  }, [gameCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Iniciando handleSubmit:", {
      isNewGame,
      gameCode,
      userId: user.id,
    });

    if (!validateForm()) {
      console.log("Validación falló");
      return;
    }

    try {
      if (isNewGame) {
        console.log("Creando nuevo juego...");
        await createGame(() => apiService.createGame(user.id));
      } else {
        console.log("Uniéndose al juego:", gameCode.trim());
        await joinGame(() => {
          if (game) {
            return apiService.joinGame(user.id, game.id);
          }
          return Promise.reject(new Error("Game not found"));
        });
      }
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      setErrors({ general: "Error al procesar la solicitud" });
    }
  };

  const loading = creatingGame || joiningGame;

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, var(--primary-50), var(--secondary-50))",
        padding: "var(--space-4)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "28rem" }}>
        <Card className="fade-in">
          <div className="text-center" style={{ marginBottom: "var(--space-8)" }}>
            <h1
              style={{
                fontSize: "var(--font-size-4xl)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--gray-900)",
                marginBottom: "var(--space-2)",
                background: "linear-gradient(135deg, var(--primary-600), var(--secondary-600))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Tutifruti
            </h1>
            <p
              style={{
                color: "var(--gray-600)",
                fontSize: "var(--font-size-lg)",
              }}
            >
              ¡Hola, {user.username}!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de juego */}
            <div className="space-y-3">
              <label
                style={{
                  display: "block",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--gray-700)",
                }}
              >
                ¿Qué quieres hacer?
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-4)",
                }}
              >
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input type="radio" name="gameType" checked={isNewGame} onChange={() => setIsNewGame(true)} style={{ marginRight: "var(--space-2)" }} />
                  <span style={{ fontSize: "var(--font-size-sm)" }}>Crear nuevo juego</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input type="radio" name="gameType" checked={!isNewGame} onChange={() => setIsNewGame(false)} style={{ marginRight: "var(--space-2)" }} />
                  <span style={{ fontSize: "var(--font-size-sm)" }}>Unirse a juego</span>
                </label>
              </div>
            </div>

            {/* Código del juego */}
            {!isNewGame && <Input name="gameCode" label="Código del juego" placeholder="ABC123" value={gameCode} onChange={setGameCode} error={errors.gameCode} required />}

            {/* Error general */}
            {errors.general && (
              <div
                style={{
                  padding: "var(--space-3)",
                  backgroundColor: "var(--error-50)",
                  border: "1px solid var(--error-200)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <p style={{ fontSize: "var(--font-size-sm)", color: "var(--error-600)" }}>{errors.general}</p>
              </div>
            )}

            {/* Botón de envío */}
            <Button type="submit" loading={loading} disabled={loading} className="w-full" size="lg">
              {isNewGame ? "Crear juego" : "Unirse al juego"}
            </Button>

            {/* Botón Mis Partidas */}
            {onShowMyGames && (
              <div style={{ marginTop: "var(--space-4)" }}>
                <Button onClick={onShowMyGames} variant="secondary" className="w-full" size="lg">
                  Mis Partidas
                </Button>
              </div>
            )}

            {/* Botón Configuraciones */}
            {onShowConfigs && (
              <div style={{ marginTop: "var(--space-4)" }}>
                <Button onClick={onShowConfigs} variant="secondary" className="w-full" size="sm">
                  Ver Configuraciones
                </Button>
              </div>
            )}
          </form>

          {/* Información adicional */}
          <div style={{ marginTop: "var(--space-6)", paddingTop: "var(--space-6)", borderTop: "1px solid var(--gray-200)" }}>
            <div className="text-center">
              <h3 style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--gray-900)", marginBottom: "var(--space-2)" }}>¿Cómo jugar?</h3>
              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--gray-600)", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                <p>1. Crea un juego o únete a uno existente</p>
                <p>2. Espera a que todos los jugadores se unan</p>
                <p>3. Completa las categorías con la letra asignada</p>
                <p>4. ¡El más rápido gana puntos!</p>
              </div>
            </div>
          </div>

          {/* Botón de logout */}
          <div style={{ marginTop: "var(--space-4)", textAlign: "center" }}>
            <button
              type="button"
              onClick={onLogout}
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
              Cerrar sesión
            </button>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center" style={{ marginTop: "var(--space-6)" }}>
          <p
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--gray-500)",
            }}
          >
            Desarrollado con ❤️ usando React + TypeScript + CSS
          </p>
        </div>
      </div>
    </div>
  );
};
