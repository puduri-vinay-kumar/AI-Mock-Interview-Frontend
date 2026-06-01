import type { AuthUser } from "@/types/auth.types";
import type { InterviewReport } from "@/types/report.types";

export type UserProfile = AuthUser & {
  history?: UserHistoryItem[];
};

export type UpdateProfileInput = {
  name?: string;
  avatar?: string;
  password?: string;
};

export type UserHistoryItem = {
  _id?: string;
  id?: string;
  report?: InterviewReport;
  reportId?: string;
  role?: string;
  interviewType?: string;
  score?: number;
  createdAt?: string;
  [key: string]: unknown;
};
