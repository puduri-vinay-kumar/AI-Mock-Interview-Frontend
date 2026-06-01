import { apiClient } from "@/lib/axios";
import { unwrapResponse } from "@/services/api";
import type {
  InterviewAnswerInput,
  InterviewSession,
  InterviewSetupInput,
  InterviewStatusUpdateInput,
  TranscriptEntry
} from "@/types/interview.types";
import type { ApiResponse } from "@/types/api.types";

export const interviewService = {
  async createInterview(payload: InterviewSetupInput) {
    const response = await apiClient.post<ApiResponse<InterviewSession>>("/api/interviews/create", payload);
    return unwrapResponse(response).data;
  },

  async getInterview(id: string) {
    const response = await apiClient.get<ApiResponse<InterviewSession>>(`/api/interviews/${id}`);
    return unwrapResponse(response).data;
  },

  async getInterviewHistory() {
    const response = await apiClient.get<ApiResponse<InterviewSession[]>>("/api/interviews/history");
    return unwrapResponse(response).data;
  },

  async submitAnswer(id: string, payload: InterviewAnswerInput) {
    const response = await apiClient.post<ApiResponse<InterviewSession>>(`/api/interviews/${id}/answer`, payload);
    return unwrapResponse(response).data;
  },

  async appendTranscript(id: string, entries: TranscriptEntry[]) {
    const response = await apiClient.post<ApiResponse<InterviewSession>>(`/api/interviews/${id}/transcript`, {
      entries
    });
    return unwrapResponse(response).data;
  },

  async completeInterview(id: string) {
    const response = await apiClient.post<ApiResponse<InterviewSession>>(`/api/interviews/${id}/complete`);
    return unwrapResponse(response).data;
  },

  async updateInterviewStatus(id: string, payload: InterviewStatusUpdateInput) {
    const response = await apiClient.put<ApiResponse<InterviewSession>>(`/api/interviews/${id}/status`, payload);
    return unwrapResponse(response).data;
  }
};
