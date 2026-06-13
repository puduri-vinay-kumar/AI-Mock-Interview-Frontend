"use client";

import Link from "next/link";
import { ArrowLeft, Bot, Camera, Mic, MicOff, Play, RefreshCw, VideoOff, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { LoadingSkeleton } from "@/components/system/loading-skeleton";
import { StatePanel } from "@/components/system/state-panel";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { useInterview, useSubmitVoiceAnswer } from "@/hooks/useInterview";
import { useAuthStore } from "@/store/auth.store";
import { useInterviewStore } from "@/store/interview.store";
import { useUIStore } from "@/store/ui.store";

type InterviewRoomProps = {
  interviewId: string;
};

function getPreferredAudioMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }

  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? "";
}

export function InterviewRoom({ interviewId }: InterviewRoomProps) {
  const { data, isLoading, isError, refetch } = useInterview(interviewId);
  const user = useAuthStore((state) => state.user);
  const currentInterview = useInterviewStore((state) => state.currentInterview);
  const currentTurn = useInterviewStore((state) => state.currentTurn);
  const finalReport = useInterviewStore((state) => state.finalReport);
  const submitVoiceAnswer = useSubmitVoiceAnswer(interviewId);
  const addToast = useUIStore((state) => state.addToast);

  const [isRequestingMedia, setIsRequestingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isVideoPreviewLive, setIsVideoPreviewLive] = useState(false);
  const [isMicrophoneReady, setIsMicrophoneReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showQuestionText, setShowQuestionText] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [canRecordAnswer, setCanRecordAnswer] = useState(false);
  const [isScreenReady, setIsScreenReady] = useState(false);
  const [hasRequestedMedia, setHasRequestedMedia] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const combinedMediaStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const recordingStartedAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastSpokenQuestionIdRef = useRef<string | null>(null);
  const previewFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechUnlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const questionText = currentTurn?.question ?? "";
  const textToSpeak = currentTurn?.speechText || currentTurn?.question || "";
  const interviewStatus = String(currentInterview?.status ?? data?.interview?.status ?? "scheduled");
  const isCompletedSession = interviewStatus === "completed" && !currentTurn;
  const isInitialLoading = isLoading && !currentInterview && !currentTurn;
  const isMediaReady = isMicrophoneReady;
  const currentQuestionNumber = Array.isArray(currentInterview?.questions) && currentTurn?.questionId
    ? Math.max(
        1,
        currentInterview.questions.findIndex((question) => question.questionId === currentTurn.questionId) + 1
      )
    : undefined;

  const playCameraPreview = useCallback(async () => {
    const videoElement = videoRef.current;
    if (!videoElement) {
      return;
    }

    try {
      await videoElement.play();
      if (videoElement.readyState >= 2) {
        setIsVideoPreviewLive(true);
      }
    } catch {
      setIsVideoPreviewLive(false);
    }
  }, []);

  const attachCameraStream = useCallback(
    (stream: MediaStream | null) => {
      const videoElement = videoRef.current;
      if (!videoElement) {
        return;
      }

      videoElement.autoplay = true;
      videoElement.muted = true;
      videoElement.playsInline = true;
      videoElement.srcObject = stream;

      if (previewFallbackTimerRef.current) {
        clearTimeout(previewFallbackTimerRef.current);
      }

      if (stream) {
        setIsVideoPreviewLive(true);
        stream.getVideoTracks().forEach((track) => {
          track.enabled = true;
        });
        void playCameraPreview();
        previewFallbackTimerRef.current = setTimeout(() => {
          if (
            videoElement.readyState >= 2 ||
            videoElement.videoWidth > 0 ||
            stream.getVideoTracks().some((track) => track.readyState === "live" && track.enabled)
          ) {
            setIsVideoPreviewLive(true);
          }
        }, 1200);
      }
    },
    [playCameraPreview]
  );

  const requestMediaAccess = useCallback(async () => {
    try {
      setIsRequestingMedia(true);
      setMediaError(null);
      setHasRequestedMedia(true);

      if (!combinedMediaStreamRef.current) {
        const combinedStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          },
        });

        combinedMediaStreamRef.current = combinedStream;
        const videoTracks = combinedStream.getVideoTracks();
        const audioTracks = combinedStream.getAudioTracks();

        cameraStreamRef.current = videoTracks.length ? combinedStream : null;
        microphoneStreamRef.current = audioTracks.length ? new MediaStream(audioTracks) : null;
      }

      if (cameraStreamRef.current) {
        setIsCameraReady(true);
        setIsVideoPreviewLive(true);
        attachCameraStream(cameraStreamRef.current);
      }

      if (microphoneStreamRef.current) {
        setIsMicrophoneReady(true);
      }
    } catch (error) {
      setIsCameraReady(Boolean(cameraStreamRef.current));
      setIsVideoPreviewLive(false);
      setIsMicrophoneReady(Boolean(microphoneStreamRef.current));
      setMediaError(error instanceof Error ? error.message : "Unable to access camera or microphone.");
    } finally {
      setIsRequestingMedia(false);
    }
  }, [attachCameraStream]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (previewFallbackTimerRef.current) {
        clearTimeout(previewFallbackTimerRef.current);
      }
      if (speechUnlockTimerRef.current) {
        clearTimeout(speechUnlockTimerRef.current);
      }

      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      combinedMediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      combinedMediaStreamRef.current = null;
      cameraStreamRef.current = null;
      microphoneStreamRef.current = null;
      setIsCameraReady(false);
      setIsVideoPreviewLive(false);
      setIsMicrophoneReady(false);
    };
  }, []);

  useEffect(() => {
    if (hasRequestedMedia && isCameraReady) {
      attachCameraStream(cameraStreamRef.current);
    }
  }, [attachCameraStream, hasRequestedMedia, isCameraReady]);

  useEffect(() => {
    if (isInitialLoading) {
      setIsScreenReady(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsScreenReady(true);
    }, 150);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isInitialLoading]);

  useEffect(() => {
    if (!isScreenReady || hasRequestedMedia || isRequestingMedia || isCompletedSession) {
      return;
    }

    void requestMediaAccess();
  }, [hasRequestedMedia, isCompletedSession, isRequestingMedia, isScreenReady, requestMediaAccess]);

  const speakCurrentTurn = useCallback(() => {
    if (speechUnlockTimerRef.current) {
      clearTimeout(speechUnlockTimerRef.current);
    }

    if (typeof window === "undefined" || typeof window.speechSynthesis === "undefined") {
      setSpeechError("Browser speech synthesis is not available in this environment.");
      setIsSpeakingQuestion(false);
      setCanRecordAnswer(true);
      return;
    }

    if (!textToSpeak) {
      setSpeechError("This turn did not include any question text to speak.");
      setIsSpeakingQuestion(false);
      setCanRecordAnswer(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    const fallbackUnlockMs = Math.min(Math.max(textToSpeak.split(/\s+/).length * 480, 4000), 18000);
    utterance.onstart = () => {
      setSpeechError(null);
      setIsSpeakingQuestion(true);
      setCanRecordAnswer(false);
      speechUnlockTimerRef.current = setTimeout(() => {
        setIsSpeakingQuestion(false);
        setCanRecordAnswer(true);
      }, fallbackUnlockMs);
    };
    utterance.onend = () => {
      if (speechUnlockTimerRef.current) {
        clearTimeout(speechUnlockTimerRef.current);
      }
      setIsSpeakingQuestion(false);
      setCanRecordAnswer(true);
    };
    utterance.onerror = () => {
      if (speechUnlockTimerRef.current) {
        clearTimeout(speechUnlockTimerRef.current);
      }
      setSpeechError("Browser text-to-speech could not play this question.");
      setIsSpeakingQuestion(false);
      setCanRecordAnswer(true);
    };
    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [textToSpeak]);

  useEffect(() => {
    if (!currentTurn) {
      lastSpokenQuestionIdRef.current = null;
      return;
    }

    if (!isScreenReady) {
      return;
    }

    if (lastSpokenQuestionIdRef.current === currentTurn.questionId) {
      return;
    }

    lastSpokenQuestionIdRef.current = currentTurn.questionId;
    setShowQuestionText(false);
    setCanRecordAnswer(false);
    speakCurrentTurn();
  }, [currentTurn, isScreenReady, speakCurrentTurn]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      mediaRecorderRef.current?.requestData();
    } catch {
      // Some browsers do not support requesting a final flush explicitly.
    }

    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  const startRecording = async () => {
    if (isRecording || submitVoiceAnswer.isPending || !canRecordAnswer) {
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
      recordingStartedAtRef.current = Date.now();

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

          if (!audioBlob.size) {
            addToast({
              title: "No audio captured",
              description: "We couldn’t detect a valid voice response. Please try recording again.",
              variant: "error"
            });
            return;
          }

          const extension = recorder.mimeType.includes("mp4") ? "m4a" : "webm";
          const file = new File([audioBlob], `voice-answer.${extension}`, {
            type: recorder.mimeType || "audio/webm"
          });
          const durationSeconds = recordingStartedAtRef.current
            ? Math.max(1, Math.round((Date.now() - recordingStartedAtRef.current) / 1000))
            : Math.max(1, recordingSeconds);

          await submitVoiceAnswer.mutateAsync({
            payload: {
              audio: file,
              durationSeconds
            },
            onProgress: setUploadProgress
          });
        } catch {
          // handled by mutation onError
        } finally {
          recordingStartedAtRef.current = null;
        }
      };

      recorder.start(250);
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
    <section className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-4 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(99,102,241,0.20),transparent_34%),radial-gradient(circle_at_80%_12%,rgba(14,165,233,0.16),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0),#020617_82%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-32px)] max-w-7xl flex-col">
        <header className="flex items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/setup"
              className="grid size-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Back to setup"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">
                {currentInterview?.role ?? data?.interview?.role ?? "Interview session"}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.8)]" />
                Live voice interview
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-3 py-2 text-xs text-slate-300 sm:flex">
            <span>{isSpeakingQuestion ? "AI speaking" : isRecording ? "Recording answer" : submitVoiceAnswer.isPending ? "Processing answer" : canRecordAnswer ? "Your turn" : "Preparing"}</span>
          </div>
        </header>

        <div className="flex flex-1 items-center py-5">
          {isInitialLoading ? (
            <div className="grid w-full gap-5 lg:grid-cols-2">
              <LoadingSkeleton className="h-[70vh] min-h-[520px] w-full rounded-[36px]" />
              <LoadingSkeleton className="h-[70vh] min-h-[520px] w-full rounded-[36px]" />
            </div>
          ) : isCompletedSession ? (
            <GlassCard className="mx-auto w-full max-w-3xl rounded-[36px] p-8 text-center sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">Session completed</p>
              <h1 className="mt-4 text-3xl font-semibold text-white">Your interview has ended.</h1>
              <p className="mt-4 text-slate-300">Your answers have been evaluated and the report is ready to review.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <GlowButton href="/setup" className="px-5 py-3">
                  Start another session
                </GlowButton>
                <GlowButton href="/history" variant="secondary" className="px-5 py-3">
                  View history
                </GlowButton>
              </div>
            </GlassCard>
          ) : (
            <div className="grid w-full gap-5 lg:grid-cols-[0.92fr_1.08fr]">
              <GlassCard className="relative min-h-[70vh] overflow-hidden rounded-[36px] p-6 sm:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(139,92,246,0.20),transparent_42%)]" />
                <div className="relative flex h-full min-h-[520px] flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-2 text-xs font-medium text-violet-100">
                      <Bot className="size-4" />
                      AI Interviewer
                    </div>
                    <button
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
                      onClick={() => setShowQuestionText((value) => !value)}
                      disabled={!currentTurn}
                    >
                      {showQuestionText ? "Hide prompt" : "Show prompt"}
                    </button>
                  </div>

                  <div className="flex flex-1 items-center justify-center py-10">
                    {currentTurn ? (
                      <div className="relative grid place-items-center">
                        <div className={`absolute size-72 rounded-full bg-violet-500/15 blur-3xl ${isSpeakingQuestion ? "animate-pulse" : ""}`} />
                        <div className="absolute size-80 rounded-full border border-violet-300/10" />
                        <div className="absolute size-64 rounded-full border border-blue-300/10" />
                        <div className="relative grid size-56 place-items-center rounded-full border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 shadow-[0_0_100px_rgba(99,102,241,0.22)] sm:size-64">
                          <div className="absolute inset-4 rounded-full border border-white/10 bg-white/[0.03]" />
                          <Bot className={`relative z-10 size-20 text-violet-100 sm:size-24 ${isSpeakingQuestion ? "animate-pulse" : ""}`} />
                        </div>
                        <div className="mt-8 text-center">
                          <div className="text-2xl font-semibold text-white">
                            {isSpeakingQuestion ? "Asking the question" : canRecordAnswer ? "Listening for your answer" : "Preparing next turn"}
                          </div>
                          <p className="mt-2 text-sm text-slate-400">Keep your response natural, clear, and concise.</p>
                        </div>
                      </div>
                    ) : (
                      <StatePanel
                        icon={Volume2}
                        eyebrow="Syncing turn"
                        title="Preparing the next question"
                        description="If this takes longer than expected, refresh the session turn."
                        tone="warning"
                        className="w-full max-w-xl"
                        actions={
                          <GlowButton type="button" variant="secondary" onClick={() => void refetch()}>
                            <RefreshCw className="size-4" />
                            Retry
                          </GlowButton>
                        }
                      />
                    )}
                  </div>

                  {showQuestionText ? (
                    <div className="rounded-[28px] border border-white/10 bg-slate-950/45 p-5 text-sm leading-7 text-slate-200">
                      {questionText || "No text prompt available for this turn."}
                    </div>
                  ) : null}
                  {speechError ? <div className="mt-3 text-xs text-amber-300">{speechError}</div> : null}
                  {isError && !currentTurn ? <div className="mt-3 text-xs text-amber-300">Session sync needs a retry.</div> : null}
                </div>
              </GlassCard>

              <GlassCard className="relative min-h-[70vh] overflow-hidden rounded-[36px] p-4 sm:p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(56,189,248,0.18),transparent_46%)]" />
                <div className="relative flex h-full min-h-[520px] flex-col">
                  <div className="relative flex-1 overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/70">
                    {!hasRequestedMedia ? (
                      <div className="flex h-full items-center justify-center p-6">
                        <StatePanel
                          icon={Camera}
                          eyebrow="Device access"
                          title={isRequestingMedia ? "Connecting camera and microphone" : "Waiting for browser permission"}
                          description={
                            isRequestingMedia
                              ? "Allow access to start your interview preview."
                              : "Use the reconnect control if the browser prompt does not appear."
                          }
                          className="w-full"
                          contentClassName="p-6 text-center"
                          actions={
                            <GlowButton type="button" variant="secondary" onClick={() => void requestMediaAccess()}>
                              <Camera className="size-4" />
                              Reconnect
                            </GlowButton>
                          }
                        />
                      </div>
                    ) : isCameraReady ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                        onLoadedMetadata={() => {
                          void playCameraPreview();
                        }}
                        onLoadedData={() => {
                          setIsVideoPreviewLive(true);
                        }}
                        onCanPlay={() => {
                          setIsVideoPreviewLive(true);
                          void playCameraPreview();
                        }}
                        onPlaying={() => {
                          setIsVideoPreviewLive(true);
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-6">
                        <StatePanel
                          icon={VideoOff}
                          eyebrow="Camera unavailable"
                          title="Camera preview is unavailable"
                          description={mediaError}
                          tone={mediaError ? "warning" : "default"}
                          className="w-full"
                          contentClassName="p-6 text-center"
                          actions={
                            <GlowButton type="button" variant="secondary" onClick={() => void requestMediaAccess()}>
                              <RefreshCw className="size-4" />
                              Reconnect
                            </GlowButton>
                          }
                        />
                      </div>
                    )}

                    <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm font-medium text-white backdrop-blur-xl">
                      {user?.name ?? "Candidate"}
                    </div>
                    <div className="absolute bottom-4 left-4 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-100 backdrop-blur-xl">
                      {isCameraReady ? "Camera live" : hasRequestedMedia ? "Camera pending" : "Camera off"}
                    </div>
                    <div className="absolute bottom-4 right-4 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-xs text-slate-200 backdrop-blur-xl">
                      {isRecording ? `${recordingSeconds}s` : submitVoiceAnswer.isPending ? `${uploadProgress}%` : isMicrophoneReady ? "Mic ready" : "Mic pending"}
                    </div>
                  </div>

                  <div className="mt-4 rounded-[28px] border border-white/10 bg-slate-950/60 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                      <button
                        type="button"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
                        onClick={speakCurrentTurn}
                        disabled={!currentTurn || isSpeakingQuestion}
                      >
                        <Play className="size-4" />
                        Replay
                      </button>
                      {isRecording ? (
                        <button
                          type="button"
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-rose-500 px-6 text-sm font-semibold text-white shadow-[0_0_35px_rgba(244,63,94,0.35)] transition hover:bg-rose-400"
                          onClick={stopRecording}
                        >
                          <MicOff className="size-4" />
                          Submit answer
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 px-6 text-sm font-semibold text-white shadow-[0_0_35px_rgba(99,102,241,0.40)] transition hover:shadow-[0_0_55px_rgba(99,102,241,0.55)] disabled:cursor-not-allowed disabled:opacity-45"
                          onClick={() => void startRecording()}
                          disabled={submitVoiceAnswer.isPending || isRequestingMedia || !currentTurn || !canRecordAnswer || !isMicrophoneReady}
                        >
                          <Mic className="size-4" />
                          {submitVoiceAnswer.isPending ? "Processing..." : canRecordAnswer ? "Answer" : "Wait"}
                        </button>
                      )}
                      <button
                        type="button"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
                        onClick={() => void requestMediaAccess()}
                        disabled={isRequestingMedia}
                      >
                        <RefreshCw className="size-4" />
                        Reconnect
                      </button>
                    </div>
                  </div>

                  {mediaError ? (
                    <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                      {mediaError}
                    </div>
                  ) : null}
                  {finalReport ? <div className="mt-3 text-xs text-emerald-300">Your report is ready.</div> : null}
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
