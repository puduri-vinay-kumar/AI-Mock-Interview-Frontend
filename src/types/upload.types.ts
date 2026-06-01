export type ResumeUploadResponse = {
  _id?: string;
  id?: string;
  resumeId?: string;
  fileName?: string;
  extractedText?: string;
  parsedSkills?: string[];
  skills?: string[];
  [key: string]: unknown;
};
