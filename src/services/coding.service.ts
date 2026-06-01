import { apiClient } from "@/lib/axios";
import { unwrapResponse } from "@/services/api";
import type { ApiResponse } from "@/types/api.types";
import type { CodingEvaluateInput, CodingEvaluationResult } from "@/types/coding.types";

export const codingService = {
  async evaluate(payload: CodingEvaluateInput) {
    const response = await apiClient.post<ApiResponse<CodingEvaluationResult>>("/api/coding/evaluate", payload);
    return unwrapResponse(response).data;
  }
};
