"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import type { ApiErrorLike } from "@/types/api.types";
import type { LoginInput, RegisterInput } from "@/types/auth.types";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return (error as ApiErrorLike).message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export function useLogin() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const setError = useAuthStore((state) => state.setError);

  return useMutation({
    mutationFn: (payload: LoginInput) => authService.login(payload),
    onSuccess: (payload) => {
      setSession(payload);
      router.push("/setup");
    },
    onError: (error) => {
      setError(getErrorMessage(error) || "Unable to sign in.");
    }
  });
}

export function useRegister() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const setError = useAuthStore((state) => state.setError);

  return useMutation({
    mutationFn: (payload: RegisterInput) => authService.register(payload),
    onSuccess: (payload) => {
      setSession(payload);
      router.push("/setup");
    },
    onError: (error) => {
      setError(getErrorMessage(error) || "Unable to create your account.");
    }
  });
}

export function useLogout() {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  return () => {
    clearSession();
    router.push("/login");
  };
}
