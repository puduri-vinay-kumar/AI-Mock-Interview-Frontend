"use client";

import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  meta?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, meta, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-200/80">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-bold text-white">{title}</h1>
        <p className="mt-3 max-w-2xl text-slate-300">{description}</p>
        {meta ? <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
