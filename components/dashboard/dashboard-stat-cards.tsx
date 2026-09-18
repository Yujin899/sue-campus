import type { LucideIcon } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

export interface DashboardStat {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}

export function DashboardStatCards({ items }: { items: DashboardStat[] }) {
  return (
    <Carousel opts={{ align: "start" }} className="w-full">
      <CarouselContent>
        {items.map((item) => (
          <CarouselItem
            key={item.label}
            className="basis-[82%] sm:basis-1/2 lg:basis-1/4"
          >
            <div className="flex h-full flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                  {item.label}
                </span>
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-4" aria-hidden="true" />
                </span>
              </div>
              <div className="grid gap-0.5">
                <span className="text-2xl font-semibold tracking-tight tabular-nums">
                  {item.value}
                </span>
                {item.hint ? (
                  <span className="text-xs text-muted-foreground">
                    {item.hint}
                  </span>
                ) : null}
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
