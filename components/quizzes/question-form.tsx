"use client";

import * as React from "react";
import { Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { Question, QuestionType } from "@/lib/types";

const TYPE_LABELS: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: "Multiple choice",
  TRUE_FALSE: "True / false",
  MULTI_SELECT: "Multi select",
};

const TRUE_FALSE_OPTIONS = ["True", "False"];

export function QuestionForm({
  quizId,
  question,
  onSuccess,
  onCancel,
}: {
  quizId: string;
  question?: Question;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const [type, setType] = React.useState<QuestionType>(
    question?.type ?? "MULTIPLE_CHOICE",
  );
  const [prompt, setPrompt] = React.useState(question?.prompt ?? "");
  const [options, setOptions] = React.useState<string[]>(
    question?.options ?? ["", ""],
  );
  const [correct, setCorrect] = React.useState<number[]>(
    question?.correctAnswerIndices ?? [],
  );
  const [isSaving, setIsSaving] = React.useState(false);

  const isTrueFalse = type === "TRUE_FALSE";
  const effectiveOptions = isTrueFalse ? TRUE_FALSE_OPTIONS : options;

  function changeType(next: QuestionType) {
    setType(next);
    setCorrect([]);
    if (next !== "TRUE_FALSE") {
      setOptions((current) =>
        current.length >= 2 && !TRUE_FALSE_OPTIONS.includes(current[0])
          ? current
          : ["", ""],
      );
    }
  }

  function toggleCorrect(index: number) {
    setCorrect((current) => {
      if (type === "MULTI_SELECT") {
        return current.includes(index)
          ? current.filter((item) => item !== index)
          : [...current, index].sort((a, b) => a - b);
      }
      return current.includes(index) ? [] : [index];
    });
  }

  function updateOption(index: number, value: string) {
    setOptions((current) =>
      current.map((option, position) => (position === index ? value : option)),
    );
  }

  function addOption() {
    setOptions((current) => [...current, ""]);
  }

  function removeOption(index: number) {
    setOptions((current) =>
      current.filter((_, position) => position !== index),
    );
    setCorrect((current) =>
      current
        .filter((item) => item !== index)
        .map((item) => (item > index ? item - 1 : item)),
    );
  }

  const trimmedOptions = effectiveOptions.map((option) => option.trim());
  const isValid =
    prompt.trim().length > 0 &&
    trimmedOptions.length >= 2 &&
    trimmedOptions.every(Boolean) &&
    new Set(trimmedOptions).size === trimmedOptions.length &&
    correct.length >= 1 &&
    (type === "MULTI_SELECT" || correct.length === 1) &&
    correct.every((index) => index >= 0 && index < effectiveOptions.length);
  const canSubmit = isValid && !isSaving;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setIsSaving(true);
    try {
      const body = JSON.stringify({
        type,
        prompt: prompt.trim(),
        options: isTrueFalse ? undefined : trimmedOptions,
        correctAnswerIndices: correct,
      });
      if (question) {
        await clientFetch(
          `/quizzes/${quizId}/questions/${question.id}`,
          { method: "PATCH", body },
        );
      } else {
        await clientFetch(`/quizzes/${quizId}/questions`, {
          method: "POST",
          body,
        });
      }
      toast.add({
        type: "success",
        title: question ? "Question updated" : "Question added",
      });
      onSuccess();
    } catch (error) {
      toast.add({
        type: "error",
        title: "Couldn't save question",
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
        <Label htmlFor="question-type">Type</Label>
        <Select
          value={type}
          disabled={isSaving}
          onValueChange={(value) => changeType(value as QuestionType)}
        >
          <SelectTrigger id="question-type">
            <SelectValue>
              {(value) => TYPE_LABELS[value as QuestionType] ?? "Select type"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(TYPE_LABELS) as QuestionType[]).map((value) => (
              <SelectItem key={value} value={value}>
                {TYPE_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="question-prompt">Question</Label>
        <Textarea
          id="question-prompt"
          value={prompt}
          placeholder="What do you want to ask?"
          disabled={isSaving}
          onChange={(event) => setPrompt(event.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <Label>Answer options</Label>
          <p className="text-xs text-muted-foreground">
            {type === "MULTI_SELECT"
              ? "Tick every correct option."
              : "Tick the correct option."}
          </p>
        </div>

        <div className="grid gap-2">
          {effectiveOptions.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Checkbox
                checked={correct.includes(index)}
                disabled={isSaving}
                aria-label={`Mark option ${index + 1} correct`}
                onCheckedChange={() => toggleCorrect(index)}
              />
              <Input
                value={option}
                readOnly={isTrueFalse}
                disabled={isSaving}
                placeholder={`Option ${index + 1}`}
                aria-label={`Option ${index + 1}`}
                onChange={(event) => updateOption(index, event.target.value)}
              />
              {!isTrueFalse ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={isSaving || options.length <= 2}
                  aria-label={`Remove option ${index + 1}`}
                  onClick={() => removeOption(index)}
                >
                  <Trash2Icon aria-hidden="true" />
                </Button>
              ) : null}
            </div>
          ))}
        </div>

        {!isTrueFalse ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            disabled={isSaving || options.length >= 10}
            onClick={addOption}
          >
            <PlusIcon aria-hidden="true" />
            Add option
          </Button>
        ) : null}
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
          {question ? "Save question" : "Add question"}
        </Button>
      </DialogFooter>
    </form>
  );
}
