export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://p01--ai-mock-interview-backend--hjcxtdgt48mj.code.run";
export const API_TIMEOUT_MS = 20_000;
export const AUTH_TOKEN_STORAGE_KEY = "ai-interview-token";
export const AUTH_USER_STORAGE_KEY = "ai-interview-user";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const DEFAULT_QUESTION_COUNT = Number(process.env.NEXT_PUBLIC_DEFAULT_QUESTION_COUNT ?? 5);
export const DEFAULT_COLD_START_MESSAGE =
  "The backend is initializing. The first request can take a little longer than usual.";
export const PROTECTED_PATHS = ["/setup"];
export const TOAST_TTL_MS = 4000;
