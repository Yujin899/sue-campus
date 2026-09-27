"use client";

import * as React from "react";
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
import { QuestionForm } from "@/components/quizzes/question-form";
import { clientFetch } from "@/lib/client-api";
import type { Question, Quiz } from "@/lib/types";

const TYPE_LABELS: Record<Question["type"], string> = {
  MULTIPLE_CHOICE: "Multiple choice",
  TRUE_FALSE: "True / false",
  MULTI_SELECT: "Multi select",
};

export function QuestionManager({
  quiz,
  onQuizChange,
}: {
  quiz: Quiz;
  onQuizChange: (quiz: Quiz) => void;
}) {
  const [questions, setQuestions] = React.useState<Question[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Question | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Question | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const canEdit = quiz.status === "DRAFT" || quiz.status === "REJECTED";

  const load = React.useCallback(async () => {
    try {
      const data = await clientFetch<unknown>(
        `/quizzes/${quiz.id}/questions`,
      );
      if (!Array.isArray(data)) {
        throw new Error("Unexpected response while loading questions.");
      }
      setQuestions(data as Question[]);
      setLoadError(null);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Couldn't load questions.",
      );
    }
  }, [quiz.id]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    void load();
  }, [load]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await clientFetch(`/quizzes/${quiz.id}/questions/${deleteTarget.id}`, {
        method: "DELETE",
      });
      toast.add({ type: "success", title: "Question deleted" });
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

  async function handleSubmitForReview() {
    setIsSubmitting(true);
    try {
      const saved = await clientFetch<Quiz>(`/quizzes/${quiz.id}/submit`, {
        method: "POST",
      });
      toast.add({
        type: "success",
        title: "Submitted for review",
        description: "An admin will review your quiz shortly.",
      });
      onQuizChange(saved);
    } catch (error) {
      toast.add({
        type: "error",
        title: "Couldn't submit quiz",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold tracking-tight">Questions</h2>
        {canEdit ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setFormOpen(true)}
              disabled={questions === null}
            >
              <PlusIcon aria-hidden="true" />
              Add question
            </Button>
            <Button
              onClick={() => void handleSubmitForReview()}
              disabled={
                isSubmitting || questions === null || questions.length === 0
              }
            >
              {isSubmitting ? (
                <Loader2Icon className="animate-spin" aria-hidden="true" />
              ) : (
                <SendIcon aria-hidden="true" />
              )}
              Submit for review
            </Button>
          </div>
        ) : null}
      </div>

      {loadError ? (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-muted/50 p-12 text-center">
          <p className="font-medium text-destructive">Couldn&apos;t load questions</p>
          <p className="text-sm text-muted-foreground">{loadError}</p>
          <Button variant="outline" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : questions === null ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed bg-muted/50 p-12">
          <WeaveSpinner />
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/50 p-12 text-center">
          <FileQuestionIcon
            className="size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="font-medium">No questions yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first question to build the quiz.
          </p>
        </div>
      ) : (
        <ol className="grid gap-2">
          {questions.map((question, index) => (
            <li
              key={question.id}
              className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-start"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {index + 1}
              </span>
              <div className="grid min-w-0 flex-1 gap-1">
                <span className="font-medium">{question.prompt}</span>
                <span className="text-xs text-muted-foreground">
                  {TYPE_LABELS[question.type]} · {question.options.length}{" "}
                  options ·{" "}
                  {question.correctAnswerIndices?.length ?? 0} correct
                </span>
              </div>
              {canEdit ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit question"
                    onClick={() => setEditTarget(question)}
                  >
                    <PencilIcon aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete question"
                    onClick={() => setDeleteTarget(question)}
                  >
                    <Trash2Icon aria-hidden="true" />
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add question</DialogTitle>
            <DialogDescription>
              Pick a type, write the prompt, and mark the correct answer.
            </DialogDescription>
          </DialogHeader>
          {formOpen ? (
            <QuestionForm
              quizId={quiz.id}
              onSuccess={() => {
                setFormOpen(false);
                void load();
              }}
              onCancel={() => setFormOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit question</DialogTitle>
            <DialogDescription>
              Update the prompt or answer options.
            </DialogDescription>
          </DialogHeader>
          {editTarget ? (
            <QuestionForm
              quizId={quiz.id}
              question={editTarget}
              onSuccess={() => {
                setEditTarget(null);
                void load();
              }}
              onCancel={() => setEditTarget(null)}
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
            <DialogTitle>Delete question?</DialogTitle>
            <DialogDescription>
              This question will be permanently removed from the quiz.
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
              Delete question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
