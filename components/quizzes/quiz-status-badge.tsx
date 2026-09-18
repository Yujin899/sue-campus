import { Badge } from "@/components/ui/badge";
import type { QuizStatus } from "@/lib/types";

const STATUS_LABELS: Record<QuizStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
};

const STATUS_VARIANTS: Record<
  QuizStatus,
  "secondary" | "warning" | "success" | "destructive"
> = {
  DRAFT: "secondary",
  PENDING_REVIEW: "warning",
  PUBLISHED: "success",
  REJECTED: "destructive",
};

export function QuizStatusBadge({ status }: { status: QuizStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}
