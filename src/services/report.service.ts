import { apiClient } from "@/lib/axios";
import { unwrapResponse } from "@/services/api";
import type { InterviewReport } from "@/types/report.types";
import type { ApiResponse } from "@/types/api.types";

export const reportService = {
  async getReport(id: string) {
    const response = await apiClient.get<ApiResponse<InterviewReport>>(`/api/reports/${id}`);
    const body = unwrapResponse(response);
    return (body.data as { report?: InterviewReport }).report ?? body.data;
  },

  async getUserReports(userId: string) {
    const response = await apiClient.get<ApiResponse<{ reports?: InterviewReport[] } | InterviewReport[]>>(
      `/api/reports/user/${userId}`
    );
    const body = unwrapResponse(response);
    return Array.isArray(body.data) ? body.data : (body.data.reports ?? []);
  }
};
