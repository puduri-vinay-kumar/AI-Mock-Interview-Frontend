"use client";

import { Bot, Camera, Mic, MicOff, Play, RefreshCw, VideoOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { LoadingSkeleton } from "@/components/system/loading-skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { useInterview, useSubmitVoiceAnswer } from "@/hooks/useInterview";
import { API_BASE_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/auth.store";
import { useInterviewStore } from "@/store/interview.store";
import { useUIStore } from "@/store/ui.store";

type InterviewRoomProps = {
  interviewId: string;
};

function resolveAudioUrl(audioUrl?: string) {
  if (!audioUrl) {
    return null;
  }

  if (audioUrl.startsWith("mock://")) {
    return null;
  }

  if (audioUrl.startsWith("http://") || audioUrl.startsWith("https://")) {
    return audioUrl;
  }

  return new URL(audioUrl, API_BASE_URL).toString();
}

function getPreferredAudioMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }

  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? "";
}

export function InterviewRoom({ interviewId }: InterviewRoomProps) {
  const { data, isLoading } = useInterview(interviewId);
  const user = useAuthStore((state) => state.user);
  const currentInterview = useInterviewStore((state) => state.currentInterview);
  const currentTurn = useInterviewStore((state) => state.currentTurn);
  const finalReport = useInterviewStore((state) => state.finalReport);
  const submitVoiceAnswer = useSubmitVoiceAnswer(interviewId);
  const addToast = useUIStore((state) => state.addToast);

  const [isRequestingMedia, setIsRequestingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showQuestionText, setShowQuestionText] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioPlaybackError, setAudioPlaybackError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const questionText = currentTurn?.question ?? "";
  const questionAudioUrl = currentTurn?.audioUrl;
  const resolvedAudioUrl = useMemo(() => resolveAudioUrl(questionAudioUrl), [questionAudioUrl]);
  const currentQuestionNumber = Array.isArray(currentInterview?.questions) && currentTurn?.questionId
    ? Math.max(
        1,
        currentInterview.questions.findIndex((question) => question.questionId === currentTurn.questionId) + 1
      )
    : undefined;

  const attachCameraStream = useCallback((stream: MediaStream | null) => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, []);

  const requestMediaAccess = useCallback(async () => {
    try {
      setIsRequestingMedia(true);
      setMediaError(null);

      if (!cameraStreamRef.current) {
        cameraStreamRef.current = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        attachCameraStream(cameraStreamRef.current);
      }

      if (!microphoneStreamRef.current) {
        microphoneStreamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          },
          video: false
        });
      }
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : "Unable to access camera or microphone.");
    } finally {
      setIsRequestingMedia(false);
    }
  }, [attachCameraStream]);

  useEffect(() => {
    void requestMediaAccess();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
      audioRef.current?.pause();
    };
  }, [requestMediaAccess]);

  useEffect(() => {
    attachCameraStream(cameraStreamRef.current);
  }, [attachCameraStream]);

  const playCurrentTurnAudio = useCallback(async () => {
    if (!questionAudioUrl) {
      setAudioPlaybackError("This turn did not include an audio prompt.");
      return;
    }

    if (!resolvedAudioUrl) {
      setAudioPlaybackError(
        questionAudioUrl.startsWith("mock://")
          ? "The backend returned a mock audio URL. Enable real audio generation in the backend for live playback."
          : "Unable to resolve the question audio URL."
      );
      return;
    }

    try {
      setAudioPlaybackError(null);
      setIsPlayingAudio(true);
      audioRef.current?.pause();
      const nextAudio = new Audio(resolvedAudioUrl);
      audioRef.current = nextAudio;
      nextAudio.onended = () => setIsPlayingAudio(false);
      await nextAudio.play();
    } catch (error) {
      setAudioPlaybackError(error instanceof Error ? error.message : "Audio playback failed.");
      setIsPlayingAudio(false);
    }
  }, [questionAudioUrl, resolvedAudioUrl]);

  useEffect(() => {
    if (currentTurn?.audioUrl) {
      void playCurrentTurnAudio();
    }
  }, [currentTurn?.audioUrl, playCurrentTurnAudio]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  const startRecording = async () => {
    if (isRecording || submitVoiceAnswer.isPending) {
      return;
    }

    if (!microphoneStreamRef.current) {
      await requestMediaAccess();
    }

    if (!microphoneStreamRef.current) {
      addToast({
        title: "Microphone unavailable",
        description: "Please allow microphone access before answering.",
        variant: "error"
      });
      return;
    }

    try {
      const mimeType = getPreferredAudioMimeType();
      recordedChunksRef.current = [];
      setUploadProgress(0);
      setRecordingSeconds(0);

      const recorder = mimeType
        ? new MediaRecorder(microphoneStreamRef.current, { mimeType })
        : new MediaRecorder(microphoneStreamRef.current);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const audioBlob = new Blob(recordedChunksRef.current, {
            type: recorder.mimeType || "audio/webm"
          });
          const extension = recorder.mimeType.includes("mp4") ? "m4a" : "webm";
          const file = new File([audioBlob], `voice-answer.${extension}`, {
            type: recorder.mimeType || "audio/webm"
          });

          await submitVoiceAnswer.mutateAsync({
            payload: {
              audio: file,
              durationSeconds: recordingSeconds
            },
            onProgress: setUploadProgress
          });
        } catch {
          // handled by mutation onError
        }
      };

      recorder.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((value) => value + 1);
      }, 1000);
    } catch (error) {
      addToast({
        title: "Recording failed",
        description: error instanceof Error ? error.message : "Unable to start recording.",
        variant: "error"
      });
    }
  };

  return (
    <section className="container-shell pb-24 pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-200/80">Voice interview</p>
            <h1 className="mt-3 text-4xl font-bold text-white">{currentInterview?.role ?? data?.interview?.role ?? "Interview session"}</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              The AI asks each question with voice, your mic captures the response, and the backend handles transcription,
              evaluation, and next-question decisions automatically.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <GlowButton type="button" variant="secondary" onClick={() => void playCurrentTurnAudio()}>
              <Play className="size-4" />
              Replay AI Question
            </GlowButton>
            <GlowButton type="button" variant="secondary" onClick={() => void requestMediaAccess()}>
              <RefreshCw className="size-4" />
              Recheck Camera & Mic
            </GlowButton>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <LoadingSkeleton className="h-[520px] w-full" />
            <LoadingSkeleton className="h-[520px] w-full" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <GlassCard className="relative overflow-hidden rounded-[36px] p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.14),transparent_50%)]" />
                <div className="relative flex h-[520px] flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-100">
                      <Bot className="size-4" />
                      AI Interviewer
                    </div>
                    <h2 className="mt-5 text-3xl font-semibold text-white">Audio-led question flow</h2>
                    <p className="mt-3 max-w-lg text-sm leading-7 text-slate-300">
                      Questions are delivered through backend-generated voice prompts. Text is hidden by default so the
                      experience feels closer to a real online interview.
                    </p>
                  </div>

                  <div className="flex flex-1 items-center justify-center">
                    <div className="relative flex size-64 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-violet-500/20 via-slate-900 to-blue-500/20 shadow-[0_0_80px_rgba(99,102,241,0.25)]">
                      <div className="absolute inset-6 rounded-full border border-white/10 bg-slate-950/70" />
                      <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="rounded-full border border-violet-400/20 bg-violet-500/10 p-5 text-violet-200">
                          <Bot className={`size-16 ${isPlayingAudio ? "animate-pulse" : ""}`} />
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-white">{isPlayingAudio ? "Speaking..." : "Waiting..."}</div>
                          <div className="mt-1 text-sm text-slate-400">
                            {currentTurn?.voiceMode ? "Voice mode enabled" : "Voice mode pending"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-white">Current turn</div>
                        <div className="text-sm text-slate-400">
                          {currentTurn?.topic ?? "General topic"} {currentTurn?.difficulty ? `• ${currentTurn.difficulty}` : ""}
                        </div>
                      </div>
                      <button
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10"
                        onClick={() => setShowQuestionText((value) => !value)}
                      >
                        {showQuestionText ? "Hide text" : "Reveal text"}
                      </button>
                    </div>
                    {showQuestionText ? (
                      <div className="text-sm leading-7 text-slate-200">{questionText || "No text question available."}</div>
                    ) : (
                      <div className="text-sm text-slate-400">
                        Question text is hidden by default. Use Replay if you want to hear it again.
                      </div>
                    )}
                    {audioPlaybackError ? <div className="text-xs text-amber-300">{audioPlaybackError}</div> : null}
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="relative overflow-hidden rounded-[36px] p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(56,189,248,0.14),transparent_45%)]" />
                <div className="relative flex h-[520px] flex-col">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-100">
                        <Camera className="size-4" />
                        Candidate Camera
                      </div>
                      <h2 className="mt-4 text-3xl font-semibold text-white">{user?.name ?? "Candidate"}</h2>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                      {isRecording ? `${recordingSeconds}s recording` : submitVoiceAnswer.isPending ? `${uploadProgress}% uploading` : "Ready"}
                    </div>
                  </div>

                  <div className="relative flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60">
                    {cameraStreamRef.current ? (
                      <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center text-slate-400">
                          <VideoOff className="mx-auto size-12" />
                          <p className="mt-4 text-sm">Camera preview unavailable</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-100">
                      Camera {cameraStreamRef.current ? "connected" : "waiting"}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <GlowButton
                      type="button"
                      className="h-14 justify-center"
                      onClick={() => void startRecording()}
                      disabled={isRecording || submitVoiceAnswer.isPending || isRequestingMedia}
                    >
                      <Mic className="size-4" />
                      {isRequestingMedia ? "Checking devices..." : isRecording ? "Recording..." : "Start Answer"}
                    </GlowButton>
                    <GlowButton
                      type="button"
                      variant="secondary"
                      className="h-14 justify-center"
                      onClick={stopRecording}
                      disabled={!isRecording}
                    >
                      <MicOff className="size-4" />
                      Stop & Upload
                    </GlowButton>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                    The backend decides whether to ask a follow-up or finish the interview. No transcript is shown in the
                    UI, and completion is based on `questionCount`.
                  </div>
                  {mediaError ? <div className="mt-3 text-sm text-rose-300">{mediaError}</div> : null}
                  {finalReport ? <div className="mt-3 text-xs text-emerald-300">Final report received from backend.</div> : null}
                </div>
              </GlassCard>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <GlassCard className="rounded-[28px] p-5">
                <div className="text-sm text-slate-400">Question count</div>
                <div className="mt-2 text-3xl font-semibold text-white">{currentInterview?.questionCount ?? "--"}</div>
              </GlassCard>
              <GlassCard className="rounded-[28px] p-5">
                <div className="text-sm text-slate-400">Session status</div>
                <div className="mt-2 text-3xl font-semibold text-white">{String(currentInterview?.status ?? "scheduled")}</div>
              </GlassCard>
              <GlassCard className="rounded-[28px] p-5">
                <div className="text-sm text-slate-400">Current question</div>
                <div className="mt-2 text-3xl font-semibold text-white">{currentQuestionNumber ?? "--"}</div>
              </GlassCard>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
