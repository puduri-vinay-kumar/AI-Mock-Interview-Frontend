export type CodingLanguage = "javascript" | "python" | "cpp" | "java";

export type CodingTestCase = {
  input: string;
  expected: string;
};

export type CodingEvaluateInput = {
  language: CodingLanguage;
  code: string;
  testCases?: CodingTestCase[];
};

export type CodingEvaluationResult = {
  score?: number;
  feedback?: string;
  output?: string;
  passed?: number;
  total?: number;
  results?: Array<{
    input?: string;
    expected?: string;
    actual?: string;
    passed?: boolean;
  }>;
  [key: string]: unknown;
};
