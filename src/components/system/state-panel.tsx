import type { LucideIcon } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

type StatePanelProps = {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: string | null;
  actions?: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
  className?: string;
  contentClassName?: string;
  iconClassName?: string;
};

const toneStyles = {
  default: {
    glow: "from-violet-500/16 via-blue-500/10 to-transparent",
    iconWrap: "border-violet-400/20 bg-violet-500/10 text-violet-100",
    eyebrow: "text-violet-200/80"
  },
  success: {
    glow: "from-emerald-500/16 via-cyan-500/10 to-transparent",
    iconWrap: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
    eyebrow: "text-emerald-200/80"
  },
  warning: {
    glow: "from-amber-500/16 via-orange-500/10 to-transparent",
    iconWrap: "border-amber-400/20 bg-amber-500/10 text-amber-100",
    eyebrow: "text-amber-200/80"
  },
  danger: {
    glow: "from-rose-500/16 via-fuchsia-500/10 to-transparent",
    iconWrap: "border-rose-400/20 bg-rose-500/10 text-rose-100",
    eyebrow: "text-rose-200/80"
  }
} as const;

export function StatePanel({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
  tone = "default",
  className,
  contentClassName,
  iconClassName
}: StatePanelProps) {
  const styles = toneStyles[tone];

  return (
    <GlassCard className={cn("relative overflow-hidden rounded-[32px]", className)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", styles.glow)} />
      <div className={cn("relative p-8 sm:p-10", contentClassName)}>
        <div
          className={cn(
            "inline-flex rounded-2xl border p-3 shadow-[0_10px_30px_rgba(15,23,42,0.2)]",
            styles.iconWrap
          )}
        >
          <Icon className={cn("size-6", iconClassName)} />
        </div>
        {eyebrow ? (
          <p className={cn("mt-5 text-xs font-semibold uppercase tracking-[0.24em]", styles.eyebrow)}>{eyebrow}</p>
        ) : null}
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{description}</p>
        ) : null}
        {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </GlassCard>
  );
}
