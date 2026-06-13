import { apiClient } from "@/lib/axios";
import { API_UPLOAD_TIMEOUT_MS } from "@/lib/constants";
import { unwrapResponse } from "@/services/api";
import type { ApiResponse } from "@/types/api.types";
import type { ResumeUploadResponse } from "@/types/upload.types";

export const uploadService = {
  async uploadResume(file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await apiClient.post<ApiResponse<ResumeUploadResponse>>("/api/upload/resume", formData, {
      timeout: API_UPLOAD_TIMEOUT_MS,
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
