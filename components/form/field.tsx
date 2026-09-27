"use client";

import * as React from "react";

export type FieldErrors = Record<string, string>;

/** Stable id for a field's error paragraph, used by aria-describedby. */
export function errorId(field: string): string {
  return `${field}-error`;
}

/**
 * Spread onto a control to wire it to its error message. Input and Textarea
 * already ship `aria-invalid:` styles, so this alone turns the field red.
 */
export function fieldAria(field: string, error?: string) {
  return {
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": error ? errorId(field) : undefined,
  };
}

export function FieldError({
  field,
  children,
}: {
  field: string;
  children?: string | null;
}) {
  if (!children) return null;
  return (
    <p
      id={errorId(field)}
      role="alert"
      className="text-sm font-medium text-destructive"
    >
      {children}
    </p>
  );
}

/**
 * Per-field error state for a form.
 *
 * Errors are only surfaced after a submit attempt, because a form that
 * validates live from the first keystroke scolds the user before they have
 * finished typing. Once shown, an error clears as soon as that field is
 * edited again.
 */
export function useFieldErrors() {
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [hasAttempted, setHasAttempted] = React.useState(false);

  const show = React.useCallback((next: FieldErrors) => {
    setErrors(next);
    setHasAttempted(true);
  }, []);

  const clear = React.useCallback((field: string) => {
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  const reset = React.useCallback(() => {
    setErrors({});
    setHasAttempted(false);
  }, []);

  return { errors, hasAttempted, show, clear, reset };
}
