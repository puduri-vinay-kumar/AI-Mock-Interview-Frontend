import { apiClient } from "@/lib/axios";
import { unwrapResponse } from "@/services/api";
import type { ApiResponse } from "@/types/api.types";
import type { ResumeUploadResponse } from "@/types/upload.types";

export const uploadService = {
  async uploadResume(file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await apiClient.post<ApiResponse<ResumeUploadResponse>>("/api/upload/resume", formData, {
      onUploadProgress: (event) => {
        if (!event.total || !onProgress) {
          return;
        }

        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    });

    return unwrapResponse(response).data;
  }
};
