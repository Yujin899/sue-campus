import Link from "next/link";
import { FileQuestionIcon, ListChecksIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizList } from "@/components/quizzes/quiz-list";

export default function QuizzesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <FileQuestionIcon className="size-6" aria-hidden="true" />
          </span>
          <div className="grid gap-1">
            <h1 className="text-3xl font-semibold tracking-tight">Quizzes</h1>
            <p className="text-sm text-muted-foreground">
              Test your knowledge with quizzes from across campus.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          render={<Link href="/quizzes/mine" />}
          nativeButton={false}
        >
          <ListChecksIcon aria-hidden="true" />
          My quizzes
        </Button>
      </div>

      <QuizList />
    </div>
  );
}
