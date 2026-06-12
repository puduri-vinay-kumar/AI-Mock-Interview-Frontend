"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Clock3, RefreshCw, UserRoundCog } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { LoadingSkeleton } from "@/components/system/loading-skeleton";
import { PageHeader } from "@/components/system/page-header";
import { StatePanel } from "@/components/system/state-panel";
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
        <PageHeader
          eyebrow="Profile"
          title="Your interview workspace"
          description="Manage your account details, review recent sessions, and revisit your latest performance reports."
          meta={
            <>
              <span>{profileQuery.data?.interviewsAttempted ?? 0} sessions completed</span>
              <span>Average score {profileQuery.data?.averageScore ?? "--"}</span>
            </>
          }
          actions={
            <GlowButton href="/setup" className="px-5 py-3">
              Start new session
            </GlowButton>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <GlassCard className="rounded-[32px] p-6 sm:p-8">
            {profileQuery.isLoading ? (
              <div className="space-y-4">
                <LoadingSkeleton className="h-8 w-48" />
                <LoadingSkeleton className="h-14 w-full" />
                <LoadingSkeleton className="h-14 w-full" />
                <LoadingSkeleton className="h-14 w-full" />
              </div>
            ) : profileQuery.isError ? (
              <StatePanel
                icon={AlertTriangle}
                eyebrow="Profile unavailable"
                title="We couldn’t load your profile"
                description="Try again to sync your latest account details from the backend."
                tone="warning"
                actions={
                  <GlowButton type="button" variant="secondary" onClick={() => void profileQuery.refetch()}>
                    <RefreshCw className="size-4" />
                    Retry loading
                  </GlowButton>
                }
              />
            ) : (
              <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Edit profile</h2>
                    <p className="mt-2 text-sm leading-7 text-slate-400">
                      Keep your account details current so reports, session records, and candidate identity stay consistent.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3 text-violet-200">
                    <UserRoundCog className="size-5" />
                  </div>
                </div>
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
              ) : historyQuery.isError ? (
                <StatePanel
                  icon={AlertTriangle}
                  eyebrow="History unavailable"
                  title="Recent sessions could not be loaded"
                  description="Retry to pull your latest interview history and report links."
                  tone="warning"
                  actions={
                    <GlowButton type="button" variant="secondary" onClick={() => void historyQuery.refetch()}>
                      <RefreshCw className="size-4" />
                      Retry loading
                    </GlowButton>
                  }
                />
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
                            View report
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <StatePanel
                  icon={Clock3}
                  eyebrow="No history yet"
                  title="Your recent sessions will show up here"
                  description="Once you complete or resume interviews, this panel will surface quick links back to reports and active sessions."
                />
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
