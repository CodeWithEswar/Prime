import type { Metadata } from "next";
import { Suspense } from "react";
import { PageFrame } from "@/components/shell";
import { getStriverSheet } from "@/features/striver-a2z/server/get-striver-sheet";
import { getStriverAnalytics } from "@/features/striver-a2z/server/get-striver-analytics";
import { StriverWorkspace } from "@/features/striver-a2z/components/striver-workspace";

export const metadata: Metadata = {
  title: "Striver A2Z DSA Sheet — Complete Learning Track — PRIME",
  description:
    "Official Striver A2Z DSA Sheet with 18 steps, 299 verified video lectures, 372 practice problems, and independent topic mastery tracking.",
};

interface PageProps {
  searchParams: Promise<{
    topic?: string;
    v?: string;
  }>;
}

function StriverSheetSkeleton() {
  return (
    <PageFrame variant="wide-table">
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="p-6 rounded-xl bg-[#080808] border border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-5 w-44 bg-neutral-900 rounded" />
              <div className="h-8 w-80 bg-neutral-800 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-28 bg-neutral-900 rounded" />
              <div className="h-9 w-32 bg-neutral-900 rounded" />
            </div>
          </div>
          <div className="h-2 w-full bg-neutral-900 rounded-full" />
        </div>

        {/* Workspace Skeleton Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Steps Sidebar Skeleton */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-14 bg-[#080808] rounded-lg border border-white/[0.05]" />
            ))}
          </div>

          {/* Main Content Area Skeleton */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            <div className="h-72 bg-[#080808] rounded-xl border border-white/[0.06]" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-[#070707] rounded-md border border-white/[0.04]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

async function StriverSheetContent({ searchParams }: PageProps) {
  const { topic, v } = await searchParams;

  const [sheetDetail, analytics] = await Promise.all([
    getStriverSheet(topic, v),
    getStriverAnalytics(),
  ]);

  return (
    <PageFrame variant="wide-table">
      <StriverWorkspace
        initialDetail={sheetDetail}
        analytics={analytics}
      />
    </PageFrame>
  );
}

export default function StriverA2ZSheetPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<StriverSheetSkeleton />}>
      <StriverSheetContent searchParams={searchParams} />
    </Suspense>
  );
}
