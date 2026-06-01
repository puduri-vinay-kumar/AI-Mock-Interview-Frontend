"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { interviewService } from "@/services/interview.service";
import { uploadService } from "@/services/upload.service";
import { useInterviewStore } from "@/store/interview.store";
import { useUIStore } from "@/store/ui.store";
import type { InterviewAnswerInput, InterviewSetupInput, TranscriptEntry } from "@/types/interview.types";

export function useResumeUpload() {
  const setResumeAnalysis = useInterviewStore((state) => state.setResumeAnalysis);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) =>
      uploadService.uploadResume(file, onProgress),
    onSuccess: (data) => {
      const resumeId = data.resumeId ?? data.id ?? data._id ?? null;
      const parsedSkills = data.parsedSkills ?? data.skills ?? [];
      setResumeAnalysis(resumeId, parsedSkills);
      addToast({
        title: "Resume uploaded",
        description: "Your resume was parsed successfully and is ready for interview personalization.",
        variant: "success"
      });
    },
    onError: (error) => {
      addToast({
        title: "Resume upload failed",
        description: error instanceof Error ? error.message : "Unable to upload resume.",
        variant: "error"
      });
    }
  });
}

export function useCreateInterview() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setCurrentInterview = useInterviewStore((state) => state.setCurrentInterview);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: (payload: InterviewSetupInput) => interviewService.createInterview(payload),
    onSuccess: (data) => {
      setCurrentInterview(data);
      void queryClient.invalidateQueries({ queryKey: ["interviews", "history"] });
      addToast({
        title: "Interview created",
        description: "Your live interview session is ready.",
        variant: "success"
      });
      router.push(`/interview/${data.id ?? data._id}`);
    },
    onError: (error) => {
      addToast({
        title: "Unable to create interview",
        description: error instanceof Error ? error.message : "Please retry in a moment.",
        variant: "error"
      });
    }
  });
}

export function useInterview(id: string) {
  const setCurrentInterview = useInterviewStore((state) => state.setCurrentInterview);
  const query = useQuery({
    queryKey: ["interviews", id],
    queryFn: () => interviewService.getInterview(id),
    enabled: Boolean(id),
    staleTime: 30_000
  });

  useEffect(() => {
    if (query.data) {
      setCurrentInterview(query.data);
    }
  }, [query.data, setCurrentInterview]);

  return query;
}

export function useInterviewHistory() {
  return useQuery({
    queryKey: ["interviews", "history"],
    queryFn: () => interviewService.getInterviewHistory()
  });
}

export function useSubmitAnswer(id: string) {
  const queryClient = useQueryClient();
  const appendAnswer = useInterviewStore((state) => state.appendAnswer);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: (payload: InterviewAnswerInput) => interviewService.submitAnswer(id, payload),
    onMutate: async (payload) => {
      appendAnswer({ answer: payload.answer });
      await queryClient.cancelQueries({ queryKey: ["interviews", id] });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["interviews", id], data);
      addToast({
        title: "Answer submitted",
        description: "Your latest answer was sent for evaluation.",
        variant: "success"
      });
    },
    onError: (error) => {
      addToast({
        title: "Answer submission failed",
        description: error instanceof Error ? error.message : "Please retry.",
        variant: "error"
      });
    }
  });
}

export function useAppendTranscript(id: string) {
  const queryClient = useQueryClient();
  const appendTranscript = useInterviewStore((state) => state.appendTranscript);

  return useMutation({
    mutationFn: (entries: TranscriptEntry[]) => interviewService.appendTranscript(id, entries),
    onMutate: async (entries) => {
      appendTranscript(entries);
      await queryClient.cancelQueries({ queryKey: ["interviews", id] });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["interviews", id], data);
    }
  });
}

export function useCompleteInterview(id: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setCurrentInterview = useInterviewStore((state) => state.setCurrentInterview);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: () => interviewService.completeInterview(id),
    onSuccess: (data) => {
      setCurrentInterview(data);
      queryClient.setQueryData(["interviews", id], data);
      void queryClient.invalidateQueries({ queryKey: ["interviews", "history"] });
      addToast({
        title: "Interview completed",
        description: "Your report is being prepared.",
        variant: "success"
      });
      router.push(`/reports/${data.reportId ?? id}`);
    },
    onError: (error) => {
      addToast({
        title: "Unable to complete interview",
        description: error instanceof Error ? error.message : "Please retry.",
        variant: "error"
      });
    }
  });
}
