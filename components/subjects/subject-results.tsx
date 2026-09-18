import { SubjectGrid } from "@/components/subjects/subject-grid";

export async function SubjectResults({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : undefined;
  return <SubjectGrid query={query} />;
}