"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { QuizStatus, QuizStatusStats } from "@/lib/types";

const statusOrder: { status: QuizStatus; label: string; color: string }[] = [
  { status: "DRAFT", label: "Draft", color: "var(--chart-3)" },
  {
    status: "PENDING_REVIEW",
    label: "Pending",
    color: "var(--chart-4)",
  },
  { status: "PUBLISHED", label: "Published", color: "var(--chart-1)" },
  { status: "REJECTED", label: "Rejected", color: "var(--chart-5)" },
];

const statusConfig = {
  count: { label: "Quizzes" },
} satisfies ChartConfig;

export function DashboardStatusChart({
  stats,
}: {
  stats: QuizStatusStats;
}) {
  const data = statusOrder.map((item) => ({
    label: item.label,
    count: stats.byStatus[item.status] ?? 0,
    fill: item.color,
  }));

  return (
    <ChartContainer config={statusConfig} className="aspect-auto h-60 w-full">
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Bar dataKey="count" radius={4}>
          {data.map((entry) => (
            <Cell key={entry.label} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
