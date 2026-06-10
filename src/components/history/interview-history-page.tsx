"use client";

import Link from "next/link";

import { LoadingSkeleton } from "@/components/system/loading-skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { useInterviewHistory } from "@/hooks/useInterview";

export function InterviewHistoryPage() {
  const historyQuery = useInterviewHistory();

  return (
    <section className="container-shell pb-24 pt-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-200/80">History</p>
          <h1 className="mt-3 text-4xl font-bold text-white">Interview sessions</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            This screen is powered by the live `GET /api/interviews/history` endpoint and links each session back into
            the interview room.
          </p>
        </div>

        <GlassCard className="rounded-[32px] p-6 sm:p-8">
          <div className="space-y-4">
            {historyQuery.isLoading ? (
              <>
                <LoadingSkeleton className="h-24 w-full" />
                <LoadingSkeleton className="h-24 w-full" />
                <LoadingSkeleton className="h-24 w-full" />
              </>
            ) : historyQuery.data?.length ? (
              historyQuery.data.map((item) => {
                const interviewId = item.id ?? item._id ?? "";

                return (
                  <div key={interviewId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="text-lg font-semibold text-white">{item.role ?? "Interview session"}</div>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-400">
                          <span>{item.interviewType ?? "Mixed"}</span>
                          <span>{item.experienceLevel ?? "General"}</span>
                          <span>{item.status ?? "scheduled"}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/interview/${interviewId}`}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100"
                        >
                          Open interview
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-400">No interview sessions found yet.</p>
            )}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
