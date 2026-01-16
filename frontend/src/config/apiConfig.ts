/**
 * API Configuration
 * 
 * Purpose: Centralize URLs for both REST and GraphQL services.
 * Supports: Local, Docker, and GitHub Codespaces environments via environment variables.
 */

// Core environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:8000";
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || `${API_BASE_URL}/graphql/`;

export const apiConfig = {
    /**
     * Base URL for the backend API (e.g., http://localhost:8000)
     */
    baseUrl: API_BASE_URL.replace(/\/$/, ""),

    /**
     * Full GraphQL Endpoint URL (e.g., http://localhost:8000/graphql/)
     */
    graphqlUrl: GRAPHQL_URL,

    /**
     * REST endpoints
     */
    endpoints: {
        auth: {
            login: `${API_BASE_URL.replace(/\/$/, "")}/auth/token/`,
            refresh: `${API_BASE_URL.replace(/\/$/, "")}/auth/token/refresh/`,
            signup: `${API_BASE_URL.replace(/\/$/, "")}/users/signup/`,
            me: `${API_BASE_URL.replace(/\/$/, "")}/users/me/`,
        },
        emails: {
            metrics: `${API_BASE_URL.replace(/\/$/, "")}/emails/metrics/`,
            threats: `${API_BASE_URL.replace(/\/$/, "")}/emails/threats/`,
            trends: `${API_BASE_URL.replace(/\/$/, "")}/emails/trends/`,
        }
    }
};

export default apiConfig;
