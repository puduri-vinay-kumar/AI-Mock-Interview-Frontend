"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { reportService } from "@/services/report.service";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";

export function useReport(id: string) {
  return useQuery({
    queryKey: ["reports", id],
    queryFn: () => reportService.getReport(id),
    enabled: Boolean(id)
  });
}

export function useUserReports() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["reports", "user", user?.id ?? user?._id],
    queryFn: () => reportService.getUserReports((user?.id ?? user?._id) as string),
    enabled: Boolean(user?.id ?? user?._id)
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["users", "profile"],
    queryFn: () => userService.getProfile()
  });
}

export function useHistory() {
  return useQuery({
    queryKey: ["users", "history"],
    queryFn: () => userService.getHistory()
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);
  const setSession = useAuthStore((state) => state.setSession);
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["users", "profile"], data);
      if (token) {
        setSession({
          token,
          user: data
        });
      }
      addToast({
        title: "Profile updated",
        description: "Your profile changes have been saved.",
        variant: "success"
      });
    },
    onError: (error) => {
      addToast({
        title: "Unable to update profile",
        description: error instanceof Error ? error.message : "Please retry.",
        variant: "error"
      });
    }
  });
}
