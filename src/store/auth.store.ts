"use client";

import { create } from "zustand";

import { clearStoredSession, getStoredToken, getStoredUser, isTokenExpired, setStoredToken, setStoredUser } from "@/lib/auth";
import { registerUnauthorizedHandler } from "@/lib/axios";
import { authService } from "@/services/auth.service";
import type { ApiErrorLike } from "@/types/api.types";
import type { AuthPayload, AuthStoreState } from "@/types/auth.types";

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  token: null,
  status: "idle",
  isHydrated: false,
  isBootstrapping: false,
  bootstrapMessage: null,
  error: null,
  setSession: (payload: AuthPayload) => {
    setStoredToken(payload.token);
    setStoredUser(payload.user);
    set({
      user: payload.user,
      token: payload.token,
      status: "authenticated",
      error: null
    });
  },
  setBootstrapping: (value, message = null) => {
    set({
      isBootstrapping: value,
      bootstrapMessage: message
    });
  },
  setHydrated: (value) => set({ isHydrated: value }),
  setError: (value) => set({ error: value }),
  clearSession: () => {
    clearStoredSession();
    set({
      user: null,
      token: null,
      status: "unauthenticated",
      error: null,
      isBootstrapping: false,
      bootstrapMessage: null
    });
  }
}));

export async function bootstrapAuth() {
  const store = useAuthStore.getState();
  const token = getStoredToken();
  const cachedUser = getStoredUser();

  if (!token || isTokenExpired(token)) {
    store.clearSession();
    store.setHydrated(true);
    return;
  }

  if (cachedUser) {
    useAuthStore.setState({
      user: cachedUser,
      token,
      status: "authenticated"
    });
  } else {
    useAuthStore.setState({
      token,
      status: "loading"
    });
  }

  store.setBootstrapping(true, "Restoring your secure session...");

  try {
    const user = await authService.getCurrentUser(token);
    store.setSession({ token, user });
  } catch (error) {
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? (error as ApiErrorLike).message
        : "Your session has expired. Please log in again.";
    store.clearSession();
    store.setError(message);
  } finally {
    useAuthStore.setState({
      isHydrated: true,
      isBootstrapping: false,
      bootstrapMessage: null
    });
  }
}

registerUnauthorizedHandler(() => {
  useAuthStore.getState().clearSession();
  useAuthStore.getState().setHydrated(true);
});
