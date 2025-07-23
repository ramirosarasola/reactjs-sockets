import { useState, useEffect } from "react";
import { Auth } from "./pages/Auth";
import { GameManager } from "./pages/GameManager";
import { MyGames } from "./pages/MyGames";
import { Lobby } from "./pages/Lobby";
import { Game } from "./pages/Game";
import { GameConfigs } from "./pages/GameConfigs";
import { logBackendStatus } from "./utils/healthCheck";
import type { User, Game as GameType } from "./types";

type AppStep = "auth" | "gameManager" | "myGames" | "lobby" | "game" | "configs";

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>("auth");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentGame, setCurrentGame] = useState<GameType | null>(null);
  const [gameData, setGameData] = useState<Record<string, unknown>>({});
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
    setGameData({});
    setIsHost(false);
    setCurrentStep("auth");
  };

  // Manejar unión a juego
  const handleJoinGame = (game: GameType) => {
    console.log("Uniéndose al juego:", game);

    if (game && game.id && game.code) {
      setCurrentGame(game);
      setCurrentStep("lobby");
    } else {
      console.error("Juego inválido en handleJoinGame:", game);
    }
  };

  // Manejar unión a juego desde MyGames
  const handleJoinGameFromMyGames = async (username: string, code: string, isNewGame: boolean) => {
    console.log("Uniéndose al juego desde MyGames:", { username, code, isNewGame });

    try {
      // Aquí podrías hacer una llamada a la API para unirse al juego
      // Por ahora, simulamos la unión
      const game: GameType = {
        id: "temp-id",
        code: code,
        status: "WAITING",
        players: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rounds: [],
        scores: [],
      };

      setCurrentGame(game);
      setCurrentStep("lobby");
    } catch (error) {
      console.error("Error uniéndose al juego:", error);
    }
  };

  // Manejar inicio de juego
  const handleGameStart = (data?: Record<string, unknown>) => {
    console.log("Iniciando juego con datos:", data);
    if (data) {
      setGameData(data);
      setIsHost(currentUser?.username === data.hostUsername || false);
    }
    setCurrentStep("game");
  };

  // Manejar regreso al lobby
  const handleBackToLobby = () => {
    console.log("Regresando al lobby");
    setGameData({});
    setIsHost(false);
    setCurrentStep("lobby");
  };

  // Renderizar componente según el paso actual
  switch (currentStep) {
    case "auth":
      return <Auth onAuthSuccess={handleAuthSuccess} />;

    case "gameManager":
      return <GameManager user={currentUser!} onJoinGame={handleJoinGame} onLogout={handleLogout} onShowMyGames={() => setCurrentStep("myGames")} onShowConfigs={() => setCurrentStep("configs")} />;

    case "myGames":
      return <MyGames userId={currentUser!.id} username={currentUser!.username} onJoinGame={handleJoinGameFromMyGames} onBack={() => setCurrentStep("gameManager")} />;

    case "lobby":
      return <Lobby username={currentUser!.username} gameCode={currentGame!.code} currentUser={currentUser!} onGameStart={handleGameStart} onBackToGameManager={() => setCurrentStep("gameManager")} />;

    case "game":
      return <Game username={currentUser!.username} gameCode={currentGame!.code} isHost={isHost} gameData={gameData} onBackToLobby={handleBackToLobby} />;

    case "configs":
      return <GameConfigs onBack={() => setCurrentStep("gameManager")} />;

    default:
      return <Auth onAuthSuccess={handleAuthSuccess} />;
  }
}
