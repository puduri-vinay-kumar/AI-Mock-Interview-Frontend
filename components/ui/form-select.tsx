import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type SelectOption = {
  label: string;
  value: string;
};

type FormSelectProps = {
  label: string;
  placeholder: string;
  options: string[] | SelectOption[];
  icon: React.ReactNode;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  error?: string;
};

export function FormSelect({
  label,
  placeholder,
  options,
  icon,
  required = false,
  value,
  onChange,
  name,
  error
}: FormSelectProps) {
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option
  );

  return (
    <label className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
        <span>{label}</span>
        {required ? <span className="text-fuchsia-300">*</span> : null}
      </div>

      <div className="group relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-violet-300">
          {icon}
        </div>
        <select
          name={name}
          value={value ?? ""}
          onChange={(event) => onChange?.(event.target.value)}
          className={cn(
            "h-14 w-full appearance-none rounded-2xl border border-white/10 bg-slate-950/40 pl-12 pr-12 text-sm text-slate-100 outline-none transition-all duration-300",
            "focus:border-violet-400/60 focus:bg-slate-950/70 focus:shadow-[0_0_0_1px_rgba(139,92,246,0.25),0_0_25px_rgba(99,102,241,0.18)]",
            "group-hover:border-white/20",
            error ? "border-rose-400/40" : ""
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {normalizedOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-slate-950 text-slate-100">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
      </div>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </label>
  );
}
