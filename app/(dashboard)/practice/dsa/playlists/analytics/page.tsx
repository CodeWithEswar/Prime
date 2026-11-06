import type { Metadata } from "next";
import { Suspense } from "react";
import { PageFrame } from "@/components/shell";
import { getDSAPlaylistAnalytics } from "@/features/dsa-playlists/server/get-playlist-analytics";
import { PlaylistAnalyticsView } from "@/features/dsa-playlists/components/playlist-analytics-view";

export const metadata: Metadata = {
  title: "DSA Learning Analytics — PRIME",
  description:
    "Real-time video progress, weekly consistency, topic distribution, and learning vs practice analytics.",
};

function PlaylistAnalyticsSkeleton() {
  return (
    <PageFrame variant="workspace">
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-neutral-900 rounded" />
          <div className="h-8 w-64 bg-neutral-800 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#080808] rounded-xl border border-white/[0.06]" />
          ))}
        </div>
        <div className="h-80 bg-[#080808] rounded-xl border border-white/[0.06]" />
      </div>
    </PageFrame>
  );
}

async function DSAPlaylistAnalyticsContent() {
  const analytics = await getDSAPlaylistAnalytics();

  return (
    <PageFrame variant="workspace">
      <PlaylistAnalyticsView analytics={analytics} />
    </PageFrame>
  );
}

export default function DSAPlaylistAnalyticsPage() {
  return (
    <Suspense fallback={<PlaylistAnalyticsSkeleton />}>
      <DSAPlaylistAnalyticsContent />
    </Suspense>
  );
}
