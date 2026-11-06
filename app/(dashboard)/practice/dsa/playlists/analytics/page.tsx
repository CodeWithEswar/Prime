import type { Metadata } from "next";
import { PageFrame } from "@/components/shell";
import { getDSAPlaylistAnalytics } from "@/features/dsa-playlists/server/get-playlist-analytics";
import { PlaylistAnalyticsView } from "@/features/dsa-playlists/components/playlist-analytics-view";

export const metadata: Metadata = {
  title: "DSA Learning Analytics — PRIME",
  description:
    "Real-time video progress, weekly consistency, topic distribution, and learning vs practice analytics.",
};

export default async function DSAPlaylistAnalyticsPage() {
  const analytics = await getDSAPlaylistAnalytics();

  return (
    <PageFrame variant="workspace">
      <PlaylistAnalyticsView analytics={analytics} />
    </PageFrame>
  );
}

