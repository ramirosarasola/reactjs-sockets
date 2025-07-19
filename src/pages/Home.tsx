import React, { useState } from "react";

interface HomeProps {
  onJoin: (username: string, gameCode: string, isNewGame: boolean) => void;
}

interface RecentUser {
  username: string;
  lastUsed: string;
}

export const Home: React.FC<HomeProps> = ({ onJoin }) => {
  const [username, setUsername] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [showJoinSection, setShowJoinSection] = useState(false);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [showRecentUsers, setShowRecentUsers] = useState(false);

  // Cargar usuarios recientes al montar el componente
  React.useEffect(() => {
    const saved = localStorage.getItem("tutifruti_recent_users");
    if (saved) {
      setRecentUsers(JSON.parse(saved));
    }
  }, []);

  const saveUserToRecent = (user: string) => {
    const now = new Date().toISOString();
    const updatedUsers = [
      { username: user, lastUsed: now },
      ...recentUsers.filter((u) => u.username !== user),
    ].slice(0, 5);
    setRecentUsers(updatedUsers);
    localStorage.setItem(
      "tutifruti_recent_users",
      JSON.stringify(updatedUsers)
    );
  };

  const handleCreateGame = () => {
    if (username.trim()) {
      saveUserToRecent(username.trim());
      onJoin(username.trim(), "", true);
    }
  };

  const handleJoinGame = () => {
    if (username.trim() && gameCode.trim()) {
      saveUserToRecent(username.trim());
      onJoin(username.trim(), gameCode.trim(), false);
    }
  };

  const handleSelectRecentUser = (selectedUser: string) => {
    setUsername(selectedUser);
    setShowRecentUsers(false);
  };

  return (
    <div
      style={{
        maxWidth: 450,
        margin: "0 auto",
        padding: "32px 24px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#2c3e50",
          marginBottom: "32px",
          fontSize: "2.5rem",
          fontWeight: "600",
        }}
      >
        🍎 Tuti Fruti Online
      </h1>

      {/* Sección de nombre de usuario */}
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <label
            style={{
              fontWeight: "600",
              color: "#34495e",
              fontSize: "1.1rem",
            }}
          >
            👤 Tu nombre:
          </label>
          {recentUsers.length > 0 && (
            <button
              onClick={() => setShowRecentUsers(!showRecentUsers)}
              style={{
                background: "none",
                border: "none",
                color: "#3498db",
                cursor: "pointer",
                fontSize: "0.9rem",
                textDecoration: "underline",
              }}
            >
              {showRecentUsers ? "Ocultar" : "Usuarios recientes"}
            </button>
          )}
        </div>

        {/* Mostrar usuarios recientes */}
        {showRecentUsers && recentUsers.length > 0 && (
          <div
            style={{
              marginBottom: "12px",
              padding: "12px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            <div
              style={{ fontSize: "0.9rem", color: "#666", marginBottom: "8px" }}
            >
              Usuarios recientes:
            </div>
            {recentUsers.map((user, index) => (
              <button
                key={index}
                onClick={() => handleSelectRecentUser(user.username)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px 12px",
                  marginBottom: "4px",
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "0.9rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f0f0f0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                {user.username}
              </button>
            ))}
          </div>
        )}

        <input
          placeholder="Ingresa tu nombre"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            padding: "16px",
            borderRadius: "12px",
            border: "2px solid #e0e0e0",
            fontSize: "16px",
            transition: "all 0.3s ease",
            boxSizing: "border-box",
            outline: "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#3498db";
            e.target.style.boxShadow = "0 0 0 3px rgba(52, 152, 219, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e0e0e0";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      {/* Botones de acción */}
      <div style={{ marginBottom: "24px" }}>
        <button
          onClick={handleCreateGame}
          disabled={!username.trim()}
          style={{
            width: "100%",
            padding: "16px",
            marginBottom: "16px",
            backgroundColor: "#27ae60",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: username.trim() ? "pointer" : "not-allowed",
            opacity: username.trim() ? 1 : 0.6,
            transition: "all 0.3s ease",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
          onMouseEnter={(e) => {
            if (username.trim()) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 12px rgba(0, 0, 0, 0.15)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
          }}
        >
          🎮 Crear nueva partida
        </button>

        <button
          onClick={() => setShowJoinSection(!showJoinSection)}
          disabled={!username.trim()}
          style={{
            width: "100%",
            padding: "16px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: username.trim() ? "pointer" : "not-allowed",
            opacity: username.trim() ? 1 : 0.6,
            transition: "all 0.3s ease",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
          onMouseEnter={(e) => {
            if (username.trim()) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 12px rgba(0, 0, 0, 0.15)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
          }}
        >
          {showJoinSection ? "👁️ Ocultar" : "🔗 Unirse a partida existente"}
        </button>
      </div>

      {/* Sección para unirse a partida */}
      <div
        style={{
          overflow: "hidden",
          transition: "all 0.4s ease-in-out",
          maxHeight: showJoinSection ? "300px" : "0px",
          opacity: showJoinSection ? 1 : 0,
        }}
      >
        <div
          style={{
            padding: "24px",
            border: "2px solid #e8f4fd",
            borderRadius: "16px",
            backgroundColor:
              "linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%)",
            background: "linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%)",
            boxShadow: "0 8px 32px rgba(52, 152, 219, 0.1)",
            borderLeft: "4px solid #3498db",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                fontSize: "24px",
                marginRight: "12px",
              }}
            >
              🎯
            </span>
            <label
              style={{
                fontWeight: "600",
                color: "#2c3e50",
                fontSize: "1.1rem",
              }}
            >
              Código de partida:
            </label>
          </div>
          <input
            placeholder="Ingresa el código de la partida"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            style={{
              display: "block",
              color: "black",
              backgroundColor: "white",
              border: "2px solid #e0e0e0",
              width: "100%",
              padding: "16px",
              marginBottom: "20px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              textAlign: "center",
              letterSpacing: "2px",
              transition: "all 0.3s ease",
              boxSizing: "border-box",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3498db";
              e.target.style.boxShadow = "0 0 0 3px rgba(52, 152, 219, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e0e0e0";
              e.target.style.boxShadow = "none";
            }}
          />
          <button
            onClick={handleJoinGame}
            disabled={!username.trim() || !gameCode.trim()}
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: "#f39c12",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor:
                username.trim() && gameCode.trim() ? "pointer" : "not-allowed",
              opacity: username.trim() && gameCode.trim() ? 1 : 0.6,
              transition: "all 0.3s ease",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={(e) => {
              if (username.trim() && gameCode.trim()) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 12px rgba(0, 0, 0, 0.15)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
            }}
          >
            🚀 Unirse a partida
          </button>
        </div>
      </div>
    </div>
  );
};
