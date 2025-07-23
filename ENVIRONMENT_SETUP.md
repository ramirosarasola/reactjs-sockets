# Configuración de Variables de Entorno

Este documento explica cómo configurar las variables de entorno para el frontend de TutiFruti.

## Archivos de Configuración

### 1. Crear el archivo `.env`

Copia el archivo `env.example` y renómbralo a `.env`:

```bash
cp env.example .env
```

### 2. Configuración para Desarrollo

Para desarrollo local, usa esta configuración en tu archivo `.env`:

```env
# Variables de entorno para el frontend
# Desarrollo
VITE_API_BASE_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001

# Configuración del entorno
VITE_NODE_ENV=development
```

### 3. Configuración para Producción

Para producción, actualiza las URLs en tu archivo `.env`:

```env
# Variables de entorno para el frontend
# Producción
VITE_API_BASE_URL=https://tu-servidor-produccion.com
VITE_SOCKET_URL=https://tu-servidor-produccion.com

# Configuración del entorno
VITE_NODE_ENV=production
```

## Variables Disponibles

| Variable            | Descripción                    | Valor por Defecto       |
| ------------------- | ------------------------------ | ----------------------- |
| `VITE_API_BASE_URL` | URL base de la API REST        | `http://localhost:5001` |
| `VITE_SOCKET_URL`   | URL del servidor de WebSockets | `http://localhost:5001` |
| `VITE_NODE_ENV`     | Entorno de la aplicación       | `development`           |

## Uso en el Código

### Importar la configuración

```typescript
import { getApiBaseUrl, getSocketUrl, isDevelopment, isProduction } from "../config/environment";
```

### Obtener URLs

```typescript
const apiUrl = getApiBaseUrl(); // Obtiene la URL de la API
const socketUrl = getSocketUrl(); // Obtiene la URL del socket
```

### Verificar el entorno

```typescript
if (isDevelopment()) {
  console.log("Ejecutando en desarrollo");
}

if (isProduction()) {
  console.log("Ejecutando en producción");
}
```

## Scripts de NPM

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
npm run preview
```

## Notas Importantes

1. **Variables VITE**: Todas las variables de entorno deben comenzar con `VITE_` para que Vite las incluya en el bundle.

2. **Archivo .env**: Este archivo debe estar en la raíz del proyecto y NO debe subirse al repositorio (ya está en .gitignore).

3. **Reinicio del servidor**: Después de modificar el archivo `.env`, reinicia el servidor de desarrollo para que los cambios surtan efecto.

4. **Validación**: El código incluye valores por defecto para evitar errores si las variables no están definidas.

## Troubleshooting

### Problema: Las variables no se cargan

- Verifica que el archivo `.env` esté en la raíz del proyecto
- Asegúrate de que las variables comiencen con `VITE_`
- Reinicia el servidor de desarrollo

### Problema: URLs incorrectas en producción

- Verifica que las URLs en el archivo `.env` sean correctas
- Asegúrate de que el servidor de producción esté configurado correctamente
- Revisa los logs del navegador para errores de conexión
