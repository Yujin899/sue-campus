import { Suspense } from "react";
import { DashboardAdmin } from "@/components/dashboard/dashboard-admin";
import { DashboardGreeting } from "@/components/dashboard/dashboard-greeting";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { getServerUser } from "@/lib/server-auth";

export default async function DashboardPage() {
  const user = await getServerUser();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <DashboardGreeting />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardOverview />
      </Suspense>

      {isAdmin ? (
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardAdmin />
        </Suspense>
      ) : null}
    </div>
  );
}
