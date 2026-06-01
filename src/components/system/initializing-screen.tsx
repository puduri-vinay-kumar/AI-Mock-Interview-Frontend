"use client";

import { LoaderCircle } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";

type InitializingScreenProps = {
  title?: string;
  description?: string | null;
};

export function InitializingScreen({
  title = "Initializing your session",
  description = "We’re reconnecting to the backend and restoring your workspace."
}: InitializingScreenProps) {
  return (
    <div className="container-shell flex min-h-[60vh] items-center justify-center py-16">
      <GlassCard className="max-w-lg rounded-[32px] p-8 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-200">
          <LoaderCircle className="size-8 animate-spin" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
      </GlassCard>
    </div>
  );
}
