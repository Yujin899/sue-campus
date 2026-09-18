"use client";

import { UserRoundIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/providers/auth-provider";

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }
  return email?.[0]?.toUpperCase() ?? "?";
}

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="grid gap-6 rounded-xl border bg-card p-6 text-card-foreground md:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar className="size-20">
            <AvatarFallback className="text-2xl">
              {getInitials(user?.name, user?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {user?.name || "Student"}
            </h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="grid gap-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium">
              {user?.role === "ADMIN" ? "Admin" : "Student"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Account</span>
            <span className="font-medium">
              {user?.emailVerified ? "Verified" : "Unverified"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <UserRoundIcon className="size-4" aria-hidden="true" />
          <span className="text-xs">Al Salam University (SUE) · Student Hub</span>
        </div>
      </div>
    </div>
  );
}