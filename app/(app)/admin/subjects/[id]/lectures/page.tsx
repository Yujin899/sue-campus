import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, FileTextIcon } from "lucide-react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminHeader } from "@/components/admin/admin-header";
import { LectureManager } from "@/components/admin/lecture-manager";
import { ApiError, apiFetch } from "@/lib/api";
import type { Subject } from "@/lib/types";

export default async function AdminSubjectLecturesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const subject = await apiFetch<Subject>(`/subjects/${id}`, {
    next: { revalidate: 60, tags: ["subjects"] },
  }).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Link
        href="/admin/subjects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        Back to subjects
      </Link>

      <AdminHeader
        icon={FileTextIcon}
        title="Manage lectures"
        description={`Upload and manage lecture PDFs for ${subject.name} (${subject.code}).`}
      />

      <AdminGuard>
        <LectureManager subjectId={subject.id} />
      </AdminGuard>
    </div>
  );
}