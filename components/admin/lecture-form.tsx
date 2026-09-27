"use client";

import * as React from "react";
import { FileTextIcon, Loader2Icon, UploadCloudIcon } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { FieldError, fieldAria, useFieldErrors } from "@/components/form/field";
import { uploadLecture } from "@/lib/lecture-upload";
import { formatFileSize } from "@/lib/format";
import { hasErrors, validateLecture } from "@/lib/validation";

const MAX_MB = Number(process.env.NEXT_PUBLIC_LECTURE_MAX_MB ?? 200);
const MAX_BYTES = MAX_MB * 1024 * 1024;

function fileToTitle(name: string): string {
  return name.replace(/\.pdf$/i, "");
}

export function LectureForm({
  subjectId,
  onSuccess,
}: {
  subjectId: string;
  onSuccess: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const inputId = React.useId();
  const [file, setFile] = React.useState<File | null>(null);
  const [title, setTitle] = React.useState("");
  const [titleTouched, setTitleTouched] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const { errors, show, clear } = useFieldErrors();

  function selectFile(selected: File | null) {
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      toast.add({
        type: "error",
        title: "Unsupported file",
        description: "Lectures must be PDF files.",
      });
      return;
    }
    if (selected.size > MAX_BYTES) {
      toast.add({
        type: "error",
        title: "File too large",
        description: `PDFs must be ${MAX_MB}MB or smaller.`,
      });
      return;
    }
    setFile(selected);
    clear("file");
    if (!titleTouched) {
      setTitle(fileToTitle(selected.name));
    }
  }

  function handleFiles(files: FileList | null) {
    selectFile(files?.[0] ?? null);
  }

  function resetInput() {
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isUploading) return;

    const found = validateLecture({ hasFile: file !== null, title });
    if (hasErrors(found) || !file) {
      show(found);
      return;
    }

    setIsUploading(true);
    setProgress(0);
    try {
      await uploadLecture({
        subjectId,
        file,
        title: title.trim(),
        onProgress: setProgress,
      });
      toast.add({
        type: "success",
        title: "Lecture uploaded",
        description: `"${title.trim()}" is now available.`,
      });
      onSuccess();
    } catch (error) {
      toast.add({
        type: "error",
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsUploading(false);
      resetInput();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="application/pdf"
        className="sr-only"
        disabled={isUploading}
        onChange={(event) => handleFiles(event.target.files)}
      />

      {file ? (
        <div className="flex items-center gap-3 rounded-xl border p-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <FileTextIcon className="size-5" aria-hidden="true" />
          </span>
          <div className="grid min-w-0 flex-1 gap-0.5">
            <span className="truncate text-sm font-medium">{file.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            Change
          </Button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault();
            if (!isUploading) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            if (!isUploading) handleFiles(event.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed p-6 text-center transition-colors hover:bg-muted/50",
            errors.file && "border-destructive",
            isDragging && "border-primary bg-primary/5",
            isUploading && "pointer-events-none opacity-60",
          )}
        >
          <UploadCloudIcon
            className="size-6 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-sm font-medium">
            Click to upload or drag and drop
          </p>
        <p className="text-xs text-muted-foreground">
          PDF up to {MAX_MB}MB
        </p>
      </label>
      )}
      <FieldError field="file">{errors.file}</FieldError>

      <div className="grid gap-2">
        <Label htmlFor="lecture-title">Title</Label>
        <Input
          id="lecture-title"
          placeholder="e.g. Lecture 1 - Introduction"
          autoComplete="off"
          value={title}
          disabled={isUploading}
          onChange={(event) => {
            setTitleTouched(true);
            setTitle(event.target.value);
            clear("title");
          }}
          {...fieldAria("title", errors.title)}
        />
        <FieldError field="title">{errors.title}</FieldError>
      </div>

      {isUploading ? (
        <div className="grid gap-1.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Uploading… {progress}%
          </p>
        </div>
      ) : null}

      <DialogFooter>
        <DialogClose
          render={<Button variant="outline" />}
          disabled={isUploading}
        >
          Cancel
        </DialogClose>
        <Button type="submit" disabled={isUploading}>
          {isUploading ? (
            <Loader2Icon className="animate-spin" aria-hidden="true" />
          ) : (
            <UploadCloudIcon aria-hidden="true" />
          )}
          Upload lecture
        </Button>
      </DialogFooter>
    </form>
  );
}