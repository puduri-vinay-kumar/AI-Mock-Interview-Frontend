"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { InitializingScreen } from "@/components/system/initializing-screen";
import { useAuthStore } from "@/store/auth.store";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const bootstrapMessage = useAuthStore((state) => state.bootstrapMessage);

  useEffect(() => {
    if (isHydrated && status !== "authenticated") {
      router.replace("/login");
    }
  }, [isHydrated, router, status]);

  if (!isHydrated) {
    return <InitializingScreen description={bootstrapMessage} />;
  }

  if (status === "authenticated") {
    return <>{children}</>;
  }

  if (isBootstrapping) {
    return <InitializingScreen description={bootstrapMessage} />;
  }

  return null;
}
