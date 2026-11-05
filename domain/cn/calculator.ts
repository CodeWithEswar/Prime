/**
 * PRIME — Computer Networks Progress & Metrics Calculator
 */

import type {
  CNDaySchedule,
  CNProgressMetrics,
  CNVideoItem,
  UserCNDayProgress,
  UserCNLabAttempt,
  UserCNVideoProgress,
} from "./types";

export function calculateCNMetrics(
  videos: CNVideoItem[],
  days: CNDaySchedule[],
  videoProgressMap: Record<string, UserCNVideoProgress>,
  dayProgressMap: Record<number, UserCNDayProgress>,
  labAttemptsMap: Record<string, UserCNLabAttempt> = {}
): CNProgressMetrics {
  const totalVideos = videos.length;
  let watchedVideos = 0;
  let watchedMinutes = 0;
  let totalMinutes = 0;
  let revisionDueCount = 0;

  for (const v of videos) {
    const minutes = Math.round((v.durationSeconds || 900) / 60);
    totalMinutes += minutes;

    const key = v.progressId ?? v.youtubeVideoId ?? `pos-${v.playlistPosition}`;
    const p = videoProgressMap[key] || videoProgressMap[String(v.playlistPosition)];
    if (p && p.watched) {
      watchedVideos++;
      watchedMinutes += minutes;
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
      const dayVideos = videos.filter((v) => v.assignedStudyDay === d.dayNumber);
      if (
        dayVideos.length > 0 &&
        dayVideos.every((v) => {
          const key = v.progressId ?? v.youtubeVideoId ?? `pos-${v.playlistPosition}`;
          const prog = videoProgressMap[key] || videoProgressMap[String(v.playlistPosition)];
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
    totalLabs: 10,
  };
}

export function getRecommendedNextCNDay(
  days: CNDaySchedule[],
  dayProgressMap: Record<number, UserCNDayProgress>,
  videoProgressMap: Record<string, UserCNVideoProgress>,
  videos: CNVideoItem[]
): number {
  for (const d of days) {
    const dp = dayProgressMap[d.dayNumber];
    if (dp && dp.assignmentCompleted) continue;

    const dayVideos = videos.filter((v) => v.assignedStudyDay === d.dayNumber);
    const allWatched =
      dayVideos.length > 0 &&
      dayVideos.every((v) => {
        const key = v.progressId ?? v.youtubeVideoId ?? `pos-${v.playlistPosition}`;
        const p = videoProgressMap[key] || videoProgressMap[String(v.playlistPosition)];
        return p && p.watched;
      });

    if (!allWatched) {
      return d.dayNumber;
    }
  }
  return 1;
}

