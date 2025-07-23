# TutiFruti Frontend

Frontend de la aplicación TutiFruti desarrollado con React, TypeScript y Vite.

## 🚀 Configuración Rápida

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
npm run setup-env
```

### 3. Iniciar servidor de desarrollo
```bash
npm run dev
```

## 📋 Variables de Entorno

El proyecto utiliza variables de entorno para configurar las URLs de la API y WebSockets según el entorno (desarrollo/producción).

### Configuración Automática
Ejecuta el siguiente comando para crear automáticamente el archivo `.env`:
```bash
npm run setup-env
```

### Configuración Manual
1. Copia el archivo `env.example` a `.env`
2. Edita las URLs según tu entorno

**Desarrollo:**
```env
VITE_API_BASE_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001
VITE_NODE_ENV=development
```

**Producción:**
```env
VITE_API_BASE_URL=https://tu-servidor-produccion.com
VITE_SOCKET_URL=https://tu-servidor-produccion.com
VITE_NODE_ENV=production
```

Para más información, consulta [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md).

## 🛠️ Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter
- `npm run setup-env` - Configura las variables de entorno

## 📁 Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
├── config/        # Configuración de la aplicación
├── hooks/         # Hooks personalizados
├── pages/         # Páginas de la aplicación
├── services/      # Servicios de API
├── store/         # Estado global (Zustand)
├── types/         # Tipos TypeScript
└── utils/         # Utilidades
```

## 🔧 Tecnologías Utilizadas

- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Socket.io Client** - Comunicación en tiempo real
- **Zustand** - Gestión de estado
- **TailwindCSS** - Framework de CSS

## 📖 Documentación Adicional

- [Configuración de Variables de Entorno](./ENVIRONMENT_SETUP.md)
- [Refactorización del Frontend](./FRONTEND_REFACTOR.md)

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
