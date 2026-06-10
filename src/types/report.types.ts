export type ScoreCard = {
  label: string;
  value: number;
};

export type TopicScore = {
  topic: string;
  score: number;
  comments?: string;
};

export type InterviewReport = {
  _id?: string;
  id?: string;
  interviewId?:
    | string
    | {
        _id?: string;
        role?: string;
        experienceLevel?: string;
        interviewType?: string;
        status?: string;
        createdAt?: string;
        [key: string]: unknown;
      };
  technicalKnowledge?: number;
  communication?: number;
  confidence?: number;
  problemSolving?: number;
  conceptualClarity?: number;
  overallScore?: number;
  strengths?: string[];
  weaknesses?: string[];
  suggestedLearnings?: string[];
  learningRecommendations?: string[];
  detailedAnalysis?: {
    summary?: string;
    communicationNotes?: string;
    technicalNotes?: string;
    behavioralNotes?: string;
    improvementPlan?: string;
    percentileEstimate?: number;
    overallRating?: string;
    [key: string]: unknown;
  };
  topicScores?: TopicScore[];
  radarMetrics?: {
    technicalKnowledge?: number;
    communication?: number;
    confidence?: number;
    problemSolving?: number;
    conceptualClarity?: number;
    [key: string]: unknown;
  };
  role?: string;
  interviewType?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};
