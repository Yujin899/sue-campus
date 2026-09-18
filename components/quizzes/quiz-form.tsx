"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { clientFetch } from "@/lib/client-api";
import type { Quiz, Subject } from "@/lib/types";

export function QuizForm({
  quiz,
  onSuccess,
  onCancel,
}: {
  quiz?: Quiz;
  onSuccess: (quiz: Quiz) => void;
  onCancel?: () => void;
}) {
  const [subjects, setSubjects] = React.useState<Subject[] | null>(null);
  const [subjectId, setSubjectId] = React.useState(quiz?.subjectId ?? "");
  const [title, setTitle] = React.useState(quiz?.title ?? "");
  const [description, setDescription] = React.useState(quiz?.description ?? "");
  const [duration, setDuration] = React.useState(
    String(quiz?.durationMinutes ?? 10),
  );
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    clientFetch<Subject[]>("/subjects")
      .then((data) => {
        if (active && Array.isArray(data)) setSubjects(data);
      })
      .catch(() => {
        if (active) setSubjects([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const durationMinutes = Number(duration);
  const canSubmit =
    subjectId.length > 0 &&
    title.trim().length > 0 &&
    Number.isInteger(durationMinutes) &&
    durationMinutes > 0 &&
    !isSaving;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setIsSaving(true);
    try {
      const body = JSON.stringify({
        subjectId,
        title: title.trim(),
        description: description.trim() || undefined,
        durationMinutes,
      });
      const saved = quiz
        ? await clientFetch<Quiz>(`/quizzes/${quiz.id}`, {
            method: "PATCH",
            body,
          })
        : await clientFetch<Quiz>("/quizzes", { method: "POST", body });
      toast.add({
        type: "success",
        title: quiz ? "Quiz updated" : "Quiz created",
      });
      onSuccess(saved);
    } catch (error) {
      toast.add({
        type: "error",
        title: "Couldn't save quiz",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="quiz-subject">Subject</Label>
        <Select
          value={subjectId || null}
          disabled={isSaving || subjects === null}
          onValueChange={(value) => setSubjectId(value == null ? "" : String(value))}
        >
          <SelectTrigger id="quiz-subject">
            <SelectValue
              placeholder={
                subjects === null ? "Loading subjects…" : "Select a subject"
              }
            >
              {(value) => {
                const subject = subjects?.find((item) => item.id === value);
                if (subject) return `${subject.code} · ${subject.name}`;
                return subjects === null
                  ? "Loading subjects…"
                  : "Select a subject";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(subjects ?? []).map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.code} · {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="quiz-title">Title</Label>
        <Input
          id="quiz-title"
          value={title}
          autoComplete="off"
          placeholder="e.g. Algebra basics"
          disabled={isSaving}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="quiz-description">Description</Label>
        <Textarea
          id="quiz-description"
          value={description}
          placeholder="Optional summary shown to students."
          disabled={isSaving}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="quiz-duration">Duration (minutes)</Label>
        <Input
          id="quiz-duration"
          type="number"
          min={1}
          value={duration}
          disabled={isSaving}
          onChange={(event) => setDuration(event.target.value)}
        />
      </div>

      <DialogFooter>
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={!canSubmit}>
          {isSaving ? (
            <Loader2Icon className="animate-spin" aria-hidden="true" />
          ) : null}
          {quiz ? "Save changes" : "Create quiz"}
        </Button>
      </DialogFooter>
    </form>
  );
}
