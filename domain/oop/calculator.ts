import type {
  OOPDaySchedule,
  OOPProgressMetrics,
  OOPSegmentItem,
  OOPVideoItem,
  UserOOPDayProgress,
  UserOOPDesignAttempt,
  UserOOPLabAttempt,
  UserOOPSegmentProgress,
  UserOOPVideoProgress,
} from "./types";

export function calculateOOPMetrics(
  days: OOPDaySchedule[],
  videos: OOPVideoItem[],
  segments: OOPSegmentItem[],
  videoProgress: Record<string, UserOOPVideoProgress>,
  segmentProgress: Record<string, UserOOPSegmentProgress>,
  labAttempts: Record<string, UserOOPLabAttempt>,
  dayProgress: Record<number, UserOOPDayProgress>,
  designAttempts: Record<string, UserOOPDesignAttempt>
): OOPProgressMetrics {
  const totalDays = days.length;
  const completedDays = Object.values(dayProgress).filter(
    (p) => p.assignmentCompleted
  ).length;

  const totalVideos = videos.length;
  const watchedVideos = Object.values(videoProgress).filter(
    (p) => p.watched
  ).length;

  const totalSegments = segments.length;
  const completedSegments = Object.values(segmentProgress).filter(
    (p) => p.completed
  ).length;

  const totalLabs = 10;
  const completedLabs = Object.values(labAttempts).filter(
    (a) => a.status === "completed"
  ).length;

  const totalDesignCases = 10;
  const completedDesignCases = Object.keys(designAttempts).length;

  // Weighted overall course percentage
  // 35% days completed, 35% videos watched, 15% labs completed, 15% design cases
  const dayRatio = totalDays > 0 ? completedDays / totalDays : 0;
  const videoRatio = totalVideos > 0 ? watchedVideos / totalVideos : 0;
  const labRatio = totalLabs > 0 ? completedLabs / totalLabs : 0;
  const designRatio = totalDesignCases > 0 ? completedDesignCases / totalDesignCases : 0;

  const coursePercentage = Math.round(
    (dayRatio * 0.35 + videoRatio * 0.35 + labRatio * 0.15 + designRatio * 0.15) * 100
  );

  // Minutes calculations
  const totalCourseMinutes = days.reduce((acc, d) => acc + d.estimatedMinutes, 0);
  const completedMinutes = days
    .filter((d) => dayProgress[d.dayNumber]?.assignmentCompleted)
    .reduce((acc, d) => acc + d.estimatedMinutes, 0);

  const estimatedMinutesRemaining = Math.max(0, totalCourseMinutes - completedMinutes);

  return {
    totalDays,
    completedDays,
    totalVideos,
    watchedVideos,
    totalSegments,
    completedSegments,
    totalLabs,
    completedLabs,
    totalDesignCases,
    completedDesignCases,
    coursePercentage: Math.min(100, Math.max(0, coursePercentage)),
    streakDays: completedDays > 0 ? Math.min(completedDays, 7) : 0,
    estimatedMinutesRemaining,
    totalStudyMinutesCompleted: completedMinutes,
  };
}

export function getRecommendedNextOOPDay(
  days: OOPDaySchedule[],
  dayProgress: Record<number, UserOOPDayProgress>
): number {
  for (const day of days) {
    if (!dayProgress[day.dayNumber]?.assignmentCompleted) {
      return day.dayNumber;
    }
  }
  return days[days.length - 1]?.dayNumber ?? 1;
}

