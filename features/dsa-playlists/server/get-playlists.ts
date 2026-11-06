import { createClient } from "@/lib/supabase/server";
import type { DSAPlaylistSummary, DSAPlaylistFilterOptions } from "../types";

export async function getDSAPlaylists(
  filters?: DSAPlaylistFilterOptions
): Promise<{
  playlists: DSAPlaylistSummary[];
  enrolledPlaylists: DSAPlaylistSummary[];
  continueLearning: DSAPlaylistSummary | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Fetch all published curated playlists
  const { data: rawPlaylists, error: plErr } = await supabase
    .from("dsa_playlists")
    .select("*")
    .order("is_default", { ascending: false })
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: true });

  if (plErr || !rawPlaylists) {
    console.error("Error fetching DSA playlists:", plErr);
    return { playlists: [], enrolledPlaylists: [], continueLearning: null };
  }

  // 2. Fetch user enrollments and progress if authenticated
  let enrollmentsMap = new Map<string, {
    status: "active" | "paused" | "completed" | "archived";
    lastVideoId: string | null;
    lastActivityAt: string;
  }>();

  let completedVideoIds = new Set<string>();

  if (user) {
    const [enrollmentsRes, progressRes] = await Promise.all([
      supabase
        .from("dsa_playlist_enrollments")
        .select("playlist_id, status, last_video_id, last_activity_at")
        .eq("user_id", user.id),
      supabase
        .from("dsa_video_progress")
        .select("video_id, status")
        .eq("user_id", user.id)
        .eq("status", "completed"),
    ]);

    if (enrollmentsRes.data) {
      enrollmentsMap = new Map(
        enrollmentsRes.data.map((e) => [
          e.playlist_id,
          {
            status: e.status as "active" | "paused" | "completed" | "archived",
            lastVideoId: e.last_video_id,
            lastActivityAt: e.last_activity_at,
          },
        ])
      );
    }

    if (progressRes.data) {
      completedVideoIds = new Set(progressRes.data.map((p) => p.video_id));
    }
  }

  // 3. Fetch playlist items to compute per-playlist lesson completion percentages
  const playlistIds = rawPlaylists.map((p) => p.id);
  const { data: allItems } = await supabase
    .from("dsa_playlist_items")
    .select("playlist_id, video_id, position, dsa_videos!inner(youtube_video_id, title, duration_seconds)")
    .in("playlist_id", playlistIds)
    .order("position", { ascending: true });

  const itemsByPlaylist = new Map<
    string,
    {
      videoId: string;
      youtubeVideoId: string;
      title: string;
      position: number;
      durationSeconds: number;
    }[]
  >();

  if (allItems) {
    for (const item of allItems) {
      const list = itemsByPlaylist.get(item.playlist_id) || [];
      const v = item.dsa_videos as unknown as {
        youtube_video_id: string;
        title: string;
        duration_seconds: number;
      };
      list.push({
        videoId: item.video_id,
        youtubeVideoId: v.youtube_video_id,
        title: v.title,
        position: item.position,
        durationSeconds: v.duration_seconds,
      });
      itemsByPlaylist.set(item.playlist_id, list);
    }
  }

  // 4. Map summaries with progress calculations
  const summaries: DSAPlaylistSummary[] = rawPlaylists.map((pl) => {
    const enrollment = enrollmentsMap.get(pl.id);
    const items = itemsByPlaylist.get(pl.id) || [];
    const totalCount = items.length || pl.video_count || 1;

    let completedCount = 0;
    let nextLesson: DSAPlaylistSummary["nextLesson"] = null;

    for (const it of items) {
      if (completedVideoIds.has(it.videoId)) {
        completedCount++;
      } else if (!nextLesson) {
        nextLesson = {
          id: it.videoId,
          youtubeVideoId: it.youtubeVideoId,
          title: it.title,
          position: it.position,
          durationSeconds: it.durationSeconds,
        };
      }
    }

    const progressPercentage = Math.min(100, Math.round((completedCount / totalCount) * 100));

    return {
      id: pl.id,
      slug: pl.slug,
      youtubePlaylistId: pl.youtube_playlist_id,
      title: pl.title,
      instructor: pl.instructor,
      channelTitle: pl.channel_title,
      description: pl.description,
      difficulty: pl.difficulty,
      level: pl.level,
      focus: pl.focus,
      programmingLanguage: pl.programming_language,
      thumbnailUrl: pl.thumbnail_url,
      videoCount: totalCount,
      totalDurationSeconds: pl.total_duration_seconds,
      topicTags: pl.topic_tags || [],
      isFeatured: pl.is_featured,
      isDefault: pl.is_default,
      isEnrolled: Boolean(enrollment),
      enrollmentStatus: enrollment?.status ?? null,
      completedLessonsCount: completedCount,
      progressPercentage,
      lastVideoId: enrollment?.lastVideoId ?? null,
      lastActivityAt: enrollment?.lastActivityAt ?? null,
      nextLesson,
    };
  });

  // 5. Apply filters if requested
  let filtered = summaries;
  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.instructor.toLowerCase().includes(q) ||
        p.focus.toLowerCase().includes(q) ||
        p.topicTags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (filters?.instructor && filters.instructor !== "all") {
    filtered = filtered.filter((p) => p.instructor.toLowerCase() === filters.instructor!.toLowerCase());
  }

  if (filters?.difficulty && filters.difficulty !== "all") {
    filtered = filtered.filter((p) => p.difficulty === filters.difficulty || p.level === filters.difficulty);
  }

  if (filters?.topic && filters.topic !== "all") {
    filtered = filtered.filter((p) => p.topicTags.includes(filters.topic!));
  }

  if (filters?.language && filters.language !== "all") {
    filtered = filtered.filter((p) =>
      p.programmingLanguage.toLowerCase().includes(filters.language!.toLowerCase())
    );
  }

  if (filters?.status && filters.status !== "all") {
    if (filters.status === "enrolled") {
      filtered = filtered.filter((p) => p.isEnrolled);
    } else if (filters.status === "in_progress") {
      filtered = filtered.filter((p) => p.isEnrolled && p.progressPercentage > 0 && p.progressPercentage < 100);
    } else if (filters.status === "completed") {
      filtered = filtered.filter((p) => p.progressPercentage === 100);
    } else if (filters.status === "not_started") {
      filtered = filtered.filter((p) => !p.isEnrolled || p.progressPercentage === 0);
    }
  }

  const enrolledPlaylists = summaries.filter((p) => p.isEnrolled);
  
  // Find highest priority "Continue Learning" candidate:
  // Active enrolled playlist with unfinished lessons, sorted by latest activity
  const activeUnfinished = enrolledPlaylists
    .filter((p) => p.progressPercentage < 100 && p.enrollmentStatus === "active")
    .sort((a, b) => new Date(b.lastActivityAt || 0).getTime() - new Date(a.lastActivityAt || 0).getTime());

  const continueLearning = activeUnfinished[0] || (enrolledPlaylists.length > 0 ? enrolledPlaylists[0] : summaries[0]);

  return {
    playlists: filtered,
    enrolledPlaylists,
    continueLearning,
  };
}

