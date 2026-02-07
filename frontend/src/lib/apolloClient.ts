import {
    ApolloClient,
    InMemoryCache,
    createHttpLink,
    from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { toast } from "sonner";

import apiConfig from "@/config/apiConfig";
import { authService } from "@/services/auth.service";

/* =========================
   HTTP LINK
========================= */
const httpLink = createHttpLink({
    uri: apiConfig.graphqlUrl,
    credentials: "include",
});

/* =========================
   AUTH LINK
========================= */
const authLink = setContext((_, { headers }) => {
    const token = authService.getToken();

    return {
        headers: {
            ...headers,
            Authorization: token ? `Bearer ${token}` : "",
        },
    };
});

/* =========================
   ERROR LINK (TS-SAFE)
========================= */
const errorLink = onError(({ graphQLErrors, networkError }) => {
    let unauthorized = false;

    if (graphQLErrors && graphQLErrors.length > 0) {
        for (const err of graphQLErrors) {
            console.error("[GraphQL error]", err.message);

            if (
                err.message === "Authentication required" ||
                err.extensions?.code === "UNAUTHENTICATED"
            ) {
                unauthorized = true;
            }
        }
    }

    if (networkError) {
        const statusCode = (networkError as any)?.statusCode;
        if (statusCode === 401) {
            unauthorized = true;
        }
    }

    if (unauthorized) {
        toast.error("Session expired", {
            description: "Please login again.",
        });

        authService.logout();

        if (window.location.pathname !== "/login") {
            window.location.href = "/login";
        }
    }
});

/* =========================
   APOLLO CLIENT
========================= */
export const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: "network-only",
            errorPolicy: "all",
        },
        query: {
            fetchPolicy: "network-only",
            errorPolicy: "all",
        },
        mutate: {
            errorPolicy: "all",
        },
    },
});
