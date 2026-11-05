/**
 * PRIME — Operating Systems Progress & Metrics Calculator
 */

import type {
  OSDaySchedule,
  OSProgressMetrics,
  OSVideoItem,
  UserOSDayProgress,
  UserOSLabAttempt,
  UserOSVideoProgress,
} from "./types";

export function calculateOSMetrics(
  videos: OSVideoItem[],
  days: OSDaySchedule[],
  videoProgressMap: Record<string, UserOSVideoProgress>,
  dayProgressMap: Record<number, UserOSDayProgress>,
  labAttemptsMap: Record<string, UserOSLabAttempt> = {}
): OSProgressMetrics {
  const totalVideos = videos.length;
  let watchedVideos = 0;
  let watchedMinutes = 0;
  let totalMinutes = 0;
  let revisionDueCount = 0;

  for (const v of videos) {
    totalMinutes += v.estimatedMinutes;
    const key = v.progressId ?? v.youtubeVideoId ?? `pos-${v.position}`;
    const p = videoProgressMap[key] || videoProgressMap[String(v.position)];
    if (p && p.watched) {
      watchedVideos++;
      watchedMinutes += v.estimatedMinutes;
    }
    if (p && p.revisionDue) {
      revisionDueCount++;
    }
  }

  const totalDays = days.length;
  let completedDays = 0;

  for (const d of days) {
    const dp = dayProgressMap[d.dayNumber];
    if (dp && dp.assignmentCompleted) {
      completedDays++;
    } else {
      // If all videos in day are watched, treat day as completed
      const dayVideos = videos.filter((v) => v.dayNumber === d.dayNumber);
      if (
        dayVideos.length > 0 &&
        dayVideos.every((v) => {
          const key = v.progressId ?? v.youtubeVideoId ?? `pos-${v.position}`;
          const prog = videoProgressMap[key] || videoProgressMap[String(v.position)];
          return prog && prog.watched;
        })
      ) {
        completedDays++;
      }
    }
  }

  const labsCompletedCount = Object.values(labAttemptsMap).filter(
    (a) => a.status === "completed"
  ).length;

  const totalPossible = totalVideos + totalDays;
  const totalCompleted = watchedVideos + completedDays;
  const completionPercentage =
    totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  return {
    totalVideos,
    watchedVideos,
    totalDays,
    completedDays,
    completionPercentage,
    totalMinutes,
    watchedMinutes,
    revisionDueCount,
    labsCompletedCount,
    totalLabs: 6,
  };
}

export function getRecommendedNextOSDay(
  days: OSDaySchedule[],
  dayProgressMap: Record<number, UserOSDayProgress>,
  videoProgressMap: Record<string, UserOSVideoProgress>,
  videos: OSVideoItem[]
): number {
  for (const d of days) {
    const dp = dayProgressMap[d.dayNumber];
    if (dp && dp.assignmentCompleted) continue;

    const dayVideos = videos.filter((v) => v.dayNumber === d.dayNumber);
    const allWatched =
      dayVideos.length > 0 &&
      dayVideos.every((v) => {
        const key = v.progressId ?? v.youtubeVideoId ?? `pos-${v.position}`;
        const p = videoProgressMap[key] || videoProgressMap[String(v.position)];
        return p && p.watched;
      });

    if (!allWatched) {
      return d.dayNumber;
    }
  }
  return 1;
}

