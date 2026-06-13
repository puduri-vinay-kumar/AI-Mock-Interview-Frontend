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
import { setupHighlights } from "@/data/mock";
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
  questionCount: z.number().min(1, "Select question count.").max(12, "Keep the interview focused.")
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
  { label: "10 Questions", value: "10" }
];

const rolePromptMap: Record<string, string> = {
  "Frontend Developer": "Frontend Developer. Ask only frontend interview questions about React, Next.js, TypeScript, HTML, CSS, browser APIs, accessibility, UI performance, state management, responsive UI, and component architecture. Do not ask Node.js, backend, database, or server architecture questions for this role.",
  "Backend Developer": "Backend Developer focused on Node.js, REST APIs, databases, authentication, system design, and server-side architecture",
  "Full Stack Engineer": "Full Stack Engineer focused on React, Next.js, Node.js, APIs, databases, and end-to-end product engineering",
  "Product Manager": "Product Manager focused on product strategy, prioritization, user research, metrics, execution, and stakeholder communication",
  "Data Analyst": "Data Analyst focused on SQL, dashboards, data cleaning, statistics, business metrics, and insight communication"
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
        ...values,
        role: rolePromptMap[values.role] ?? values.role,
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
          description="Choose the role, interview style, and question count you want to practice so your session feels focused and relevant."
          meta={
            <>
              <span>Voice-based session</span>
              <span>Resume personalization available</span>
              <span>Question-count driven</span>
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
                <p className="mt-3 text-base leading-7 text-slate-300">
                  Add your resume to help tailor questions around your experience, skills, and target role.
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
              helperText="Upload a PDF or DOCX up to 5 MB."
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
                    <h3 className="text-xl font-semibold text-white">Why uploading a resume helps</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                      Resume signals help the platform ask more relevant questions, choose stronger follow-ups, and make
                      the interview feel closer to a real hiring conversation.
                    </p>
                    {resumeId ? <p className="mt-2 text-xs text-emerald-300">Resume connected successfully.</p> : null}
                  </div>
                </div>
                <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3 text-violet-200">
                  <div className="text-xs uppercase tracking-[0.22em] text-violet-200/80">Session summary</div>
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
              <p className="text-center text-xs leading-6 text-slate-400">
                You can start without a resume. Adding one simply sharpens the interview context.
              </p>
            </div>
          </div>
        </form>
      </GlassCard>
    </section>
  );
}
