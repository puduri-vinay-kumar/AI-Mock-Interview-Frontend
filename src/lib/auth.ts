import { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY } from "@/lib/constants";
import type { AuthApiData, AuthPayload, AuthUser } from "@/types/auth.types";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getStoredToken() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

export function getStoredUser() {
  if (!isBrowser()) {
    return null;
  }

  const value = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
}

export function clearStoredSession() {
  clearStoredToken();
  clearStoredUser();
}

function inferUser(data: AuthApiData | AuthUser) {
  if ("name" in data && "email" in data) {
    return data as AuthUser;
  }

  const user = "user" in data ? data.user : null;
  const profile = "profile" in data ? data.profile : null;
  const currentUser = "currentUser" in data ? data.currentUser : null;

  return user ?? profile ?? currentUser ?? null;
}

export function normalizeAuthPayload(data: AuthApiData | AuthUser): AuthPayload | null {
  const token = [
    "token" in data ? data.token : null,
    "accessToken" in data ? data.accessToken : null,
    "jwt" in data ? data.jwt : null,
    "authToken" in data ? data.authToken : null
  ].find((value) => typeof value === "string" && value.length > 0) ?? null;
  const user = inferUser(data);

  if (!token || !user) {
    return null;
  }

  return { token, user };
}

export function normalizeUser(data: AuthApiData | AuthUser) {
  return inferUser(data);
}

export function parseJwtExpiration(token: string) {
  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return null;
    }

    const decoded = JSON.parse(atob(payload));
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string) {
  const expiration = parseJwtExpiration(token);

  if (!expiration) {
    return false;
  }

  return Date.now() >= expiration;
}
