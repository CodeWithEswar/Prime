import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/shell";
import { SingleProblemView } from "@/features/problems/components/single-problem-view";
import { ProblemPageLoading } from "@/features/problems/components/problem-page-loading";
import { getProblemPageData } from "@/features/problems/queries/problem-page.server";
interface PageProps {
  params: Promise<{ problemSlug: string }>;
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { problemSlug } = await params;
  const { problem } = await getProblemPageData(problemSlug);
  return {
    title: problem
      ? `${problem.title} — PRIME DSA Practice`
      : "Problem not found — PRIME",
    description: problem
      ? `Practice history, revision, and preparation context for ${problem.title}.`
      : undefined,
  };
}
async function ProblemContent({ params }: PageProps) {
  const { problemSlug } = await params;
  const { problem, userId } = await getProblemPageData(problemSlug);
  if (!problem) notFound();
  return (
    <PageFrame variant="wide-table" className="problem-page-frame">
      <SingleProblemView initialProblem={problem} userId={userId} />
    </PageFrame>
  );
}
export default function ProblemPage(props: PageProps) {
  return (
    <Suspense fallback={<ProblemPageLoading />}>
      <ProblemContent {...props} />
    </Suspense>
  );
}
