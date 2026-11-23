import type {
  DataEngineeringVideoItem,
  DataEngineeringStageSchedule,
  DataEngineeringExercise,
  UserVideoProgress,
  UserStageProgress,
  UserExerciseAttempt,
  DataEngineeringProgressMetrics,
  DataEngineeringTopicMastery,
} from "./types";
import { DATA_ENGINEERING_TOPIC_NAMES } from "./curriculum";

export function calculateTopicMastery(
  videos: DataEngineeringVideoItem[],
  videoProgress: Record<string, UserVideoProgress>
): DataEngineeringTopicMastery[] {
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
    const masteryStatus: DataEngineeringTopicMastery["masteryStatus"] =
      percentage === 100
        ? "mastered"
        : percentage > 0
          ? "in_progress"
          : "not_started";

    return {
      topicSlug: slug,
      topicTitle:
        DATA_ENGINEERING_TOPIC_NAMES[slug] ??
        slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      stageNumber: stats.stageNumber,
      totalVideos: stats.total,
      watchedVideos: stats.watched,
      percentage,
      masteryStatus,
    };
  });
}

export function calculateDataEngineeringProgress(
  stages: DataEngineeringStageSchedule[],
  videos: DataEngineeringVideoItem[],
  videoProgress: Record<string, UserVideoProgress>,
  stageProgress: Record<number, UserStageProgress>,
  exercises: DataEngineeringExercise[],
  exerciseAttempts: Record<string, UserExerciseAttempt>
): DataEngineeringProgressMetrics {
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

  const percentageComplete =
    totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;

  let completedStages = 0;
  let currentStage = 1;

  for (const stage of stages) {
    const stageVideos = videos.filter((v) => v.stageNumber === stage.stageNumber);
    const allWatched =
      stageVideos.length > 0 &&
      stageVideos.every((v) => videoProgress[v.youtubeVideoId]?.watched);
    const assignmentDone =
      !!stageProgress[stage.stageNumber]?.assignmentCompleted;

    if (allWatched && assignmentDone) {
      completedStages += 1;
    }
  }

  // Determine currentStage as the first incomplete stage
  for (const stage of stages) {
    const stageVideos = videos.filter((v) => v.stageNumber === stage.stageNumber);
    const allWatched =
      stageVideos.length > 0 &&
      stageVideos.every((v) => videoProgress[v.youtubeVideoId]?.watched);
    if (!allWatched) {
      currentStage = stage.stageNumber;
      break;
    }
  }

  const totalExercises = exercises.length;
  const solvedExercises = Object.values(exerciseAttempts).filter(
    (a) => a.status === "solved"
  ).length;

  const topicsMastery = calculateTopicMastery(videos, videoProgress);

  return {
    totalVideos,
    watchedVideos,
    totalMinutes,
    watchedMinutes,
    percentageComplete,
    completedStages,
    currentStage,
    solvedExercises,
    totalExercises,
    topicsMastery,
  };
}

export function getNextRecommendation(
  stages: DataEngineeringStageSchedule[],
  videos: DataEngineeringVideoItem[],
  videoProgress: Record<string, UserVideoProgress>,
  stageProgress: Record<number, UserStageProgress>,
  exercises: DataEngineeringExercise[],
  exerciseAttempts: Record<string, UserExerciseAttempt>
): {
  type: "video" | "assignment" | "exercise";
  stageNumber: number;
  videoId?: string;
  videoTitle?: string;
  exerciseId?: string;
  title: string;
  description: string;
} {
  // 1. First unwatched video across ordered stages
  for (const stage of stages) {
    const stageVideos = videos
      .filter((v) => v.stageNumber === stage.stageNumber)
      .sort((a, b) => a.position - b.position);

    for (const v of stageVideos) {
      if (!videoProgress[v.youtubeVideoId]?.watched) {
        return {
          type: "video",
          stageNumber: stage.stageNumber,
          videoId: v.youtubeVideoId,
          videoTitle: v.title,
          title: `Next Lesson: ${v.title}`,
          description: `Stage ${stage.stageNumber} • ${v.channel} (${v.estimatedMinutes} min)`,
        };
      }
    }

    // 2. If all videos watched in stage, check practical assignment
    if (!stageProgress[stage.stageNumber]?.assignmentCompleted) {
      return {
        type: "assignment",
        stageNumber: stage.stageNumber,
        title: `Practical Milestone: ${stage.practicalAssignment.title}`,
        description: stage.practicalAssignment.description,
      };
    }

    // 3. Check stage exercises
    const stageExercises = exercises.filter(
      (e) => e.stageNumber === stage.stageNumber
    );
    for (const ex of stageExercises) {
      if (exerciseAttempts[ex.id]?.status !== "solved") {
        return {
          type: "exercise",
          stageNumber: stage.stageNumber,
          exerciseId: ex.id,
          title: `Lab Exercise: ${ex.title}`,
          description: ex.description,
        };
      }
    }
  }

  // All completed
  const firstVideo = videos[0];
  return {
    type: "video",
    stageNumber: 1,
    videoId: firstVideo?.youtubeVideoId,
    videoTitle: firstVideo?.title,
    title: "Curriculum Completed!",
    description: "You have reviewed all modules in the Data Engineering Roadmap.",
  };
}
