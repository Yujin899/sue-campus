import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { QuizRunner } from "@/components/quizzes/quiz-runner";
import { ApiError, apiFetch } from "@/lib/api";
import type { Quiz } from "@/lib/types";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const quiz = await apiFetch<Quiz>(`/quizzes/${id}`, {
    cache: "no-store",
  }).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Link
        href="/quizzes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        All quizzes
      </Link>
      <QuizRunner quiz={quiz} />
    </div>
  );
}
