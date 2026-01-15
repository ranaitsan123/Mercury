import apiConfig from "@/config/apiConfig";

export const ACCESS_TOKEN_KEY = "access";
export const REFRESH_TOKEN_KEY = "refresh";

export const AUTH_STATE_KEY = "isAuthenticated";
export const USER_PROFILE_KEY = "user_profile";

export const AUTH_URL = apiConfig.endpoints.auth.login;
export const REFRESH_URL = apiConfig.endpoints.auth.refresh;
export const SIGNUP_URL = apiConfig.endpoints.auth.signup;
