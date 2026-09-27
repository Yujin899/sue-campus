import type { FieldErrors } from "./validation";

function extractErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  if (typeof record.message === "string") return record.message;
  if (Array.isArray(record.message)) return record.message.join(", ");
  if (typeof record.error === "string") return record.error;
  return null;
}

function extractFieldErrors(data: unknown): FieldErrors {
  if (!data || typeof data !== "object") return {};
  const errors = (data as Record<string, unknown>).errors;
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) return {};

  const result: FieldErrors = {};
  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages) && typeof messages[0] === "string") {
      result[field] = messages.join(" ");
    } else if (typeof messages === "string") {
      result[field] = messages;
    }
  }
  return result;
}

/**
 * Error thrown by clientFetch. Extends Error so existing
 * `error instanceof Error ? error.message : ...` call sites keep working, while
 * exposing the HTTP status and any per-field messages from the backend.
 */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldErrors;

  constructor(message: string, status: number, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export async function clientFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`/api/backoffice${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      extractErrorMessage(data) ??
      (res.status === 403
        ? "You need admin access to do that."
        : `Request failed (${res.status})`);
    throw new ApiRequestError(message, res.status, extractFieldErrors(data));
  }

  return data as T;
}
