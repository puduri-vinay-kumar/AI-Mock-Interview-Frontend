import { apiClient } from "@/lib/axios";
import { getStoredToken } from "@/lib/auth";
import { API_BASE_URL, API_VOICE_ANSWER_TIMEOUT_MS } from "@/lib/constants";
import { unwrapResponse } from "@/services/api";
import type {
  InterviewCreateResponse,
  InterviewResumeResponse,
  InterviewSession,
  InterviewSetupInput,
  InterviewVoiceAnswerInput
} from "@/types/interview.types";
import type { ApiResponse } from "@/types/api.types";

async function parseApiResponse<T>(response: Response) {
  const body = (await response.json().catch(() => null)) as (ApiResponse<T> & { error?: unknown }) | null;

  if (!body) {
    throw new Error("The backend returned an unreadable response.");
  }

  if (!response.ok || !body.success) {
    const fieldMessage = Array.isArray(body.error)
      ? body.error.find((item): item is { message: string } => {
          return typeof item === "object" && item !== null && "message" in item && typeof item.message === "string";
        })?.message
      : null;

    throw new Error(fieldMessage ?? body.message ?? "The backend rejected this request.");
  }

  return body.data;
}

function normalizeInterviewResponse(data: InterviewResumeResponse | InterviewSession): InterviewResumeResponse {
  if (typeof data === "object" && data !== null && "interview" in data && data.interview) {
    const responseData = data as InterviewResumeResponse;

    return {
      ...responseData,
      currentTurn: responseData.currentTurn ?? responseData.session?.currentTurn ?? undefined
    };
  }

  return {
    interview: data as InterviewSession,
    currentTurn:
      typeof data === "object" && data !== null && "currentTurn" in data
        ? (data.currentTurn as InterviewResumeResponse["currentTurn"])
        : undefined
  };
}

export const interviewService = {
  async createInterview(payload: InterviewSetupInput) {
    const token = getStoredToken();
    const body = {
      role: payload.role.trim(),
      experienceLevel: payload.experienceLevel,
      interviewType: payload.interviewType,
      questionCount: Number(payload.questionCount),
      ...(payload.resumeId ? { resumeId: payload.resumeId } : {}),
      ...(typeof payload.previousScore === "number" ? { previousScore: payload.previousScore } : {})
    };

    const response = await fetch(`${API_BASE_URL}/api/interviews/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    });

    return parseApiResponse<InterviewCreateResponse>(response);
  },

  async getInterview(id: string) {
    const response = await apiClient.get<ApiResponse<InterviewResumeResponse>>(`/api/interviews/${id}`);
    const body = unwrapResponse(response);
    return normalizeInterviewResponse(body.data);
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
    return normalizeInterviewResponse(unwrapResponse(response).data);
  }
};
