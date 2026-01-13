import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getAccessToken, removeAccessToken } from './auth';
import { toast } from 'sonner';

const httpLink = createHttpLink({
    uri: 'http://localhost:8000/graphql/',
});

const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = getAccessToken();
    // return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        }
    }
});

const errorLink = onError(({ error }) => {
    if (error) {
        // In Apollo Client 4, GraphQL errors are bundled in error.errors if it's a CombinedGraphQLErrors
        const graphQLErrors = (error as any).errors;

        if (graphQLErrors && Array.isArray(graphQLErrors)) {
            graphQLErrors.forEach(({ message, extensions }: any) => {
                console.error(
                    `[GraphQL error]: Message: ${message}`
                );

                // Handle specific error codes or messages
                if (extensions?.code === 'UNAUTHENTICATED') {
                    removeAccessToken();
                    window.location.href = '/login';
                }

                const lowerMessage = message.toLowerCase();
                if (lowerMessage.includes('admin only')) {
                    toast.error('Access Denied', {
                        description: 'Admin privileges are required to perform this action.',
                    });
                } else if (lowerMessage.includes('limit exceeded')) {
                    toast.warning('Usage Limit Exceeded', {
                        description: 'Please try again later.',
                    });
                }
            });
        } else {
            // If there are no graphQLErrors, treat it as a network or general error
            console.error(`[Error]: ${error}`);
            toast.error('Network Error', {
                description: 'Please check your internet connection and try again.',
            });
        }
    }
});

const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
});

export default client;
