"use client";

import * as React from "react";
import {
  FileTextIcon,
  Loader2Icon,
  PencilIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { WeaveSpinner } from "@/components/ui/weave-spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { LectureForm } from "@/components/admin/lecture-form";
import { LectureDownloadButton } from "@/components/subjects/lecture-download-button";
import { clientFetch } from "@/lib/client-api";
import { formatDate, formatFileSize } from "@/lib/format";
import type { Lecture } from "@/lib/types";

export function LectureManager({ subjectId }: { subjectId: string }) {
  const [lectures, setLectures] = React.useState<Lecture[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [uploadOpen, setUploadOpen] = React.useState(false);

  const [renameTarget, setRenameTarget] = React.useState<Lecture | null>(null);
  const [renameTitle, setRenameTitle] = React.useState("");
  const [isRenaming, setIsRenaming] = React.useState(false);

  const [deleteTarget, setDeleteTarget] = React.useState<Lecture | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const data = await clientFetch<unknown>(`/subjects/${subjectId}/lectures`);
      if (!Array.isArray(data)) {
        throw new Error("Unexpected response while loading lectures.");
      }
      setLectures(data as Lecture[]);
      setLoadError(null);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Couldn't load lectures.",
      );
    }
  }, [subjectId]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    void load();
  }, [load]);

  function openRename(lecture: Lecture) {
    setRenameTarget(lecture);
    setRenameTitle(lecture.title);
  }

  async function handleRename() {
    if (!renameTarget || !renameTitle.trim()) return;
    setIsRenaming(true);
    try {
      await clientFetch(`/lectures/${renameTarget.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: renameTitle.trim() }),
      });
      toast.add({ type: "success", title: "Lecture renamed" });
      setRenameTarget(null);
      void load();
    } catch (error) {
      toast.add({
        type: "error",
        title: "Rename failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsRenaming(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await clientFetch(`/lectures/${deleteTarget.id}`, { method: "DELETE" });
      toast.add({
        type: "success",
        title: "Lecture deleted",
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
        <Button onClick={() => setUploadOpen(true)}>
          <UploadIcon aria-hidden="true" />
          Upload lecture
        </Button>
      </div>

      {loadError ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-muted/50 p-12 text-center">
          <p className="font-medium">Couldn&apos;t load lectures</p>
          <p className="text-sm text-muted-foreground">{loadError}</p>
          <Button variant="outline" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : lectures === null ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed bg-muted/50 p-12">
          <WeaveSpinner />
        </div>
      ) : lectures.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/50 p-12 text-center">
          <FileTextIcon
            className="size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="font-medium">No lectures yet</p>
          <p className="text-sm text-muted-foreground">
            Upload the first lecture PDF for this subject.
          </p>
        </div>
      ) : (
        <ul className="grid gap-2">
          {lectures.map((lecture) => (
            <li
              key={lecture.id}
              className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileTextIcon className="size-5" aria-hidden="true" />
                </span>
                <div className="grid min-w-0 gap-0.5">
                  <span className="truncate font-medium">{lecture.title}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {lecture.fileName} · {formatFileSize(lecture.size)} ·{" "}
                    {formatDate(lecture.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <LectureDownloadButton lectureId={lecture.id} />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => openRename(lecture)}
                  aria-label={`Rename ${lecture.title}`}
                >
                  <PencilIcon aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDeleteTarget(lecture)}
                  aria-label={`Delete ${lecture.title}`}
                >
                  <Trash2Icon aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload lecture</DialogTitle>
            <DialogDescription>
              Add a PDF lecture to this subject.
            </DialogDescription>
          </DialogHeader>
          {uploadOpen ? (
            <LectureForm
              subjectId={subjectId}
              onSuccess={() => {
                setUploadOpen(false);
                void load();
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isRenaming) setRenameTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rename lecture</DialogTitle>
            <DialogDescription>
              Update the display title. The file itself stays the same.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="rename-lecture">Title</Label>
            <Input
              id="rename-lecture"
              value={renameTitle}
              disabled={isRenaming}
              autoComplete="off"
              onChange={(event) => setRenameTitle(event.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" />}
              disabled={isRenaming}
            >
              Cancel
            </DialogClose>
            <Button
              onClick={() => void handleRename()}
              disabled={isRenaming || !renameTitle.trim()}
            >
              {isRenaming ? (
                <Loader2Icon className="animate-spin" aria-hidden="true" />
              ) : null}
              Save
            </Button>
          </DialogFooter>
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
            <DialogTitle>Delete lecture?</DialogTitle>
            <DialogDescription>
              &quot;{deleteTarget?.title ?? "This lecture"}&quot; and its file
              will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" />}
              disabled={isDeleting}
            >
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2Icon className="animate-spin" aria-hidden="true" />
              ) : (
                <Trash2Icon aria-hidden="true" />
              )}
              Delete lecture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}