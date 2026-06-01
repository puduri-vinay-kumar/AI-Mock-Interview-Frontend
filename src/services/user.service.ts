import { apiClient } from "@/lib/axios";
import { unwrapResponse } from "@/services/api";
import type { ApiResponse } from "@/types/api.types";
import type { UpdateProfileInput, UserHistoryItem, UserProfile } from "@/types/user.types";

export const userService = {
  async getProfile() {
    const response = await apiClient.get<ApiResponse<UserProfile>>("/api/users/profile");
    return unwrapResponse(response).data;
  },

  async updateProfile(payload: UpdateProfileInput) {
    const response = await apiClient.put<ApiResponse<UserProfile>>("/api/users/profile", payload);
    return unwrapResponse(response).data;
  },

  async getHistory() {
    const response = await apiClient.get<ApiResponse<UserHistoryItem[]>>("/api/users/history");
    return unwrapResponse(response).data;
  }
};
