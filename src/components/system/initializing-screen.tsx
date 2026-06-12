"use client";

import { LoaderCircle } from "lucide-react";

import { StatePanel } from "@/components/system/state-panel";

type InitializingScreenProps = {
  title?: string;
  description?: string | null;
};

export function InitializingScreen({
  title = "Initializing your session",
  description = "We’re reconnecting to the backend and restoring your workspace."
}: InitializingScreenProps) {
  return (
    <div className="container-shell flex min-h-[60vh] items-center justify-center py-16">
      <StatePanel
        icon={LoaderCircle}
        eyebrow="Please wait"
        title={title}
        description={description}
        className="max-w-lg"
        contentClassName="text-center"
        iconClassName="animate-spin"
      />
    </div>
  );
}
