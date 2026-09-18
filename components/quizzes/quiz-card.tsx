import Link from "next/link";
import { ArrowRightIcon, ClockIcon, ListChecksIcon } from "lucide-react";
import { QuizStatusBadge } from "@/components/quizzes/quiz-status-badge";
import type { Quiz } from "@/lib/types";

export function QuizCard({ quiz }: { quiz: Quiz }) {
  const questionCount = quiz._count?.questions ?? 0;

  return (
    <Link
      href={`/quizzes/${quiz.id}`}
      className="group flex flex-col gap-3 rounded-xl border bg-card p-5 text-card-foreground transition-colors hover:border-primary/50 hover:bg-accent"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {quiz.subject?.code ?? "Quiz"}
        </span>
        <QuizStatusBadge status={quiz.status} />
      </div>

      <div className="grid gap-1">
        <h2 className="font-semibold tracking-tight">{quiz.title}</h2>
        {quiz.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {quiz.description}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ListChecksIcon className="size-3.5" aria-hidden="true" />
          {questionCount} {questionCount === 1 ? "question" : "questions"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ClockIcon className="size-3.5" aria-hidden="true" />
          {quiz.durationMinutes} min
        </span>
        <ArrowRightIcon
          className="ml-auto size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
