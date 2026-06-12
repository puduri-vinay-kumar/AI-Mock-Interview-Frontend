"use client";

import { CheckCircle2 } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";

const points = [
  "Voice-first interviews that feel closer to real hiring conversations",
  "Role-based practice sessions with structured post-interview review",
  "A consistent flow from setup to interview to performance reporting"
];

export function AboutSection() {
  return (
    <section id="about" className="container-shell pb-28">
      <GlassCard className="rounded-[36px] px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-200/80">About the platform</p>
            <h2 className="mt-4 font-[var(--font-heading)] text-3xl font-bold text-white sm:text-4xl">
              Built to make interview practice more realistic and more useful.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              AI Interview is designed for candidates who want more than a question bank. It combines guided setup,
              spoken interview prompts, voice-based responses, and structured reports into one product experience.
            </p>
          </div>

          <div className="space-y-4">
            {points.map((point) => (
              <div key={point} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-300" />
                <p className="text-sm leading-7 text-slate-200">{point}</p>
              </div>
            ))}
            <div className="pt-2">
              <GlowButton href="/setup" className="px-6 py-3">
                Start a practice session
              </GlowButton>
            </div>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
