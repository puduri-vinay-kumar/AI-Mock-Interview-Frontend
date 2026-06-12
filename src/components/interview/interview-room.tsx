"use client";

import { AlertTriangle, Bot, Camera, Mic, MicOff, Play, RefreshCw, VideoOff, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { LoadingSkeleton } from "@/components/system/loading-skeleton";
import { PageHeader } from "@/components/system/page-header";
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

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastSpokenQuestionIdRef = useRef<string | null>(null);

  const questionText = currentTurn?.question ?? "";
  const textToSpeak = currentTurn?.speechText || currentTurn?.question || "";
  const interviewStatus = String(currentInterview?.status ?? data?.interview?.status ?? "scheduled");
  const isCompletedSession = interviewStatus === "completed" && !currentTurn;
  const isMediaReady = isVideoPreviewLive && isMicrophoneReady;
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
      setIsVideoPreviewLive(false);

      if (stream) {
        stream.getVideoTracks().forEach((track) => {
          track.enabled = true;
        });
        void playCameraPreview();
      }
    },
    [playCameraPreview]
  );

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
        setIsCameraReady(true);
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
    void requestMediaAccess();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCameraReady(false);
      setIsVideoPreviewLive(false);
      setIsMicrophoneReady(false);
    };
  }, [requestMediaAccess]);

  useEffect(() => {
    attachCameraStream(cameraStreamRef.current);
  }, [attachCameraStream]);

  useEffect(() => {
    if (isLoading) {
      setIsScreenReady(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsScreenReady(true);
    }, 150);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLoading]);

  const speakCurrentTurn = useCallback(() => {
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
    utterance.onstart = () => {
      setSpeechError(null);
      setIsSpeakingQuestion(true);
      setCanRecordAnswer(false);
    };
    utterance.onend = () => {
      setIsSpeakingQuestion(false);
      setCanRecordAnswer(true);
    };
    utterance.onerror = () => {
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
        <PageHeader
          eyebrow="Voice interview"
          title={currentInterview?.role ?? data?.interview?.role ?? "Interview session"}
          description="Listen to each question, answer in your own voice, and let the platform guide the conversation one turn at a time."
          meta={
            <>
              <span>Status {interviewStatus}</span>
              <span>{currentInterview?.questionCount ?? "--"} questions planned</span>
              <span>{currentQuestionNumber ?? "--"} current turn</span>
            </>
          }
          actions={
            <>
              <GlowButton type="button" variant="secondary" onClick={speakCurrentTurn}>
                <Play className="size-4" />
                Replay question
              </GlowButton>
              <GlowButton type="button" variant="secondary" onClick={() => void requestMediaAccess()}>
                <RefreshCw className="size-4" />
                Check devices
              </GlowButton>
            </>
          }
        />

        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <LoadingSkeleton className="h-[520px] w-full" />
            <LoadingSkeleton className="h-[520px] w-full" />
          </div>
        ) : isCompletedSession ? (
          <GlassCard className="rounded-[36px] p-8 sm:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">Session completed</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">This interview has already been completed.</h2>
              <p className="mt-4 text-slate-300">
                Your responses have been evaluated. Start another session to practice again, or return to your history to
                review previous interview runs.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <GlowButton href="/setup" className="px-5 py-3">
                  Start another session
                </GlowButton>
                <GlowButton href="/history" variant="secondary" className="px-5 py-3">
                  Back to history
                </GlowButton>
              </div>
            </div>
          </GlassCard>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <GlassCard className="relative overflow-hidden rounded-[36px] p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.14),transparent_50%)]" />
                <div className="relative flex h-[520px] flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-100">
                      <Bot className="size-4" />
                      Interviewer
                    </div>
                    <h2 className="mt-5 text-3xl font-semibold text-white">Live interview prompt</h2>
                    <p className="mt-3 max-w-lg text-sm leading-7 text-slate-300">
                      Each question is generated for your session, spoken aloud in the browser, and followed by your recorded response.
                    </p>
                  </div>

                  <div className="flex flex-1 items-center justify-center">
                    {currentTurn ? (
                      <div className="relative flex size-64 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-violet-500/20 via-slate-900 to-blue-500/20 shadow-[0_0_80px_rgba(99,102,241,0.25)]">
                        <div className="absolute inset-6 rounded-full border border-white/10 bg-slate-950/70" />
                        <div className="relative z-10 flex flex-col items-center gap-3">
                          <div className="rounded-full border border-violet-400/20 bg-violet-500/10 p-5 text-violet-200">
                            <Bot className={`size-16 ${isSpeakingQuestion ? "animate-pulse" : ""}`} />
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-white">
                              {isSpeakingQuestion ? "Speaking..." : canRecordAnswer ? "Your turn" : "Preparing..."}
                            </div>
                            <div className="mt-1 text-sm text-slate-400">
                              {currentTurn?.voiceMode ? "Voice mode enabled" : "Voice mode pending"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <StatePanel
                        icon={Volume2}
                        eyebrow="Waiting for the next prompt"
                        title="The next question is being prepared"
                        description="If the session has just started or resumed, give the backend a moment and then retry. Once the next turn is available, the question will be spoken automatically."
                        tone="warning"
                        className="w-full max-w-xl"
                        actions={
                          <GlowButton type="button" variant="secondary" onClick={() => void refetch()}>
                            <RefreshCw className="size-4" />
                            Refresh turn
                          </GlowButton>
                        }
                      />
                    )}
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
                        disabled={!currentTurn}
                      >
                        {showQuestionText ? "Hide text" : "Reveal text"}
                      </button>
                    </div>
                    {showQuestionText ? (
                      <div className="text-sm leading-7 text-slate-200">{questionText || "No text question available."}</div>
                    ) : (
                      <div className="text-sm text-slate-400">
                        Keep the focus on listening first. Reveal the text only if you need to review the wording.
                      </div>
                    )}
                    {speechError ? <div className="text-xs text-amber-300">{speechError}</div> : null}
                    {isError && !currentTurn ? <div className="text-xs text-amber-300">We also hit a sync issue while loading this turn.</div> : null}
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
                    {isCameraReady ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          className="h-full w-full object-cover"
                          onLoadedMetadata={() => {
                            void playCameraPreview();
                          }}
                          onCanPlay={() => {
                            void playCameraPreview();
                          }}
                          onPlaying={() => {
                            setIsVideoPreviewLive(true);
                          }}
                        />
                        {!isVideoPreviewLive ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55 backdrop-blur-sm">
                            <div className="text-center text-slate-300">
                              <RefreshCw className="mx-auto size-10 animate-spin text-cyan-200" />
                              <p className="mt-4 text-sm">Starting camera preview...</p>
                            </div>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center p-6">
                        <StatePanel
                          icon={VideoOff}
                          eyebrow="Camera unavailable"
                          title="Preview is not ready yet"
                          description="Allow camera access to see your live preview during the interview. You can still retry device setup if the browser blocked access."
                          tone={mediaError ? "warning" : "default"}
                          className="w-full"
                          contentClassName="p-6 text-center"
                          actions={
                            <GlowButton type="button" variant="secondary" onClick={() => void requestMediaAccess()}>
                              <RefreshCw className="size-4" />
                              Enable camera
                            </GlowButton>
                          }
                        />
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-100">
                      Camera {isVideoPreviewLive ? "live" : isCameraReady ? "starting" : "waiting"}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Microphone</div>
                      <div className="mt-2 text-white">{isMicrophoneReady ? "Connected and ready to record" : "Waiting for permission"}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Interview flow</div>
                      <div className="mt-2 text-white">
                        {isSpeakingQuestion
                          ? "Listening to question"
                          : submitVoiceAnswer.isPending
                            ? "Uploading answer"
                            : canRecordAnswer
                              ? "Ready for your answer"
                              : "Waiting for AI prompt"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <GlowButton
                      type="button"
                      className="h-14 justify-center"
                      onClick={() => void startRecording()}
                      disabled={isRecording || submitVoiceAnswer.isPending || isRequestingMedia || !canRecordAnswer || !isMediaReady}
                    >
                      <Mic className="size-4" />
                      {isRequestingMedia
                        ? "Checking devices..."
                        : isRecording
                          ? "Recording..."
                          : canRecordAnswer
                            ? "Start Answer"
                            : "Wait for AI"}
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
                    Once the question finishes, recording unlocks automatically so you can respond naturally and move straight into the next turn.
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

            {isError ? (
              <div className="mt-6">
                <StatePanel
                  icon={AlertTriangle}
                  eyebrow="Connection issue"
                  title="The interview session needs a refresh"
                  description="The backend may have timed out or cold-started. Retry to resync the current turn without losing the session."
                  tone="warning"
                  actions={
                    <GlowButton type="button" variant="secondary" onClick={() => void refetch()}>
                      <RefreshCw className="size-4" />
                      Retry session sync
                    </GlowButton>
                  }
                />
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
