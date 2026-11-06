import type { Metadata } from "next";
import { Suspense } from "react";
import { PageFrame } from "@/components/shell";
import { getKunalBootcamp } from "@/features/kunal-bootcamp/server/get-kunal-bootcamp";
import { KunalWorkspace } from "@/features/kunal-bootcamp/components/kunal-workspace";

export const metadata: Metadata = {
  title: "Java + DSA Bootcamp — Kunal Kushwaha — PRIME",
  description:
    "Complete Java and DSA Bootcamp by Kunal Kushwaha with 19 modules, 69 verified master lectures, timestamp chapters, assignments, and FAANG interview preparation.",
};

interface PageProps {
  searchParams: Promise<{
    topic?: string;
    v?: string;
    a?: string;
  }>;
}

function KunalWorkspaceSkeleton() {
  return (
    <PageFrame variant="wide-table">
      <div className="space-y-6 animate-pulse">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 xl:col-span-3 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-14 bg-[#080808] rounded-lg border border-white/[0.05]" />
            ))}
          </div>
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            <div className="aspect-video bg-[#080808] rounded-xl border border-white/[0.06]" />
            <div className="h-44 bg-[#080808] rounded-xl border border-white/[0.06]" />
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

async function KunalBootcampContent({ searchParams }: PageProps) {
  const { topic, v, a } = await searchParams;
  const detail = await getKunalBootcamp(topic, v, a);

  return (
    <PageFrame variant="wide-table">
      <KunalWorkspace initialDetail={detail} />
    </PageFrame>
  );
}

export default async function KunalBootcampPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<KunalWorkspaceSkeleton />}>
      <KunalBootcampContent searchParams={searchParams} />
    </Suspense>
  );
}

