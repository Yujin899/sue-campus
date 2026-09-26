import { UsersIcon } from "lucide-react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminHeader } from "@/components/admin/admin-header";
import { UserManager } from "@/components/admin/user-manager";

export default function AdminUsersPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <AdminHeader
        icon={UsersIcon}
        title="Manage users"
        description="Change roles, block accounts, and remove people from the campus."
      />
      <AdminGuard>
        <UserManager />
      </AdminGuard>
    </div>
  );
}
