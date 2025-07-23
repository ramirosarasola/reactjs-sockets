import React, { useEffect, useState } from "react";
import { Card, Button, Badge } from "../components/ui";
import { apiService } from "../services/api";
import type { GameSettings } from "../types";

interface GameConfigsProps {
  onBack: () => void;
}

export const GameConfigs: React.FC<GameConfigsProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<GameSettings[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getAllGameSettings();
      console.log("Respuesta de getAllGameSettings:", response);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Asegurar que response.data sea un array
        const settingsArray = Array.isArray(response.data) ? response.data : [];
        console.log("Settings array:", settingsArray);
        setSettings(settingsArray);
      } else {
        setSettings([]);
      }
    } catch (error) {
      console.error("Error cargando configuraciones:", error);
      setError("Error cargando configuraciones");
      setSettings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getCategoryLabels = (categories: string[]): string[] => {
    const categoryMap: Record<string, string> = {
      name: "Nombre",
      country: "País",
      animal: "Animal",
      thing: "Cosa",
      food: "Comida",
      color: "Color",
      city: "Ciudad",
      sport: "Deporte",
      profession: "Profesión",
      brand: "Marca",
    };

    return categories.map((cat) => categoryMap[cat] || cat);
  };

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
          <div style={{ padding: "var(--space-6)" }}>
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-6)",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "var(--font-size-3xl)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--gray-900)",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  Configuraciones de Juego
                </h1>
                <p
                  style={{
                    color: "var(--gray-600)",
                    fontSize: "var(--font-size-lg)",
                  }}
                >
                  Administra las configuraciones disponibles para las partidas
                </p>
              </div>
              <Button onClick={onBack} variant="secondary">
                ← Volver
              </Button>
            </div>

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: "center", padding: "var(--space-8)" }}>
                <p style={{ color: "var(--gray-600)" }}>Cargando configuraciones...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: "var(--space-4)",
                  backgroundColor: "var(--error-50)",
                  border: "1px solid var(--error-200)",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "var(--space-4)",
                }}
              >
                <p style={{ color: "var(--error-700)" }}>{error}</p>
              </div>
            )}

            {/* Configuraciones */}
            {!loading && !error && (
              <div style={{ display: "grid", gap: "var(--space-4)" }}>
                {settings.map((setting) => (
                  <div
                    key={setting.id}
                    style={{
                      border: "2px solid var(--gray-200)",
                      borderRadius: "var(--radius-lg)",
                      padding: "var(--space-4)",
                      backgroundColor: "white",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--primary-300)";
                      e.currentTarget.style.backgroundColor = "var(--primary-50)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--gray-200)";
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "var(--space-3)",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontSize: "var(--font-size-lg)",
                            fontWeight: "var(--font-weight-bold)",
                            color: "var(--gray-900)",
                            marginBottom: "var(--space-1)",
                          }}
                        >
                          {setting.name}
                        </h3>
                        <p
                          style={{
                            color: "var(--gray-600)",
                            fontSize: "var(--font-size-sm)",
                          }}
                        >
                          {setting.description}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "var(--space-2)" }}>
                        {setting.isDefault && <Badge variant="primary">Predeterminada</Badge>}
                        <Badge variant="success">{setting.config.maxRounds} rondas</Badge>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "var(--space-3)",
                        marginTop: "var(--space-3)",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: "var(--font-size-sm)",
                            fontWeight: "var(--font-weight-medium)",
                            color: "var(--gray-700)",
                            marginBottom: "var(--space-1)",
                          }}
                        >
                          ⏱️ Tiempo por ronda
                        </p>
                        <p style={{ color: "var(--gray-600)", fontSize: "var(--font-size-sm)" }}>{formatTime(setting.config.roundTimeSeconds)}</p>
                      </div>

                      <div>
                        <p
                          style={{
                            fontSize: "var(--font-size-sm)",
                            fontWeight: "var(--font-weight-medium)",
                            color: "var(--gray-700)",
                            marginBottom: "var(--space-1)",
                          }}
                        >
                          👥 Jugadores
                        </p>
                        <p style={{ color: "var(--gray-600)", fontSize: "var(--font-size-sm)" }}>
                          {setting.config.minPlayers}-{setting.config.maxPlayers}
                        </p>
                      </div>

                      <div>
                        <p
                          style={{
                            fontSize: "var(--font-size-sm)",
                            fontWeight: "var(--font-weight-medium)",
                            color: "var(--gray-700)",
                            marginBottom: "var(--space-1)",
                          }}
                        >
                          🏆 Puntos por ganar
                        </p>
                        <p style={{ color: "var(--gray-600)", fontSize: "var(--font-size-sm)" }}>{setting.config.pointsPerWin} pts</p>
                      </div>

                      <div>
                        <p
                          style={{
                            fontSize: "var(--font-size-sm)",
                            fontWeight: "var(--font-weight-medium)",
                            color: "var(--gray-700)",
                            marginBottom: "var(--space-1)",
                          }}
                        >
                          📝 Categorías
                        </p>
                        <p style={{ color: "var(--gray-600)", fontSize: "var(--font-size-sm)" }}>{getCategoryLabels(setting.config.categories).join(", ")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && settings.length === 0 && (
              <div style={{ textAlign: "center", padding: "var(--space-8)" }}>
                <p style={{ color: "var(--gray-600)" }}>No hay configuraciones disponibles</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
