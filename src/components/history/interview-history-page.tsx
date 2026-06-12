"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, History, RefreshCw } from "lucide-react";

import { LoadingSkeleton } from "@/components/system/loading-skeleton";
import { PageHeader } from "@/components/system/page-header";
import { StatePanel } from "@/components/system/state-panel";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { useInterviewHistory } from "@/hooks/useInterview";

export function InterviewHistoryPage() {
  const historyQuery = useInterviewHistory();

  return (
    <section className="container-shell pb-24 pt-10">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          eyebrow="History"
          title="Interview sessions"
          description="Review previous sessions, reopen unfinished interviews, and keep track of how your preparation is progressing."
          actions={
            <GlowButton href="/setup" className="px-5 py-3">
              New practice session
            </GlowButton>
          }
        />

        <GlassCard className="rounded-[32px] p-6 sm:p-8">
          <div className="space-y-4">
            {historyQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 space-y-3">
                      <LoadingSkeleton className="h-7 w-56" />
                      <LoadingSkeleton className="h-5 w-full max-w-md" />
                    </div>
                    <LoadingSkeleton className="h-12 w-36" />
                  </div>
                </div>
              ))
            ) : historyQuery.isError ? (
              <StatePanel
                icon={AlertTriangle}
                eyebrow="History unavailable"
                title="We couldn’t load your interview history"
                description="The backend may still be waking up, or the request may have failed temporarily. Retry to fetch your latest sessions."
                tone="warning"
                actions={
                  <GlowButton type="button" variant="secondary" onClick={() => void historyQuery.refetch()}>
                    <RefreshCw className="size-4" />
                    Retry loading
                  </GlowButton>
                }
              />
            ) : historyQuery.data?.length ? (
              historyQuery.data.map((item) => {
                const interviewId = item.id ?? item._id ?? "";
                const status = String(item.status ?? "scheduled");
                const questionCount = item.questionCount ?? "--";
                const overallScore =
                  typeof item.scores === "object" && item.scores && "overallScore" in item.scores
                    ? String((item.scores as { overallScore?: number }).overallScore ?? "--")
                    : "--";

                return (
                  <div key={interviewId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="text-lg font-semibold text-white">{item.role ?? "Interview session"}</div>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                            {status}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-400">
                          <span>{item.interviewType ?? "Mixed"}</span>
                          <span>{item.experienceLevel ?? "General"}</span>
                          <span>{questionCount} questions</span>
                          <span>Score {overallScore}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/interview/${interviewId}`}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10"
                        >
                          <ArrowRight className="size-4" />
                          {status === "completed" ? "Review session" : "Resume session"}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <StatePanel
                icon={History}
                eyebrow="No sessions yet"
                title="Your practice timeline will appear here"
                description="Start your first interview to build a searchable history of sessions, feedback, and report links."
                actions={
                  <GlowButton href="/setup" className="px-5 py-3">
                    Start practicing
                  </GlowButton>
                }
              />
            )}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
