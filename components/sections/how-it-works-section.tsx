"use client";

import { motion } from "framer-motion";
import { AudioLines, FileText, MicVocal, Trophy } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";

const steps = [
  {
    title: "Set your interview",
    description: "Choose the role, round type, and question count you want to practice before the session begins.",
    icon: FileText
  },
  {
    title: "Listen to the prompt",
    description: "Each question is generated for your session and spoken aloud so the experience feels conversational.",
    icon: AudioLines
  },
  {
    title: "Respond by voice",
    description: "Answer naturally through your microphone while the platform records and submits your response.",
    icon: MicVocal
  },
  {
    title: "Review the report",
    description: "See your score, strengths, weak points, and topic-level recommendations after the interview finishes.",
    icon: Trophy
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="container-shell pb-24">
      <div className="mb-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-200/80">How it works</p>
        <h2 className="mt-4 font-[var(--font-heading)] text-3xl font-bold text-white sm:text-4xl">
          A simple loop designed for focused improvement.
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-300">
          The platform is built around one clear cycle: prepare, answer, review, and improve. Every screen exists to
          support that flow without adding noise.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, delay: index * 0.08 }}
          >
            <GlassCard className="relative h-full rounded-[30px] p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-violet-100">
                  <step.icon className="size-5" />
                </div>
                <div className="text-sm font-semibold text-slate-500">0{index + 1}</div>
              </div>
              <h3 className="text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{step.description}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
