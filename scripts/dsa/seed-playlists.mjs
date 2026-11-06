/**
 * PRIME — Curated DSA Playlists Seeding Script
 * Seeds the 10 curated playlists, 433 verified YouTube videos, and practice question links.
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function main() {
  console.log("🌱 Starting Curated DSA Playlists Seeding...");

  const manifestPath = path.resolve("content/dsa/playlists-manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest file not found at ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  console.log(`Found ${manifest.length} playlists in manifest.`);

  // 1. Seed Playlists
  for (const pl of manifest) {
    console.log(`Seeding playlist: ${pl.title} (${pl.slug})...`);
    const { data: playlistRow, error: plErr } = await supabase
      .from("dsa_playlists")
      .upsert(
        {
          slug: pl.slug,
          youtube_playlist_id: pl.playlistId,
          title: pl.title,
          instructor: pl.instructor,
          channel_title: pl.channel,
          description: pl.focus,
          difficulty: pl.difficulty,
          level: pl.level,
          focus: pl.focus,
          programming_language: pl.language,
          thumbnail_url: pl.thumbnailUrl,
          video_count: pl.videos.length,
          total_duration_seconds: pl.totalDurationSeconds,
          topic_tags: pl.topicTags,
          is_featured: pl.isFeatured,
          is_default: pl.isDefault,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (plErr || !playlistRow) {
      console.error(`Error seeding playlist ${pl.slug}:`, plErr);
      continue;
    }

    const playlistId = playlistRow.id;

    // 2. Batch upsert canonical videos
    const videoChunks = [];
    const chunkSize = 50;
    for (let i = 0; i < pl.videos.length; i += chunkSize) {
      videoChunks.push(pl.videos.slice(i, i + chunkSize));
    }

    for (const chunk of videoChunks) {
      const videoPayload = chunk.map((v) => ({
        youtube_video_id: v.youtubeVideoId,
        title: v.title,
        duration_seconds: v.durationSeconds,
        thumbnail_url: v.thumbnailUrl,
        channel_title: v.channelTitle,
        canonical_topic_slug: v.topicSlug || "fundamentals",
        embed_allowed: true,
      }));

      const { data: insertedVideos, error: vidErr } = await supabase
        .from("dsa_videos")
        .upsert(videoPayload, { onConflict: "youtube_video_id" })
        .select("id, youtube_video_id");

      if (vidErr) {
        console.error(`Error seeding videos for ${pl.slug}:`, vidErr);
        continue;
      }

      const videoIdMap = new Map((insertedVideos || []).map((v) => [v.youtube_video_id, v.id]));

      // 3. Seed playlist items (ordering)
      const itemPayload = chunk
        .map((v) => {
          const videoDbId = videoIdMap.get(v.youtubeVideoId);
          if (!videoDbId) return null;
          return {
            playlist_id: playlistId,
            video_id: videoDbId,
            position: v.position,
            topic_slug: v.topicSlug || "fundamentals",
            is_essential: true,
          };
        })
        .filter(Boolean);

      const { error: itemErr } = await supabase
        .from("dsa_playlist_items")
        .upsert(itemPayload, { onConflict: "playlist_id,video_id" });

      if (itemErr) {
        console.error(`Error seeding playlist items for ${pl.slug}:`, itemErr);
      }
    }

    console.log(`✅ Playlist ${pl.slug}: ${pl.videos.length} videos synced.`);
  }

  // 4. Link canonical practice questions from problems table
  console.log("🔗 Linking canonical practice questions to DSA videos...");
  const { data: problems } = await supabase
    .from("problems")
    .select("id, slug, title");

  const { data: allVideos } = await supabase
    .from("dsa_videos")
    .select("id, title, canonical_topic_slug");

  if (problems && allVideos && problems.length > 0) {
    const questionLinks = [];
    for (const v of allVideos) {
      const vTitle = v.title.toLowerCase();
      // Match problems whose title or slug is mentioned in the video title
      const matched = problems.filter((p) => {
        const pTitle = p.title.toLowerCase();
        return (
          vTitle.includes(pTitle) ||
          (pTitle.length > 6 && vTitle.includes(pTitle.slice(0, 10))) ||
          (v.canonical_topic_slug === "binary-search" && p.slug.includes("binary-search"))
        );
      });

      for (const p of matched.slice(0, 3)) {
        questionLinks.push({
          video_id: v.id,
          problem_id: p.id,
          relationship: "practice",
          notes: `Practice problem for ${v.title}`,
        });
      }
    }

    if (questionLinks.length > 0) {
      const { error: linkErr } = await supabase
        .from("dsa_video_question_links")
        .upsert(questionLinks, { onConflict: "video_id,problem_id" });

      if (linkErr) {
        console.warn("Question link warning (ignorable if problems empty):", linkErr.message);
      } else {
        console.log(`✅ Created ${questionLinks.length} video-practice question links.`);
      }
    }
  }

  console.log("🎉 Curated DSA Playlists Seeding Completed Successfully!");
}

main().catch(console.error);

