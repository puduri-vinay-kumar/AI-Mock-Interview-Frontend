"use client";

import Link from "next/link";
import { Mic, Send, Volume2, WandSparkles } from "lucide-react";
import { useState } from "react";

import { LoadingSkeleton } from "@/components/system/loading-skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { useAppendTranscript, useCompleteInterview, useInterview, useSubmitAnswer } from "@/hooks/useInterview";
import { voiceService } from "@/services/voice.service";
import { useUIStore } from "@/store/ui.store";

type InterviewRoomProps = {
  interviewId: string;
};

export function InterviewRoom({ interviewId }: InterviewRoomProps) {
  const addToast = useUIStore((state) => state.addToast);
  const interviewQuery = useInterview(interviewId);
  const submitAnswer = useSubmitAnswer(interviewId);
  const appendTranscript = useAppendTranscript(interviewId);
  const completeInterview = useCompleteInterview(interviewId);
  const [answer, setAnswer] = useState("");
  const [transcriptChunk, setTranscriptChunk] = useState("");
  const [voicePrompt, setVoicePrompt] = useState("Welcome to your AI mock interview.");
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const interview = interviewQuery.data;
  const transcript = interview?.liveTranscript ?? interview?.transcript ?? [];

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      return;
    }

    await submitAnswer.mutateAsync({
      answer,
      transcript: transcriptChunk || undefined
    });
    setAnswer("");
  };

  const handleAppendTranscript = async () => {
    if (!transcriptChunk.trim()) {
      return;
    }

    await appendTranscript.mutateAsync([{ speaker: "user", text: transcriptChunk }]);
    setTranscriptChunk("");
  };

  const handleSpeak = async () => {
    try {
      setIsSpeaking(true);
      const response = await voiceService.speak({ text: voicePrompt, voice: "Kore" });
      const audioUrl =
        typeof response === "object" && response !== null && "audioUrl" in response
          ? String(response.audioUrl)
          : typeof response === "object" && response !== null && "url" in response
            ? String(response.url)
            : null;
      setVoiceAudioUrl(audioUrl);
      addToast({
        title: "Voice response ready",
        description: audioUrl ? "The backend returned a playable audio URL." : "Voice synthesis completed.",
        variant: "success"
      });
    } catch (error) {
      addToast({
        title: "Voice generation failed",
        description: error instanceof Error ? error.message : "Unable to generate speech.",
        variant: "error"
      });
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleTranscribe = async (file: File | null) => {
    if (!file) {
      return;
    }

    try {
      setIsTranscribing(true);
      const response = await voiceService.transcribe(file, "Generate a transcript of the interview answer.");
      const text = response.transcript ?? response.text ?? "";
      if (text) {
        setTranscriptChunk(text);
      }
      addToast({
        title: "Audio transcribed",
        description: "The uploaded audio was processed by the backend.",
        variant: "success"
      });
    } catch (error) {
      addToast({
        title: "Transcription failed",
        description: error instanceof Error ? error.message : "Unable to transcribe audio.",
        variant: "error"
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <section className="container-shell pb-24 pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-200/80">Live interview</p>
            <h1 className="mt-3 text-4xl font-bold text-white">{interview?.role ?? "Interview session"}</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Submit answers, append transcript chunks, test voice flows, and complete the session to generate a report.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/coding" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
              Open coding evaluator
            </Link>
            <GlowButton type="button" onClick={() => completeInterview.mutate()} disabled={completeInterview.isPending}>
              {completeInterview.isPending ? "Completing..." : "Complete Interview"}
            </GlowButton>
          </div>
        </div>

        {interviewQuery.isLoading ? (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <LoadingSkeleton className="h-[520px] w-full" />
            <LoadingSkeleton className="h-[520px] w-full" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
              <GlassCard className="rounded-[32px] p-6">
                <h2 className="text-2xl font-semibold text-white">Questions</h2>
                <div className="mt-5 space-y-3">
                  {(interview?.questions ?? ["Tell me about yourself.", "What problem are you most proud of solving?"]).map(
                    (question, index) => (
                      <div key={`${question}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-200">
                        {index + 1}. {question}
                      </div>
                    )
                  )}
                </div>
              </GlassCard>

              <GlassCard className="rounded-[32px] p-6">
                <h2 className="text-2xl font-semibold text-white">Voice architecture</h2>
                <div className="mt-5 space-y-4">
                  <textarea
                    value={voicePrompt}
                    onChange={(event) => setVoicePrompt(event.target.value)}
                    className="min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none"
                  />
                  <div className="flex flex-wrap gap-3">
                    <GlowButton type="button" onClick={handleSpeak} disabled={isSpeaking}>
                      <Volume2 className="size-4" />
                      {isSpeaking ? "Generating..." : "Call /voice/speak"}
                    </GlowButton>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
                      <Mic className="size-4" />
                      {isTranscribing ? "Transcribing..." : "Upload audio for /voice/transcribe"}
                      <input type="file" accept="audio/*" className="hidden" onChange={(event) => void handleTranscribe(event.target.files?.[0] ?? null)} />
                    </label>
                  </div>
                  {voiceAudioUrl ? (
                    <audio controls className="w-full">
                      <source src={voiceAudioUrl} />
                    </audio>
                  ) : null}
                </div>
              </GlassCard>
            </div>

            <div className="space-y-6">
              <GlassCard className="rounded-[32px] p-6">
                <h2 className="text-2xl font-semibold text-white">Submit answer</h2>
                <textarea
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  className="mt-5 min-h-36 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none"
                  placeholder="Type your interview answer here..."
                />
                <div className="mt-4 flex justify-end">
                  <GlowButton type="button" onClick={handleSubmitAnswer} disabled={submitAnswer.isPending}>
                    <Send className="size-4" />
                    {submitAnswer.isPending ? "Submitting..." : "Submit Answer"}
                  </GlowButton>
                </div>
              </GlassCard>

              <GlassCard className="rounded-[32px] p-6">
                <h2 className="text-2xl font-semibold text-white">Transcript stream</h2>
                <textarea
                  value={transcriptChunk}
                  onChange={(event) => setTranscriptChunk(event.target.value)}
                  className="mt-5 min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none"
                  placeholder="Paste or transcribe the latest chunk..."
                />
                <div className="mt-4 flex justify-end">
                  <GlowButton type="button" variant="secondary" onClick={handleAppendTranscript} disabled={appendTranscript.isPending}>
                    <WandSparkles className="size-4" />
                    {appendTranscript.isPending ? "Syncing..." : "Append Transcript"}
                  </GlowButton>
                </div>
                <div className="mt-6 space-y-3">
                  {transcript.length ? (
                    transcript.map((entry, index) => (
                      <div key={`${entry.speaker}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
                        <div className="mb-1 text-xs uppercase tracking-[0.2em] text-slate-400">{entry.speaker}</div>
                        <div className="text-slate-100">{entry.text}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No transcript entries yet.</p>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
