export type ExperienceLevel = "fresher" | "junior" | "mid" | "senior";

export type InterviewType = "technical" | "hr" | "behavioral" | "coding" | "mixed";

export type InterviewStatus = "scheduled" | "in-progress" | "completed" | "cancelled";

export type InterviewSetupInput = {
  role: string;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  duration: number;
  resumeId?: string;
  previousScore?: number;
};

export type TranscriptSpeaker = "ai" | "user" | "system";

export type TranscriptEntry = {
  speaker: TranscriptSpeaker;
  text: string;
};

export type InterviewAnswerInput = {
  answer: string;
  transcript?: string;
  durationSeconds?: number;
};

export type InterviewStatusUpdateInput = {
  status?: InterviewStatus;
  answers?: Array<{
    questionId?: string;
    question?: string;
    answer?: string;
  }>;
  liveTranscript?: TranscriptEntry[];
};

export type InterviewSession = {
  _id?: string;
  id?: string;
  role?: string;
  experienceLevel?: ExperienceLevel | string;
  interviewType?: InterviewType | string;
  duration?: number;
  status?: InterviewStatus | string;
  questions?: string[];
  transcript?: TranscriptEntry[];
  liveTranscript?: TranscriptEntry[];
  answers?: Array<{
    questionId?: string;
    question?: string;
    answer?: string;
    feedback?: string;
    score?: number;
  }>;
  reportId?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export type InterviewStoreState = {
  currentInterview: InterviewSession | null;
  resumeId: string | null;
  parsedSkills: string[];
  setCurrentInterview: (interview: InterviewSession | null) => void;
  setResumeAnalysis: (resumeId: string | null, parsedSkills?: string[]) => void;
  appendTranscript: (entries: TranscriptEntry[]) => void;
  appendAnswer: (answer: { question?: string; answer?: string }) => void;
  resetInterview: () => void;
};
