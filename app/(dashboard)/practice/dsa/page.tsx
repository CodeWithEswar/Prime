import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  getFilterOptions,
  getPracticeCatalog,
  getUserPracticeSummary,
  PracticeCatalogView,
  type PracticeCatalogFilter,
  type ProblemDifficulty,
  type UserProblemStatus,
  type CompanyWindow,
  type PracticeSort,
} from "@/features/problems";
import { Skeleton } from "@/components/ui/skeleton";
import { PageFrame } from "@/components/shell";

export const metadata: Metadata = {
  title: "DSA Practice — PRIME",
  description:
    "Canonical DSA catalog, advanced filtering, context-driven practice, and spaced retention tracking.",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    topic?: string;
    difficulty?: string;
    status?: string;
    collection?: string;
    company?: string;
    window?: string;
    revision?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
  }>;
}

function PracticeCatalogSkeleton() {
  return (
    <PageFrame variant="wide-table">
      <div className="space-y-6">
        <div className="pb-6 border-b border-[var(--border-subtle)] space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-96 max-w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="hidden lg:block lg:col-span-1 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="col-span-1 lg:col-span-3 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

async function PracticeCatalogContent({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentFilters: PracticeCatalogFilter = {
    q: resolvedSearchParams.q || "",
    topic: resolvedSearchParams.topic || "",
    difficulty: (resolvedSearchParams.difficulty as ProblemDifficulty) || "",
    status: (resolvedSearchParams.status as UserProblemStatus) || "",
    collection: resolvedSearchParams.collection || "",
    company: resolvedSearchParams.company || "",
    window: (resolvedSearchParams.window as CompanyWindow) || "",
    revision: (resolvedSearchParams.revision as "due" | "overdue") || "",
    sort: (resolvedSearchParams.sort as PracticeSort) || "recommended",
    page: resolvedSearchParams.page ? parseInt(resolvedSearchParams.page, 10) : 1,
    pageSize: resolvedSearchParams.pageSize ? parseInt(resolvedSearchParams.pageSize, 10) : 25,
    userId: user?.id,
  };

  const [filterOptions, catalogResult, summary] = await Promise.all([
    getFilterOptions(supabase),
    getPracticeCatalog(supabase, currentFilters),
    getUserPracticeSummary(supabase, user?.id),
  ]);

  return (
    <PageFrame variant="wide-table">
      <PracticeCatalogView
        summary={summary}
        filterOptions={filterOptions}
        catalogResult={catalogResult}
        currentFilters={currentFilters}
      />
    </PageFrame>
  );
}

export default function DSAPracticePage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<PracticeCatalogSkeleton />}>
      <PracticeCatalogContent searchParams={searchParams} />
    </Suspense>
  );
}
