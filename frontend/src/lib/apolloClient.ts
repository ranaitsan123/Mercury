import { ApolloClient, InMemoryCache, createHttpLink, from, Observable } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { toast } from "sonner";

import { authService } from "@/services/auth.service";

// Create HTTP link to the GraphQL endpoint
const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";
const httpLink = createHttpLink({
    uri: `${apiBase}/graphql/`,
});

// Middleware to inject JWT token
const authLink = setContext((_, { headers }) => {
    // Get the authentication token from our auth service
    const token = authService.getToken();

    // Return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            ...(token ? { authorization: `Bearer ${token}` } : {}),
        }
    };
});

// Error handling middleware
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }: any) => {
    if (graphQLErrors) {
        for (const err of graphQLErrors) {
            console.error(
                `[GraphQL error]: Message: ${err.message}, Path: ${err.path}`
            );
        }
    }

    if (networkError) {
        console.error(`[Network error]: ${networkError}`);

        // Handle 401 status codes from network error (Session Expired/Token Invalid)
        const status = (networkError as any).statusCode;
        if (status === 401) {
            return new Observable((observer) => {
                authService.refreshToken()
                    .then((isValid) => {
                        if (isValid) {
                            const subscriber = forward(operation).subscribe({
                                next: observer.next.bind(observer),
                                error: observer.error.bind(observer),
                                complete: observer.complete.bind(observer),
                            });
                            return () => subscriber.unsubscribe();
                        } else {
                            authService.logout();
                            toast.error("Session Expired", { description: "Your session has ended. Please login again." });
                            window.location.href = '/login';
                            observer.complete();
                        }
                    })
                    .catch((err) => {
                        observer.error(err);
                    });
            });
        }

        if (status === 403) {
            toast.error("Access Denied", { description: "You do not have permission to view this resource." });
        } else {
            toast.error("Connection Error", { description: "Could not connect to the server." });
        }
    }
});

// Initialize Apollo Client
export const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
});
