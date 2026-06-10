"use client";

import { create } from "zustand";

import type { InterviewSession, InterviewStoreState } from "@/types/interview.types";

export const useInterviewStore = create<InterviewStoreState>((set) => ({
  currentInterview: null,
  currentTurn: null,
  finalReport: null,
  resumeId: null,
  parsedSkills: [],
  setCurrentInterview: (interview) => set({ currentInterview: interview }),
  setCurrentTurn: (turn) => set({ currentTurn: turn }),
  setVoiceProgress: ({ interview, currentTurn = null, report = null }) =>
    set({
      currentInterview: interview,
      currentTurn,
      finalReport: report
    }),
  setResumeAnalysis: (resumeId, parsedSkills = []) => set({ resumeId, parsedSkills }),
  resetInterview: () =>
    set({
      currentInterview: null,
      currentTurn: null,
      finalReport: null,
      resumeId: null,
      parsedSkills: []
    })
}));
