/**
 * Auth Service
 * 
 * Purpose: Manage JWT authentication and session state.
 */

const ACCESS_TOKEN_KEY = 'access_token';
const AUTH_STATE_KEY = 'isAuthenticated';

export interface AuthResponse {
    access: string;
    refresh?: string;
    user?: any;
}

export const authService = {
    /**
     * Authenticate with the backend.
     */
    async login(email: string, password: string): Promise<boolean> {
        try {
            const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";
            const response = await fetch(`${apiBase}/auth/token/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: email, password }), // Standard DRF SimpleJWT uses 'username'
            });

            if (!response.ok) {
                return false;
            }

            const data: AuthResponse = await response.json();
            if (data.access) {
                this.setToken(data.access);
                localStorage.setItem(AUTH_STATE_KEY, 'true');
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login failed:", error);
            return false;
        }
    },

    /**
     * Signup a new user.
     */
    async signup(email: string, password: string): Promise<boolean> {
        try {
            const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";
            const response = await fetch(`${apiBase}/auth/signup/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: email, password, email }),
            });

            return response.ok;
        } catch (error) {
            console.error("Signup failed:", error);
            return false;
        }
    },

    /**
     * Clear session.
     */
    logout() {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(AUTH_STATE_KEY);
    },

    /**
     * Get stored token.
     */
    getToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    /**
     * Set stored token.
     */
    setToken(token: string) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    },

    /**
     * Check if user is authenticated locally.
     */
    isAuthenticated(): boolean {
        return localStorage.getItem(AUTH_STATE_KEY) === 'true' && !!this.getToken();
    }
};
