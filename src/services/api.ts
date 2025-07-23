import type { User, Game, ApiResponse, GameScore, CreateRoundResponse, SaveRoundAnswerResponse, RoundDetailsResponse, FinishRoundResponse, RoundAnswer, UserGame, GameSettings, GameConfigValidation, GameConfig } from "../types";

const API_BASE_URL = "http://localhost:5001";

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const config: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      };

      console.log(`API Request: ${options.method || "GET"} ${url}`);

      const response = await fetch(url, config);
      const data = await response.json();

      console.log(`API Response: ${response.status}`, data);

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return { data };
    } catch (error) {
      console.error("API Error:", error);

      // Manejo específico de errores de red
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          error: "No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.",
        };
      }

      return {
        error: error instanceof Error ? error.message : "Error de conexión",
      };
    }
  }

  // ===== USERS =====
  async registerUser(username: string, email: string): Promise<ApiResponse<User>> {
    return this.request<User>("/users/register", {
      method: "POST",
      body: JSON.stringify({ username, email }),
    });
  }

  async loginUser(email: string): Promise<ApiResponse<User>> {
    return this.request<User>("/users/login", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async createUser(username: string, email: string): Promise<ApiResponse<User>> {
    return this.request<User>("/users", {
      method: "POST",
      body: JSON.stringify({ username, email }),
    });
  }

  async findUserByUsername(username: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/search?username=${encodeURIComponent(username)}`);
  }

  async findUserByEmail(email: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/email/${encodeURIComponent(email)}`);
  }

  async findUserById(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`);
  }

  // ===== GAMES =====
  async createGame(userId: string): Promise<ApiResponse<Game>> {
    return this.request<Game>("/games", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  async joinGame(userId: string, gameId: string): Promise<ApiResponse<Game>> {
    return this.request<Game>("/games/join", {
      method: "POST",
      body: JSON.stringify({ userId, gameId }),
    });
  }

  async getGameByCode(code: string): Promise<ApiResponse<Game>> {
    return this.request<Game>(`/games/${code}`);
  }

  async getGameById(id: string): Promise<ApiResponse<Game>> {
    return this.request<Game>(`/games/${id}`);
  }

  async getGameWithDetails(gameId: string): Promise<ApiResponse<Game>> {
    return this.request<Game>(`/games/${gameId}/details`);
  }

  async updateGameStatus(gameId: string, status: string): Promise<ApiResponse<Game>> {
    return this.request<Game>(`/games/${gameId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async getGameScores(gameId: string): Promise<ApiResponse<GameScore[]>> {
    return this.request<GameScore[]>(`/games/${gameId}/scores`);
  }

  async getPlayerScores(gameId: string): Promise<ApiResponse<GameScore[]>> {
    return this.request<GameScore[]>(`/games/${gameId}/player-scores`);
  }

  async saveGameScore(gameId: string, userId: string, score: number): Promise<ApiResponse<GameScore>> {
    return this.request<GameScore>("/games/scores", {
      method: "POST",
      body: JSON.stringify({ gameId, userId, score }),
    });
  }

  async getActiveGames(): Promise<ApiResponse<Game[]>> {
    return this.request<Game[]>("/games");
  }

  async getUserGames(userId: string): Promise<ApiResponse<{ games: UserGame[] }>> {
    return this.request<{ games: UserGame[] }>(`/games/user/${userId}`);
  }

  // ===== ROUNDS =====
  async createRound(gameId: string, roundNumber: number, letter: string): Promise<ApiResponse<CreateRoundResponse>> {
    return this.request<CreateRoundResponse>("/rounds", {
      method: "POST",
      body: JSON.stringify({ gameId, roundNumber, letter }),
    });
  }

  async saveRoundAnswer(gameId: string, roundNumber: number, userId: string, answers: Record<string, string>): Promise<ApiResponse<SaveRoundAnswerResponse>> {
    return this.request<SaveRoundAnswerResponse>("/rounds/answer", {
      method: "POST",
      body: JSON.stringify({ gameId, roundNumber, userId, answers }),
    });
  }

  async getRoundDetails(gameId: string, roundNumber: number): Promise<ApiResponse<RoundDetailsResponse>> {
    return this.request<RoundDetailsResponse>(`/rounds/${gameId}/${roundNumber}`);
  }

  async getGameRounds(gameId: string): Promise<ApiResponse<RoundDetailsResponse[]>> {
    return this.request<RoundDetailsResponse[]>(`/rounds/${gameId}`);
  }

  async finishRound(gameId: string, roundNumber: number): Promise<ApiResponse<FinishRoundResponse>> {
    return this.request<FinishRoundResponse>(`/rounds/${gameId}/${roundNumber}/finish`, {
      method: "PUT",
    });
  }

  async getRoundAnswers(gameId: string, roundNumber: number): Promise<ApiResponse<RoundAnswer[]>> {
    return this.request<RoundAnswer[]>(`/rounds/${gameId}/${roundNumber}/answers`);
  }

  // ===== HEALTH CHECK =====
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>("/health");
  }

  // ===== GAME CONFIGURATIONS =====
  async getAllGameSettings(): Promise<ApiResponse<GameSettings[]>> {
    return this.request<GameSettings[]>("/game-config");
  }

  async getDefaultGameSettings(): Promise<ApiResponse<GameSettings>> {
    return this.request<GameSettings>("/game-config/default");
  }

  async getGameSettingsById(id: string): Promise<ApiResponse<GameSettings>> {
    return this.request<GameSettings>(`/game-config/${id}`);
  }

  async createGameSettings(name: string, description: string, config: GameConfig): Promise<ApiResponse<GameSettings>> {
    return this.request<GameSettings>("/game-config", {
      method: "POST",
      body: JSON.stringify({ name, description, config }),
    });
  }

  async updateGameSettings(id: string, name: string, description: string, config: GameConfig): Promise<ApiResponse<GameSettings>> {
    return this.request<GameSettings>(`/game-config/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, description, config }),
    });
  }

  async setDefaultGameSettings(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/game-config/${id}/default`, {
      method: "PATCH",
    });
  }

  async deleteGameSettings(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/game-config/${id}`, {
      method: "DELETE",
    });
  }

  async initializeDefaultSettings(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>("/game-config/initialize", {
      method: "POST",
    });
  }

  async validateGameConfig(config: GameConfig): Promise<ApiResponse<GameConfigValidation>> {
    return this.request<GameConfigValidation>("/game-config/validate", {
      method: "POST",
      body: JSON.stringify({ config }),
    });
  }

  // ===== GAMES WITH CONFIG =====
  async createGameWithConfig(userId: string, configId?: string): Promise<ApiResponse<Game>> {
    return this.request<Game>("/games", {
      method: "POST",
      body: JSON.stringify({ userId, configId }),
    });
  }
}

export const apiService = new ApiService();
