/**
 * Auth Service
 * 
 * Purpose: Manage JWT authentication and session state.
 */

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, AUTH_STATE_KEY, USER_PROFILE_KEY, AUTH_URL, REFRESH_URL, SIGNUP_URL } from "@/lib/constants";
import { authenticatedFetch } from "@/lib/api";

let refreshPromise: Promise<boolean> | null = null;

export interface AuthResponse {
    access: string;
    refresh?: string;
    user?: {
        id: number;
        username: string;
        email: string;
        role: string;
    };
}

export interface LoginPayload {
    username: string;
    password: string;
}

export interface SignupPayload {
    username: string;
    email: string;
    password: string;
}

export interface SignupResult {
    success: boolean;
    error?: string | Record<string, string[]>;
}

export interface LoginResult {
    success: boolean;
    error?: string;
}

export const authService = {
    /**
     * Authenticate with the backend.
     */
    async login(username: string, password: string): Promise<LoginResult> {
        try {
            const payload: LoginPayload = { username, password };
            const response = await fetch(AUTH_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    return { success: false, error: "Invalid credentials" };
                }
                return { success: false, error: "Authentication failed" };
            }

            const data: AuthResponse = await response.json();
            if (data.access) {
                this.setToken(data.access);
                if (data.refresh) {
                    this.setRefreshToken(data.refresh);
                }

                // Fetch user profile immediately after login
                await this.getProfile();

                localStorage.setItem(AUTH_STATE_KEY, 'true');
                return { success: true };
            }
            return { success: false, error: "Invalid response from server" };
        } catch (error) {
            console.error("Login failed:", error);
            return { success: false, error: "Network error. Is the backend online?" };
        }
    },

    /**
     * Signup a new user.
     */
    async signup(username: string, email: string, password: string): Promise<SignupResult> {
        try {
            const payload: SignupPayload = { username, email, password };
            const response = await fetch(SIGNUP_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                return { success: true };
            }

            if (response.status === 400) {
                const errorData = await response.json();
                return { success: false, error: errorData };
            }

            return { success: false, error: "An unexpected error occurred during signup." };
        } catch (error) {
            console.error("Signup failed:", error);
            return { success: false, error: "Connection error. Is the backend running?" };
        }
    },

    /**
     * Fetch user profile details.
     */
    async getProfile(): Promise<any> {
        try {
            const response = await authenticatedFetch('/users/me/');

            if (response.status === 401) {
                this.logout();
                window.location.href = '/login';
                return null;
            }

            if (!response.ok) return null;

            const userProfile = await response.json();
            localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userProfile));
            return userProfile;
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            return null;
        }
    },

    /**
     * Refresh the access token.
     */
    async refreshToken(): Promise<boolean> {
        if (refreshPromise) {
            return refreshPromise;
        }

        refreshPromise = (async () => {
            try {
                const refresh = this.getRefreshToken();
                if (!refresh) return false;

                const response = await fetch(REFRESH_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ refresh }),
                });

                if (!response.ok) {
                    this.logout();
                    return false;
                }

                const data: { access: string } = await response.json();
                if (data.access) {
                    this.setToken(data.access);
                    return true;
                }
                return false;
            } catch (error) {
                console.error("Token refresh failed:", error);
                return false;
            } finally {
                refreshPromise = null;
            }
        })();

        return refreshPromise;
    },

    /**
     * Clear session.
     */
    logout() {
        this.removeToken();
        this.removeRefreshToken();
        localStorage.removeItem(AUTH_STATE_KEY);
        localStorage.removeItem(USER_PROFILE_KEY);
    },

    /**
     * Get stored token.
     * Includes a migration check for the legacy "access" key.
     */
    getToken(): string | null {
        let token = localStorage.getItem(ACCESS_TOKEN_KEY);

        // MIGRATION: Check for legacy key if canonical key is missing
        if (!token) {
            const legacyToken = localStorage.getItem("access");
            if (legacyToken) {
                token = legacyToken;
                this.setToken(token);
                localStorage.removeItem("access");
                console.log("[AuthService] Migrated legacy token to access_token");
            }
        }

        return token;
    },

    /**
     * Set stored token.
     */
    setToken(token: string) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    },

    /**
     * Remove stored token.
     */
    removeToken() {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem("access"); // Clean up legacy key if exists
    },

    /**
     * Get stored refresh token.
     */
    getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    /**
     * Set stored refresh token.
     */
    setRefreshToken(token: string) {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    },

    /**
     * Remove stored refresh token.
     */
    removeRefreshToken() {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    /**
     * Get stored user profile.
     */
    getUserProfile(): any {
        const profile = localStorage.getItem(USER_PROFILE_KEY);
        return profile ? JSON.parse(profile) : null;
    },

    /**
     * Check if user is authenticated locally.
     */
    isAuthenticated(): boolean {
        // Must have auth state flag AND a valid token (under either key during transition)
        return localStorage.getItem(AUTH_STATE_KEY) === 'true' && !!this.getToken();
    }
};
