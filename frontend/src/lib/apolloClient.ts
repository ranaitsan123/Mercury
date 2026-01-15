import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { toast } from "sonner";

import apiConfig from "@/config/apiConfig";
import { authService } from "@/services/auth.service";

const httpLink = createHttpLink({
    uri: apiConfig.graphqlUrl,
});

const authLink = setContext((_, { headers }) => {
    const token = authService.getToken();
    return {
        headers: {
            ...headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    };
});

const errorLink = onError(({ graphQLErrors, networkError }: any) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(err => {
            console.error("[GraphQL error]:", err.message);
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
