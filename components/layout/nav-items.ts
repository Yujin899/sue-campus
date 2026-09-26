import {
  BookOpenIcon,
  FileQuestionIcon,
  LayoutDashboardIcon,
  ShieldIcon,
  UserRoundIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const mainNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Subjects", href: "/subjects", icon: BookOpenIcon },
  { title: "Quizzes", href: "/quizzes", icon: FileQuestionIcon },
  { title: "Profile", href: "/profile", icon: UserRoundIcon },
];

export const adminNavItems: NavItem[] = [
  { title: "Admin", href: "/admin", icon: ShieldIcon, exact: true },
  { title: "Subjects", href: "/admin/subjects", icon: BookOpenIcon },
  { title: "Quizzes", href: "/admin/quizzes", icon: FileQuestionIcon },
  { title: "Users", href: "/admin/users", icon: UsersIcon },
];

export const adminTabItem: NavItem = {
  title: "Admin",
  href: "/admin",
  icon: ShieldIcon,
};

const sectionTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/subjects": "Subjects",
  "/quizzes": "Quizzes",
  "/profile": "Profile",
  "/admin": "Admin",
};

export function getPageTitle(pathname: string): string {
  const section = `/${pathname.split("/")[1] ?? ""}`;
  return sectionTitles[section] ?? "Sue Campus";
}

export function isItemActive(
  pathname: string,
  href: string,
  exact = false,
): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}