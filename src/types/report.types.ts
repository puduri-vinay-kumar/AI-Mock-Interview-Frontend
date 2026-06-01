export type ScoreCard = {
  label: string;
  value: number;
};

export type InterviewReport = {
  _id?: string;
  id?: string;
  score?: number;
  summary?: string;
  strengths?: string[];
  improvements?: string[];
  metrics?: ScoreCard[];
  analytics?: ScoreCard[];
  interviewId?: string;
  role?: string;
  interviewType?: string;
  createdAt?: string;
  [key: string]: unknown;
};
