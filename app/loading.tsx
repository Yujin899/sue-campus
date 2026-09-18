"use client";

import { WeaveSpinner } from "@/components/ui/weave-spinner";

export default function Loading() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <WeaveSpinner />
    </div>
  );
}