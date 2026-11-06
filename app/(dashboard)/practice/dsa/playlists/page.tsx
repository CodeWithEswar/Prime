import type { Metadata } from "next";
import { Suspense } from "react";
import { PageFrame } from "@/components/shell";
import { getDSAPlaylists } from "@/features/dsa-playlists/server/get-playlists";
import { PlaylistCatalog } from "@/features/dsa-playlists/components/playlist-catalog";

export const metadata: Metadata = {
  title: "DSA Playlists & Learning Courses — PRIME",
  description:
    "Curated DSA placement tracks from Striver, Kunal Kushwaha, Aditya Verma & Abdul Bari. Track lessons in order, record notes, and link to LeetCode practice.",
};

function PlaylistCatalogSkeleton() {
  return (
    <PageFrame variant="workspace">
      <div className="space-y-8 animate-pulse">
        <div className="space-y-3">
          <div className="h-4 w-32 bg-neutral-900 rounded" />
          <div className="h-8 w-72 bg-neutral-800 rounded" />
          <div className="h-4 w-96 max-w-full bg-neutral-900/60 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-[#080808] rounded-xl border border-white/[0.06]" />
          ))}
        </div>
      </div>
    </PageFrame>
  );
}

async function DSAPlaylistsContent() {
  const { playlists, continueLearning } = await getDSAPlaylists();

  return (
    <PageFrame variant="workspace">
      <PlaylistCatalog
        playlists={playlists}
        continueLearning={continueLearning}
      />
    </PageFrame>
  );
}

export default function DSAPlaylistsPage() {
  return (
    <Suspense fallback={<PlaylistCatalogSkeleton />}>
      <DSAPlaylistsContent />
    </Suspense>
  );
}
