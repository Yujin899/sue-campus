import { ShieldIcon } from "lucide-react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminHub } from "@/components/admin/admin-hub";

export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <AdminHeader
        icon={ShieldIcon}
        title="Admin"
        description="Pick an area to manage."
      />
      <AdminGuard>
        <AdminHub />
      </AdminGuard>
    </div>
  );
}