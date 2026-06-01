"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

type BaseProps = {
  className?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

type GlowButtonProps =
  | (BaseProps & {
      href: string;
      onClick?: never;
    })
  | (BaseProps &
      HTMLMotionProps<"button"> & {
        href?: never;
      });

const sharedClassName =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold transition-all duration-300";

const variants = {
  primary:
    "bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 text-white shadow-[0_0_35px_rgba(99,102,241,0.45)] hover:shadow-[0_0_50px_rgba(99,102,241,0.65)]",
  secondary:
    "border border-white/12 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white"
};

export function GlowButton(props: GlowButtonProps) {
  const variant = props.variant ?? "primary";

  if ("href" in props && typeof props.href === "string") {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link href={props.href} className={cn(sharedClassName, variants[variant], props.className)}>
          {props.children}
        </Link>
      </motion.div>
    );
  }

  const { className, children, ...buttonProps } = props;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(sharedClassName, variants[variant], className)}
      {...buttonProps}
    >
      {children}
    </motion.button>
  );
}
