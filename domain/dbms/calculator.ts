import type {
  DBMSVideoItem,
  DBMSDaySchedule,
  DBMSSQLExercise,
  UserVideoProgress,
  UserDayProgress,
  UserExerciseAttempt,
  DBMSProgressMetrics,
  DBMSTopicMastery,
  DBMSVideoDifficulty,
  DBMSVideoImportance,
} from "./types";
import { DBMS_TOPIC_NAMES } from "./curriculum";

export function calculateTopicMastery(
  videos: DBMSVideoItem[],
  videoProgress: Record<string, UserVideoProgress>
): DBMSTopicMastery[] {
  const topicMap: Record<string, { total: number; watched: number }> = {};

  for (const video of videos) {
    const slug = video.topicSlug || "general";
    if (!topicMap[slug]) {
      topicMap[slug] = { total: 0, watched: 0 };
    }
    topicMap[slug].total += 1;
    if (videoProgress[video.youtubeVideoId]?.watched) {
      topicMap[slug].watched += 1;
    }
  }

  return Object.entries(topicMap).map(([slug, stats]) => {
    const percentage = stats.total > 0 ? Math.round((stats.watched / stats.total) * 100) : 0;
    const masteryStatus: DBMSTopicMastery["masteryStatus"] =
      percentage === 100 ? "mastered" : percentage > 0 ? "in_progress" : "not_started";

    return {
      topicSlug: slug,
      topicTitle: DBMS_TOPIC_NAMES[slug] ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      totalVideos: stats.total,
      watchedVideos: stats.watched,
      percentage,
      masteryStatus,
    };
  });
}

export function calculateDBMSProgress(
  days: DBMSDaySchedule[],
  videos: DBMSVideoItem[],
  videoProgress: Record<string, UserVideoProgress>,
  dayProgress: Record<number, UserDayProgress>,
  exercises: DBMSSQLExercise[],
  exerciseAttempts: Record<string, UserExerciseAttempt>
): DBMSProgressMetrics {
  const totalVideos = videos.length;
  let watchedVideos = 0;
  let totalMinutes = 0;
  let watchedMinutes = 0;

  for (const video of videos) {
    totalMinutes += video.estimatedMinutes;
    if (videoProgress[video.youtubeVideoId]?.watched) {
      watchedVideos += 1;
      watchedMinutes += video.estimatedMinutes;
    }
  }

  const percentageComplete = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;

  let completedDays = 0;
  let currentDay = 1;

  for (const day of days) {
    // A day is considered completed if all its assigned videos are watched
    const dayVideos = videos.filter((v) => v.dayNumber === day.dayNumber);
    const allWatched =
      dayVideos.length > 0 && dayVideos.every((v) => videoProgress[v.youtubeVideoId]?.watched);
    const assignmentDone = !!dayProgress[day.dayNumber]?.assignmentCompleted;

    if (allWatched && assignmentDone) {
      completedDays += 1;
    } else if (currentDay === 1 && !allWatched) {
      currentDay = day.dayNumber;
    }
  }

  // If earlier days are all done, currentDay points to the first unfinished day
  for (const day of days) {
    const dayVideos = videos.filter((v) => v.dayNumber === day.dayNumber);
    const dayDone = dayVideos.length > 0 && dayVideos.every((v) => videoProgress[v.youtubeVideoId]?.watched);
    if (!dayDone) {
      currentDay = day.dayNumber;
      break;
    }
  }

  const totalExercises = exercises.length;
  const solvedExercises = Object.values(exerciseAttempts).filter((a) => a.status === "solved").length;

  const topicsMastery = calculateTopicMastery(videos, videoProgress);

  return {
    totalVideos,
    watchedVideos,
    totalMinutes,
    watchedMinutes,
    percentageComplete,
    completedDays,
    currentDay,
    totalExercises,
    solvedExercises,
    topicsMastery,
  };
}

export interface VideoFilterOptions {
  dayNumber?: number | "all";
  difficulty?: DBMSVideoDifficulty | "all";
  importance?: DBMSVideoImportance | "all";
  status?: "all" | "watched" | "unwatched" | "bookmarked" | "revision_due";
  searchQuery?: string;
}

export function filterVideos(
  videos: DBMSVideoItem[],
  options: VideoFilterOptions,
  videoProgress: Record<string, UserVideoProgress>
): DBMSVideoItem[] {
  return videos.filter((video) => {
    // Day filter
    if (options.dayNumber && options.dayNumber !== "all" && video.dayNumber !== options.dayNumber) {
      return false;
    }

    // Difficulty filter
    if (options.difficulty && options.difficulty !== "all" && video.difficulty !== options.difficulty) {
      return false;
    }

    // Importance filter
    if (options.importance && options.importance !== "all" && video.importance !== options.importance) {
      return false;
    }

    // Status filter
    if (options.status && options.status !== "all") {
      const prog = videoProgress[video.youtubeVideoId];
      if (options.status === "watched" && !prog?.watched) return false;
      if (options.status === "unwatched" && prog?.watched) return false;
      if (options.status === "bookmarked" && !prog?.isBookmarked) return false;
      if (options.status === "revision_due" && !prog?.revisionDue) return false;
    }

    // Search query filter
    if (options.searchQuery && options.searchQuery.trim().length > 0) {
      const q = options.searchQuery.toLowerCase();
      const matchTitle = video.title.toLowerCase().includes(q);
      const matchPosition = video.position != null && String(video.position) === q;
      const matchTopic = (video.topicSlug || "").toLowerCase().includes(q);
      if (!matchTitle && !matchPosition && !matchTopic) {
        return false;
      }
    }

    return true;
  });
}

export interface NextRecommendation {
  type: "video" | "exercise" | "assignment" | "course_completed";
  dayNumber: number;
  itemTitle: string;
  itemSubtitle: string;
  videoId?: string;
  exerciseId?: string;
  estimatedMinutes: number;
}

export function getNextRecommendedItem(
  days: DBMSDaySchedule[],
  videos: DBMSVideoItem[],
  videoProgress: Record<string, UserVideoProgress>,
  dayProgress: Record<number, UserDayProgress>,
  exercises: DBMSSQLExercise[],
  exerciseAttempts: Record<string, UserExerciseAttempt>
): NextRecommendation {
  for (const day of days) {
    const dayVideos = videos.filter((v) => v.dayNumber === day.dayNumber);
    const unwatchedVideo = dayVideos.find((v) => !videoProgress[v.youtubeVideoId]?.watched);

    if (unwatchedVideo) {
      return {
        type: "video",
        dayNumber: day.dayNumber,
        itemTitle: unwatchedVideo.title,
        itemSubtitle: `Day ${day.dayNumber}: ${day.title} • Video #${unwatchedVideo.position}`,
        videoId: unwatchedVideo.youtubeVideoId,
        estimatedMinutes: unwatchedVideo.estimatedMinutes,
      };
    }

    // If all videos watched, check practical assignment
    if (!dayProgress[day.dayNumber]?.assignmentCompleted) {
      return {
        type: "assignment",
        dayNumber: day.dayNumber,
        itemTitle: day.practicalAssignment.title,
        itemSubtitle: `Day ${day.dayNumber}: Assignment Checkpoint`,
        estimatedMinutes: 30,
      };
    }

    // Check day exercises
    const dayExercises = exercises.filter((e) => e.dayNumber === day.dayNumber);
    const unsolvedExercise = dayExercises.find((e) => exerciseAttempts[e.id]?.status !== "solved");

    if (unsolvedExercise) {
      return {
        type: "exercise",
        dayNumber: day.dayNumber,
        itemTitle: unsolvedExercise.title,
        itemSubtitle: `Day ${day.dayNumber} SQL Practice • ${unsolvedExercise.sourcePlatform}`,
        exerciseId: unsolvedExercise.id,
        estimatedMinutes: unsolvedExercise.estimatedMinutes,
      };
    }
  }

  return {
    type: "course_completed",
    dayNumber: 12,
    itemTitle: "DBMS Curriculum Completed!",
    itemSubtitle: "All 12 days, 91 core videos, and SQL exercises completed. Ready for interviews!",
    estimatedMinutes: 0,
  };
}

