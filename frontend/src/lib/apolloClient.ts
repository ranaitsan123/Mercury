import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { toast } from "sonner";

import { authService } from "@/services/auth.service";

// Create HTTP link to the GraphQL endpoint
const httpLink = createHttpLink({
    uri: "http://localhost:8000/graphql/",
});

// Middleware to inject JWT token
const authLink = setContext((_, { headers }) => {
    // Get the authentication token from our auth service
    const token = authService.getToken();

    // Return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        }
    };
});

// Error handling middleware
const errorLink = onError((errorResponse: any) => {
    const { graphQLErrors, networkError } = errorResponse;
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
            console.error(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            );

            // Handle 401/403 specifically if the backend returns them as graphql errors with codes
            // For now, generic logging is sufficient
        });
        toast.error("Data Error", { description: "There was an issue processing your request." });
    }

    if (networkError) {
        console.error(`[Network error]: ${networkError}`);
        // Handle 401/403 status codes from network error
        if ('statusCode' in networkError && networkError.statusCode === 401) {
            toast.error("Session Expired", { description: "Please login again." });
            // Optionally redirect to login
            // window.location.href = '/login'; 
        } else if ('statusCode' in networkError && networkError.statusCode === 403) {
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
