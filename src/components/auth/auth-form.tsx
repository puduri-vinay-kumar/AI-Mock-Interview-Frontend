"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { LoaderCircle, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { useLogin, useRegister } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters.")
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters.")
});

type AuthFormProps = {
  mode: "login" | "register";
};

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function AuthForm({ mode }: AuthFormProps) {
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.setError);
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const isRegister = mode === "register";
  const mutation = isRegister ? registerMutation : loginMutation;

  const form = useForm<LoginValues | RegisterValues>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    defaultValues: isRegister
      ? { name: "", email: "", password: "" }
      : {
          email: "",
          password: ""
        }
  });
  const nameError = isRegister ? formErrorFromRegisterField("name", null) : null;

  const onSubmit = async (values: LoginValues | RegisterValues) => {
    clearError(null);

    try {
      if (isRegister) {
        await registerMutation.mutateAsync({
          ...(values as RegisterValues),
          role: "candidate"
        });
        return;
      }

      await loginMutation.mutateAsync(values as LoginValues);
    } catch {
      // The mutation onError handler already syncs the friendly message into the store.
      // Swallow the rejected promise here so Next does not surface a runtime overlay.
    }
  };

  function formErrorFromRegisterField(field: keyof RegisterValues, fallback: null) {
    const registerErrors = form.formState.errors as Partial<Record<keyof RegisterValues, { message?: string }>>;
    return registerErrors[field] ?? fallback;
  }

  return (
    <GlassCard className="w-full max-w-xl rounded-[32px] p-6 sm:p-8">
      <div className="mb-8 space-y-3">
        <div className="inline-flex rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3 text-violet-200">
          <ShieldCheck className="size-6" />
        </div>
        <h1 className="font-[var(--font-heading)] text-3xl font-bold text-white sm:text-4xl">
          {isRegister ? "Create your interview workspace" : "Welcome back"}
        </h1>
        <p className="text-sm leading-7 text-slate-300 sm:text-base">
          {isRegister
            ? "Create your account to start practicing voice-based mock interviews and track your progress."
            : "Sign in to continue your interview practice, review past sessions, and pick up where you left off."}
        </p>
      </div>

      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        {isRegister ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Full name</span>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-violet-300" />
              <input
                {...form.register("name")}
                className="h-14 w-full rounded-2xl border border-white/10 bg-slate-950/40 pl-12 pr-4 text-sm text-slate-100 outline-none transition focus:border-violet-400/60 focus:bg-slate-950/70"
                placeholder="Enter your full name"
              />
            </div>
            {nameError ? (
              <p className="text-sm text-rose-300">{nameError.message}</p>
            ) : null}
          </label>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Email address</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-violet-300" />
            <input
              {...form.register("email")}
              className="h-14 w-full rounded-2xl border border-white/10 bg-slate-950/40 pl-12 pr-4 text-sm text-slate-100 outline-none transition focus:border-violet-400/60 focus:bg-slate-950/70"
              placeholder="john@example.com"
              type="email"
            />
          </div>
          {form.formState.errors.email ? (
            <p className="text-sm text-rose-300">{form.formState.errors.email.message}</p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Password</span>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-violet-300" />
            <input
              {...form.register("password")}
              className="h-14 w-full rounded-2xl border border-white/10 bg-slate-950/40 pl-12 pr-4 text-sm text-slate-100 outline-none transition focus:border-violet-400/60 focus:bg-slate-950/70"
              placeholder="Enter your password"
              type="password"
            />
          </div>
          {form.formState.errors.password ? (
            <p className="text-sm text-rose-300">{form.formState.errors.password.message}</p>
          ) : null}
        </label>

        {storeError ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
          >
            {storeError}
          </motion.div>
        ) : null}

        <GlowButton
          type="submit"
          className="h-14 w-full justify-center text-base"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? <LoaderCircle className="size-5 animate-spin" /> : null}
          {isRegister ? "Create account" : "Sign in"}
        </GlowButton>
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        {isRegister ? "Already have an account?" : "Need an account?"}{" "}
        <Link href={isRegister ? "/login" : "/register"} className="font-medium text-violet-200 transition hover:text-white">
          {isRegister ? "Sign in" : "Create an account"}
        </Link>
      </div>
    </GlassCard>
  );
}
