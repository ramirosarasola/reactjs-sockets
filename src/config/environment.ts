// Configuración de variables de entorno
export const environment = {
  // URLs de la API
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001",
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || "http://localhost:5001",

  // Entorno
  NODE_ENV: import.meta.env.VITE_NODE_ENV || "development",

  // Configuración adicional
  IS_DEVELOPMENT: import.meta.env.DEV || false,
  IS_PRODUCTION: import.meta.env.PROD || false,

  // Configuración de la aplicación
  APP_NAME: "TutiFruti",
  APP_VERSION: "1.0.0",
};

// Función para obtener la URL base según el entorno
export const getApiBaseUrl = (): string => {
  return environment.API_BASE_URL;
};

// Función para obtener la URL del socket según el entorno
export const getSocketUrl = (): string => {
  return environment.SOCKET_URL;
};

// Función para verificar si estamos en desarrollo
export const isDevelopment = (): boolean => {
  return environment.IS_DEVELOPMENT || environment.NODE_ENV === "development";
};

// Función para verificar si estamos en producción
export const isProduction = (): boolean => {
  return environment.IS_PRODUCTION || environment.NODE_ENV === "production";
};

// Función para obtener la configuración completa
export const getEnvironmentConfig = () => {
  return {
    ...environment,
    getApiBaseUrl,
    getSocketUrl,
    isDevelopment,
    isProduction,
  };
};
