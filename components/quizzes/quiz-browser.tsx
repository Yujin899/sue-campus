"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { QuizCard } from "@/components/quizzes/quiz-card";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import type { Quiz } from "@/lib/types";

interface QuizGroup {
  id: string;
  code: string;
  name: string;
  quizzes: Quiz[];
}

function groupBySubject(quizzes: Quiz[]): QuizGroup[] {
  const groups = new Map<string, QuizGroup>();

  for (const quiz of quizzes) {
    const key = quiz.subject?.id ?? "unassigned";
    const existing = groups.get(key);

    if (existing) {
      existing.quizzes.push(quiz);
      continue;
    }

    groups.set(key, {
      id: key,
      code: quiz.subject?.code ?? "—",
      name: quiz.subject?.name ?? "Unassigned",
      quizzes: [quiz],
    });
  }

  return Array.from(groups.values());
}

function QuizGrid({ quizzes }: { quizzes: Quiz[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}
    </div>
  );
}

export function QuizBrowser({ quizzes }: { quizzes: Quiz[] }) {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => groupBySubject(quizzes), [quizzes]);

  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return quizzes.filter((quiz) => {
      const subject = `${quiz.subject?.code ?? ""} ${
        quiz.subject?.name ?? ""
      }`.toLowerCase();

      return (
        quiz.title.toLowerCase().includes(normalizedQuery) ||
        (quiz.description?.toLowerCase().includes(normalizedQuery) ?? false) ||
        subject.includes(normalizedQuery)
      );
    });
  }, [quizzes, normalizedQuery]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search quizzes or subjects…"
          aria-label="Search quizzes"
          className="h-9 pl-8"
        />
      </div>

      {normalizedQuery ? (
        results.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed bg-muted/50 p-12 text-center">
            <SearchIcon
              className="size-8 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="font-medium">No quizzes match “{query.trim()}”</p>
            <p className="text-sm text-muted-foreground">
              Try a different title or subject.
            </p>
          </div>
        ) : (
          <QuizGrid quizzes={results} />
        )
      ) : (
        <Accordion multiple defaultValue={groups[0] ? [groups[0].id] : []}>
          {groups.map((group) => (
            <AccordionItem key={group.id} value={group.id}>
              <AccordionHeader>
                <AccordionTrigger>
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                      {group.code}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {group.name}
                    </span>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                      {group.quizzes.length}
                    </span>
                  </span>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>
                <div className="border-t p-4">
                  <QuizGrid quizzes={group.quizzes} />
                </div>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
