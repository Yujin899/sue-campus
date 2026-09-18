import { FileTextIcon } from "lucide-react";
import { LectureDownloadButton } from "@/components/subjects/lecture-download-button";
import { formatDate, formatFileSize } from "@/lib/format";
import type { Lecture } from "@/lib/types";

export function LectureItem({ lecture }: { lecture: Lecture }) {
  return (
    <li className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground sm:flex-row sm:items-center">
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
      <LectureDownloadButton lectureId={lecture.id} />
    </li>
  );
}