import { apiClient } from "@/lib/axios";
import { unwrapResponse } from "@/services/api";
import type { ApiResponse } from "@/types/api.types";
import type { VoiceSessionInput, VoiceSpeakInput, VoiceTranscriptionResponse } from "@/types/voice.types";

export const voiceService = {
  async speak(payload: VoiceSpeakInput) {
    const response = await apiClient.post<ApiResponse<unknown>>("/api/voice/speak", payload);
    return unwrapResponse(response).data;
  },

  async transcribe(audio: File, prompt?: string, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append("audio", audio);

    if (prompt) {
      formData.append("prompt", prompt);
    }

    const response = await apiClient.post<ApiResponse<VoiceTranscriptionResponse>>("/api/voice/transcribe", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress: (event) => {
        if (!event.total || !onProgress) {
          return;
        }

        onProgress(Math.round((event.loaded * 100) / event.total));
      }
    });

    return unwrapResponse(response).data;
  },

  async session(payload: VoiceSessionInput) {
    const response = await apiClient.post<ApiResponse<unknown>>("/api/voice/session", payload);
    return unwrapResponse(response).data;
  }
};
