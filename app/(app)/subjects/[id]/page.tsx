import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  FileQuestionIcon,
  FileTextIcon,
} from "lucide-react";
import { LectureItem } from "@/components/subjects/lecture-item";
import { QuizList } from "@/components/quizzes/quiz-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError, apiFetch } from "@/lib/api";
import type { Lecture, Subject } from "@/lib/types";

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [subject, lectures] = await Promise.all([
    apiFetch<Subject>(`/subjects/${id}`, {
      next: { revalidate: 60, tags: ["subjects"] },
    }),
    apiFetch<Lecture[]>(`/subjects/${id}/lectures`, {
      next: { revalidate: 60, tags: ["subjects"] },
    }),
  ]).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Link
        href="/subjects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        All subjects
      </Link>

      <div className="relative overflow-hidden rounded-2xl border">
        <div className="relative aspect-[16/7] w-full">
          {subject.thumbnail ? (
            <>
              <Image
                src={subject.thumbnail}
                alt={subject.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
                aria-hidden="true"
              />
            </>
          ) : (
            <div className="grid h-full w-full place-items-center bg-primary text-primary-foreground">
              <BookOpenIcon className="size-20 opacity-30" aria-hidden="true" />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 grid gap-1.5 p-6">
            <span className="w-fit rounded-md bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              {subject.code}
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {subject.name}
            </h1>
            {subject.description ? (
              <p className="max-w-2xl text-sm text-white/80">
                {subject.description}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <Tabs defaultValue="lectures">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="lectures" className="flex-1 sm:flex-none">
            <FileTextIcon aria-hidden="true" />
            Lectures
            <span className="rounded-full bg-foreground/10 px-1.5 text-xs tabular-nums">
              {lectures.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="flex-1 sm:flex-none">
            <FileQuestionIcon aria-hidden="true" />
            Quizzes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lectures">
          {lectures.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/50 p-12 text-center">
              <FileTextIcon
                className="size-8 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="font-medium">No lectures yet</p>
              <p className="text-sm text-muted-foreground">
                Lecture files will show up here once they&apos;re uploaded.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3">
              {lectures.map((lecture) => (
                <LectureItem key={lecture.id} lecture={lecture} />
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="quizzes">
          <QuizList subjectId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}