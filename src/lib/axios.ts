"use client";

import axios, { AxiosError } from "axios";

import { clearStoredSession, getStoredToken } from "@/lib/auth";
import { API_BASE_URL, API_TIMEOUT_MS, DEFAULT_COLD_START_MESSAGE } from "@/lib/constants";
import type { ApiErrorLike, ApiErrorResponse, ApiFieldError } from "@/types/api.types";

let unauthorizedHandler: (() => void) | null = null;

export class ApiClientError extends Error {
  status?: number;
  details?: unknown;

  constructor({ message, status, details }: ApiErrorLike) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

export function registerUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

export function normalizeApiError(error: unknown): ApiErrorLike {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status;
    const messageFromApi = axiosError.response?.data?.message;

    if (axiosError.code === "ECONNABORTED") {
      return {
        message: `${DEFAULT_COLD_START_MESSAGE} Please retry in a few seconds.`,
        status
      };
    }

    if (!axiosError.response) {
      return {
        message: "Unable to reach the backend right now. Please check your connection and retry.",
        status
      };
    }

    const details = axiosError.response?.data?.error;
    const fieldMessages = Array.isArray(details)
      ? details
          .map((detail: ApiFieldError) => detail?.message)
          .filter((message): message is string => Boolean(message))
      : [];

    return {
      message: fieldMessages.length
        ? fieldMessages.join(" ")
        : messageFromApi ?? "Something went wrong while contacting the backend.",
      status,
      details
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "An unexpected error occurred." };
}

export function toApiClientError(error: unknown) {
  return new ApiClientError(normalizeApiError(error));
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete (config.headers as Record<string, unknown>)["Content-Type"];
    delete (config.headers as Record<string, unknown>)["content-type"];
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error instanceof AxiosError ? error.response?.status : undefined;

    if (status === 401) {
      clearStoredSession();
      unauthorizedHandler?.();
    }

    return Promise.reject(toApiClientError(error));
  }
);
