"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  FileQuestionIcon,
  PencilIcon,
  SendIcon,
} from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { WeaveSpinner } from "@/components/ui/weave-spinner";
import { toast } from "@/components/ui/toast";
import { AttemptResultView } from "@/components/quizzes/attempt-result";
import { QuizStatusBadge } from "@/components/quizzes/quiz-status-badge";
import { useAuth } from "@/components/providers/auth-provider";
import { clientFetch } from "@/lib/client-api";
import { formatDate } from "@/lib/format";
import type {
  AttemptResult,
  AttemptSession,
  AttemptSummary,
  Question,
  Quiz,
} from "@/lib/types";

const STORAGE_PREFIX = "sue-quiz-attempt:";
const PAGE_SIZE = 3;

function storageKey(attemptId: string) {
  return `${STORAGE_PREFIX}${attemptId}`;
}

function readStoredSelection(attemptId: string): Record<string, number[]> | null {
  try {
    const raw = window.localStorage.getItem(storageKey(attemptId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, number[]>;
    }
  } catch {
    return null;
  }
  return null;
}

function formatClock(seconds: number) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function selectionFrom(session: AttemptSession) {
  return Object.fromEntries(
    session.answers.map((answer) => [answer.questionId, answer.selectedIndices]),
  ) as Record<string, number[]>;
}

function QuestionField({
  question,
  index,
  selected,
  onSelect,
}: {
  question: Question;
  index: number;
  selected: number[];
  onSelect: (indices: number[]) => void;
}) {
  const isMulti = question.type === "MULTI_SELECT";

  function toggle(optionIndex: number) {
    if (isMulti) {
      onSelect(
        selected.includes(optionIndex)
          ? selected.filter((item) => item !== optionIndex)
          : [...selected, optionIndex].sort((a, b) => a - b),
      );
      return;
    }
    onSelect(selected.includes(optionIndex) ? [] : [optionIndex]);
  }

  return (
    <li className="grid gap-3 rounded-xl border bg-card p-4">
      <div className="flex items-start gap-2.5">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {index + 1}
        </span>
        <span className="pt-0.5 font-medium">{question.prompt}</span>
      </div>

      {isMulti ? (
        <div className="grid gap-1.5">
          {question.options.map((option, optionIndex) => {
            const isSelected = selected.includes(optionIndex);
            return (
              <label
                key={optionIndex}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm transition-colors",
                  isSelected ? "border-primary/40 bg-primary/10" : "hover:bg-muted",
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggle(optionIndex)}
                />
                <span>{option}</span>
              </label>
            );
          })}
        </div>
      ) : (
        <RadioGroup
          value={selected.length === 1 ? String(selected[0]) : undefined}
          onValueChange={(value) =>
            onSelect(value == null ? [] : [Number(value)])
          }
          className="gap-1.5"
        >
          {question.options.map((option, optionIndex) => {
            const isSelected = selected.includes(optionIndex);
            return (
              <label
                key={optionIndex}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm transition-colors",
                  isSelected ? "border-primary/40 bg-primary/10" : "hover:bg-muted",
                )}
              >
                <RadioGroupItem value={String(optionIndex)} />
                <span>{option}</span>
              </label>
            );
          })}
        </RadioGroup>
      )}
    </li>
  );
}

function QuestionNavigator({
  questions,
  selected,
  onNavigate,
  variant,
  activeIndex,
}: {
  questions: Question[];
  selected: Record<string, number[]>;
  onNavigate: (index: number) => void;
  variant: "sidebar" | "bar";
  activeIndex: number;
}) {
  const [api, setApi] = React.useState<CarouselApi>();

  const answered = questions.filter(
    (question) => (selected[question.id] ?? []).length > 0,
  ).length;

  React.useEffect(() => {
    if (!api || activeIndex < 0) return;
    api.scrollTo(activeIndex);
  }, [api, activeIndex]);

  const stateClass = (isAnswered: boolean, isActive: boolean) =>
    cn(
      isAnswered
        ? "border-primary bg-primary text-primary-foreground"
        : "border-input text-muted-foreground hover:bg-muted",
      isActive && "ring-2 ring-primary ring-offset-2 ring-offset-background",
    );

  if (variant === "bar") {
    return (
      <Carousel
        setApi={setApi}
        opts={{ align: "center" }}
        className="w-full lg:hidden"
      >
        <CarouselContent className="-ml-2">
          {questions.map((question, index) => (
            <CarouselItem key={question.id} className="basis-10 pl-2">
              <button
                type="button"
                onClick={() => onNavigate(index)}
                aria-label={`Go to question ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={cn(
                  "grid size-8 place-items-center rounded-full border text-xs font-medium transition-colors",
                  stateClass(
                    (selected[question.id] ?? []).length > 0,
                    index === activeIndex,
                  ),
                )}
              >
                {index + 1}
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    );
  }

  const percent =
    questions.length > 0 ? (answered / questions.length) * 100 : 0;

  return (
    <div className="grid gap-4 rounded-xl border bg-card p-4">
      <div className="grid gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Progress</span>
          <span className="tabular-nums text-muted-foreground">
            {answered}/{questions.length} answered
          </span>
        </div>
        <Progress value={percent} />
      </div>

      <div className="grid grid-cols-5 gap-2">
        {questions.map((question, index) => (
          <button
            key={question.id}
            type="button"
            onClick={() => onNavigate(index)}
            aria-label={`Go to question ${index + 1}`}
            aria-current={index === activeIndex ? "true" : undefined}
            className={cn(
              "grid aspect-square place-items-center rounded-lg border text-sm font-medium transition-colors",
              stateClass(
                (selected[question.id] ?? []).length > 0,
                index === activeIndex,
              ),
            )}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="grid gap-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-primary" />
          Answered
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-full border border-input" />
          Unanswered
        </span>
      </div>
    </div>
  );
}

export function QuizRunner({ quiz }: { quiz: Quiz }) {
  const { user } = useAuth();
  const [phase, setPhase] = React.useState<
    "loading" | "idle" | "active" | "result"
  >("loading");
  const [attempts, setAttempts] = React.useState<AttemptSummary[]>([]);
  const [session, setSession] = React.useState<AttemptSession | null>(null);
  const [selected, setSelected] = React.useState<Record<string, number[]>>({});
  const [result, setResult] = React.useState<AttemptResult | null>(null);
  const [remaining, setRemaining] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [activeQuestion, setActiveQuestion] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const deadlineRef = React.useRef(0);
  const autoSubmittedRef = React.useRef(false);
  const selectedRef = React.useRef(selected);
  const submitRef = React.useRef<() => void>(() => {});
  const listTopRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const begin = React.useCallback(async () => {
    setError(null);
    setPhase("loading");
    autoSubmittedRef.current = false;
    try {
      const next = await clientFetch<AttemptSession>(
        `/quizzes/${quiz.id}/attempts`,
        { method: "POST" },
      );
      const stored = readStoredSelection(next.attempt.id);
      const initial = stored ?? selectionFrom(next);
      deadlineRef.current =
        Date.now() + Math.max(0, next.remainingSeconds) * 1000;
      setSession(next);
      setSelected(initial);
      setCurrentPage(0);
      setActiveQuestion(0);
      setRemaining(Math.max(0, next.remainingSeconds));
      setPhase("active");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Couldn't start the quiz.",
      );
      setPhase("idle");
    }
  }, [quiz.id]);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await clientFetch<AttemptSummary[]>(
          `/quizzes/${quiz.id}/attempts/mine`,
        );
        if (!active) return;
        const inProgress = data.find(
          (attempt) => attempt.status === "IN_PROGRESS",
        );
        if (inProgress) {
          await begin();
          return;
        }
        setAttempts(data);
        setPhase("idle");
      } catch (caught) {
        if (!active) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "Couldn't load this quiz.",
        );
        setPhase("idle");
      }
    })();
    return () => {
      active = false;
    };
  }, [quiz.id, begin]);

  const submit = React.useCallback(async () => {
    if (!session) return;
    setIsSubmitting(true);
    try {
      const answers = session.questions.map((question) => ({
        questionId: question.id,
        selectedIndices: selectedRef.current[question.id] ?? [],
      }));
      const payload = await clientFetch<AttemptResult>(
        `/quizzes/${quiz.id}/attempts/${session.attempt.id}/submit`,
        { method: "POST", body: JSON.stringify({ answers }) },
      );
      try {
        window.localStorage.removeItem(storageKey(session.attempt.id));
      } catch {
        // ignore storage failures
      }
      setResult(payload);
      setConfirmOpen(false);
      setPhase("result");
    } catch (caught) {
      toast.add({
        type: "error",
        title: "Couldn't submit answers",
        description:
          caught instanceof Error ? caught.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz.id, session]);

  React.useEffect(() => {
    submitRef.current = () => {
      void submit();
    };
  }, [submit]);

  React.useEffect(() => {
    if (phase !== "active" || !session) return;
    const tick = () => {
      const seconds = Math.max(
        0,
        Math.ceil((deadlineRef.current - Date.now()) / 1000),
      );
      setRemaining(seconds);
      if (seconds <= 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        submitRef.current();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [phase, session]);

  React.useEffect(() => {
    if (phase !== "active" || !session) return;
    try {
      window.localStorage.setItem(
        storageKey(session.attempt.id),
        JSON.stringify(selected),
      );
    } catch {
      // ignore storage failures
    }
  }, [phase, session, selected]);

  const questionCount = quiz._count?.questions ?? 0;
  const isOwner = user?.id === quiz.createdById;
  const questions = session?.questions ?? [];
  const answeredCount = questions.filter(
    (question) => (selected[question.id] ?? []).length > 0,
  ).length;
  const pageCount = Math.max(1, Math.ceil(questions.length / PAGE_SIZE));
  const pageStart = currentPage * PAGE_SIZE;
  const pageQuestions = questions.slice(pageStart, pageStart + PAGE_SIZE);

  function goToPage(page: number, active = page * PAGE_SIZE) {
    const next = Math.min(Math.max(page, 0), pageCount - 1);
    setCurrentPage(next);
    setActiveQuestion(active);
    listTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function goToQuestion(index: number) {
    goToPage(Math.floor(index / PAGE_SIZE), index);
  }

  return (
    <div className="grid gap-6">
      {phase !== "active" ? (
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {quiz.title}
            </h1>
            <QuizStatusBadge status={quiz.status} />
          </div>
          {quiz.description ? (
            <p className="text-sm text-muted-foreground">{quiz.description}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span>{quiz.subject?.code ?? "Quiz"}</span>
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="size-3.5" aria-hidden="true" />
              {quiz.durationMinutes} min
            </span>
            <span>{questionCount} questions</span>
            {isOwner ? (
              <Link
                href={`/quizzes/${quiz.id}/edit`}
                className="inline-flex items-center gap-1.5 text-foreground transition-colors hover:text-primary"
              >
                <PencilIcon className="size-3.5" aria-hidden="true" />
                Edit quiz
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-muted/50 p-12 text-center">
          <p className="font-medium">Something went wrong</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      ) : null}

      {phase === "loading" ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed bg-muted/50 p-12">
          <WeaveSpinner />
        </div>
      ) : null}

      {phase === "idle" && !error ? (
        <div className="grid gap-4">
          {questionCount === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/50 p-12 text-center">
              <FileQuestionIcon
                className="size-8 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="font-medium">No questions yet</p>
              <p className="text-sm text-muted-foreground">
                This quiz doesn&apos;t have any questions.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-8 text-center">
              <p className="font-medium">Ready when you are</p>
              <p className="text-sm text-muted-foreground">
                You&apos;ll have {quiz.durationMinutes} minutes to finish once
                you start.
              </p>
              <Button onClick={() => void begin()}>
                <FileQuestionIcon aria-hidden="true" />
                Start quiz
              </Button>
            </div>
          )}

          {attempts.length > 0 ? (
            <div className="grid gap-2">
              <h2 className="text-sm font-medium">Past attempts</h2>
              <ul className="grid gap-2">
                {attempts.map((attempt) => (
                  <li
                    key={attempt.id}
                    className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-2.5 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {formatDate(attempt.submittedAt ?? attempt.startedAt)}
                    </span>
                    <span className="font-medium tabular-nums">
                      {attempt.score ?? 0} / {attempt.total ?? 0}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {phase === "active" && session ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
          <div className="grid min-w-0 gap-4">
            <div className="sticky top-2 z-10 flex items-center justify-between gap-3 rounded-xl border bg-card/95 px-4 py-2.5 backdrop-blur">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{quiz.title}</p>
                <p className="text-xs text-muted-foreground">
                  {answeredCount} of {questions.length} answered
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium tabular-nums",
                    remaining <= 60
                      ? "border-destructive/40 bg-destructive/10 text-destructive"
                      : "border-border text-foreground",
                  )}
                >
                  <ClockIcon className="size-4" aria-hidden="true" />
                  {formatClock(remaining)}
                </span>
                <Button
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => setConfirmOpen(true)}
                >
                  <SendIcon aria-hidden="true" />
                  Submit
                </Button>
              </div>
            </div>

            <div className="grid min-w-0 scroll-mt-20 gap-4" ref={listTopRef}>
              <QuestionNavigator
                questions={session.questions}
                selected={selected}
                onNavigate={goToQuestion}
                variant="bar"
                activeIndex={activeQuestion}
              />

              <ol className="grid gap-3">
                {pageQuestions.map((question, offset) => {
                  const index = pageStart + offset;
                  return (
                    <QuestionField
                      key={question.id}
                      question={question}
                      index={index}
                      selected={selected[question.id] ?? []}
                      onSelect={(indices) =>
                        setSelected((current) => ({
                          ...current,
                          [question.id]: indices,
                        }))
                      }
                    />
                  );
                })}
              </ol>

              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  disabled={currentPage <= 0}
                  onClick={() => goToPage(currentPage - 1)}
                >
                  <ChevronLeftIcon aria-hidden="true" />
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground tabular-nums">
                  Page {currentPage + 1} of {pageCount}
                </span>
                {currentPage >= pageCount - 1 ? (
                  <Button
                    disabled={isSubmitting}
                    onClick={() => setConfirmOpen(true)}
                  >
                    <SendIcon aria-hidden="true" />
                    Submit
                  </Button>
                ) : (
                  <Button onClick={() => goToPage(currentPage + 1)}>
                    Next
                    <ChevronRightIcon aria-hidden="true" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <aside className="hidden lg:sticky lg:top-2 lg:block">
            <QuestionNavigator
              questions={session.questions}
              selected={selected}
              onNavigate={goToQuestion}
              variant="sidebar"
              activeIndex={activeQuestion}
            />
          </aside>
        </div>
      ) : null}

      {phase === "result" && result ? (
        <AttemptResultView
          result={result}
          onRetake={() => void begin()}
        />
      ) : null}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit your answers?</DialogTitle>
            <DialogDescription>
              You won&apos;t be able to change them afterwards.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setConfirmOpen(false)}
            >
              Keep working
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={() => void submit()}
            >
              {isSubmitting ? "Submitting…" : "Submit quiz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
