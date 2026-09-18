"use client";

import * as React from "react";
import {
  ClockIcon,
  CloudOffIcon,
  Loader2Icon,
  PencilIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { QuizForm } from "@/components/quizzes/quiz-form";
import { QuestionManager } from "@/components/quizzes/question-manager";
import { QuizStatusBadge } from "@/components/quizzes/quiz-status-badge";
import { clientFetch } from "@/lib/client-api";
import type { Quiz } from "@/lib/types";

export function QuizEditor({ quiz: initialQuiz }: { quiz: Quiz }) {
  const [quiz, setQuiz] = React.useState(initialQuiz);
  const [editOpen, setEditOpen] = React.useState(false);
  const [isUnpublishing, setIsUnpublishing] = React.useState(false);

  const canEdit = quiz.status === "DRAFT" || quiz.status === "REJECTED";

  async function handleUnpublish() {
    setIsUnpublishing(true);
    try {
      const updated = await clientFetch<Quiz>(`/quizzes/${quiz.id}/unpublish`, {
        method: "POST",
      });
      setQuiz(updated);
      toast.add({
        type: "success",
        title: "Quiz unpublished",
        description: "It's back in draft, so you can make changes.",
      });
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
    <div className="grid gap-6">
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
          <span>{quiz._count?.questions ?? 0} questions</span>
        </div>

        {canEdit ? (
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => setEditOpen(true)}
          >
            <PencilIcon aria-hidden="true" />
            Edit details
          </Button>
        ) : null}
      </div>

      {quiz.status === "REJECTED" && quiz.reviewNote ? (
        <div className="grid gap-1 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="font-medium text-destructive">Changes requested</p>
          <p className="text-sm text-muted-foreground">{quiz.reviewNote}</p>
        </div>
      ) : null}

      {quiz.status === "PENDING_REVIEW" ? (
        <div className="rounded-xl border border-dashed bg-muted/50 p-4 text-sm text-muted-foreground">
          This quiz is awaiting admin review. You can&apos;t edit it until
          it&apos;s approved or sent back with changes.
        </div>
      ) : null}

      {quiz.status === "PUBLISHED" ? (
        <div className="flex flex-col gap-3 rounded-xl border border-dashed bg-muted/50 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>This quiz is published. Unpublish it to make changes.</p>
          <Button
            variant="outline"
            size="sm"
            className="w-fit shrink-0"
            onClick={() => void handleUnpublish()}
            disabled={isUnpublishing}
          >
            {isUnpublishing ? (
              <Loader2Icon className="animate-spin" aria-hidden="true" />
            ) : (
              <CloudOffIcon aria-hidden="true" />
            )}
            Unpublish
          </Button>
        </div>
      ) : null}

      <QuestionManager quiz={quiz} onQuizChange={setQuiz} />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit quiz details</DialogTitle>
            <DialogDescription>
              Update the subject, title, description, or duration.
            </DialogDescription>
          </DialogHeader>
          {editOpen ? (
            <QuizForm
              quiz={quiz}
              onSuccess={(saved) => {
                setQuiz(saved);
                setEditOpen(false);
              }}
              onCancel={() => setEditOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
