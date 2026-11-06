import { createClient } from "@/lib/supabase/server";
import type {
  StriverSheetDetail,
  StriverModuleDetail,
  StriverTopicDetail,
  StriverVideoItem,
  StriverProblemItem,
  TopicMasteryLevel,
  ProblemSolveStatus,
} from "../types";

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`.trim();
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds > 0 ? `${seconds}s` : ""}`.trim();
  }
  return `${seconds}s`;
}

export async function getStriverSheet(
  preferredTopicSlug?: string,
  preferredVideoId?: string
): Promise<StriverSheetDetail> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Fetch Sheet Metadata
  const { data: sheet } = await supabase
    .from("dsa_sheets")
    .select("*")
    .eq("slug", "striver-a2z")
    .maybeSingle();

  if (!sheet) {
    throw new Error("Striver A2Z sheet curriculum not found in database.");
  }

  // 2. Fetch Modules, Topics, Problems, and Video Mappings in parallel
  const [modulesRes, topicsRes, problemsRes, topicVideosRes] = await Promise.all([
    supabase
      .from("dsa_sheet_modules")
      .select("*")
      .eq("sheet_id", sheet.id)
      .order("step_number", { ascending: true }),
    supabase
      .from("dsa_sheet_topics")
      .select("*")
      .order("position", { ascending: true }),
    supabase
      .from("dsa_sheet_problems")
      .select("*")
      .order("position", { ascending: true }),
    supabase
      .from("dsa_sheet_topic_videos")
      .select("topic_id, position, dsa_videos!inner(id, youtube_video_id, title, duration_seconds, thumbnail_url, channel_title)")
      .order("position", { ascending: true }),
  ]);

  const rawModules = modulesRes.data || [];
  const rawTopics = topicsRes.data || [];
  const rawProblems = problemsRes.data || [];
  const rawTopicVideos = topicVideosRes.data || [];

  // 3. User Progress Dimensions (Videos, Problems, Mastery, Revisions)
  const completedVideoIds = new Set<string>();
  const bookmarkedVideoIds = new Set<string>();
  const videoNotesMap = new Map<string, string>();
  const solvedProblemIds = new Set<string>();
  const attemptedProblemIds = new Set<string>();
  let dueRevisionsCount = 0;
  let lastActivityAt: string | null = null;

  if (user) {
    const [progressRes, bookmarksRes, notesRes, attemptsRes, revisionsRes] = await Promise.all([
      supabase
        .from("dsa_video_progress")
        .select("video_id, status, completed_at, last_opened_at")
        .eq("user_id", user.id),
      supabase
        .from("dsa_video_bookmarks")
        .select("video_id")
        .eq("user_id", user.id),
      supabase
        .from("dsa_video_notes")
        .select("video_id, content")
        .eq("user_id", user.id),
      supabase
        .from("problem_attempts")
        .select("problem_id, outcome, attempted_at")
        .eq("user_id", user.id),
      supabase
        .from("revision_items")
        .select("id, next_review_at")
        .eq("user_id", user.id)
        .lte("next_review_at", new Date().toISOString()),
    ]);

    if (progressRes.data) {
      for (const p of progressRes.data) {
        if (p.status === "completed") completedVideoIds.add(p.video_id);
        if (p.last_opened_at && (!lastActivityAt || p.last_opened_at > lastActivityAt)) {
          lastActivityAt = p.last_opened_at;
        }
      }
    }

    if (bookmarksRes.data) {
      for (const b of bookmarksRes.data) {
        if (b.video_id) bookmarkedVideoIds.add(b.video_id);
      }
    }

    if (notesRes.data) {
      for (const n of notesRes.data) {
        videoNotesMap.set(n.video_id, n.content);
      }
    }

    if (attemptsRes.data) {
      for (const a of attemptsRes.data) {
        attemptedProblemIds.add(a.problem_id);
        if (a.outcome === "independent" || a.outcome === "hint") {
          solvedProblemIds.add(a.problem_id);
        }
        if (a.attempted_at && (!lastActivityAt || a.attempted_at > lastActivityAt)) {
          lastActivityAt = a.attempted_at;
        }
      }
    }

    if (revisionsRes.data) {
      dueRevisionsCount = revisionsRes.data.length;
    }
  }

  // 4. Index videos by topic
  const videosByTopicId = new Map<string, StriverVideoItem[]>();
  for (const item of rawTopicVideos) {
    const v = item.dsa_videos as unknown as {
      id: string;
      youtube_video_id: string;
      title: string;
      duration_seconds: number;
      thumbnail_url: string | null;
      channel_title: string;
    };
    if (!v) continue;

    if (!videosByTopicId.has(item.topic_id)) {
      videosByTopicId.set(item.topic_id, []);
    }

    videosByTopicId.get(item.topic_id)!.push({
      id: v.id,
      youtubeVideoId: v.youtube_video_id,
      title: v.title,
      durationSeconds: v.duration_seconds,
      durationFormatted: formatDuration(v.duration_seconds),
      thumbnailUrl: v.thumbnail_url,
      channelTitle: v.channel_title,
      isCompleted: completedVideoIds.has(v.id),
      isBookmarked: bookmarkedVideoIds.has(v.id),
      notesContent: videoNotesMap.get(v.id),
    });
  }

  // 5. Index problems by topic
  const problemsByTopicId = new Map<string, StriverProblemItem[]>();
  for (const p of rawProblems) {
    if (!problemsByTopicId.has(p.topic_id)) {
      problemsByTopicId.set(p.topic_id, []);
    }

    let status: ProblemSolveStatus = "not_started";
    if (p.problem_id) {
      if (solvedProblemIds.has(p.problem_id)) status = "solved";
      else if (attemptedProblemIds.has(p.problem_id)) status = "attempted";
    }

    problemsByTopicId.get(p.topic_id)!.push({
      id: p.id,
      topicId: p.topic_id,
      canonicalProblemId: p.problem_id,
      title: p.title,
      difficulty: p.difficulty as "easy" | "medium" | "hard",
      leetcodeUrl: p.leetcode_url,
      articleUrl: p.article_url,
      position: p.position,
      status,
      mappedVideoId: p.video_id,
    });
  }

  // 6. Build Topic & Module Hierarchy with Evidence-based Mastery
  const topicsByModuleId = new Map<string, StriverTopicDetail[]>();

  let totalVideosCount = 0;
  let totalCompletedVideosCount = 0;
  let totalProblemsCount = 0;
  let totalSolvedProblemsCount = 0;

  for (const top of rawTopics) {
    const topicVideos = videosByTopicId.get(top.id) || [];
    const topicProblems = problemsByTopicId.get(top.id) || [];

    const completedVids = topicVideos.filter((v) => v.isCompleted).length;
    const solvedProbs = topicProblems.filter((p) => p.status === "solved").length;

    totalVideosCount += topicVideos.length;
    totalCompletedVideosCount += completedVids;
    totalProblemsCount += topicProblems.length;
    totalSolvedProblemsCount += solvedProbs;

    // Evidence-based Mastery calculation
    let masteryLevel: TopicMasteryLevel = "not_assessed";
    if (topicProblems.length > 0) {
      const solveRatio = solvedProbs / topicProblems.length;
      if (solvedProbs === 0 && completedVids > 0) {
        masteryLevel = "learning";
      } else if (solveRatio > 0 && solveRatio < 0.4) {
        masteryLevel = "practicing";
      } else if (solveRatio >= 0.4 && solveRatio < 0.8) {
        masteryLevel = "developing";
      } else if (solveRatio >= 0.8) {
        masteryLevel = "proficient";
      }
    } else if (completedVids > 0) {
      masteryLevel = "learning";
    }

    const topicDetail: StriverTopicDetail = {
      id: top.id,
      moduleId: top.module_id,
      substepNumber: top.substep_number,
      title: top.title,
      slug: top.slug,
      description: top.description,
      position: top.position,
      videos: topicVideos,
      problems: topicProblems,
      stats: {
        totalVideos: topicVideos.length,
        completedVideos: completedVids,
        totalProblems: topicProblems.length,
        solvedProblems: solvedProbs,
        masteryLevel,
      },
    };

    if (!topicsByModuleId.has(top.module_id)) {
      topicsByModuleId.set(top.module_id, []);
    }
    topicsByModuleId.get(top.module_id)!.push(topicDetail);
  }

  const modules: StriverModuleDetail[] = rawModules.map((m) => {
    const modTopics = topicsByModuleId.get(m.id) || [];
    const totalVids = modTopics.reduce((acc, t) => acc + t.stats.totalVideos, 0);
    const completedVids = modTopics.reduce((acc, t) => acc + t.stats.completedVideos, 0);
    const totalProbs = modTopics.reduce((acc, t) => acc + t.stats.totalProblems, 0);
    const solvedProbs = modTopics.reduce((acc, t) => acc + t.stats.solvedProblems, 0);

    return {
      id: m.id,
      stepNumber: m.step_number,
      title: m.title,
      slug: m.slug,
      description: m.description,
      position: m.position,
      topics: modTopics,
      stats: {
        totalVideos: totalVids,
        completedVideos: completedVids,
        totalProblems: totalProbs,
        solvedProblems: solvedProbs,
      },
    };
  });

  // Determine active topic
  let activeTopicId = modules[0]?.topics[0]?.id || "";
  if (preferredTopicSlug) {
    for (const m of modules) {
      const match = m.topics.find((t) => t.slug === preferredTopicSlug || t.id === preferredTopicSlug);
      if (match) {
        activeTopicId = match.id;
        break;
      }
    }
  }

  // Calculate percentages
  const videoProgressPercentage =
    totalVideosCount > 0 ? Math.round((totalCompletedVideosCount / totalVideosCount) * 100) : 0;

  const problemProgressPercentage =
    totalProblemsCount > 0 ? Math.round((totalSolvedProblemsCount / totalProblemsCount) * 100) : 0;

  const masteryPercentage =
    totalProblemsCount > 0
      ? Math.round((totalSolvedProblemsCount / totalProblemsCount) * 100)
      : videoProgressPercentage;

  return {
    sheet: {
      id: sheet.id,
      slug: sheet.slug,
      title: sheet.title,
      author: sheet.author,
      description: sheet.description,
      officialUrl: sheet.official_url,
      version: sheet.version,
    },
    modules,
    activeTopicId,
    activeVideoId: preferredVideoId ?? null,
    overallStats: {
      totalVideos: totalVideosCount,
      completedVideos: totalCompletedVideosCount,
      videoProgressPercentage,
      totalProblems: totalProblemsCount,
      solvedProblems: totalSolvedProblemsCount,
      problemProgressPercentage,
      masteryPercentage,
      dueRevisionsCount,
      lastActivityAt,
    },
  };
}

