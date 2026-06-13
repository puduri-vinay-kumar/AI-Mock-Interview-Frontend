import { apiClient } from "@/lib/axios";
import { API_VOICE_ANSWER_TIMEOUT_MS } from "@/lib/constants";
import { unwrapResponse } from "@/services/api";
import type {
  InterviewCreateResponse,
  InterviewResumeResponse,
  InterviewSession,
  InterviewSetupInput,
  InterviewVoiceAnswerInput
} from "@/types/interview.types";
import type { ApiResponse } from "@/types/api.types";

export const interviewService = {
  async createInterview(payload: InterviewSetupInput) {
    const response = await apiClient.post<ApiResponse<InterviewCreateResponse>>("/api/interviews/create", payload);
    return unwrapResponse(response).data;
  },

  async getInterview(id: string) {
    const response = await apiClient.get<ApiResponse<InterviewResumeResponse>>(`/api/interviews/${id}`);
    const body = unwrapResponse(response);
    const normalized =
      "interview" in body.data && body.data.interview
        ? body.data
        : ({
            interview: body.data as unknown as InterviewSession,
            currentTurn:
              typeof body.data === "object" && body.data !== null && "currentTurn" in body.data
                ? (body.data.currentTurn as InterviewResumeResponse["currentTurn"])
                : undefined
          } satisfies InterviewResumeResponse);
    return normalized;
  },

  async getInterviewHistory() {
    const response = await apiClient.get<ApiResponse<{ total?: number; interviews?: InterviewSession[] } | InterviewSession[]>>(
      "/api/interviews/history"
    );
    const body = unwrapResponse(response);
    return Array.isArray(body.data) ? body.data : (body.data.interviews ?? []);
  },

  async submitVoiceAnswer(id: string, payload: InterviewVoiceAnswerInput, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append("audio", payload.audio);

    if (typeof payload.durationSeconds === "number") {
      formData.append("durationSeconds", String(payload.durationSeconds));
    }

    const response = await apiClient.post<ApiResponse<InterviewResumeResponse>>(
      `/api/interviews/${id}/answer-voice`,
      formData,
      {
        timeout: API_VOICE_ANSWER_TIMEOUT_MS,
        onUploadProgress: (event) => {
          if (!event.total || !onProgress) {
            return;
          }

          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      }
    );
    return unwrapResponse(response).data;
  }
};
