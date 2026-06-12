import { cn } from "@/lib/utils";

type LoadingSkeletonProps = {
  className?: string;
};

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl bg-white/[0.06]", className)}
      aria-hidden="true"
    >
      <div className="absolute inset-0 animate-pulse bg-white/[0.03]" />
      <div className="skeleton-shimmer absolute inset-y-0 -left-1/2 w-1/2" />
    </div>
  );
}
