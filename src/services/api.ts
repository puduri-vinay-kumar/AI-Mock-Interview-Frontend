import type { AxiosResponse } from "axios";

import type { ApiFieldError, ApiResponse } from "@/types/api.types";

function getApiErrorMessage(responseData: unknown) {
  if (typeof responseData !== "object" || responseData === null) {
    return "The backend rejected this request.";
  }

  const data = responseData as { message?: string; error?: unknown };
  const fieldMessages = Array.isArray(data.error)
    ? data.error
        .map((detail: ApiFieldError) => detail?.message)
        .filter((message): message is string => Boolean(message))
    : [];

  return fieldMessages.length ? fieldMessages.join(" ") : data.message || "The backend rejected this request.";
}

export function unwrapResponse<T>(response: AxiosResponse<ApiResponse<T>>) {
  if (!response.data.success) {
    throw new Error(getApiErrorMessage(response.data));
  }

  return response.data;
}
