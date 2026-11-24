import type {
  PythonVideoItem,
  PythonStageSchedule,
  PythonExercise,
  UserVideoProgress,
  UserStageProgress,
  UserExerciseAttempt,
  PythonProgressMetrics,
  PythonTopicMastery,
} from "./types";
import { PYTHON_TOPIC_NAMES } from "./curriculum";

export function calculateTopicMastery(
  videos: PythonVideoItem[],
  videoProgress: Record<string, UserVideoProgress>
): PythonTopicMastery[] {
  const topicMap: Record<
    string,
    { total: number; watched: number; stageNumber: number }
  > = {};

  for (const video of videos) {
    const slug = video.topicSlug || "general";
    if (!topicMap[slug]) {
      topicMap[slug] = { total: 0, watched: 0, stageNumber: video.stageNumber };
    }
    topicMap[slug].total += 1;
    if (videoProgress[video.youtubeVideoId]?.watched) {
      topicMap[slug].watched += 1;
    }
  }

  return Object.entries(topicMap).map(([slug, stats]) => {
    const percentage =
      stats.total > 0 ? Math.round((stats.watched / stats.total) * 100) : 0;
    const masteryStatus: PythonTopicMastery["masteryStatus"] =
      percentage === 100
        ? "mastered"
        : percentage > 0
          ? "in_progress"
          : "not_started";

    return {
      topicSlug: slug,
      topicTitle:
        PYTHON_TOPIC_NAMES[slug] ??
        slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      stageNumber: stats.stageNumber,
      totalVideos: stats.total,
      watchedVideos: stats.watched,
      percentage,
      masteryStatus,
    };
  });
}

export function calculatePythonProgress(
  stages: PythonStageSchedule[],
  videos: PythonVideoItem[],
  videoProgress: Record<string, UserVideoProgress>,
  stageProgress: Record<number, UserStageProgress>,
  exerciseAttempts: Record<string, UserExerciseAttempt>,
  exercises: PythonExercise[]
): PythonProgressMetrics {
  const totalStages = stages.length;
  const totalVideos = videos.length;
  const totalExercises = exercises.length;

  let watchedVideos = 0;
  let watchedMinutes = 0;
  let totalEstimatedMinutes = 0;

  for (const v of videos) {
    totalEstimatedMinutes += v.estimatedMinutes;
    if (videoProgress[v.youtubeVideoId]?.watched) {
      watchedVideos += 1;
      watchedMinutes += v.estimatedMinutes;
    }
  }

  let completedStages = 0;
  let practicalAssignmentsCompleted = 0;

  for (const s of stages) {
    const sp = stageProgress[s.stageNumber];
    if (sp?.completed) {
      completedStages += 1;
    }
    if (sp?.practicalAssignmentSubmitted) {
      practicalAssignmentsCompleted += 1;
    }
  }

  let exercisesCompleted = 0;
  for (const ex of exercises) {
    if (exerciseAttempts[ex.id]?.status === "completed") {
      exercisesCompleted += 1;
    }
  }

  const progressPercentage =
    totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;

  return {
    totalStages,
    completedStages,
    totalVideos,
    watchedVideos,
    totalEstimatedMinutes,
    watchedMinutes,
    progressPercentage,
    currentStreakDays: watchedVideos > 0 ? 3 : 0,
    practicalAssignmentsCompleted,
    totalPracticalAssignments: totalStages,
    exercisesCompleted,
    totalExercises,
  };
}
