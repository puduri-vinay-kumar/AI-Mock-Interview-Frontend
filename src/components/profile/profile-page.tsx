"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { LoadingSkeleton } from "@/components/system/loading-skeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { useHistory, useProfile, useUpdateProfile } from "@/hooks/useReports";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required."),
  avatar: z.string().url("Use a valid image URL.").or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters.").or(z.literal(""))
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const profileQuery = useProfile();
  const historyQuery = useHistory();
  const updateProfile = useUpdateProfile();
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profileQuery.data?.name ?? "",
      avatar: profileQuery.data?.avatar ?? "",
      password: ""
    }
  });

  const onSubmit = async (values: ProfileValues) => {
    await updateProfile.mutateAsync({
      name: values.name,
      avatar: values.avatar || undefined,
      password: values.password || undefined
    });
    form.setValue("password", "");
  };

  return (
    <section className="container-shell pb-24 pt-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-200/80">Profile</p>
          <h1 className="mt-3 text-4xl font-bold text-white">Your interview workspace</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Manage your profile, review past sessions, and jump back into your latest reports.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <GlassCard className="rounded-[32px] p-6 sm:p-8">
            {profileQuery.isLoading ? (
              <div className="space-y-4">
                <LoadingSkeleton className="h-8 w-48" />
                <LoadingSkeleton className="h-14 w-full" />
                <LoadingSkeleton className="h-14 w-full" />
                <LoadingSkeleton className="h-14 w-full" />
              </div>
            ) : (
              <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
                <h2 className="text-2xl font-semibold text-white">Edit profile</h2>
                <label className="block space-y-2">
                  <span className="text-sm text-slate-200">Name</span>
                  <input
                    {...form.register("name")}
                    className="h-14 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm text-slate-100 outline-none"
                  />
                  {form.formState.errors.name ? (
                    <p className="text-sm text-rose-300">{form.formState.errors.name.message}</p>
                  ) : null}
                </label>
                <label className="block space-y-2">
                  <span className="text-sm text-slate-200">Avatar URL</span>
                  <input
                    {...form.register("avatar")}
                    className="h-14 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm text-slate-100 outline-none"
                  />
                  {form.formState.errors.avatar ? (
                    <p className="text-sm text-rose-300">{form.formState.errors.avatar.message}</p>
                  ) : null}
                </label>
                <label className="block space-y-2">
                  <span className="text-sm text-slate-200">New password</span>
                  <input
                    {...form.register("password")}
                    type="password"
                    className="h-14 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 text-sm text-slate-100 outline-none"
                  />
                  {form.formState.errors.password ? (
                    <p className="text-sm text-rose-300">{form.formState.errors.password.message}</p>
                  ) : null}
                </label>
                <GlowButton type="submit" className="h-14 px-8" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Saving..." : "Save profile"}
                </GlowButton>
              </form>
            )}
          </GlassCard>

          <GlassCard className="rounded-[32px] p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-white">Interview history</h2>
            <div className="mt-6 space-y-4">
              {historyQuery.isLoading ? (
                <>
                  <LoadingSkeleton className="h-24 w-full" />
                  <LoadingSkeleton className="h-24 w-full" />
                </>
              ) : historyQuery.data?.length ? (
                historyQuery.data.map((item) => (
                  <div key={item.id ?? item._id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-medium text-white">{item.role ?? "Interview session"}</div>
                        <div className="mt-1 text-sm text-slate-400">{item.interviewType ?? "Mixed round"}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-emerald-300">
                          Score: {item.score ?? item.overallScore ?? item.report?.overallScore ?? "--"}
                        </div>
                        {item.report?._id || item.reportId ? (
                          <Link
                            href={`/reports/${item.report?._id ?? item.reportId}`}
                            className="text-sm font-medium text-violet-200"
                          >
                            Open report
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No interview history yet. Start one from the setup page.</p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
