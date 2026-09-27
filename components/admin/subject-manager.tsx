"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpenIcon,
  FileTextIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
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
import { toast } from "@/components/ui/toast";
import { SubjectForm } from "@/components/admin/subject-form";
import { clientFetch } from "@/lib/client-api";
import type { Subject } from "@/lib/types";

export function SubjectManager() {
  const [subjects, setSubjects] = React.useState<Subject[] | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingSubject, setEditingSubject] = React.useState<Subject | null>(
    null,
  );

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deletingSubject, setDeletingSubject] = React.useState<Subject | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function load() {
    try {
      const data = await clientFetch<unknown>("/subjects");
      if (!Array.isArray(data)) {
        throw new Error("Unexpected response while loading subjects.");
      }
      setSubjects(data as Subject[]);
      setLoadError(null);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Couldn't load subjects.",
      );
    }
  }

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    void load();
  }, []);

  const filtered = React.useMemo(() => {
    if (!subjects) return [];
    const q = query.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(q) ||
        subject.code.toLowerCase().includes(q),
    );
  }, [subjects, query]);

  function openCreate() {
    setEditingSubject(null);
    setFormOpen(true);
  }

  function openEdit(subject: Subject) {
    setEditingSubject(subject);
    setFormOpen(true);
  }

  function openDelete(subject: Subject) {
    setDeletingSubject(subject);
    setConfirmOpen(true);
  }

  function handleFormSuccess() {
    setFormOpen(false);
    setEditingSubject(null);
    void load();
  }

  async function handleDelete() {
    if (!deletingSubject) return;
    setIsDeleting(true);
    try {
      await clientFetch(`/subjects/${deletingSubject.id}`, {
        method: "DELETE",
      });
      toast.add({
        type: "success",
        title: "Subject deleted",
        description: `"${deletingSubject.name}" was deleted.`,
      });
      setConfirmOpen(false);
      setDeletingSubject(null);
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
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search subjects..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-9 pl-9"
            aria-label="Search subjects"
          />
        </div>
        <Button onClick={openCreate}>
          <PlusIcon aria-hidden="true" />
          Add subject
        </Button>
      </div>

      {loadError ? (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-muted/50 p-12 text-center">
          <p className="font-medium text-destructive">Couldn&apos;t load subjects</p>
          <p className="text-sm text-muted-foreground">{loadError}</p>
          <Button variant="outline" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : subjects === null ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed bg-muted/50 p-12">
          <WeaveSpinner />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/50 p-12 text-center">
          <p className="font-medium">
            {subjects.length === 0 ? "No subjects yet" : "No matching subjects"}
          </p>
          <p className="text-sm text-muted-foreground">
            {subjects.length === 0
              ? "Create your first subject to get started."
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <ul className="grid gap-2">
          {filtered.map((subject) => (
            <li
              key={subject.id}
              className="flex items-center gap-3 rounded-xl border bg-card p-3"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <BookOpenIcon className="size-5" aria-hidden="true" />
              </span>
              <div className="grid min-w-0 flex-1 gap-0.5">
                <Link
                  href={`/subjects/${subject.id}`}
                  className="truncate font-medium hover:underline"
                >
                  {subject.name}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {subject.code}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  nativeButton={false}
                  render={
                    <Link href={`/admin/subjects/${subject.id}/lectures`} />
                  }
                  aria-label={`Manage lectures for ${subject.name}`}
                >
                  <FileTextIcon aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => openEdit(subject)}
                  aria-label={`Edit ${subject.name}`}
                >
                  <PencilIcon aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => openDelete(subject)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Delete ${subject.name}`}
                >
                  <Trash2Icon aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSubject ? "Edit subject" : "New subject"}</DialogTitle>
            <DialogDescription>
              {editingSubject
                ? `Update the details for ${editingSubject.name}.`
                : "Add a new subject students can browse."}
            </DialogDescription>
          </DialogHeader>
          {formOpen ? (
            <SubjectForm subject={editingSubject} onSuccess={handleFormSuccess} />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setConfirmOpen(false);
            setDeletingSubject(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete subject?</DialogTitle>
            <DialogDescription>
              &quot;{deletingSubject?.name ?? "This subject"}&quot; will be
              permanently removed along with its lectures.
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
              Delete subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}