import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { DSAPlaylistDetail, DSALessonItem, DSAPlaylistSummary } from "../types";

function formatSeconds(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return `${h}h ${remM.toString().padStart(2, "0")}m`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export async function getDSAPlaylistDetail(
  slug: string,
  preferredVideoId?: string
): Promise<DSAPlaylistDetail> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Fetch playlist metadata
  const { data: pl, error: plErr } = await supabase
    .from("dsa_playlists")
    .select("*")
    .eq("slug", slug)
    .single();

  if (plErr || !pl) {
    notFound();
  }

  // 2. Fetch playlist items in sequential order
  const { data: rawItems, error: itemsErr } = await supabase
    .from("dsa_playlist_items")
    .select(`
      id,
      position,
      title_override,
      topic_slug,
      is_essential,
      video_id,
      dsa_videos!inner(
        id,
        youtube_video_id,
        title,
        duration_seconds,
        thumbnail_url,
        channel_title,
        canonical_topic_slug,
        difficulty,
        embed_allowed
      )
    `)
    .eq("playlist_id", pl.id)
    .order("position", { ascending: true });

  if (itemsErr || !rawItems || rawItems.length === 0) {
    notFound();
  }

  const videoIds = rawItems.map((it) => it.video_id);

  // 3. Concurrently fetch user data and question links
  let enrollment: {
    status: "active" | "paused" | "completed" | "archived";
    lastVideoId: string | null;
    lastActivityAt: string;
  } | null = null;

  let progressMap = new Map<string, {
    status: string;
    lastPositionSeconds: number;
    watchedSeconds: number;
    completedAt: string | null;
  }>();

  let notesMap = new Map<string, string>();
  let bookmarksSet = new Set<string>();

  const [enrollmentRes, progressRes, notesRes, bookmarksRes, linksRes] = await Promise.all([
    user
      ? supabase
          .from("dsa_playlist_enrollments")
          .select("status, last_video_id, last_activity_at")
          .eq("user_id", user.id)
          .eq("playlist_id", pl.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),

    user
      ? supabase
          .from("dsa_video_progress")
          .select("video_id, status, last_position_seconds, watched_seconds, completed_at")
          .eq("user_id", user.id)
          .in("video_id", videoIds)
      : Promise.resolve({ data: null }),

    user
      ? supabase
          .from("dsa_video_notes")
          .select("video_id, content")
          .eq("user_id", user.id)
          .in("video_id", videoIds)
      : Promise.resolve({ data: null }),

    user
      ? supabase
          .from("dsa_video_bookmarks")
          .select("video_id")
          .eq("user_id", user.id)
          .in("video_id", videoIds)
      : Promise.resolve({ data: null }),

    supabase
      .from("dsa_video_question_links")
      .select(`
        video_id,
        relationship,
        problems!inner(
          id,
          slug,
          title,
          difficulty
        )
      `)
      .in("video_id", videoIds),
  ]);

  if (enrollmentRes.data) {
    enrollment = {
      status: enrollmentRes.data.status as "active" | "paused" | "completed" | "archived",
      lastVideoId: enrollmentRes.data.last_video_id,
      lastActivityAt: enrollmentRes.data.last_activity_at,
    };
  }

  if (progressRes.data) {
    progressMap = new Map(
      progressRes.data.map((p) => [
        p.video_id,
        {
          status: p.status,
          lastPositionSeconds: p.last_position_seconds,
          watchedSeconds: p.watched_seconds,
          completedAt: p.completed_at,
        },
      ])
    );
  }

  if (notesRes.data) {
    notesMap = new Map(notesRes.data.map((n) => [n.video_id, n.content]));
  }

  if (bookmarksRes.data) {
    bookmarksSet = new Set(bookmarksRes.data.map((b) => b.video_id!));
  }

  // Group linked problems by videoId
  const linksByVideo = new Map<
    string,
    {
      id: string;
      slug: string;
      title: string;
      difficulty: "easy" | "medium" | "hard";
      relationship: "theory" | "practice" | "solution" | "prerequisite";
    }[]
  >();

  if (linksRes.data) {
    for (const l of linksRes.data) {
      const list = linksByVideo.get(l.video_id) || [];
      const prob = l.problems as unknown as {
        id: string;
        slug: string;
        title: string;
        difficulty: "easy" | "medium" | "hard";
      };
      list.push({
        id: prob.id,
        slug: prob.slug,
        title: prob.title,
        difficulty: prob.difficulty,
        relationship: l.relationship as "theory" | "practice" | "solution" | "prerequisite",
      });
      linksByVideo.set(l.video_id, list);
    }
  }

  // 4. Transform raw items into DSALessonItem array
  let completedCount = 0;
  let completedDuration = 0;
  let totalDuration = 0;

  const lessons: DSALessonItem[] = rawItems.map((item) => {
    const v = item.dsa_videos as unknown as {
      id: string;
      youtube_video_id: string;
      title: string;
      duration_seconds: number;
      thumbnail_url: string | null;
      channel_title: string;
      canonical_topic_slug: string;
      difficulty: "easy" | "medium" | "hard";
      embed_allowed: boolean;
    };

    const prog = progressMap.get(item.video_id);
    const isCompleted = prog?.status === "completed";
    const noteContent = notesMap.get(item.video_id);
    const isBookmarked = bookmarksSet.has(item.video_id);

    totalDuration += v.duration_seconds;
    if (isCompleted) {
      completedCount++;
      completedDuration += v.duration_seconds;
    }

    return {
      id: item.video_id,
      playlistItemId: item.id,
      videoDbId: v.id,
      youtubeVideoId: v.youtube_video_id,
      position: item.position,
      title: item.title_override || v.title,
      durationSeconds: v.duration_seconds,
      durationFormatted: formatSeconds(v.duration_seconds),
      thumbnailUrl: v.thumbnail_url,
      channelTitle: v.channel_title,
      canonicalTopicSlug: item.topic_slug || v.canonical_topic_slug,
      difficulty: v.difficulty,
      embedAllowed: v.embed_allowed,
      isCompleted,
      isBookmarked,
      lastPositionSeconds: prog?.lastPositionSeconds || 0,
      watchedSeconds: prog?.watchedSeconds || 0,
      completedAt: prog?.completedAt || null,
      hasNotes: Boolean(noteContent && noteContent.trim().length > 0),
      notesContent: noteContent || "",
      linkedProblems: linksByVideo.get(item.video_id) || [],
    };
  });

  const progressPercentage = Math.round((completedCount / lessons.length) * 100);

  // 5. Determine active lesson
  let activeLesson = lessons[0];

  if (preferredVideoId) {
    const matched = lessons.find(
      (l) => l.videoDbId === preferredVideoId || l.youtubeVideoId === preferredVideoId
    );
    if (matched) activeLesson = matched;
  } else if (enrollment?.lastVideoId) {
    const matched = lessons.find((l) => l.videoDbId === enrollment.lastVideoId);
    if (matched) activeLesson = matched;
  } else {
    // Pick first uncompleted lesson
    const firstIncomplete = lessons.find((l) => !l.isCompleted);
    if (firstIncomplete) activeLesson = firstIncomplete;
  }

  const playlistSummary: DSAPlaylistSummary = {
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
    videoCount: lessons.length,
    totalDurationSeconds: totalDuration,
    topicTags: pl.topic_tags || [],
    isFeatured: pl.is_featured,
    isDefault: pl.is_default,
    isEnrolled: Boolean(enrollment),
    enrollmentStatus: enrollment?.status ?? null,
    completedLessonsCount: completedCount,
    progressPercentage,
    lastVideoId: enrollment?.lastVideoId ?? null,
    lastActivityAt: enrollment?.lastActivityAt ?? null,
  };

  return {
    playlist: playlistSummary,
    lessons,
    activeLesson,
    enrolled: Boolean(enrollment),
    stats: {
      totalLessons: lessons.length,
      completedLessons: completedCount,
      progressPercentage,
      totalDurationSeconds: totalDuration,
      completedDurationSeconds: completedDuration,
    },
  };
}

