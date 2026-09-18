"use client";

import * as React from "react";
import { DownloadIcon, Loader2Icon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { clientFetch } from "@/lib/client-api";
import type { LectureDownload } from "@/lib/types";

export function LectureDownloadButton({
  lectureId,
}: {
  lectureId: string;
}) {
  const [isPending, setIsPending] = React.useState(false);

  async function handleDownload() {
    setIsPending(true);
    try {
      const data = await clientFetch<LectureDownload>(
        `/lectures/${lectureId}/download`,
      );
      const anchor = document.createElement("a");
      anchor.href = data.url;
      anchor.download = data.fileName;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } catch {
      toast.add({
        type: "error",
        title: "Download failed",
        description: "Couldn't start the download. Please try again.",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void handleDownload()}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2Icon className="animate-spin" aria-hidden="true" />
      ) : (
        <DownloadIcon aria-hidden="true" />
      )}
      Download
    </Button>
  );
}