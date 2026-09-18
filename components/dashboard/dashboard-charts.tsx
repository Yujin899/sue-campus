"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { AttemptOverviewItem, SubjectPerformance } from "@/lib/types";

const trendConfig = {
  percentage: { label: "Score", color: "var(--chart-1)" },
} satisfies ChartConfig;

const subjectConfig = {
  averagePercentage: { label: "Average", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function DashboardCharts({
  recent,
  bySubject,
}: {
  recent: AttemptOverviewItem[];
  bySubject: SubjectPerformance[];
}) {
  const trendData = [...recent]
    .sort((a, b) => (a.submittedAt ?? "").localeCompare(b.submittedAt ?? ""))
    .map((attempt, index) => ({
      label: `#${index + 1}`,
      percentage: attempt.percentage,
      title: attempt.quizTitle,
    }));

  const subjectData = bySubject.map((subject) => ({
    code: subject.code,
    averagePercentage: subject.averagePercentage,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border bg-card p-5 text-card-foreground">
        <div className="mb-4 grid gap-1">
          <h2 className="font-semibold tracking-tight">Score trend</h2>
          <p className="text-sm text-muted-foreground">
            Your recent quiz scores over time.
          </p>
        </div>

        {trendData.length ? (
          <ChartContainer
            config={trendConfig}
            className="aspect-auto h-60 w-full"
          >
            <AreaChart
              data={trendData}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-percentage)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-percentage)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                width={36}
                unit="%"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="percentage"
                type="monotone"
                fill="url(#fillScore)"
                stroke="var(--color-percentage)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <EmptyChart />
        )}
      </section>

      <section className="rounded-xl border bg-card p-5 text-card-foreground">
        <div className="mb-4 grid gap-1">
          <h2 className="font-semibold tracking-tight">Performance by subject</h2>
          <p className="text-sm text-muted-foreground">
            Your average score in each subject.
          </p>
        </div>

        {subjectData.length ? (
          <ChartContainer
            config={subjectConfig}
            className="aspect-auto h-60 w-full"
          >
            <BarChart
              data={subjectData}
              layout="vertical"
              margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                unit="%"
              />
              <YAxis
                dataKey="code"
                type="category"
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                dataKey="averagePercentage"
                fill="var(--color-averagePercentage)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <EmptyChart />
        )}
      </section>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="grid h-60 place-items-center rounded-lg border border-dashed text-sm text-muted-foreground">
      No data yet — complete a quiz to see your progress.
    </div>
  );
}
