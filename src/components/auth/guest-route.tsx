"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/store/auth.store";

type GuestRouteProps = {
  children: React.ReactNode;
};

export function GuestRoute({ children }: GuestRouteProps) {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);

  useEffect(() => {
    if (isHydrated && status === "authenticated") {
      router.replace("/setup");
    }
  }, [isHydrated, router, status]);

  if (!isHydrated) {
    return null;
  }

  if (status === "authenticated") {
    return null;
  }

  return <>{children}</>;
}
