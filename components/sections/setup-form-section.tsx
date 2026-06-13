"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { BriefcaseBusiness, Hash, Layers3, Sparkles, UserRoundSearch } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormSelect } from "@/components/ui/form-select";
import { GlassCard } from "@/components/ui/glass-card";
import { GlowButton } from "@/components/ui/glow-button";
import { UploadBox } from "@/components/ui/upload-box";
import { useCreateInterview, useResumeUpload } from "@/hooks/useInterview";
import { DEFAULT_QUESTION_COUNT } from "@/lib/constants";
import { useInterviewStore } from "@/store/interview.store";
import { PageHeader } from "@/components/system/page-header";

const setupSchema = z.object({
  role: z.string().min(2, "Select your target role."),
  experienceLevel: z.enum(["fresher", "junior", "mid", "senior"], {
    message: "Select your experience level."
  }),
  interviewType: z.enum(["technical", "hr", "behavioral", "coding", "mixed"], {
    message: "Select an interview type."
  }),
  questionCount: z.number().int("Question count must be a whole number.").min(1, "Select question count.").max(20, "Question count must be between 1 and 20.")
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

const questionCountOptions = [
  { label: "3 Questions", value: "3" },
  { label: "5 Questions", value: "5" },
  { label: "7 Questions", value: "7" },
  { label: "10 Questions", value: "10" },
  { label: "15 Questions", value: "15" },
  { label: "20 Questions", value: "20" }
];

const rolePromptMap: Record<string, string> = {
  "Frontend Developer": "Frontend Developer",
  "Backend Developer": "Backend Developer",
  "Full Stack Engineer": "Full Stack Engineer",
  "Product Manager": "Product Manager",
  "Data Analyst": "Data Analyst"
};

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
      questionCount: DEFAULT_QUESTION_COUNT
    }
  });

  const handleFileChange = async (file: File | null) => {
    setSelectedFile(file);
    setUploadProgress(0);

    if (!file) {
      return;
    }

    try {
      await resumeUpload.mutateAsync({
        file,
        onProgress: setUploadProgress
      });
    } catch {
      // mutation onError already surfaces a user-facing toast
    }
  };

  const onSubmit = async (values: SetupValues) => {
    try {
      await createInterview.mutateAsync({
        role: (rolePromptMap[values.role] ?? values.role).trim(),
        experienceLevel: values.experienceLevel,
        interviewType: values.interviewType,
        questionCount: Number(values.questionCount),
        resumeId: resumeId ?? undefined
      });
    } catch {
      // mutation onError already surfaces a user-facing toast
    }
  };

  return (
    <section className="container-shell pb-24 pt-10">
      <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
        <PageHeader
          eyebrow="Interview setup"
          title="Setup Your Interview"
          description="Configure the session."
          meta={
            <>
              <span>Voice interview</span>
              <span>{form.watch("questionCount")} questions</span>
            </>
          }
        />
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
              label="Question Count"
              placeholder="Choose number of questions"
              options={questionCountOptions}
              icon={<Hash className="size-5" />}
              required
              value={String(form.watch("questionCount"))}
              onChange={(value) => form.setValue("questionCount", Number(value), { shouldValidate: true })}
              error={form.formState.errors.questionCount?.message}
            />
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.38fr_0.62fr]">
            <div className="space-y-5 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
              <div className="inline-flex rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3 text-violet-200">
                <Sparkles className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Upload Resume</h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-sm text-slate-400">Status</div>
                <div className="mt-2 text-base font-medium text-white">{resumeId ? "Resume connected" : "Optional"}</div>
              </div>
            </div>

            <UploadBox
              fileName={selectedFile?.name ?? null}
              onFileChange={handleFileChange}
              isUploading={resumeUpload.isPending}
              uploadProgress={uploadProgress}
              parsedSkills={parsedSkills}
              helperText="PDF or DOCX, up to 5 MB."
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="rounded-[28px] border border-white/10 bg-gradient-to-r from-white/[0.06] to-white/[0.03] p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3 text-violet-200">
                    <Sparkles className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Session summary</h3>
                    {resumeId ? <p className="mt-2 text-xs text-emerald-300">Resume connected successfully.</p> : null}
                  </div>
                </div>
                <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3 text-violet-200">
                  <div className="text-xs uppercase tracking-[0.22em] text-violet-200/80">Details</div>
                  <div className="mt-2 text-sm text-white">
                    {form.watch("interviewType")} • {form.watch("experienceLevel")} • {form.watch("questionCount")} questions
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <GlowButton
                type="submit"
                className="h-14 px-8 text-base"
                disabled={createInterview.isPending || resumeUpload.isPending}
              >
                {createInterview.isPending ? "Creating..." : "Start Interview"}
              </GlowButton>
            </div>
          </div>
        </form>
      </GlassCard>
    </section>
  );
}
