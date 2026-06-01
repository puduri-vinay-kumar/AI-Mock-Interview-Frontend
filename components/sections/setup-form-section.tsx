"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { BriefcaseBusiness, Clock3, Layers3, Sparkles, UserRoundSearch } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormSelect } from "@/components/ui/form-select";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { UploadBox } from "@/components/ui/upload-box";
import { setupHighlights } from "@/data/mock";
import { useCreateInterview, useResumeUpload } from "@/hooks/useInterview";
import { useInterviewStore } from "@/store/interview.store";

const setupSchema = z.object({
  role: z.string().min(2, "Select your target role."),
  experienceLevel: z.enum(["fresher", "junior", "mid", "senior"], {
    message: "Select your experience level."
  }),
  interviewType: z.enum(["technical", "hr", "behavioral", "coding", "mixed"], {
    message: "Select an interview type."
  }),
  duration: z.number().min(15, "Select interview duration.")
});

type SetupValues = z.infer<typeof setupSchema>;

const roleOptions = [
  { label: "Frontend Developer", value: "Frontend Developer" },
  { label: "Backend Developer", value: "Backend Developer" },
  { label: "Full Stack Engineer", value: "Full Stack Engineer" },
  { label: "Product Manager", value: "Product Manager" },
  { label: "Data Analyst", value: "Data Analyst" }
];

const experienceOptions = [
  { label: "Fresher", value: "fresher" },
  { label: "Junior", value: "junior" },
  { label: "Mid", value: "mid" },
  { label: "Senior", value: "senior" }
];

const interviewTypeOptions = [
  { label: "Technical", value: "technical" },
  { label: "HR Round", value: "hr" },
  { label: "Behavioral", value: "behavioral" },
  { label: "Coding", value: "coding" },
  { label: "Mixed", value: "mixed" }
];

const durationOptions = [
  { label: "15 Minutes", value: "15" },
  { label: "30 Minutes", value: "30" },
  { label: "45 Minutes", value: "45" },
  { label: "60 Minutes", value: "60" }
];

export function SetupFormSection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const resumeId = useInterviewStore((state) => state.resumeId);
  const parsedSkills = useInterviewStore((state) => state.parsedSkills);
  const resumeUpload = useResumeUpload();
  const createInterview = useCreateInterview();
  const form = useForm<SetupValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      role: "",
      experienceLevel: "junior",
      interviewType: "technical",
      duration: 30
    }
  });

  const handleFileChange = async (file: File | null) => {
    setSelectedFile(file);
    setUploadProgress(0);

    if (!file) {
      return;
    }

    await resumeUpload.mutateAsync({
      file,
      onProgress: setUploadProgress
    });
  };

  const onSubmit = async (values: SetupValues) => {
    await createInterview.mutateAsync({
      ...values,
      resumeId: resumeId ?? undefined
    });
  };

  return (
    <section className="container-shell pb-24 pt-10">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
        className="mx-auto max-w-4xl text-center"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-violet-200/80">Personalized setup</p>
        <h1 className="mt-5 font-[var(--font-heading)] text-4xl font-bold text-white sm:text-5xl">
          Setup Your Interview
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Provide a few details to personalize your interview experience and shape a polished practice flow.
        </p>
      </motion.div>

      <GlassCard className="mx-auto mt-12 max-w-6xl rounded-[36px] p-5 sm:p-8 lg:p-10">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
            <FormSelect
              label="Select Role"
              placeholder="Choose your target role"
              options={roleOptions}
              icon={<BriefcaseBusiness className="size-5" />}
              required
              value={form.watch("role")}
              onChange={(value) => form.setValue("role", value, { shouldValidate: true })}
              error={form.formState.errors.role?.message}
            />
            <FormSelect
              label="Experience Level"
              placeholder="Choose your experience"
              options={experienceOptions}
              icon={<Layers3 className="size-5" />}
              required
              value={form.watch("experienceLevel")}
              onChange={(value) =>
                form.setValue("experienceLevel", value as SetupValues["experienceLevel"], { shouldValidate: true })
              }
              error={form.formState.errors.experienceLevel?.message}
            />
            <FormSelect
              label="Interview Type"
              placeholder="Choose interview type"
              options={interviewTypeOptions}
              icon={<UserRoundSearch className="size-5" />}
              required
              value={form.watch("interviewType")}
              onChange={(value) =>
                form.setValue("interviewType", value as SetupValues["interviewType"], { shouldValidate: true })
              }
              error={form.formState.errors.interviewType?.message}
            />
            <FormSelect
              label="Interview Duration"
              placeholder="Choose session length"
              options={durationOptions}
              icon={<Clock3 className="size-5" />}
              required
              value={String(form.watch("duration"))}
              onChange={(value) => form.setValue("duration", Number(value), { shouldValidate: true })}
              error={form.formState.errors.duration?.message}
            />
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.38fr_0.62fr]">
            <div className="space-y-5 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
              <div className="inline-flex rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3 text-violet-200">
                <Sparkles className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Upload Resume</h2>
                <p className="mt-3 text-base leading-7 text-slate-300">
                  Your resume is uploaded to the live backend and used to personalize question generation.
                </p>
              </div>

              <div className="space-y-4">
                {setupHighlights.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-2.5 text-violet-200">
                        <item.icon className="size-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{item.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-400">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <UploadBox
              fileName={selectedFile?.name ?? null}
              onFileChange={handleFileChange}
              isUploading={resumeUpload.isPending}
              uploadProgress={uploadProgress}
              parsedSkills={parsedSkills}
              helperText="PDF or DOCX up to 5 MB. The backend expects multipart upload with the resume field."
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="rounded-[28px] border border-white/10 bg-gradient-to-r from-white/[0.06] to-white/[0.03] p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3 text-violet-200">
                  <Sparkles className="size-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Why uploading a resume helps</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                    Parsed skills from the backend help shape role-specific prompts, better question selection, and a
                    more realistic mock interview session.
                  </p>
                  {resumeId ? <p className="mt-2 text-xs text-emerald-300">Resume connected successfully.</p> : null}
                </div>
              </div>
            </div>

            <GlowButton
              type="submit"
              className="h-14 px-8 text-base"
              disabled={createInterview.isPending || resumeUpload.isPending}
            >
              {createInterview.isPending ? "Creating..." : "Start Interview"}
            </GlowButton>
          </div>
        </form>
      </GlassCard>
    </section>
  );
}
