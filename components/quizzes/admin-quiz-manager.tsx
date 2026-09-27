"use client";

import * as React from "react";
import {
  CheckIcon,
  FileQuestionIcon,
  Loader2Icon,
  RotateCcwIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { WeaveSpinner } from "@/components/ui/weave-spinner";
import { toast } from "@/components/ui/toast";
import { QuizStatusBadge } from "@/components/quizzes/quiz-status-badge";
import { FieldError, fieldAria } from "@/components/form/field";
import { clientFetch } from "@/lib/client-api";
import type { Question, Quiz, QuizStatus } from "@/lib/types";

const TYPE_LABELS: Record<Question["type"], string> = {
  MULTIPLE_CHOICE: "Multiple choice",
  TRUE_FALSE: "True / false",
  MULTI_SELECT: "Multi select",
};

export function AdminQuizManager() {
  const [tab, setTab] = React.useState<Exclude<QuizStatus, "DRAFT" | "REJECTED">>(
    "PENDING_REVIEW",
  );
  const [quizzes, setQuizzes] = React.useState<Quiz[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [reviewTarget, setReviewTarget] = React.useState<Quiz | null>(null);
  const [reviewQuestions, setReviewQuestions] = React.useState<
    Question[] | null
  >(null);
  const [note, setNote] = React.useState("");
  const [noteError, setNoteError] = React.useState<string | null>(null);
  const [isReviewing, setIsReviewing] = React.useState(false);

  const [unpublishTarget, setUnpublishTarget] = React.useState<Quiz | null>(
    null,
  );
  const [isUnpublishing, setIsUnpublishing] = React.useState(false);

  const load = React.useCallback(async (status: typeof tab) => {
    setQuizzes(null);
    try {
      const data = await clientFetch<unknown>(`/quizzes?status=${status}`);
      if (!Array.isArray(data)) {
        throw new Error("Unexpected response while loading quizzes.");
      }
      setQuizzes(data as Quiz[]);
      setLoadError(null);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Couldn't load quizzes.",
      );
    }
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-change
    void load(tab);
  }, [tab, load]);

  async function openReview(quiz: Quiz) {
    setReviewTarget(quiz);
    setNote("");
    setReviewQuestions(null);
    try {
      const data = await clientFetch<Question[]>(
        `/quizzes/${quiz.id}/questions`,
      );
      setReviewQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      setReviewQuestions([]);
      toast.add({
        type: "error",
        title: "Couldn't load questions",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  async function handleReview(action: "approve" | "reject") {
    if (!reviewTarget) return;
    if (action === "reject" && !note.trim()) {
      setNoteError("Tell the author what needs changing before rejecting.");
      return;
    }
    setNoteError(null);
    setIsReviewing(true);
    try {
      await clientFetch(`/quizzes/${reviewTarget.id}/review`, {
        method: "POST",
        body: JSON.stringify({
          action,
          note: action === "reject" ? note.trim() : undefined,
        }),
      });
      toast.add({
        type: "success",
        title: action === "approve" ? "Quiz published" : "Quiz rejected",
        description: `"${reviewTarget.title}" was ${
          action === "approve" ? "approved" : "sent back for changes"
        }.`,
      });
      setReviewTarget(null);
      void load(tab);
    } catch (error) {
      toast.add({
        type: "error",
        title: "Review failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsReviewing(false);
    }
  }

  async function handleUnpublish() {
    if (!unpublishTarget) return;
    setIsUnpublishing(true);
    try {
      await clientFetch(`/quizzes/${unpublishTarget.id}/unpublish`, {
        method: "POST",
      });
      toast.add({
        type: "success",
        title: "Quiz unpublished",
        description: `"${unpublishTarget.title}" is back in draft.`,
      });
      setUnpublishTarget(null);
      void load(tab);
    } catch (error) {
      toast.add({
        type: "error",
        title: "Unpublish failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsUnpublishing(false);
    }
  }

  return (
    <div className="grid gap-4">
      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
        <TabsList>
          <TabsTrigger value="PENDING_REVIEW">Pending review</TabsTrigger>
          <TabsTrigger value="PUBLISHED">Published</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {loadError ? (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-muted/50 p-12 text-center">
          <p className="font-medium text-destructive">Couldn&apos;t load quizzes</p>
              <p className="text-sm text-muted-foreground">{loadError}</p>
              <Button variant="outline" onClick={() => void load(tab)}>
                Try again
              </Button>
            </div>
          ) : quizzes === null ? (
            <div className="flex items-center justify-center rounded-xl border border-dashed bg-muted/50 p-12">
              <WeaveSpinner />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/50 p-12 text-center">
              <FileQuestionIcon
                className="size-8 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="font-medium">
                {tab === "PENDING_REVIEW"
                  ? "Nothing to review"
                  : "No published quizzes"}
              </p>
              <p className="text-sm text-muted-foreground">
                {tab === "PENDING_REVIEW"
                  ? "Submitted quizzes will appear here for approval."
                  : "Approved quizzes will appear here."}
              </p>
            </div>
          ) : (
            <ul className="grid gap-2">
              {quizzes.map((quiz) => (
                <li
                  key={quiz.id}
                  className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center"
                >
                  <div className="grid min-w-0 flex-1 gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium">
                        {quiz.title}
                      </span>
                      <QuizStatusBadge status={quiz.status} />
                    </div>
                    <span className="truncate text-xs text-muted-foreground">
                      {quiz.subject?.code ?? "Quiz"} ·{" "}
                      {quiz._count?.questions ?? 0} questions ·{" "}
                      {quiz.durationMinutes} min
                    </span>
                  </div>
                  {tab === "PENDING_REVIEW" ? (
                    <Button size="sm" onClick={() => void openReview(quiz)}>
                      Review
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUnpublishTarget(quiz)}
                    >
                      <RotateCcwIcon aria-hidden="true" />
                      Unpublish
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={reviewTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isReviewing) setReviewTarget(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{reviewTarget?.title ?? "Review quiz"}</DialogTitle>
            <DialogDescription>
              Check the questions and answers, then approve or send back.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2 text-sm text-muted-foreground">
            <span>
              {reviewTarget?.subject?.code ?? "Quiz"} ·{" "}
              {reviewTarget?.durationMinutes ?? 0} min
            </span>
            {reviewTarget?.description ? (
              <span>{reviewTarget.description}</span>
            ) : null}
          </div>

          {reviewQuestions === null ? (
            <div className="flex items-center justify-center rounded-xl border border-dashed bg-muted/50 p-8">
              <WeaveSpinner />
            </div>
          ) : reviewQuestions.length === 0 ? (
            <p className="rounded-xl border border-dashed bg-muted/50 p-6 text-center text-sm text-muted-foreground">
              This quiz has no questions.
            </p>
          ) : (
            <ol className="grid gap-3">
              {reviewQuestions.map((question, index) => (
                <li
                  key={question.id}
                  className="grid gap-2 rounded-xl border p-4"
                >
                  <span className="font-medium">
                    {index + 1}. {question.prompt}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {TYPE_LABELS[question.type]}
                  </span>
                  <ul className="grid gap-1.5">
                    {question.options.map((option, optionIndex) => {
                      const isCorrect =
                        question.correctAnswerIndices?.includes(optionIndex) ??
                        false;
                      return (
                        <li
                          key={optionIndex}
                          className={
                            isCorrect
                              ? "flex items-center gap-2 rounded-md bg-emerald-500/10 px-2 py-1 text-sm"
                              : "flex items-center gap-2 rounded-md px-2 py-1 text-sm"
                          }
                        >
                          {isCorrect ? (
                            <CheckIcon
                              className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                              aria-hidden="true"
                            />
                          ) : (
                            <XIcon
                              className="size-3.5 shrink-0 text-muted-foreground/40"
                              aria-hidden="true"
                            />
                          )}
                          <span>{option}</span>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ol>
          )}

          <div className="grid gap-2">
            <Label htmlFor="review-note">Note to author (required to reject)</Label>
            <Textarea
              id="review-note"
              value={note}
              placeholder="Explain what needs to change…"
              disabled={isReviewing}
              onChange={(event) => {
                setNote(event.target.value);
                setNoteError(null);
              }}
              {...fieldAria("reviewNote", noteError ?? undefined)}
            />
            <FieldError field="reviewNote">{noteError}</FieldError>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              disabled={isReviewing}
              onClick={() => void handleReview("reject")}
            >
              <XIcon aria-hidden="true" />
              Reject
            </Button>
            <Button
              disabled={isReviewing}
              onClick={() => void handleReview("approve")}
            >
              {isReviewing ? (
                <Loader2Icon className="animate-spin" aria-hidden="true" />
              ) : (
                <CheckIcon aria-hidden="true" />
              )}
              Approve &amp; publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={unpublishTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isUnpublishing) setUnpublishTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unpublish quiz?</DialogTitle>
            <DialogDescription>
              &quot;{unpublishTarget?.title ?? "This quiz"}&quot; will be moved
              back to draft and hidden from students.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isUnpublishing}
              onClick={() => setUnpublishTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isUnpublishing}
              onClick={() => void handleUnpublish()}
            >
              {isUnpublishing ? (
                <Loader2Icon className="animate-spin" aria-hidden="true" />
              ) : (
                <RotateCcwIcon aria-hidden="true" />
              )}
              Unpublish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
