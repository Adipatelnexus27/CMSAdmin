import { AuthUser, TokenPayload } from "@/core/auth/types";

const ACCESS_TOKEN_KEY = "cms.auth.accessToken";
const REFRESH_TOKEN_KEY = "cms.auth.refreshToken";
const EXPIRES_AT_KEY = "cms.auth.expiresAtUtc";
const USER_KEY = "cms.auth.user";

export function getAccessToken(): string | null {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  const value = window.localStorage.getItem(USER_KEY);
  return value ? (JSON.parse(value) as AuthUser) : null;
}

export function getTokenExpiry(): string | null {
  return window.localStorage.getItem(EXPIRES_AT_KEY);
}

export function setSession(payload: TokenPayload): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
  window.localStorage.setItem(EXPIRES_AT_KEY, payload.expiresAtUtc);
  window.localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
}

export function clearSession(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(EXPIRES_AT_KEY);
  window.localStorage.removeItem(USER_KEY);
}

