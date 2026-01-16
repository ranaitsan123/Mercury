export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const AUTH_STATE_KEY = 'isAuthenticated';
export const USER_PROFILE_KEY = 'user_profile';

const API_BASE = import.meta.env.VITE_API_URL || "https://curly-engine-gwgjrqw7wqqh9x69-8000.app.github.dev/";

export const AUTH_URL = import.meta.env.VITE_AUTH_URL || `${API_BASE}/auth/token/`;
export const REFRESH_URL = import.meta.env.VITE_REFRESH_URL || `${API_BASE}/auth/token/refresh/`;
export const SIGNUP_URL = import.meta.env.VITE_SIGNUP_URL || `${API_BASE}/users/signup/`;
