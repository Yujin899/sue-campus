import Link from "next/link";
import { ArrowRightIcon, ShieldCheckIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DashboardStatusChart } from "@/components/dashboard/dashboard-status-chart";
import type { Quiz, QuizStatusStats } from "@/lib/types";

export async function DashboardAdmin() {
  const [stats, pending] = await Promise.all([
    apiFetch<QuizStatusStats>("/quizzes/stats", { cache: "no-store" }),
    apiFetch<Quiz[]>("/quizzes?status=PENDING_REVIEW", { cache: "no-store" }),
  ]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold tracking-tight">Admin overview</h2>
        <Link
          href="/admin/quizzes"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Admin tools
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 text-card-foreground">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheckIcon className="size-5" aria-hidden="true" />
            </span>
            <div className="grid gap-1">
              <h3 className="font-semibold tracking-tight">Moderation queue</h3>
              <p className="text-sm text-muted-foreground">
                {pending.length === 0
                  ? "Nothing awaiting review. All caught up."
                  : `${pending.length} ${
                      pending.length === 1 ? "quiz" : "quizzes"
                    } awaiting review.`}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="self-start"
            render={<Link href="/admin/quizzes" />}
            nativeButton={false}
          >
            Review quizzes
            <ArrowRightIcon aria-hidden="true" />
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-5 text-card-foreground">
          <div className="mb-4 grid gap-1">
            <h3 className="font-semibold tracking-tight">Quiz status</h3>
            <p className="text-sm text-muted-foreground">
              {stats.total} {stats.total === 1 ? "quiz" : "quizzes"} in total.
            </p>
          </div>
          <DashboardStatusChart stats={stats} />
        </div>
      </div>
    </section>
  );
}
