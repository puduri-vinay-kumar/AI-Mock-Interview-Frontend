"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText, LoaderCircle, UploadCloud } from "lucide-react";
import { useRef } from "react";

import { GlowButton } from "@/components/ui/glow-button";
import { cn } from "@/lib/utils";

type UploadBoxProps = {
  fileName?: string | null;
  onFileChange?: (file: File | null) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  parsedSkills?: string[];
  helperText?: string;
};

export function UploadBox({
  fileName,
  onFileChange,
  isUploading = false,
  uploadProgress = 0,
  parsedSkills = [],
  helperText = "PDF or DOCX up to 5 MB. Uploading will personalize your interview setup."
}: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange?.(event.target.files?.[0] ?? null);
    event.target.value = "";
  };

  return (
    <div
      className={cn(
        "group relative flex min-h-[320px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[28px] border border-dashed border-violet-400/35 bg-slate-950/35 p-8 text-center transition-all duration-300",
        "hover:border-violet-300/60 hover:bg-slate-950/55 hover:shadow-[0_0_40px_rgba(99,102,241,0.16)]"
      )}
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
      />

      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/70 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_45%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="relative z-10 mb-5 rounded-full border border-violet-400/30 bg-violet-500/10 p-5 text-violet-200"
      >
        <UploadCloud className="size-10" />
      </motion.div>

      <div className="relative z-10 space-y-3">
        <h3 className="text-2xl font-semibold text-white">Drag &amp; drop your resume here</h3>
        <p className="text-sm text-slate-400">{helperText}</p>
      </div>

      <div className="relative z-10 mt-6">
        <GlowButton
          type="button"
          variant="secondary"
          className="px-5"
          onClick={(event) => {
            event.stopPropagation();
            inputRef.current?.click();
          }}
        >
          {isUploading ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {isUploading ? `Uploading ${uploadProgress}%` : "Browse File"}
        </GlowButton>
      </div>

      <AnimatePresence>
        {fileName ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="relative z-10 mt-6 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
          >
            <FileText className="size-4" />
            <span>{fileName}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {parsedSkills.length ? (
        <div className="relative z-10 mt-5 flex flex-wrap justify-center gap-2">
          {parsedSkills.slice(0, 8).map((skill) => (
            <span key={skill} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
              {skill}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
