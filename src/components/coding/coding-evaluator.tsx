"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { OnMount } from "@monaco-editor/react";

import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { codingService } from "@/services/coding.service";
import { useUIStore } from "@/store/ui.store";
import type { CodingEvaluationResult, CodingLanguage } from "@/types/coding.types";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const starterCode: Record<CodingLanguage, string> = {
  javascript: "function solve(a, b) {\n  return a + b;\n}",
  python: "def solve(a, b):\n    return a + b",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  return 0;\n}",
  java: "class Main {\n  public static void main(String[] args) {\n  }\n}"
};

export function CodingEvaluator() {
  const addToast = useUIStore((state) => state.addToast);
  const [language, setLanguage] = useState<CodingLanguage>("javascript");
  const [code, setCode] = useState(starterCode.javascript);
  const [result, setResult] = useState<CodingEvaluationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEvaluate = async () => {
    try {
      setIsSubmitting(true);
      const response = await codingService.evaluate({
        language,
        code,
        testCases: [
          { input: "1 2", expected: "3" },
          { input: "4 6", expected: "10" }
        ]
      });
      setResult(response);
      addToast({
        title: "Code evaluated",
        description: "The backend returned your coding evaluation successfully.",
        variant: "success"
      });
    } catch (error) {
      addToast({
        title: "Evaluation failed",
        description: error instanceof Error ? error.message : "Unable to evaluate code.",
        variant: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditorMount: OnMount = () => {
    setCode(starterCode[language]);
  };

  return (
    <section className="container-shell pb-24 pt-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-200/80">Coding</p>
          <h1 className="mt-3 text-4xl font-bold text-white">Backend-connected coding evaluation</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Monaco is wired to the deployed `/api/coding/evaluate` endpoint with live submission and result rendering.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <GlassCard className="rounded-[32px] p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <select
                value={language}
                onChange={(event) => {
                  const nextLanguage = event.target.value as CodingLanguage;
                  setLanguage(nextLanguage);
                  setCode(starterCode[nextLanguage]);
                }}
                className="h-12 rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm text-slate-100"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
              <GlowButton type="button" className="h-12 px-6" disabled={isSubmitting} onClick={handleEvaluate}>
                {isSubmitting ? "Evaluating..." : "Evaluate Code"}
              </GlowButton>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-white/10">
              <MonacoEditor
                height="520px"
                defaultLanguage={language}
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value ?? "")}
                onMount={handleEditorMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false
                }}
              />
            </div>
          </GlassCard>

          <GlassCard className="rounded-[32px] p-6">
            <h2 className="text-2xl font-semibold text-white">Evaluation output</h2>
            {result ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-sm text-slate-400">Score</div>
                  <div className="mt-2 text-4xl font-bold text-white">{result.score ?? "--"}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-sm text-slate-400">Feedback</div>
                  <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-200">
                    {result.feedback ?? "No feedback provided by the backend."}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-sm text-slate-400">Result summary</div>
                  <div className="mt-2 text-sm text-slate-200">
                    Passed {result.passed ?? 0} / {result.total ?? result.results?.length ?? 0}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm leading-7 text-slate-400">
                Submit code to see score, evaluation notes, and backend-generated result feedback.
              </p>
            )}
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
