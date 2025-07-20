import React, { useState } from "react";
import { Button, Card, Input } from "../components/ui";
import { useApi } from "../hooks/useApi";
import { apiService } from "../services/api";
import type { User } from "../types";

interface HomeProps {
  onJoin: (user: string, code: string, isNewGame: boolean) => Promise<void>;
  onShowMyGames?: () => void;
  userId?: string;
  username?: string;
}

export const Home: React.FC<HomeProps> = ({ onJoin, onShowMyGames, userId, username: currentUsername }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [isNewGame, setIsNewGame] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { execute: createUser, loading: creatingUser } = useApi<User>({
    onSuccess: (user) => {
      console.log("Usuario creado:", user);
    },
    onError: (error) => {
      setErrors({ general: error });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = "El nombre de usuario es requerido";
    } else if (username.length < 3) {
      newErrors.username = "El nombre debe tener al menos 3 caracteres";
    }

    if (!email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "El email no es válido";
    }

    if (!isNewGame && !gameCode.trim()) {
      newErrors.gameCode = "El código del juego es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Crear usuario primero
      await createUser(() => apiService.createUser(username.trim(), email.trim()));

      // Unirse al juego
      await onJoin(username.trim(), gameCode.trim(), isNewGame);
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      setErrors({ general: "Error al procesar la solicitud" });
    }
  };

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
              ¡El clásico juego de palabras!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Usuario */}
            <Input name="username" label="Nombre de usuario" placeholder="Ingresa tu nombre" value={username} onChange={setUsername} error={errors.username} required />

            {/* Email */}
            <Input name="email" label="Email" type="email" placeholder="tu@email.com" value={email} onChange={setEmail} error={errors.email} required />

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
                Tipo de juego
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-4)",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <input type="radio" name="gameType" checked={isNewGame} onChange={() => setIsNewGame(true)} style={{ marginRight: "var(--space-2)" }} />
                  <span style={{ fontSize: "var(--font-size-sm)" }}>Nuevo juego</span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
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
                <p
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--error-600)",
                  }}
                >
                  {errors.general}
                </p>
              </div>
            )}

            {/* Botón de envío */}
            <Button type="submit" loading={creatingUser} disabled={creatingUser} className="w-full" size="lg">
              {isNewGame ? "Crear juego" : "Unirse al juego"}
            </Button>

            {/* Botón Mis Partidas */}
            {userId && currentUsername && onShowMyGames && (
              <div style={{ marginTop: "var(--space-4)" }}>
                <Button onClick={onShowMyGames} variant="secondary" className="w-full" size="lg">
                  Mis Partidas
                </Button>
              </div>
            )}
          </form>

          {/* Información adicional */}
          <div
            style={{
              marginTop: "var(--space-6)",
              paddingTop: "var(--space-6)",
              borderTop: "1px solid var(--gray-200)",
            }}
          >
            <div className="text-center">
              <h3
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--gray-900)",
                  marginBottom: "var(--space-2)",
                }}
              >
                ¿Cómo jugar?
              </h3>
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--gray-600)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-1)",
                }}
              >
                <p>1. Crea un juego o únete a uno existente</p>
                <p>2. Espera a que todos los jugadores se unan</p>
                <p>3. Completa las categorías con la letra asignada</p>
                <p>4. ¡El más rápido gana puntos!</p>
              </div>
            </div>
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
