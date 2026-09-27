"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { ImageUpload } from "@/components/admin/image-upload";
import { FieldError, fieldAria, useFieldErrors } from "@/components/form/field";
import { ApiRequestError, clientFetch } from "@/lib/client-api";
import { hasErrors, validateSubject } from "@/lib/validation";
import type { Subject } from "@/lib/types";

interface SubjectFormValues {
  code: string;
  name: string;
  description: string;
  thumbnail: string;
}

const EMPTY_VALUES: SubjectFormValues = {
  code: "",
  name: "",
  description: "",
  thumbnail: "",
};

export function SubjectForm({
  subject,
  onSuccess,
}: {
  subject?: Subject | null;
  onSuccess: () => void;
}) {
  const isEditing = Boolean(subject);
  const [values, setValues] = React.useState<SubjectFormValues>(() =>
    subject
      ? {
          code: subject.code,
          name: subject.name,
          description: subject.description ?? "",
          thumbnail: subject.thumbnail ?? "",
        }
      : EMPTY_VALUES,
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { errors, show, clear } = useFieldErrors();

  function update(field: "code" | "name") {
    return (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
      clear(field);
    };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSubmitting) return;

    const found = validateSubject(values);
    if (hasErrors(found)) {
      show(found);
      return;
    }

    setIsSubmitting(true);
    const body = JSON.stringify({
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description.trim(),
      thumbnail: values.thumbnail.trim(),
    });

    try {
      if (subject) {
        await clientFetch(`/subjects/${subject.id}`, {
          method: "PATCH",
          body,
        });
      } else {
        await clientFetch("/subjects", { method: "POST", body });
      }
      toast.add({
        type: "success",
        title: isEditing ? "Subject updated" : "Subject created",
        description: `"${values.name.trim()}" was ${
          isEditing ? "updated" : "created"
        } successfully.`,
      });
      onSuccess();
    } catch (error) {
      if (error instanceof ApiRequestError && hasErrors(error.fieldErrors)) {
        show(error.fieldErrors);
        toast.add({
          type: "error",
          title: isEditing ? "Update failed" : "Creation failed",
          description: "Check the highlighted fields.",
        });
      } else {
        toast.add({
          type: "error",
          title: isEditing ? "Update failed" : "Creation failed",
          description:
            error instanceof Error ? error.message : "Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="subject-code">Code</Label>
          <Input
            id="subject-code"
            placeholder="e.g. CS101"
            autoComplete="off"
            value={values.code}
            disabled={isSubmitting}
            onChange={update("code")}
            {...fieldAria("code", errors.code)}
          />
          <FieldError field="code">{errors.code}</FieldError>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="subject-name">Name</Label>
          <Input
            id="subject-name"
            placeholder="e.g. Introduction to Programming"
            autoComplete="off"
            value={values.name}
            disabled={isSubmitting}
            onChange={update("name")}
            {...fieldAria("name", errors.name)}
          />
          <FieldError field="name">{errors.name}</FieldError>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="subject-description">Description</Label>
        <Textarea
          id="subject-description"
          placeholder="Optional short description shown on the subject card."
          rows={3}
          value={values.description}
          disabled={isSubmitting}
          onChange={(event) =>
            setValues((prev) => ({
              ...prev,
              description: event.target.value,
            }))
          }
        />
      </div>

      <div className="grid gap-2">
        <Label>Thumbnail</Label>
        <ImageUpload
          value={values.thumbnail || null}
          onChange={(url) =>
            setValues((prev) => ({ ...prev, thumbnail: url ?? "" }))
          }
          disabled={isSubmitting}
        />
      </div>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" />} disabled={isSubmitting}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2Icon className="animate-spin" aria-hidden="true" />
          ) : null}
          {isEditing ? "Save changes" : "Create subject"}
        </Button>
      </DialogFooter>
    </form>
  );
}
