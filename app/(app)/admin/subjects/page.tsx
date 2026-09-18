import { BookOpenIcon } from "lucide-react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminHeader } from "@/components/admin/admin-header";
import { SubjectManager } from "@/components/admin/subject-manager";

export default function AdminSubjectsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <AdminHeader
        icon={BookOpenIcon}
        title="Manage subjects"
        description="Create, edit, and remove subjects students can browse."
      />
      <AdminGuard>
        <SubjectManager />
      </AdminGuard>
    </div>
  );
}