"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileQuestionIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  SendIcon,
  Trash2Icon,
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
import { WeaveSpinner } from "@/components/ui/weave-spinner";
import { toast } from "@/components/ui/toast";
import { QuizForm } from "@/components/quizzes/quiz-form";
import { QuizStatusBadge } from "@/components/quizzes/quiz-status-badge";
import { clientFetch } from "@/lib/client-api";
import type { Quiz } from "@/lib/types";

export function QuizManager() {
  const [quizzes, setQuizzes] = React.useState<Quiz[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Quiz | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [submittingId, setSubmittingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const data = await clientFetch<unknown>("/quizzes?mine=true");
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    void load();
  }, [load]);

  async function handleSubmitForReview(quiz: Quiz) {
    setSubmittingId(quiz.id);
    try {
      await clientFetch(`/quizzes/${quiz.id}/submit`, { method: "POST" });
      toast.add({
        type: "success",
        title: "Submitted for review",
        description: `"${quiz.title}" is awaiting approval.`,
      });
      void load();
    } catch (error) {
      toast.add({
        type: "error",
        title: "Couldn't submit quiz",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await clientFetch(`/quizzes/${deleteTarget.id}`, { method: "DELETE" });
      toast.add({
        type: "success",
        title: "Quiz deleted",
        description: `"${deleteTarget.title}" was removed.`,
      });
      setDeleteTarget(null);
      void load();
    } catch (error) {
      toast.add({
        type: "error",
        title: "Delete failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon aria-hidden="true" />
          New quiz
        </Button>
      </div>

      {loadError ? (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-muted/50 p-12 text-center">
          <p className="font-medium text-destructive">Couldn&apos;t load quizzes</p>
          <p className="text-sm text-muted-foreground">{loadError}</p>
          <Button variant="outline" onClick={() => void load()}>
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
          <p className="font-medium">No quizzes yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first quiz and submit it for review.
          </p>
        </div>
      ) : (
        <ul className="grid gap-2">
          {quizzes.map((quiz) => {
            const canEdit =
              quiz.status === "DRAFT" || quiz.status === "REJECTED";
            return (
              <li
                key={quiz.id}
                className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center"
              >
                <div className="grid min-w-0 flex-1 gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium">{quiz.title}</span>
                    <QuizStatusBadge status={quiz.status} />
                  </div>
                  <span className="truncate text-xs text-muted-foreground">
                    {quiz.subject?.code ?? "Quiz"} ·{" "}
                    {quiz._count?.questions ?? 0} questions ·{" "}
                    {quiz.durationMinutes} min
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={`/quizzes/${quiz.id}/edit`} />}
                    nativeButton={false}
                  >
                    <PencilIcon aria-hidden="true" />
                    Edit
                  </Button>
                  {canEdit ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={submittingId === quiz.id}
                      onClick={() => void handleSubmitForReview(quiz)}
                    >
                      {submittingId === quiz.id ? (
                        <Loader2Icon
                          className="animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <SendIcon aria-hidden="true" />
                      )}
                      Submit
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Delete ${quiz.title}`}
                    onClick={() => setDeleteTarget(quiz)}
                  >
                    <Trash2Icon aria-hidden="true" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New quiz</DialogTitle>
            <DialogDescription>
              Set up the quiz details. You&apos;ll add questions next.
            </DialogDescription>
          </DialogHeader>
          {createOpen ? (
            <QuizForm
              onSuccess={() => {
                setCreateOpen(false);
                void load();
              }}
              onCancel={() => setCreateOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete quiz?</DialogTitle>
            <DialogDescription>
              &quot;{deleteTarget?.title ?? "This quiz"}&quot; and all of its
              questions will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() => void handleDelete()}
            >
              {isDeleting ? (
                <Loader2Icon className="animate-spin" aria-hidden="true" />
              ) : (
                <Trash2Icon aria-hidden="true" />
              )}
              Delete quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
