"use client";

import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";

import { GlowButton } from "@/components/ui/glow-button";
import { GlassCard } from "@/components/ui/glass-card";
import { heroStats } from "@/data/mock";

export function HeroSection() {
  return (
    <section className="container-shell relative overflow-hidden pb-20 pt-12 sm:pb-24 sm:pt-16 lg:pb-28">
      <div className="absolute inset-y-20 right-0 hidden w-[34rem] rounded-full bg-violet-500/10 blur-[140px] lg:block" />

      <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.7, ease: "easeOut" }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-100 shadow-[0_0_25px_rgba(99,102,241,0.12)]"
          >
            <Sparkles className="size-4" />
            AI-powered interview practice
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl font-[var(--font-heading)] text-5xl font-bold leading-[1.02] text-white sm:text-6xl lg:text-7xl"
          >
            Practice Smarter.
            <br />
            <span className="text-gradient">Get Hired Faster.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}
            className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl"
          >
            Practice realistic interviews with AI-led questions, voice-based responses, and structured feedback that
            helps you improve with every session.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: "easeOut" }}
            className="mt-8 flex flex-col gap-4 sm:flex-row"
          >
            <GlowButton href="/setup" className="px-7 py-4 text-base">
              Start Interview
              <ArrowRight className="size-4" />
            </GlowButton>
            <GlowButton href="#how-it-works" variant="secondary" className="px-7 py-4 text-base">
              <PlayCircle className="size-4" />
              Watch Demo
            </GlowButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7, ease: "easeOut" }}
            className="mt-10 flex items-center gap-5"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="flex size-12 items-center justify-center rounded-full border-2 border-slate-950 bg-gradient-to-br from-violet-400 to-blue-400 text-sm font-semibold text-white"
                >
                  {String.fromCharCode(64 + index)}
                </div>
              ))}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Built for serious interview preparation</div>
              <div className="text-sm text-slate-400">Role-specific practice, voice rounds, and clear post-interview review.</div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-[620px]"
        >
          <div className="absolute left-6 top-16 h-24 w-24 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-12 right-10 h-28 w-28 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative flex min-h-[560px] items-center justify-center">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute left-0 top-10 hidden w-48 md:block"
            >
              <GlassCard className="p-4">
                <div className="text-sm text-slate-300">How can I help you today?</div>
                <div className="mt-3 h-1.5 w-14 rounded-full bg-gradient-to-r from-violet-400 to-blue-400" />
              </GlassCard>
            </motion.div>

            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute right-0 top-20 hidden w-48 md:block"
            >
              <GlassCard className="p-4">
                <div className="mb-3 text-sm font-medium text-white">Feedback</div>
                <div className="space-y-2 text-sm text-slate-300">
                  <div>Communication</div>
                  <div>Problem Solving</div>
                  <div>Confidence</div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute left-4 top-64 hidden w-56 md:block"
            >
              <GlassCard className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    <span className="h-6 w-3 rounded-full bg-violet-500/70" />
                    <span className="h-10 w-3 rounded-full bg-fuchsia-500/70" />
                    <span className="h-14 w-3 rounded-full bg-blue-500/70" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-300">Performance</div>
                    <div className="text-3xl font-bold text-emerald-300">85%</div>
                  </div>
                </div>
                <div className="text-sm text-slate-400">Good job. Confidence score increased.</div>
              </GlassCard>
            </motion.div>

            <div className="relative">
              <div className="absolute inset-x-8 bottom-1 h-16 rounded-full bg-violet-500/20 blur-3xl" />
              <div className="relative mx-auto flex h-[400px] w-[300px] flex-col items-center">
                <div className="relative mt-2 flex h-56 w-56 items-center justify-center rounded-[44%] border border-white/20 bg-gradient-to-br from-white via-slate-100 to-slate-300 shadow-[0_0_60px_rgba(255,255,255,0.15)]">
                  <div className="absolute -top-10 h-10 w-1.5 rounded-full bg-gradient-to-b from-blue-300 to-violet-400" />
                  <div className="absolute -top-12 size-5 rounded-full bg-blue-300 shadow-[0_0_25px_rgba(96,165,250,0.65)]" />
                  <div className="absolute inset-[16%] rounded-[34%] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-[inset_0_0_40px_rgba(59,130,246,0.22)]" />
                  <div className="absolute left-12 top-[46%] h-5 w-10 rounded-full border-b-[5px] border-cyan-300" />
                  <div className="absolute right-12 top-[46%] h-5 w-10 rounded-full border-b-[5px] border-cyan-300" />
                  <div className="absolute bottom-12 h-7 w-16 rounded-b-full border-b-[5px] border-cyan-300" />
                  <div className="absolute -left-5 top-1/2 h-24 w-10 -translate-y-1/2 rounded-full border border-white/20 bg-gradient-to-br from-slate-200 to-slate-400" />
                  <div className="absolute -right-5 top-1/2 h-24 w-10 -translate-y-1/2 rounded-full border border-white/20 bg-gradient-to-br from-slate-200 to-slate-400" />
                </div>

                <div className="relative mt-[-8px] h-24 w-40 rounded-[40%] border border-white/15 bg-gradient-to-b from-slate-100 to-slate-300 shadow-[0_0_40px_rgba(255,255,255,0.1)]" />
                <div className="relative mt-[-12px] flex h-40 w-64 items-center justify-center rounded-[32px] border border-white/15 bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 shadow-[0_0_50px_rgba(255,255,255,0.08)]">
                  <div className="absolute bottom-0 left-1/2 h-10 w-36 -translate-x-1/2 rounded-t-full bg-slate-900/10 blur-xl" />
                  <div className="absolute inset-x-6 bottom-[-26px] h-10 rounded-[24px] bg-gradient-to-r from-violet-600 to-blue-600 blur-2xl opacity-70" />
                </div>
                <div className="mt-10 h-10 w-[340px] rounded-full bg-gradient-to-r from-violet-500/15 via-blue-500/20 to-violet-500/15 blur-xl" />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <GlassCard key={stat.title} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-slate-400">{stat.title}</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{stat.value}</div>
                    <div className="mt-2 text-xs leading-5 text-slate-400">{stat.detail}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-violet-200">
                    <stat.icon className="size-5" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
