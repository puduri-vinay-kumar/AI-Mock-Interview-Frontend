"use client";

import { motion } from "framer-motion";

import { FeatureCard } from "@/components/ui/feature-card";
import { GlassCard } from "@/components/ui/glass-card";
import { features } from "@/data/mock";

export function FeatureGrid() {
  return (
    <section id="features" className="container-shell pb-24">
      <GlassCard className="rounded-[36px] px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-200/80">Why choose AI Interview</p>
          <h2 className="mt-4 font-[var(--font-heading)] text-3xl font-bold sm:text-4xl">
            Premium interview preparation, built to feel like a real product.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            This frontend foundation sets the tone for a futuristic AI interview experience with polished motion,
            reusable building blocks, and product-grade visual consistency.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </section>
  );
}
