"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { interviewService } from "@/services/interview.service";
import { uploadService } from "@/services/upload.service";
import { useInterviewStore } from "@/store/interview.store";
import { useUIStore } from "@/store/ui.store";
import type { InterviewSetupInput, InterviewVoiceAnswerInput } from "@/types/interview.types";

export function useResumeUpload() {
  const setResumeAnalysis = useInterviewStore((state) => state.setResumeAnalysis);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) =>
      uploadService.uploadResume(file, onProgress),
    onSuccess: (data) => {
      const resumeId = data.resume?._id ?? null;
      const parsedSkills = data.analysis?.skills ?? data.resume?.extractedSkills ?? data.resume?.parsedData?.skills ?? [];
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
  const setCurrentTurn = useInterviewStore((state) => state.setCurrentTurn);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: (payload: InterviewSetupInput) => interviewService.createInterview(payload),
    onSuccess: (data) => {
      setCurrentInterview(data.interview);
      setCurrentTurn(data.session?.currentTurn ?? null);
      void queryClient.invalidateQueries({ queryKey: ["interviews", "history"] });
      addToast({
        title: "Interview created",
        description: "Your voice interview session is ready.",
        variant: "success"
      });
      router.push(`/interview/${data.interview._id ?? data.interview.id}`);
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
  const setVoiceProgress = useInterviewStore((state) => state.setVoiceProgress);
  const query = useQuery({
    queryKey: ["interviews", id],
    queryFn: () => interviewService.getInterview(id),
    enabled: Boolean(id),
    staleTime: 30_000
  });

  useEffect(() => {
    if (query.data) {
      setVoiceProgress({
        interview: query.data.interview,
        currentTurn: query.data.currentTurn ?? null,
        report: query.data.report ?? null
      });
    }
  }, [query.data, setVoiceProgress]);

  return query;
}

export function useInterviewHistory() {
  return useQuery({
    queryKey: ["interviews", "history"],
    queryFn: () => interviewService.getInterviewHistory()
  });
}

export function useSubmitVoiceAnswer(id: string) {
  const queryClient = useQueryClient();
  const setVoiceProgress = useInterviewStore((state) => state.setVoiceProgress);
  const addToast = useUIStore((state) => state.addToast);
  const router = useRouter();

  return useMutation({
    mutationFn: ({ payload, onProgress }: { payload: InterviewVoiceAnswerInput; onProgress?: (progress: number) => void }) =>
      interviewService.submitVoiceAnswer(id, payload, onProgress),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["interviews", id] });
    },
    onSuccess: (data) => {
      const nextTurn = data.currentTurn ?? data.session?.currentTurn ?? null;

      setVoiceProgress({
        interview: data.interview,
        currentTurn: data.completed ? null : nextTurn,
        report: data.report ?? null
      });
      queryClient.setQueryData(["interviews", id], {
        ...data,
        currentTurn: nextTurn ?? undefined
      });
      if (data.completed) {
        addToast({
          title: "Interview completed",
          description: "Your final report is ready.",
          variant: "success"
        });
        const reportId =
          (typeof data.report === "object" && data.report && "_id" in data.report
            ? String((data.report as { _id?: string })._id)
            : typeof data.report === "object" && data.report && "id" in data.report
              ? String((data.report as { id?: string }).id)
            : null) ?? id;
        router.push(`/reports/${reportId}`);
        return;
      }

      addToast({
        title: "Voice answer processed",
        description: nextTurn ? "Next question is ready." : "Answer saved. Refreshing the next turn.",
        variant: "success"
      });

      if (!nextTurn) {
        void queryClient.invalidateQueries({ queryKey: ["interviews", id] });
      }
    },
    onError: (error) => {
      addToast({
        title: "Voice answer failed",
        description: error instanceof Error ? error.message : "Please retry.",
        variant: "error"
      });
    }
  });
}
