import React, { useEffect, useState } from "react";
import { Card, Button, Badge } from "./ui";
import { apiService } from "../services/api";
import type { GameSettings } from "../types";

interface GameConfigSelectorProps {
  onConfigSelect: (configId: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const GameConfigSelector: React.FC<GameConfigSelectorProps> = ({ onConfigSelect, onClose, isOpen }) => {
  const [settings, setSettings] = useState<GameSettings[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getAllGameSettings();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error("Error cargando configuraciones:", error);
      setError("Error cargando configuraciones");
    } finally {
      setLoading(false);
    }
  };

  const handleConfigSelect = (configId: string) => {
    onConfigSelect(configId);
    onClose();
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

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "var(--space-4)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Card>
          <div style={{ padding: "var(--space-6)" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-6)",
              }}
            >
              <h2
                style={{
                  fontSize: "var(--font-size-2xl)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--gray-900)",
                }}
              >
                Seleccionar Configuración
              </h2>
              <Button variant="secondary" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>

            {loading && (
              <div style={{ textAlign: "center", padding: "var(--space-8)" }}>
                <p style={{ color: "var(--gray-600)" }}>Cargando configuraciones...</p>
              </div>
            )}

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

            {!loading && !error && (
              <div style={{ display: "grid", gap: "var(--space-4)" }}>
                {settings.map((setting) => (
                  <div
                    key={setting.id}
                    style={{
                      border: "2px solid var(--gray-200)",
                      borderRadius: "var(--radius-lg)",
                      padding: "var(--space-4)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      backgroundColor: "white",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--primary-300)";
                      e.currentTarget.style.backgroundColor = "var(--primary-50)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--gray-200)";
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                    onClick={() => handleConfigSelect(setting.id)}
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
