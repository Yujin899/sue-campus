import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { SubjectCard } from "@/components/subjects/subject-card";
import type { Subject } from "@/lib/types";

export function DashboardSubjects({ subjects }: { subjects: Subject[] }) {
  if (!subjects.length) {
    return null;
  }

  return (
    <Carousel opts={{ align: "start" }} className="w-full">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold tracking-tight">Subjects</h2>
        <Link
          href="/subjects"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>

      <CarouselContent className="mt-3">
        {subjects.map((subject) => (
          <CarouselItem key={subject.id} className="sm:basis-1/2 lg:basis-1/3">
            <SubjectCard subject={subject} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
