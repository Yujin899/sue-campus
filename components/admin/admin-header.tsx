import type { LucideIcon } from "lucide-react";
import { cn } from "cn";

export function AdminHeader({
  title,
  description,
  icon: Icon,
  className,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="grid gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}