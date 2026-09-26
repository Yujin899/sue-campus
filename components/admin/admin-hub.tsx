import Link from "next/link";
import {
  ArrowRightIcon,
  BookOpenIcon,
  FileQuestionIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

type AdminSection = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  comingSoon?: boolean;
};

const adminSections: AdminSection[] = [
  {
    title: "Subjects",
    description: "Create, edit, and remove subjects and their thumbnails.",
    href: "/admin/subjects",
    icon: BookOpenIcon,
  },
  {
    title: "Quizzes",
    description: "Build quizzes and manage questions for each subject.",
    href: "/admin/quizzes",
    icon: FileQuestionIcon,
  },
  {
    title: "Users",
    description: "Change roles, block accounts, and remove people.",
    href: "/admin/users",
    icon: UsersIcon,
  },
];

export function AdminHub() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {adminSections.map((section) => (
        <Link
          key={section.href}
          href={section.href}
          className="group flex flex-col gap-4 rounded-xl border bg-card p-5 text-card-foreground transition-colors hover:border-primary/50 hover:bg-accent"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <section.icon className="size-6" aria-hidden="true" />
            </span>
            {section.comingSoon ? (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Coming soon
              </span>
            ) : (
              <ArrowRightIcon
                className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            )}
          </div>
          <div className="grid gap-1">
            <h2 className="font-semibold tracking-tight">{section.title}</h2>
            <p className="text-sm text-muted-foreground">
              {section.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}