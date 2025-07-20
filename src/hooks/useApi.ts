import { useState, useCallback } from "react";
import type { ApiResponse } from "../types";

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export const useApi = <T = unknown>(options: UseApiOptions<T> = {}) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (apiCall: () => Promise<ApiResponse<T>>) => {
      setLoading(true);
      setError(null);

      try {
        console.log("useApi: Ejecutando API call...");
        const result = await apiCall();
        console.log("useApi: Resultado recibido:", result);

        if (result.error) {
          console.log("useApi: Error detectado:", result.error);
          setError(result.error);
          options.onError?.(result.error);
        } else if (result.data) {
          console.log("useApi: Datos recibidos:", result.data);
          setData(result.data);
          options.onSuccess?.(result.data);
        } else {
          console.log("useApi: Respuesta sin datos ni error:", result);
        }
      } catch (err) {
        console.error("useApi: Error en execute:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        options.onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};
