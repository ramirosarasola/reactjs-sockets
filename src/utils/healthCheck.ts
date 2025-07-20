import { apiService } from "../services/api";

export const checkBackendHealth = async (): Promise<{
  isHealthy: boolean;
  message: string;
}> => {
  try {
    const response = await apiService.healthCheck();

    if (response.data && response.data.status === "ok") {
      return {
        isHealthy: true,
        message: "Backend conectado correctamente",
      };
    } else {
      return {
        isHealthy: false,
        message: response.error || "Backend no responde correctamente",
      };
    }
  } catch (error) {
    return {
      isHealthy: false,
      message:
        "No se pudo conectar con el backend. Verifica que esté ejecutándose en http://localhost:5001",
    };
  }
};

export const logBackendStatus = async (): Promise<void> => {
  const health = await checkBackendHealth();
  console.log(
    `Backend Status: ${health.isHealthy ? "✅" : "❌"} ${health.message}`
  );

  if (!health.isHealthy) {
    console.error("Backend no está disponible. Verifica:");
    console.error("1. Que el servidor esté ejecutándose en el puerto 5001");
    console.error("2. Que la base de datos PostgreSQL esté activa");
    console.error("3. Que el archivo .env esté configurado correctamente");
  }
};
