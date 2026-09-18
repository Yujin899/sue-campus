import { apiFetch } from "@/lib/api";
import type { AuthUser } from "@/lib/auth";

interface ServerSession {
  user: AuthUser;
}

export async function getServerUser(): Promise<AuthUser | null> {
  try {
    const session = await apiFetch<ServerSession | null>(
      "/api/auth/get-session",
      { cache: "no-store" },
    );

    return session?.user ?? null;
  } catch {
    return null;
  }
}
