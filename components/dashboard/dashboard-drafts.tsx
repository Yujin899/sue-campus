import Link from "next/link";
import { FilePenLineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizStatusBadge } from "@/components/quizzes/quiz-status-badge";
import type { Quiz } from "@/lib/types";

export function DashboardDrafts({ quizzes }: { quizzes: Quiz[] }) {
  if (!quizzes.length) {
    return null;
  }

  const rejected = quizzes.filter(
    (quiz) => quiz.status === "REJECTED",
  ).length;

  return (
    <section className="space-y-3">
      <h2 className="font-semibold tracking-tight">Needs your attention</h2>

      <div className="rounded-xl border bg-card p-5 text-card-foreground">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FilePenLineIcon className="size-5" aria-hidden="true" />
            </span>
            <div className="grid gap-1">
              <h3 className="font-semibold tracking-tight">
                {quizzes.length} unpublished{" "}
                {quizzes.length === 1 ? "quiz" : "quizzes"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {rejected
                  ? `${rejected} rejected — update and resubmit. `
                  : ""}
                Finish drafts and submit them for review.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            render={<Link href="/quizzes/mine" />}
            nativeButton={false}
          >
            Manage quizzes
          </Button>
        </div>

        <ul className="mt-4 grid gap-2">
          {quizzes.slice(0, 4).map((quiz) => (
            <li
              key={quiz.id}
              className="flex items-center justify-between gap-3 rounded-lg border bg-background/50 px-3 py-2"
            >
              <Link
                href={`/quizzes/${quiz.id}`}
                className="truncate text-sm font-medium transition-colors hover:text-primary"
              >
                {quiz.title}
              </Link>
              <QuizStatusBadge status={quiz.status} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
