const ACCESS_TOKEN_KEY = 'access_token';

/**
 * Retrieves the access token from localStorage.
 */
export const getAccessToken = (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Saves the access token to localStorage.
 * @param token The JWT access token.
 */
export const setAccessToken = (token: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

/**
 * Removes the access token from localStorage.
 */
export const removeAccessToken = (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
};

/**
 * Checks if the user is authenticated based on the presence of a token.
 */
export const isAuthenticated = (): boolean => {
    return !!getAccessToken();
};

/**
 * MOCK: Simulates a successful login by setting a dummy token.
 */
export const loginMock = (): void => {
    setAccessToken('mock-jwt-token-12345');
    localStorage.setItem('isAuthenticated', 'true'); // Support legacy mock check if any
};

/**
 * MOCK: Simulates logout by clearing the token.
 */
export const logoutMock = (): void => {
    removeAccessToken();
    localStorage.removeItem('isAuthenticated');
};
