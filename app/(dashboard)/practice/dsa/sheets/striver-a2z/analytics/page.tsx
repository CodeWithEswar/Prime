import type { Metadata } from "next";
import { Suspense } from "react";
import { PageFrame } from "@/components/shell";
import { getStriverAnalytics } from "@/features/striver-a2z/server/get-striver-analytics";
import { StriverAnalyticsView } from "@/features/striver-a2z/components/striver-analytics-view";

export const metadata: Metadata = {
  title: "Striver A2Z Learning Analytics — PRIME",
  description:
    "Comprehensive telemetry separating lecture watching, coding practice, and topic mastery on Striver's A2Z DSA Sheet.",
};

function StriverAnalyticsSkeleton() {
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

async function StriverAnalyticsContent() {
  const analytics = await getStriverAnalytics();

  return (
    <PageFrame variant="wide-table">
      <StriverAnalyticsView analytics={analytics} />
    </PageFrame>
  );
}

export default function StriverA2ZAnalyticsPage() {
  return (
    <Suspense fallback={<StriverAnalyticsSkeleton />}>
      <StriverAnalyticsContent />
    </Suspense>
  );
}

