import { apiClient } from "@/lib/axios";
import { unwrapResponse } from "@/services/api";
import type { InterviewReport } from "@/types/report.types";
import type { ApiResponse } from "@/types/api.types";

export const reportService = {
  async getReport(id: string) {
    const response = await apiClient.get<ApiResponse<InterviewReport>>(`/api/reports/${id}`);
    return unwrapResponse(response).data;
  },

  async getUserReports(userId: string) {
    const response = await apiClient.get<ApiResponse<InterviewReport[]>>(`/api/reports/user/${userId}`);
    return unwrapResponse(response).data;
  }
};
