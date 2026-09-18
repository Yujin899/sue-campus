import Link from "next/link";
import { ArrowLeftIcon, FileQuestionIcon } from "lucide-react";
import { QuizManager } from "@/components/quizzes/quiz-manager";

export default function MyQuizzesPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Link
        href="/quizzes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        All quizzes
      </Link>

      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <FileQuestionIcon className="size-6" aria-hidden="true" />
        </span>
        <div className="grid gap-1">
          <h1 className="text-3xl font-semibold tracking-tight">My quizzes</h1>
          <p className="text-sm text-muted-foreground">
            Create quizzes, build questions, and submit them for review.
          </p>
        </div>
      </div>

      <QuizManager />
    </div>
  );
}
