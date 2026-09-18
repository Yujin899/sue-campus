"use client";

import * as React from "react";
import Image from "next/image";
import {
  ImagePlusIcon,
  Loader2Icon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { clientFetch } from "@/lib/client-api";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

export type ImagePurpose = "avatar" | "subject-thumbnail";

interface PresignResponse {
  uploadUrl: string;
  params: {
    cloudName: string;
    apiKey: string;
    folder: string;
    timestamp: number;
    signature: string;
  };
}

export function ImageUpload({
  value,
  onChange,
  purpose = "subject-thumbnail",
  disabled,
  className,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  purpose?: ImagePurpose;
  disabled?: boolean;
  className?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const inputId = React.useId();
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const isDisabled = disabled || isUploading;

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.add({
        type: "error",
        title: "Unsupported file",
        description: "Please choose an image file.",
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.add({
        type: "error",
        title: "File too large",
        description: "Images must be 5MB or smaller.",
      });
      return;
    }

    setIsUploading(true);
    try {
      const presign = await clientFetch<PresignResponse>(
        `/images/presign/${purpose}`,
        { method: "POST" },
      );

      const body = new FormData();
      body.append("api_key", presign.params.apiKey);
      body.append("timestamp", String(presign.params.timestamp));
      body.append("signature", presign.params.signature);
      body.append("folder", presign.params.folder);
      body.append("file", file);

      const res = await fetch(presign.uploadUrl, { method: "POST", body });
      if (!res.ok) {
        throw new Error("The image host rejected the upload.");
      }

      const data = (await res.json()) as { secure_url?: string };
      if (!data.secure_url) {
        throw new Error("The upload didn't return an image URL.");
      }

      onChange(data.secure_url);
      toast.add({ type: "success", title: "Image uploaded" });
    } catch (error) {
      toast.add({
        type: "error",
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) void uploadFile(file);
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        disabled={isDisabled}
        onChange={(event) => handleFiles(event.target.files)}
      />

      {value ? (
        <div className="flex items-center gap-3">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
            <Image
              src={value}
              alt="Selected image preview"
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDisabled}
              onClick={() => inputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2Icon className="animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlusIcon aria-hidden="true" />
              )}
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isDisabled}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onChange(null)}
            >
              <XIcon aria-hidden="true" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault();
            if (!isDisabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            if (!isDisabled) handleFiles(event.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed p-6 text-center transition-colors hover:bg-muted/50",
            isDragging && "border-primary bg-primary/5",
            isDisabled && "pointer-events-none opacity-60",
          )}
        >
          {isUploading ? (
            <Loader2Icon
              className="size-6 animate-spin text-muted-foreground"
              aria-hidden="true"
            />
          ) : (
            <UploadCloudIcon
              className="size-6 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          <p className="text-sm font-medium">
            {isUploading
              ? "Uploading..."
              : "Click to upload or drag and drop"}
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WEBP or GIF up to 5MB
          </p>
        </label>
      )}
    </div>
  );
}