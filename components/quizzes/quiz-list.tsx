import { FileQuestionIcon } from "lucide-react";
import { QuizBrowser } from "@/components/quizzes/quiz-browser";
import { QuizCard } from "@/components/quizzes/quiz-card";
import { apiFetch } from "@/lib/api";
import type { Quiz } from "@/lib/types";

export async function QuizList({ subjectId }: { subjectId?: string }) {
  const qs = subjectId ? `?subjectId=${encodeURIComponent(subjectId)}` : "";
  const quizzes = await apiFetch<Quiz[]>(`/quizzes${qs}`, {
    next: { revalidate: 60, tags: ["quizzes"] },
  });

  if (quizzes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/50 p-12 text-center">
        <FileQuestionIcon
          className="size-8 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="font-medium">No quizzes yet</p>
        <p className="text-sm text-muted-foreground">
          Published quizzes will show up here once they&apos;re approved.
        </p>
      </div>
    );
  }

  if (!subjectId) {
    return <QuizBrowser quizzes={quizzes} />;
  }

  return (
    <ul className="grid gap-3">
      {quizzes.map((quiz) => (
        <li key={quiz.id}>
          <QuizCard quiz={quiz} />
        </li>
      ))}
    </ul>
  );
}
