"use client";

import { LoadingSkeleton } from "@/components/system/loading-skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { useReport } from "@/hooks/useReports";

type ReportPageProps = {
  reportId: string;
};

export function ReportPage({ reportId }: ReportPageProps) {
  const reportQuery = useReport(reportId);
  const metrics = reportQuery.data?.metrics ?? reportQuery.data?.analytics ?? [];

  return (
    <section className="container-shell pb-24 pt-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-200/80">Report</p>
          <h1 className="mt-3 text-4xl font-bold text-white">Interview analytics</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            This report is loaded directly from the live backend and rendered with premium loading states.
          </p>
        </div>

        {reportQuery.isLoading ? (
          <div className="grid gap-6">
            <LoadingSkeleton className="h-44 w-full" />
            <div className="grid gap-6 md:grid-cols-3">
              <LoadingSkeleton className="h-36 w-full" />
              <LoadingSkeleton className="h-36 w-full" />
              <LoadingSkeleton className="h-36 w-full" />
            </div>
          </div>
        ) : reportQuery.data ? (
          <div className="grid gap-6">
            <GlassCard className="rounded-[32px] p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-sm uppercase tracking-[0.22em] text-slate-400">Overall score</div>
                  <div className="mt-3 text-6xl font-bold text-white">{reportQuery.data.score ?? "--"}</div>
                </div>
                <div className="max-w-2xl text-sm leading-7 text-slate-300">
                  {reportQuery.data.summary ?? "Detailed backend-generated feedback will appear here after interview completion."}
                </div>
              </div>
            </GlassCard>

            <div className="grid gap-6 md:grid-cols-3">
              {metrics.length ? (
                metrics.map((metric) => (
                  <GlassCard key={metric.label} className="rounded-[28px] p-6">
                    <div className="text-sm text-slate-400">{metric.label}</div>
                    <div className="mt-3 text-3xl font-semibold text-white">{metric.value}</div>
                  </GlassCard>
                ))
              ) : (
                <>
                  <GlassCard className="rounded-[28px] p-6">
                    <div className="text-sm text-slate-400">Strengths</div>
                    <div className="mt-3 text-base text-white">{reportQuery.data.strengths?.join(", ") || "Pending"}</div>
                  </GlassCard>
                  <GlassCard className="rounded-[28px] p-6">
                    <div className="text-sm text-slate-400">Improvements</div>
                    <div className="mt-3 text-base text-white">{reportQuery.data.improvements?.join(", ") || "Pending"}</div>
                  </GlassCard>
                  <GlassCard className="rounded-[28px] p-6">
                    <div className="text-sm text-slate-400">Role</div>
                    <div className="mt-3 text-base text-white">{reportQuery.data.role ?? "Interview session"}</div>
                  </GlassCard>
                </>
              )}
            </div>
          </div>
        ) : (
          <GlassCard className="rounded-[32px] p-8 text-slate-300">Unable to load this report.</GlassCard>
        )}
      </div>
    </section>
  );
}
