import { Suspense } from "react";
import { BookOpenIcon } from "lucide-react";
import { SubjectResults } from "@/components/subjects/subject-results";
import { SubjectSearch } from "@/components/subjects/subject-search";
import { WeaveSpinner } from "@/components/ui/weave-spinner";

function SubjectListLoader() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed bg-muted/50 p-12">
      <WeaveSpinner />
    </div>
  );
}

export default function SubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <BookOpenIcon className="size-6" aria-hidden="true" />
        </span>
        <div className="grid gap-1">
          <h1 className="text-3xl font-semibold tracking-tight">Subjects</h1>
          <p className="text-sm text-muted-foreground">
            Browse all subjects and their lectures.
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <SubjectSearch />
      </Suspense>

      <Suspense fallback={<SubjectListLoader />}>
        <SubjectResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}