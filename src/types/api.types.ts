export type ApiResponse<TData> = {
  success: boolean;
  message: string;
  data: TData;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  error?: unknown;
};

export type ApiErrorLike = {
  message: string;
  status?: number;
  details?: unknown;
};
