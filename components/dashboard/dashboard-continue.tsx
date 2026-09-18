import Link from "next/link";
import { ClockIcon, FileQuestionIcon, PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { QuizCard } from "@/components/quizzes/quiz-card";
import type { InProgressAttempt, Quiz } from "@/lib/types";

function formatRemaining(seconds: number) {
  const minutes = Math.max(0, Math.ceil(seconds / 60));

  if (minutes === 0) {
    return "Time is almost up";
  }
  if (minutes === 1) {
    return "1 minute left";
  }

  return `${minutes} minutes left`;
}

export function DashboardContinue({
  inProgress,
  quizzes,
}: {
  inProgress: InProgressAttempt | null;
  quizzes: Quiz[];
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold tracking-tight">
          {inProgress ? "Continue where you left off" : "Recent quizzes"}
        </h2>
        <Link
          href="/quizzes"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>

      {inProgress ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <PlayIcon className="size-5" aria-hidden="true" />
            </span>
            <div className="grid gap-1">
              <h3 className="font-semibold tracking-tight">
                {inProgress.quizTitle}
              </h3>
              <p className="text-sm text-muted-foreground">
                {inProgress.subjectName
                  ? `${inProgress.subjectCode} · ${inProgress.subjectName}`
                  : "Quiz"}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <ClockIcon className="size-3.5" aria-hidden="true" />
                {formatRemaining(inProgress.remainingSeconds)}
              </span>
            </div>
          </div>
          <Button render={<Link href={`/quizzes/${inProgress.quizId}`} />} nativeButton={false}>
            Resume quiz
          </Button>
        </div>
      ) : quizzes.length ? (
        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent>
            {quizzes.map((quiz) => (
              <CarouselItem
                key={quiz.id}
                className="basis-[85%] sm:basis-1/2 lg:basis-1/3"
              >
                <QuizCard quiz={quiz} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
          <FileQuestionIcon className="size-5 shrink-0" aria-hidden="true" />
          No quizzes available yet. Check back soon.
        </div>
      )}
    </section>
  );
}
