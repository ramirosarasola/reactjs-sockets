import { useState, useEffect } from "react";
import { Auth } from "./pages/Auth";
import { GameManager } from "./pages/GameManager";
import { Lobby } from "./pages/Lobby";
import { Game } from "./pages/Game";
import { logBackendStatus } from "./utils/healthCheck";
import type { User, Game as GameType } from "./types";

type AppStep = "auth" | "gameManager" | "lobby" | "game";

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>("auth");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentGame, setCurrentGame] = useState<GameType | null>(null);
  const [gameData, setGameData] = useState<any>({});
  const [isHost, setIsHost] = useState<boolean>(false);

  // Verificar salud del backend al cargar la aplicación
  useEffect(() => {
    logBackendStatus();
  }, []);

  // Manejar autenticación exitosa
  const handleAuthSuccess = (user: User) => {
    console.log("Usuario autenticado:", user);
    setCurrentUser(user);
    setCurrentStep("gameManager");
  };

  // Manejar logout
  const handleLogout = () => {
    console.log("Usuario cerrando sesión");
    setCurrentUser(null);
    setCurrentGame(null);
    setCurrentStep("auth");
  };

  // Manejar unión a juego
  const handleJoinGame = (game: GameType) => {
    console.log("Uniéndose al juego:", game);
    console.log("Tipo de game en handleJoinGame:", typeof game);
    console.log(
      "Estructura de game en handleJoinGame:",
      JSON.stringify(game, null, 2)
    );

    if (game && game.id && game.code) {
      setCurrentGame(game);
      setCurrentStep("lobby");
    } else {
      console.error("Juego inválido en handleJoinGame:", game);
    }
  };

  // Manejar inicio de juego
  const handleGameStart = (data?: any) => {
    console.log("Iniciando juego con datos:", data);
    if (data) {
      setGameData(data);
      // Determinar si es host basado en el primer jugador del lobby
      // Por ahora lo determinamos por el username del usuario actual
      setIsHost(currentUser?.username === data.hostUsername || false);
    }
    setCurrentStep("game");
  };

  // Manejar regreso al lobby
  const handleBackToLobby = () => {
    console.log("Regresando al lobby");
    // Limpiar datos del juego para la siguiente ronda
    setGameData({});
    setIsHost(false);
    setCurrentStep("lobby");
  };

  // Renderizar componente según el paso actual
  switch (currentStep) {
    case "auth":
      return <Auth onAuthSuccess={handleAuthSuccess} />;

    case "gameManager":
      return (
        <GameManager
          user={currentUser!}
          onJoinGame={handleJoinGame}
          onLogout={handleLogout}
        />
      );

    case "lobby":
      return (
        <Lobby
          username={currentUser!.username}
          gameCode={currentGame!.code}
          currentUser={currentUser!}
          onGameStart={handleGameStart}
          onBackToGameManager={() => setCurrentStep("gameManager")}
        />
      );

    case "game":
      return (
        <Game
          username={currentUser!.username}
          gameCode={currentGame!.code}
          isHost={isHost}
          gameData={gameData}
          onBackToLobby={handleBackToLobby}
        />
      );

    default:
      return <Auth onAuthSuccess={handleAuthSuccess} />;
  }
}
