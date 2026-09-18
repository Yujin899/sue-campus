"use client";

import * as React from "react";
import { LockKeyholeIcon } from "lucide-react";
import { WeaveSpinner } from "@/components/ui/weave-spinner";
import { useAuth } from "@/components/providers/auth-provider";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isPending } = useAuth();

  if (isPending || !user) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed bg-muted/50 p-12">
        <WeaveSpinner />
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-muted/50 p-12 text-center">
        <LockKeyholeIcon
          className="size-8 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="font-medium">Admins only</p>
        <p className="text-sm text-muted-foreground">
          You need an admin account to manage campus content.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}