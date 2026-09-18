import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon } from "lucide-react";
import type { Subject } from "@/lib/types";

export function SubjectCard({ subject }: { subject: Subject }) {
  return (
    <Link
      href={`/subjects/${subject.id}`}
      className="group flex flex-col gap-4 overflow-hidden rounded-xl border bg-card text-card-foreground transition-colors hover:border-primary/50 hover:bg-accent"
    >
      {subject.thumbnail ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <Image
            src={subject.thumbnail}
            alt={subject.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="grid aspect-[4/3] w-full place-items-center bg-primary/5 text-primary/40">
          <BookOpenIcon className="size-16" aria-hidden="true" />
        </div>
      )}

      <div className="flex flex-col gap-3 px-5 pb-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {subject.code}
          </span>
          <ArrowRightIcon
            className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>

        <div className="grid gap-1">
          <h2 className="font-semibold tracking-tight group-hover:text-foreground">
            {subject.name}
          </h2>
          {subject.description ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {subject.description}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}