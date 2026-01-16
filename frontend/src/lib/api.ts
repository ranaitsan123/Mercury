import { authService } from "@/services/auth.service";
import { ACCESS_TOKEN_KEY } from "./constants";
import { toast } from "sonner";

const apiBase = import.meta.env.VITE_API_URL || "https://curly-engine-gwgjrqw7wqqh9x69-8000.app.github.dev/";

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

export const authenticatedFetch = async (endpoint: string, options: FetchOptions = {}): Promise<Response> => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const url = endpoint.startsWith("http") ? endpoint : `${apiBase}${endpoint}`;

    try {
        let response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            // Attempt refresh
            const refreshed = await authService.refreshToken();
            if (refreshed) {
                // Retry with new token
                const newToken = localStorage.getItem(ACCESS_TOKEN_KEY);
                if (newToken) {
                    headers.Authorization = `Bearer ${newToken}`;
                    response = await fetch(url, { ...options, headers });
                }
            } else {
                // Refresh failed, authService.refreshToken() typically logs out, but ensure strict return
                return response;
            }
        }

        return response;
    } catch (error) {
        toast.error("Connection Error", {
            description: "Unable to reach the server. Please check your internet connection."
        });
        throw error;
    }
};
