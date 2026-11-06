import type { Metadata } from "next";
import { PageFrame } from "@/components/shell";
import { getDSAPlaylistDetail } from "@/features/dsa-playlists/server/get-playlist-detail";
import { PlaylistDetailView } from "@/features/dsa-playlists/components/playlist-detail-view";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ v?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
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

export default async function DSAPlaylistDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { v: preferredVideoId } = await searchParams;

  const detail = await getDSAPlaylistDetail(slug, preferredVideoId);

  return (
    <PageFrame variant="wide-table">
      <PlaylistDetailView initialDetail={detail} />
    </PageFrame>
  );
}

