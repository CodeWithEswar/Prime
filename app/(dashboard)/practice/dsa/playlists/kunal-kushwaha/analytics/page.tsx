import type { Metadata } from "next";
import { Suspense } from "react";
import { PageFrame } from "@/components/shell";
import { getKunalAnalytics } from "@/features/kunal-bootcamp/server/get-kunal-analytics";
import { KunalAnalyticsView } from "@/features/kunal-bootcamp/components/kunal-analytics-view";

export const metadata: Metadata = {
  title: "Kunal Kushwaha Bootcamp Analytics — PRIME",
  description:
    "Comprehensive telemetry separating Java video consumption, algorithm problem solving, assignment completion, and topic mastery.",
};

function KunalAnalyticsSkeleton() {
  return (
    <PageFrame variant="wide-table">
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="space-y-2 border-b border-white/[0.08] pb-4">
          <div className="h-4 w-40 bg-neutral-900 rounded" />
          <div className="h-8 w-72 bg-neutral-800 rounded" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[#080808] rounded-xl border border-white/[0.06]" />
          ))}
        </div>
        <div className="h-80 bg-[#080808] rounded-xl border border-white/[0.06]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-[#080808] rounded-xl border border-white/[0.06]" />
          <div className="h-72 bg-[#080808] rounded-xl border border-white/[0.06]" />
        </div>
      </div>
    </PageFrame>
  );
}

async function KunalAnalyticsContent() {
  const analytics = await getKunalAnalytics();

  return (
    <PageFrame variant="wide-table">
      <KunalAnalyticsView analytics={analytics} />
    </PageFrame>
  );
}

export default function KunalBootcampAnalyticsPage() {
  return (
    <Suspense fallback={<KunalAnalyticsSkeleton />}>
      <KunalAnalyticsContent />
    </Suspense>
  );
}

