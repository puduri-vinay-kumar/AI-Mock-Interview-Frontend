"use client";

import { motion } from "framer-motion";

import { GlassCard } from "@/components/ui/glass-card";
import type { Feature } from "@/data/mock";

type FeatureCardProps = Feature;

export function FeatureCard({ title, description, icon: Icon, accent }: FeatureCardProps) {
  return (
    <motion.div whileHover={{ y: -8, scale: 1.01 }} transition={{ duration: 0.25 }}>
      <GlassCard className="group relative h-full overflow-hidden rounded-[28px] p-6">
        <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
        <div className="relative z-10">
          <div className="mb-5 inline-flex rounded-2xl border border-white/10 bg-white/10 p-4 text-white shadow-[0_0_25px_rgba(99,102,241,0.18)]">
            <Icon className="size-6" />
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
        </div>
      </GlassCard>
    </motion.div>
  );
}
