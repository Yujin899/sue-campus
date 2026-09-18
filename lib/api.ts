import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type FetchNext = {
  revalidate?: false | 0 | number;
  tags?: string[];
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    path: string,
  ) {
    super(`API request failed (${status}): ${path}`);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { next?: FetchNext },
): Promise<T> {
  const cookieStore = await cookies();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
      cookie: cookieStore.toString(),
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, path);
  }

  return res.json() as Promise<T>;
}