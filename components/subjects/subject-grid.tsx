import { SearchXIcon } from "lucide-react";
import { SubjectCard } from "@/components/subjects/subject-card";
import { apiFetch } from "@/lib/api";
import type { Subject } from "@/lib/types";

export async function SubjectGrid({ query }: { query?: string }) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  const qs = params.toString();

  const subjects = await apiFetch<Subject[]>(`/subjects${qs ? `?${qs}` : ""}`, {
    next: { revalidate: 60, tags: ["subjects"] },
  });

  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/50 p-12 text-center">
        <SearchXIcon className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="font-medium">No subjects found</p>
        <p className="text-sm text-muted-foreground">
          {query
            ? `Nothing matches "${query}". Try a different name or code.`
            : "Subjects will appear here once they're added."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {subjects.map((subject) => (
        <SubjectCard key={subject.id} subject={subject} />
      ))}
    </div>
  );
}