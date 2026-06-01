"use client";

import { create } from "zustand";

import type { InterviewSession, InterviewStoreState, TranscriptEntry } from "@/types/interview.types";

function getTranscript(interview: InterviewSession | null) {
  return interview?.liveTranscript ?? interview?.transcript ?? [];
}

export const useInterviewStore = create<InterviewStoreState>((set) => ({
  currentInterview: null,
  resumeId: null,
  parsedSkills: [],
  setCurrentInterview: (interview) => set({ currentInterview: interview }),
  setResumeAnalysis: (resumeId, parsedSkills = []) => set({ resumeId, parsedSkills }),
  appendTranscript: (entries: TranscriptEntry[]) =>
    set((state) => ({
      currentInterview: state.currentInterview
        ? {
            ...state.currentInterview,
            liveTranscript: [...getTranscript(state.currentInterview), ...entries]
          }
        : state.currentInterview
    })),
  appendAnswer: (answer) =>
    set((state) => ({
      currentInterview: state.currentInterview
        ? {
            ...state.currentInterview,
            answers: [...(state.currentInterview.answers ?? []), answer]
          }
        : state.currentInterview
    })),
  resetInterview: () =>
    set({
      currentInterview: null,
      resumeId: null,
      parsedSkills: []
    })
}));
