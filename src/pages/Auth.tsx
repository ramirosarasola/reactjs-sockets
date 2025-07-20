import React, { useState } from "react";
import { Button, Card, Input } from "../components/ui";
import { useApi } from "../hooks/useApi";
import { apiService } from "../services/api";
import type { User } from "../types";

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { execute: registerUser, loading: registering } = useApi<User>({
    onSuccess: (user) => {
      console.log("Usuario registrado:", user);
      onAuthSuccess(user);
    },
    onError: (error) => {
      setErrors({ general: error });
    },
  });

  const { execute: loginUser, loading: loggingIn } = useApi<User>({
    onSuccess: (user) => {
      console.log("Usuario logueado:", user);
      onAuthSuccess(user);
    },
    onError: (error) => {
      setErrors({ general: error });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isLogin && !username.trim()) {
      newErrors.username = "El nombre de usuario es requerido";
    } else if (!isLogin && username.length < 3) {
      newErrors.username = "El nombre debe tener al menos 3 caracteres";
    }

    if (!email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "El email no es válido";
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
      if (isLogin) {
        await loginUser(() => apiService.loginUser(email.trim()));
      } else {
        await registerUser(() =>
          apiService.registerUser(username.trim(), email.trim())
        );
      }
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      setErrors({ general: "Error al procesar la solicitud" });
    }
  };

  const loading = registering || loggingIn;

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, var(--primary-50), var(--secondary-50))",
        padding: "var(--space-4)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "28rem" }}>
        <Card className="fade-in">
          <div
            className="text-center"
            style={{ marginBottom: "var(--space-8)" }}
          >
            <h1
              style={{
                fontSize: "var(--font-size-4xl)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--gray-900)",
                marginBottom: "var(--space-2)",
                background:
                  "linear-gradient(135deg, var(--primary-600), var(--secondary-600))",
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
              {isLogin ? "Inicia sesión para jugar" : "Regístrate para jugar"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre de usuario (solo para registro) */}
            {!isLogin && (
              <Input
                name="username"
                label="Nombre de usuario"
                placeholder="Ingresa tu nombre"
                value={username}
                onChange={setUsername}
                error={errors.username}
                required
              />
            )}

            {/* Email */}
            <Input
              name="email"
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={setEmail}
              error={errors.email}
              required
            />

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
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {isLogin ? "Iniciar sesión" : "Registrarse"}
            </Button>
          </form>

          {/* Cambiar entre login y registro */}
          <div
            style={{
              marginTop: "var(--space-6)",
              paddingTop: "var(--space-6)",
              borderTop: "1px solid var(--gray-200)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--gray-600)",
                marginBottom: "var(--space-2)",
              }}
            >
              {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setUsername("");
                setEmail("");
              }}
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--primary-600)",
                fontWeight: "var(--font-weight-medium)",
                textDecoration: "underline",
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              {isLogin ? "Regístrate aquí" : "Inicia sesión aquí"}
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
