import { apiClient } from "@/lib/axios";
import { normalizeAuthPayload, normalizeUser } from "@/lib/auth";
import { unwrapResponse } from "@/services/api";
import type { AuthPayload, LoginInput, RegisterInput } from "@/types/auth.types";
import type { ApiResponse } from "@/types/api.types";

export const authService = {
  async register(payload: RegisterInput) {
    const response = await apiClient.post<ApiResponse<unknown>>("/api/auth/register", payload);
    const body = unwrapResponse(response);
    const normalized = normalizeAuthPayload(body.data as never);

    if (normalized) {
      return normalized;
    }

    return this.login({
      email: payload.email,
      password: payload.password
    });
  },

  async login(payload: LoginInput) {
    const response = await apiClient.post<ApiResponse<unknown>>("/api/auth/login", payload);
    const body = unwrapResponse(response);
    const normalized = normalizeAuthPayload(body.data as never);

    if (!normalized) {
      throw new Error("Login succeeded, but the auth payload was missing a token or user.");
    }

    return normalized;
  },

  async getCurrentUser(token?: string | null) {
    const response = await apiClient.get<ApiResponse<unknown>>("/api/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    const body = unwrapResponse(response);
    const user = normalizeUser(body.data as never);

    if (!user) {
      throw new Error("Unable to resolve the authenticated user from /api/auth/me.");
    }

    return user;
  }
};
