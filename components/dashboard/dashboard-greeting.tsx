"use client";

import Link from "next/link";
import { BookOpenIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

export function DashboardGreeting() {
  const { user } = useAuth();

  const displayName =
    (user?.name && user.name.trim()) ||
    user?.email?.split("@")[0] ||
    "";

  const greetingName = displayName
    ? displayName.charAt(0).toUpperCase() + displayName.slice(1)
    : "there";

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="grid gap-1.5">
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back, {greetingName}
        </h1>
        <p className="text-base text-muted-foreground">
          {isAdmin
            ? "Here's what's happening across campus today."
            : "Pick up where you left off and keep learning."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          render={<Link href="/subjects" />}
          nativeButton={false}
        >
          <BookOpenIcon aria-hidden="true" />
          Browse subjects
        </Button>
        <Button render={<Link href="/quizzes/mine" />} nativeButton={false}>
          <PlusIcon aria-hidden="true" />
          New quiz
        </Button>
      </div>
    </div>
  );
}
