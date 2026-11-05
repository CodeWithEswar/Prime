/**
 * Seeds the Supabase database with all Aptitude tracks, days, topics, and videos
 * from content/aptitude/aptitude-curriculum-manifest.json and video-catalog.json.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

async function main() {
  console.log("🌱 Starting Aptitude Curriculum Database Seed...");

  const manifestPath = path.resolve(
    "content/aptitude/aptitude-curriculum-manifest.json"
  );
  const catalogPath = path.resolve("content/aptitude/video-catalog.json");

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const videoCatalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));

  // 1. Seed Tracks
  console.log(`Seeding ${manifest.tracks.length} tracks...`);
  const tracksPayload = manifest.tracks.map((tr) => ({
    id: tr.id,
    slug: tr.slug,
    title: tr.title,
    description: tr.description,
    order_index: tr.orderIndex,
    color: tr.color || "#FF4D4D",
  }));

  const { error: trackErr } = await supabase
    .from("aptitude_tracks")
    .upsert(tracksPayload, { onConflict: "id" });
  if (trackErr) throw new Error("Failed to seed tracks: " + trackErr.message);
  console.log("✅ Tracks seeded successfully.");

  // Map track slugs to track IDs
  const trackMap = Object.fromEntries(
    manifest.tracks.map((tr) => [tr.slug, tr.id])
  );

  // 2. Seed Days
  console.log(`Seeding ${manifest.days.length} days...`);
  const daysPayload = manifest.days.map((d) => ({
    id: d.id,
    day_number: d.dayNumber,
    track_id: trackMap[d.trackSlug] || manifest.tracks[0].id,
    title: d.title,
    subtitle: d.subtitle || "",
    description: d.description || "",
    is_assessment_day: Boolean(d.isAssessmentDay),
    estimated_minutes: d.estimatedMinutes || 90,
    sort_order: d.dayNumber,
  }));

  const { error: dayErr } = await supabase
    .from("aptitude_days")
    .upsert(daysPayload, { onConflict: "id" });
  if (dayErr) throw new Error("Failed to seed days: " + dayErr.message);
  console.log("✅ Days seeded successfully.");

  // 3. Seed Topics
  const allTopics = manifest.days.flatMap((d) =>
    (d.topics || []).map((t) => ({ ...t, dayId: d.id }))
  );
  console.log(`Seeding ${allTopics.length} topics...`);

  const topicsPayload = allTopics.map((t) => ({
    id: t.id,
    day_id: t.dayId,
    day_number: t.dayNumber,
    track_slug: t.trackSlug,
    title: t.title,
    order_index: t.orderIndex,
    difficulty: t.difficulty || "Medium",
    priority: t.priority || "High",
    estimated_minutes: t.estimatedMinutes || 30,
    objectives: t.objectives || [],
    prerequisites: t.prerequisites || [],
    concept_checklist: t.conceptChecklist || [],
    formula_notes: t.formulaNotes || "",
  }));

  // Batch insert topics in chunks of 50
  for (let i = 0; i < topicsPayload.length; i += 50) {
    const chunk = topicsPayload.slice(i, i + 50);
    const { error: topicErr } = await supabase
      .from("aptitude_topics")
      .upsert(chunk, { onConflict: "id" });
    if (topicErr) throw new Error("Failed to seed topics: " + topicErr.message);
  }
  console.log("✅ Topics seeded successfully.");

  // 4. Seed Videos
  const catalogEntries = Object.values(videoCatalog);
  console.log(`Seeding ${catalogEntries.length} videos...`);
  const videosPayload = catalogEntries.map((v) => ({
    video_id: v.videoId,
    canonical_url: v.canonicalUrl,
    title: v.title,
    channel_title: v.channelTitle || "Unknown",
    duration_seconds: v.durationSeconds || 0,
    duration_formatted: v.durationFormatted || "00:00",
    default_audio_language: v.defaultAudioLanguage || "en",
    default_language: v.defaultLanguage || "en",
    embeddable: v.embeddable !== false,
    availability: v.availability || "available",
    review_status: v.reviewStatus || "verified",
    spoken_english_verified: Boolean(v.spokenEnglishVerified),
    topic_coverage_verified: Boolean(v.topicCoverageVerified),
    review_notes: v.reviewNotes || "",
  }));

  for (let i = 0; i < videosPayload.length; i += 50) {
    const chunk = videosPayload.slice(i, i + 50);
    const { error: videoErr } = await supabase
      .from("aptitude_videos")
      .upsert(chunk, { onConflict: "video_id" });
    if (videoErr) throw new Error("Failed to seed videos: " + videoErr.message);
  }
  console.log("✅ Videos seeded successfully.");

  // 5. Seed Topic-Video Mappings
  const topicVideos = [];
  for (const t of allTopics) {
    if (t.primaryVideo?.videoId) {
      topicVideos.push({
        topic_id: t.id,
        video_id: t.primaryVideo.videoId,
        role: "primary",
        rank: 1,
        coverage_notes: t.primaryVideo.coverageNotes || "",
      });
    }
    if (t.backupVideo?.videoId) {
      topicVideos.push({
        topic_id: t.id,
        video_id: t.backupVideo.videoId,
        role: "backup",
        rank: 2,
        coverage_notes: t.backupVideo.coverageNotes || "",
      });
    }
  }

  console.log(`Seeding ${topicVideos.length} topic-video associations...`);
  for (let i = 0; i < topicVideos.length; i += 50) {
    const chunk = topicVideos.slice(i, i + 50);
    const { error: tvErr } = await supabase
      .from("aptitude_topic_videos")
      .upsert(chunk, { onConflict: "topic_id,video_id" });
    if (tvErr) throw new Error("Failed to seed topic videos: " + tvErr.message);
  }
  console.log("✅ Topic-video associations seeded successfully.");

  // Verify counts
  const { count: topicCount } = await supabase
    .from("aptitude_topics")
    .select("*", { count: "exact", head: true });
  const { count: dayCount } = await supabase
    .from("aptitude_days")
    .select("*", { count: "exact", head: true });
  const { count: trackCount } = await supabase
    .from("aptitude_tracks")
    .select("*", { count: "exact", head: true });
  const { count: videoCount } = await supabase
    .from("aptitude_videos")
    .select("*", { count: "exact", head: true });

  console.log("\n📊 Final Database Catalog Verification:");
  console.log(`- Tracks: ${trackCount}`);
  console.log(`- Days: ${dayCount}`);
  console.log(`- Topics: ${topicCount}`);
  console.log(`- Videos: ${videoCount}`);
  console.log("\n✨ Aptitude catalog seeding complete!");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
