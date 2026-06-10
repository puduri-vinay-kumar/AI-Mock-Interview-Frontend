export type ResumeUploadResponse = {
  resume?: {
    _id?: string;
    fileName?: string;
    extractedSkills?: string[];
    parsedData?: {
      skills?: string[];
      summary?: string;
      education?: string[];
      projects?: string[];
      technologies?: string[];
      experience?: string[];
    };
    [key: string]: unknown;
  };
  analysis?: {
    skills?: string[];
    summary?: string;
    education?: string[];
    projects?: string[];
    technologies?: string[];
    experience?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
};
