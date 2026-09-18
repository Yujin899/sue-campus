import {
  BookOpenIcon,
  FileQuestionIcon,
  ListChecksIcon,
  TargetIcon,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { DashboardContinue } from "@/components/dashboard/dashboard-continue";
import { DashboardDrafts } from "@/components/dashboard/dashboard-drafts";
import {
  DashboardStatCards,
  type DashboardStat,
} from "@/components/dashboard/dashboard-stat-cards";
import { DashboardSubjects } from "@/components/dashboard/dashboard-subjects";
import type { MyAttemptsOverview, Quiz, Subject } from "@/lib/types";

export async function DashboardOverview() {
  const [overview, quizzes, mine, subjects] = await Promise.all([
    apiFetch<MyAttemptsOverview>("/quizzes/attempts/mine", {
      cache: "no-store",
    }),
    apiFetch<Quiz[]>("/quizzes", {
      next: { revalidate: 60, tags: ["quizzes"] },
    }),
    apiFetch<Quiz[]>("/quizzes?mine=true", { cache: "no-store" }),
    apiFetch<Subject[]>("/subjects", {
      next: { revalidate: 60, tags: ["subjects"] },
    }),
  ]);

  const published = quizzes.filter((quiz) => quiz.status === "PUBLISHED");
  const drafts = mine.filter(
    (quiz) => quiz.status === "DRAFT" || quiz.status === "REJECTED",
  );
  const { stats } = overview;

  const statItems: DashboardStat[] = [
    {
      label: "Subjects",
      value: String(subjects.length),
      hint: "Available to browse",
      icon: BookOpenIcon,
    },
    {
      label: "Published quizzes",
      value: String(published.length),
      hint: "Ready to attempt",
      icon: FileQuestionIcon,
    },
    {
      label: "My quizzes",
      value: String(mine.length),
      hint: drafts.length
        ? `${drafts.length} unpublished`
        : "All published",
      icon: ListChecksIcon,
    },
    {
      label: "Attempts",
      value: String(stats.attempts),
      hint:
        stats.averagePercentage != null
          ? `Avg ${stats.averagePercentage}% · Best ${stats.bestPercentage ?? 0}%`
          : "Take your first quiz",
      icon: TargetIcon,
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardStatCards items={statItems} />
      <DashboardContinue
        inProgress={overview.inProgress}
        quizzes={published.slice(0, 3)}
      />
      <DashboardDrafts quizzes={drafts} />
      <DashboardCharts recent={overview.recent} bySubject={overview.bySubject} />
      <DashboardSubjects subjects={subjects} />
    </div>
  );
}
