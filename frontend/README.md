# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

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

export default defineConfig([
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

# Mercury Dashboard Integration Guide

This frontend connects to the Mercury Django backend service. Below is the integration overview for developers.

## Data & Authentication Flow

### 1. Data Access Layer (`src/services/emailService.ts`)
The application uses a unified service pattern to abstract the data source. UI components **must not** fetch data directly.
- **Service**: `EmailService`
- **Responsibility**: Determines whether to fetch data from the live backend or local mock definitions based on the environment.

### 2. Authentication (JWT)
Authentication is handled via JSON Web Tokens (JWT).
- **Storage**: `localStorage` (key: `access_token`)
- **Injection**: The `ApolloClient` in `src/lib/apolloClient.ts` automatically injects the token into the `Authorization` header (`Bearer <token>`) for every GraphQL request.
- **Expiry**: Returns a 401 error, which is caught by the Apollo error link to trigger a user notification or redirect.

### 3. GraphQL Integration
The app uses **Apollo Client** for data fetching.
- **Endpoint**: `/graphql/` (proxied in dev or absolute URL in prod)
- **Queries**: Defined in `src/graphql/queries.ts`.
- **Usage**: `EmailService` executes these queries when in **Real Mode**.

## Environment Configuration

Control the behavior of the application using `.env`:

| Variable | Values | Description |
|----------|--------|-------------|
| `VITE_DATA_MODE` | `mock` \| `real` | Switches between local mock data and real backend calls. |

### Modes
- **Mock Mode** (`VITE_DATA_MODE=mock`):
  - No network calls to backend.
  - Data is served instantly from `src/lib/mockData.ts`.
  - Useful for UI development, testing, and offline work.

- **Real Mode** (`VITE_DATA_MODE=real`):
  - Connects to the GraphQL endpoint.
  - Requires a valid JWT token.
  - **Graceful Degradation**: If the backend is offline or returns an error, the service falls back to an empty state (or mock data for critical components) to prevent crashes.

## Intelligent Middleware
The backend employs "Intelligent Middleware" that scans emails before they reach the database. The frontend is transparent to this process; it simply queries the `EmailLog` results.
- **Status Field**: `Clean` | `Suspicious` | `Malicious`
- **Confidence**: `0-100` (Displayed directly, never computed frontend-side).

## Development vs Production
- **Development**: typically runs with `VITE_DATA_MODE=mock` for speed, or `real` with a local Django server running on port 8000.
- **Production**: Always runs with `VITE_DATA_MODE=real`. Ensure the build pipeline sets this correctly.

