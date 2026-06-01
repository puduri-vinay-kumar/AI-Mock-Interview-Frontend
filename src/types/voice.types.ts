export type VoiceSpeakInput = {
  text: string;
  voice?: string;
  instructions?: string;
};

export type VoiceSessionInput = {
  transcriptChunk?: string;
  aiSpeaking?: boolean;
  userSpeaking?: boolean;
};

export type VoiceTranscriptionResponse = {
  transcript?: string;
  text?: string;
  [key: string]: unknown;
};
