import type { AxiosResponse } from "axios";

import type { ApiResponse } from "@/types/api.types";

export function unwrapResponse<T>(response: AxiosResponse<ApiResponse<T>>) {
  if (!response.data.success) {
    throw new Error(response.data.message || "The backend rejected this request.");
  }

  return response.data;
}
