import type { Metadata } from "next";
import { PageFrame } from "@/components/shell";
import { getDSAPlaylists } from "@/features/dsa-playlists/server/get-playlists";
import { PlaylistCatalog } from "@/features/dsa-playlists/components/playlist-catalog";

export const metadata: Metadata = {
  title: "DSA Playlists & Learning Courses — PRIME",
  description:
    "Curated DSA placement tracks from Striver, Kunal Kushwaha, Aditya Verma & Abdul Bari. Track lessons in order, record notes, and link to LeetCode practice.",
};

export default async function DSAPlaylistsPage() {
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

