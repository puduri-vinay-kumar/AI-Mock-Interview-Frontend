"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, OctagonAlert, X } from "lucide-react";
import { useEffect } from "react";

import { TOAST_TTL_MS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";

const iconMap = {
  success: CheckCircle2,
  error: OctagonAlert,
  info: Info
} as const;

export function ToastRegion() {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  useEffect(() => {
    if (!toasts.length) {
      return;
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        removeToast(toast.id);
      }, TOAST_TTL_MS)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [removeToast, toasts]);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.variant];

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className={cn(
                "pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_20px_60px_rgba(2,6,23,0.45)] backdrop-blur-xl",
                toast.variant === "success" && "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
                toast.variant === "error" && "border-rose-400/20 bg-rose-500/10 text-rose-100",
                toast.variant === "info" && "border-violet-400/20 bg-violet-500/10 text-violet-100"
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 size-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{toast.title}</div>
                  {toast.description ? <div className="mt-1 text-sm opacity-90">{toast.description}</div> : null}
                </div>
                <button
                  className="rounded-full p-1 opacity-80 transition hover:bg-white/10 hover:opacity-100"
                  onClick={() => removeToast(toast.id)}
                >
                  <X className="size-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
