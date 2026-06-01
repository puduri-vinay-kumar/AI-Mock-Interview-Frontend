import { cn } from "@/lib/utils";

type GlassCardProps = React.HTMLAttributes<HTMLDivElement>;

export function GlassCard({ className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-panel surface-gradient rounded-[28px] border-white/10 shadow-[0_24px_80px_rgba(15,23,42,0.45)]",
        className
      )}
      {...props}
    />
  );
}
