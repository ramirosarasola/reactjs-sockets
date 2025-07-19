import { useState } from "react";
import { Home } from "./pages/Home";
import { Lobby } from "./pages/Lobby";

export default function App() {
  const [step, setStep] = useState<"home" | "lobby">("home");
  const [username, setUsername] = useState("");
  const [gameCode, setGameCode] = useState("");

  // Función para buscar o crear usuario
  const findOrCreateUser = async (username: string) => {
    try {
      // Primero intentamos buscar el usuario existente
      const searchResponse = await fetch(
        `http://localhost:5001/users/search?username=${encodeURIComponent(
          username
        )}`
      );

      if (searchResponse.ok) {
        const existingUser = await searchResponse.json();
        if (existingUser) {
          console.log(`Usuario existente encontrado: ${username}`);
          return { user: existingUser, isNew: false };
        }
      }

      // Si no existe, lo creamos
      const createResponse = await fetch("http://localhost:5001/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (createResponse.ok) {
        const newUser = await createResponse.json();
        console.log(`Nuevo usuario creado: ${username}`);
        return { user: newUser, isNew: true };
      } else {
        throw new Error("No se pudo crear el usuario");
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  // Simula la creación/unión a partida (falta llamada al backend real)
  const handleJoin = async (user: string, code: string, isNewGame: boolean) => {
    setUsername(user);

    try {
      // 1. Buscar o crear usuario
      const userResult = await findOrCreateUser(user);

      if (!userResult.user.id) {
        alert("No se pudo obtener el usuario");
        return;
      }

      // Mostrar mensaje si es usuario existente
      if (!userResult.isNew) {
        console.log(`Bienvenido de vuelta, ${user}!`);
      }

      // 2. Crear o unirse a partida usando el userId correcto
      if (isNewGame) {
        const gameResponse = await fetch("http://localhost:5001/games", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userResult.user.id }),
        });

        if (gameResponse.ok) {
          const gameRes = await gameResponse.json();
          setGameCode(gameRes.code);
          setStep("lobby");
        } else {
          alert("No se pudo crear la partida");
        }
      } else {
        const gameResponse = await fetch("http://localhost:5001/games/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userResult.user.id, code }),
        });

        if (gameResponse.ok) {
          const gameRes = await gameResponse.json();
          setGameCode(gameRes.code);
          setStep("lobby");
        } else {
          alert("No se pudo unirse a la partida");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al procesar la solicitud");
    }
  };

  if (step === "lobby") {
    return <Lobby username={username} gameCode={gameCode} />;
  }

  return <Home onJoin={handleJoin} />;
}
