"use client";

import { LoadingSkeleton } from "@/components/system/loading-skeleton";
import { GlassCard } from "@/components/ui/glass-card";
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
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-200/80">Report</p>
          <h1 className="mt-3 text-4xl font-bold text-white">Interview analytics</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            This report is loaded directly from the live backend and rendered with premium loading states.
          </p>
        </div>

        {reportQuery.isLoading && !report ? (
          <div className="grid gap-6">
            <LoadingSkeleton className="h-44 w-full" />
            <div className="grid gap-6 md:grid-cols-3">
              <LoadingSkeleton className="h-36 w-full" />
              <LoadingSkeleton className="h-36 w-full" />
              <LoadingSkeleton className="h-36 w-full" />
            </div>
          </div>
        ) : report ? (
          <div className="grid gap-6">
            <GlassCard className="rounded-[32px] p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-sm uppercase tracking-[0.22em] text-slate-400">Overall score</div>
                  <div className="mt-3 text-6xl font-bold text-white">{overallScore ?? "--"}</div>
                </div>
                <div className="max-w-2xl text-sm leading-7 text-slate-300">
                  {summary ?? "Detailed backend-generated feedback will appear here after interview completion."}
                </div>
              </div>
            </GlassCard>

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
                <div className="mt-3 text-base text-white">{report.strengths?.join(", ") || "Pending"}</div>
              </GlassCard>
              <GlassCard className="rounded-[28px] p-6">
                <div className="text-sm text-slate-400">Weaknesses</div>
                <div className="mt-3 text-base text-white">{report.weaknesses?.join(", ") || "Pending"}</div>
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
                  {report.detailedAnalysis?.improvementPlan ?? "No improvement plan available yet."}
                </div>
              </GlassCard>
              <GlassCard className="rounded-[32px] p-8">
                <div className="text-xl font-semibold text-white">Recommendations</div>
                <div className="mt-4 space-y-2 text-sm leading-7 text-slate-300">
                  {(report.learningRecommendations ?? report.suggestedLearnings ?? []).length ? (
                    (report.learningRecommendations ?? report.suggestedLearnings ?? []).map((item) => (
                      <div key={item}>{item}</div>
                    ))
                  ) : (
                    <div>No recommendations available yet.</div>
                  )}
                </div>
              </GlassCard>
            </div>
          </div>
        ) : (
          <GlassCard className="rounded-[32px] p-8 text-slate-300">Unable to load this report.</GlassCard>
        )}
      </div>
    </section>
  );
}
