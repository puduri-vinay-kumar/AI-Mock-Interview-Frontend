import type { AxiosResponse } from "axios";

import type { ApiResponse } from "@/types/api.types";

export function unwrapResponse<T>(response: AxiosResponse<ApiResponse<T>>) {
  return response.data;
}
