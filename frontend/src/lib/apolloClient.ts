import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { toast } from "sonner";

import apiConfig from "@/config/apiConfig";
import { authService } from "@/services/auth.service";

/**
 * Apollo Client Setup
 * 
 * Configures the GraphQL client with authentication and error handling links.
 */

const httpLink = createHttpLink({
    uri: apiConfig.graphqlUrl,
});

/**
 * Auth Link: Injects the JWT Bearer token into the Authorization header.
 * Uses authService.getToken() which leverages the unified 'access_token' key.
 */
const authLink = setContext((_, { headers }) => {
    const token = authService.getToken();

    return {
        headers: {
            ...headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    };
});

/**
 * Error Link: Handles GraphQL and Network errors globally.
 * Specifically redirects to login on 401 Unauthorized errors.
 */
const errorLink = onError(({ graphQLErrors, networkError }: any) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(err => {
            console.error("[GraphQL error]:", err.message);

            // Handle explicit backend 'Authentication required' error in body
            if (err.extensions?.code === "AUTH_REQUIRED" || err.message === "Authentication required") {
                authService.logout();
                window.location.href = "/login?expired=true";
            }
        });
    }

    if (networkError) {
        const status = (networkError as any).statusCode;

        if (status === 401) {
            toast.error("Session expired", {
                description: "Please login again."
            });
            authService.logout();
            window.location.href = "/login";
        }
    }
});

export const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
});
