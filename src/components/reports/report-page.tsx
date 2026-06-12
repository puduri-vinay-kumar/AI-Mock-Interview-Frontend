"use client";

import Link from "next/link";
import { AlertTriangle, BrainCircuit, CheckCircle2, RefreshCw, Target } from "lucide-react";

import { PageHeader } from "@/components/system/page-header";
import { LoadingSkeleton } from "@/components/system/loading-skeleton";
import { StatePanel } from "@/components/system/state-panel";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { useReport } from "@/hooks/useReports";
import { useInterviewStore } from "@/store/interview.store";
import type { InterviewReport } from "@/types/report.types";

type ReportPageProps = {
  reportId: string;
};

export function ReportPage({ reportId }: ReportPageProps) {
  const reportQuery = useReport(reportId);
  const finalReport = useInterviewStore((state) => state.finalReport);
  const report = (reportQuery.data ?? finalReport) as InterviewReport | null;
  const overallScore = report?.overallScore;
  const summary = report?.detailedAnalysis?.summary;
  const strengths = report?.strengths ?? [];
  const weaknesses = report?.weaknesses ?? [];
  const recommendations = report?.learningRecommendations ?? report?.suggestedLearnings ?? [];
  const role =
    report?.role ??
    (typeof report?.interviewId === "object" && report.interviewId !== null ? report.interviewId.role : undefined);
  const interviewType =
    report?.interviewType ??
    (typeof report?.interviewId === "object" && report.interviewId !== null ? report.interviewId.interviewType : undefined);
  const radarMetrics = report?.radarMetrics
    ? [
        { label: "Technical Knowledge", value: report.radarMetrics.technicalKnowledge ?? 0 },
        { label: "Communication", value: report.radarMetrics.communication ?? 0 },
        { label: "Confidence", value: report.radarMetrics.confidence ?? 0 },
        { label: "Problem Solving", value: report.radarMetrics.problemSolving ?? 0 },
        { label: "Conceptual Clarity", value: report.radarMetrics.conceptualClarity ?? 0 }
      ]
    : [
        { label: "Technical Knowledge", value: report?.technicalKnowledge ?? 0 },
        { label: "Communication", value: report?.communication ?? 0 },
        { label: "Confidence", value: report?.confidence ?? 0 },
        { label: "Problem Solving", value: report?.problemSolving ?? 0 },
        { label: "Conceptual Clarity", value: report?.conceptualClarity ?? 0 }
      ];

  return (
    <section className="container-shell pb-24 pt-10">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          eyebrow="Report"
          title="Interview report"
          description="Review your overall performance, topic-level feedback, and the areas that deserve more practice before your next round."
          actions={
            <>
              <GlowButton href="/setup" className="px-5 py-3">
                Practice again
              </GlowButton>
              <Link
                href="/history"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                Back to history
              </Link>
            </>
          }
        />

        {reportQuery.isLoading && !report ? (
          <div className="grid gap-6">
            <LoadingSkeleton className="h-44 w-full" />
            <div className="grid gap-6 md:grid-cols-3">
              <LoadingSkeleton className="h-36 w-full" />
              <LoadingSkeleton className="h-36 w-full" />
              <LoadingSkeleton className="h-36 w-full" />
            </div>
          </div>
        ) : reportQuery.isError && !report ? (
          <StatePanel
            icon={AlertTriangle}
            eyebrow="Report unavailable"
            title="We couldn’t load this interview report"
            description="The report may still be generating, or the backend may need a moment to respond. Retry the request or return to your history."
            tone="warning"
            actions={
              <>
                <GlowButton type="button" variant="secondary" onClick={() => void reportQuery.refetch()}>
                  <RefreshCw className="size-4" />
                  Retry loading
                </GlowButton>
                <GlowButton href="/history" className="px-5 py-3">
                  Back to history
                </GlowButton>
              </>
            }
          />
        ) : report ? (
          <div className="grid gap-6">
            <GlassCard className="rounded-[32px] p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-sm uppercase tracking-[0.22em] text-slate-400">Overall score</div>
                  <div className="mt-3 text-6xl font-bold text-white">{overallScore ?? "--"}</div>
                </div>
                <div className="max-w-2xl text-sm leading-7 text-slate-300">
                  {summary ?? "A summary of this session will appear here once the report is available."}
                </div>
              </div>
            </GlassCard>

            <div className="grid gap-6 md:grid-cols-3">
              <GlassCard className="rounded-[28px] p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3 text-violet-200">
                    <BrainCircuit className="size-5" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Role focus</div>
                    <div className="mt-2 text-xl font-semibold text-white">{role ?? "Interview session"}</div>
                    <div className="mt-1 text-sm text-slate-400">{interviewType ?? "Voice round"}</div>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="rounded-[28px] p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-emerald-200">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Strongest signals</div>
                    <div className="mt-2 text-base text-white">
                      {strengths.length ? strengths.slice(0, 2).join(", ") : "Waiting for strength highlights"}
                    </div>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="rounded-[28px] p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-cyan-200">
                    <Target className="size-5" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Top improvement area</div>
                    <div className="mt-2 text-base text-white">
                      {weaknesses.length ? weaknesses[0] : "Improvement areas will appear here"}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {radarMetrics.map((metric) => (
                <GlassCard key={metric.label} className="rounded-[28px] p-6">
                  <div className="text-sm text-slate-400">{metric.label}</div>
                  <div className="mt-3 text-3xl font-semibold text-white">{metric.value}</div>
                </GlassCard>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <GlassCard className="rounded-[28px] p-6">
                <div className="text-sm text-slate-400">Strengths</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {strengths.length ? (
                    strengths.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <div className="text-base text-white">Pending</div>
                  )}
                </div>
              </GlassCard>
              <GlassCard className="rounded-[28px] p-6">
                <div className="text-sm text-slate-400">Weaknesses</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {weaknesses.length ? (
                    weaknesses.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs text-rose-100"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <div className="text-base text-white">Pending</div>
                  )}
                </div>
              </GlassCard>
              <GlassCard className="rounded-[28px] p-6">
                <div className="text-sm text-slate-400">Interview</div>
                <div className="mt-3 text-base text-white">{role ?? "Interview session"}</div>
                <div className="mt-1 text-sm text-slate-400">{interviewType ?? "Voice round"}</div>
              </GlassCard>
            </div>

            {report.topicScores?.length ? (
              <GlassCard className="rounded-[32px] p-8">
                <div className="text-xl font-semibold text-white">Topic breakdown</div>
                <div className="mt-6 grid gap-4">
                  {report.topicScores.map((topicScore) => (
                    <div key={`${topicScore.topic}-${topicScore.score}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="font-medium text-white">{topicScore.topic}</div>
                        <div className="text-sm text-violet-200">{topicScore.score}</div>
                      </div>
                      {topicScore.comments ? <div className="mt-2 text-sm text-slate-400">{topicScore.comments}</div> : null}
                    </div>
                  ))}
                </div>
              </GlassCard>
            ) : null}

            <div className="grid gap-6 md:grid-cols-2">
              <GlassCard className="rounded-[32px] p-8">
                <div className="text-xl font-semibold text-white">Improvement plan</div>
                <div className="mt-4 text-sm leading-7 text-slate-300">
                  {report.detailedAnalysis?.improvementPlan ?? "No improvement plan is available for this session yet."}
                </div>
              </GlassCard>
              <GlassCard className="rounded-[32px] p-8">
                <div className="text-xl font-semibold text-white">Recommendations</div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                  {recommendations.length ? (
                    recommendations.map((item) => (
                      <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                        {item}
                      </div>
                    ))
                  ) : (
                    <div>No recommendations are available for this session yet.</div>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        ) : (
          <StatePanel
            icon={AlertTriangle}
            eyebrow="No report data"
            title="This report is not ready yet"
            description="Return to your session history and open another completed interview, or retry once the report finishes generating."
            tone="warning"
          />
        )}
      </div>
    </section>
  );
}
