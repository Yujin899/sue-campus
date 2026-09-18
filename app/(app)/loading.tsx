"use client";

import { WeaveSpinner } from "@/components/ui/weave-spinner";

export default function Loading() {
  return (
    <div className="flex min-h-[50svh] items-center justify-center">
      <WeaveSpinner />
    </div>
  );
}