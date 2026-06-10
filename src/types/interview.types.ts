export type ExperienceLevel = "fresher" | "junior" | "mid" | "senior";

export type InterviewType = "technical" | "hr" | "behavioral" | "coding" | "mixed";

export type InterviewStatus = "scheduled" | "in-progress" | "completed" | "cancelled";

export type InterviewSetupInput = {
  role: string;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  questionCount: number;
  resumeId?: string;
  previousScore?: number;
};

export type InterviewTurn = {
  sessionId: string;
  questionId: string;
  question: string;
  topic?: string;
  difficulty?: string;
  type?: string;
  followUpPossible?: boolean;
  audioUrl?: string;
  voiceMode?: boolean;
};

export type InterviewVoiceAnswerInput = {
  audio: File;
  durationSeconds?: number;
};

export type InterviewSession = {
  _id?: string;
  id?: string;
  role?: string;
  experienceLevel?: ExperienceLevel | string;
  interviewType?: InterviewType | string;
  questionCount?: number;
  duration?: number;
  status?: InterviewStatus | string;
  reportId?: string;
  sessionId?: string;
  currentDifficulty?: string;
  questions?: Array<{
    questionId?: string;
    question?: string;
    type?: string;
    topic?: string;
    difficulty?: string;
    followUpPossible?: boolean;
    source?: string;
    expectedAnswer?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export type InterviewCreateResponse = {
  interview: InterviewSession;
  session?: {
    currentTurn?: InterviewTurn;
    [key: string]: unknown;
  };
};

export type InterviewResumeResponse = {
  interview: InterviewSession;
  currentTurn?: InterviewTurn;
  completed?: boolean;
  report?: Record<string, unknown>;
};

export type InterviewStoreState = {
  currentInterview: InterviewSession | null;
  currentTurn: InterviewTurn | null;
  finalReport: Record<string, unknown> | null;
  resumeId: string | null;
  parsedSkills: string[];
  setCurrentInterview: (interview: InterviewSession | null) => void;
  setCurrentTurn: (turn: InterviewTurn | null) => void;
  setVoiceProgress: (payload: { interview: InterviewSession; currentTurn?: InterviewTurn | null; report?: Record<string, unknown> | null }) => void;
  setResumeAnalysis: (resumeId: string | null, parsedSkills?: string[]) => void;
  resetInterview: () => void;
};
