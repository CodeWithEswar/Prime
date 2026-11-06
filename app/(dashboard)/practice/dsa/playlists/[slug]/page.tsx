import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageFrame } from "@/components/shell";
import { getDSAPlaylistDetail } from "@/features/dsa-playlists/server/get-playlist-detail";
import { PlaylistDetailView } from "@/features/dsa-playlists/components/playlist-detail-view";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ v?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "kunal-java-dsa" || slug === "kunal-kushwaha") {
    return {
      title: "Java + DSA Bootcamp — Kunal Kushwaha — PRIME",
      description:
        "Complete Java and DSA Bootcamp by Kunal Kushwaha with 19 modules, 69 verified master lectures, timestamp chapters, assignments, and FAANG interview preparation.",
    };
  }
  try {
    const detail = await getDSAPlaylistDetail(slug);
    return {
      title: `${detail.playlist.title} — PRIME DSA`,
      description: detail.playlist.focus,
    };
  } catch {
    return {
      title: "DSA Course — PRIME",
    };
  }
}

function PlaylistDetailSkeleton() {
  return (
    <PageFrame variant="wide-table">
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="p-6 rounded-xl bg-[#080808] border border-white/[0.08] space-y-4">
          <div className="h-6 w-72 bg-neutral-900 rounded" />
          <div className="h-4 w-96 max-w-full bg-neutral-900/60 rounded" />
          <div className="h-2 w-full bg-neutral-900 rounded-full" />
        </div>

        {/* Video & Curriculum Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="aspect-video bg-[#080808] rounded-xl border border-white/[0.06]" />
            <div className="h-28 bg-[#080808] rounded-xl border border-white/[0.05]" />
          </div>
          <div className="lg:col-span-4 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 bg-[#080808] rounded-lg border border-white/[0.05]" />
            ))}
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

async function DSAPlaylistDetailContent({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { v: preferredVideoId } = await searchParams;

  if (slug === "kunal-java-dsa" || slug === "kunal-kushwaha") {
    redirect(`/practice/dsa/playlists/kunal-kushwaha${preferredVideoId ? `?v=${preferredVideoId}` : ""}`);
  }

  const detail = await getDSAPlaylistDetail(slug, preferredVideoId);

  return (
    <PageFrame variant="wide-table">
      <PlaylistDetailView initialDetail={detail} />
    </PageFrame>
  );
}

export default function DSAPlaylistDetailPage({ params, searchParams }: PageProps) {
  return (
    <Suspense fallback={<PlaylistDetailSkeleton />}>
      <DSAPlaylistDetailContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
