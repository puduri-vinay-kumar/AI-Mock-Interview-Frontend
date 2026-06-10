import { apiClient } from "@/lib/axios";
import { unwrapResponse } from "@/services/api";
import type { ApiResponse } from "@/types/api.types";
import type { UpdateProfileInput, UserHistoryItem, UserProfile } from "@/types/user.types";

export const userService = {
  async getProfile() {
    const response = await apiClient.get<ApiResponse<UserProfile>>("/api/users/profile");
    const body = unwrapResponse(response);
    return (body.data as { user?: UserProfile }).user ?? body.data;
  },

  async updateProfile(payload: UpdateProfileInput) {
    const response = await apiClient.put<ApiResponse<UserProfile>>("/api/users/profile", payload);
    const body = unwrapResponse(response);
    return (body.data as { user?: UserProfile }).user ?? body.data;
  },

  async getHistory() {
    const response = await apiClient.get<ApiResponse<{ total?: number; history?: UserHistoryItem[] } | UserHistoryItem[]>>(
      "/api/users/history"
    );
    const body = unwrapResponse(response);

    return Array.isArray(body.data) ? body.data : (body.data.history ?? []);
  }
};
