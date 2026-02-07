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

# Mercury Backend Integration

This dashboard is designed to work seamlessly with the Mercury AI Backend, providing real-time visibility into email security scans.

## 🔐 Authentication Flow (JWT)

Mercury uses standard JSON Web Token (JWT) authentication to secure backend communication.

1.  **Login**: Users submit credentials via `src/pages/Login.tsx`.
2.  **Token Storage**: Upon success, the `access_token` is stored in `localStorage`.
3.  **Automatic Injection**: The Apollo Client (`src/lib/apolloClient.ts`) uses an `authLink` to intercept every outgoing request and inject the `Authorization: Bearer <token>` header automatically.
4.  **Session Management**: The `ProtectedRoute` component ensures that components requiring authentication are only accessible if a token is present.
5.  **Logout**: Clearing `localStorage` immediately revokes the frontend's ability to call protected endpoints.

## 📡 GraphQL Architecture

We use **Apollo Client** as our primary interface for data fetching in "Real Mode".

*   **Queries & Mutations**: All GraphQL operations are defined in `src/graphql/queries.ts` for type safety and reuse.
*   **Error Handling**: A dedicated `errorLink` in `src/lib/apolloClient.ts` captures network and GraphQL errors globally, providing user-friendly notifications (via `sonner` toasts) without crashing the UI.
*   **Endpoint**: The frontend targets the `/graphql/` path on the backend server. By default, this is set to `http://localhost:8000/graphql/`.

## 🧠 Intelligent Middleware Transparency

The Mercury Backend features an **Intelligent Middleware** layer that scans inbound emails *before* they are logged. 

*   **Frontend Unawareness**: As a frontend developer, you do not need to trigger scans or handle complex security logic. You simply query the `EmailLog` entity.
*   **Data Structure**: Logs arrive with pre-computed fields:
    *   `status`: `Clean`, `Suspicious`, or `Malicious`.
    *   `confidence`: A percentage (0-100) representing the AI's certainty.
*   **Role**: The dashboard's role is purely to **visualize and report** on these decisions made by the backend's security engine.

## 🛠 Real vs. Mock Services

The application implements a "Service Layer" pattern in `src/services/emailService.ts` to isolate UI components from the data source logic.

*   **Component Unawareness**: UI components (like `EmailLogTable`) do not know if they are receiving real or mock data. They simply call `getEmailLogs()` and await the result.
*   **The Switch**: Data source is controlled by the `VITE_DATA_MODE` environment variable.

| Mode | Behavior | Use Case |
| :--- | :--- | :--- |
| **Mock** | Uses `src/lib/mockData.ts` | Offline dev, UI prototyping, and testing. |
| **Real** | Executes Apollo GraphQL queries | Production or integration with a running backend. |

## ⚙️ Environment Variables

Create a `.env` file in the `frontend` root:

```env
# Modes: "mock" (default) | "real"
VITE_DATA_MODE=mock
```

## 🚀 Development vs. Production

*   **Development (`pnpm dev`)**:
    *   Default mode is usually `mock` for rapid UI iteration.
    *   HMR (Hot Module Replacement) is active.
*   **Production (`pnpm build`)**:
    *   Ensure `VITE_DATA_MODE=real` is set in your build environment.
    *   The build artifacts in `dist/` are optimized and stripped of development-only logic.

