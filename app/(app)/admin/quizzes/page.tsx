import { FileQuestionIcon } from "lucide-react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminQuizManager } from "@/components/quizzes/admin-quiz-manager";

export default function AdminQuizzesPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <AdminHeader
        icon={FileQuestionIcon}
        title="Manage quizzes"
        description="Review submitted quizzes, publish them, and moderate content."
      />
      <AdminGuard>
        <AdminQuizManager />
      </AdminGuard>
    </div>
  );
}
