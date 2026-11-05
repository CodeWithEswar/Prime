import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AptitudeDashboardData,
  AptitudeEnrollment,
  AptitudeTrack,
  AptitudeDay,
  AptitudeTopic,
  UserAptitudeTopicProgress,
  UserAptitudeVideoProgress,
  AptitudeMetrics,
  AptitudeTrackSlug,
} from "../types";
import curriculumManifestJson from "@/content/aptitude/aptitude-curriculum-manifest.json";
import {
  aptitudeVideoProgressKey,
  getAptitudeTopicVideos,
} from "@/domain/aptitude/videos";

type Client = SupabaseClient;

export async function getAptitudeDashboardData(
  client: Client | null,
  userId: string | null
): Promise<AptitudeDashboardData> {
  const manifest = curriculumManifestJson as unknown as {
    tracks: Array<{
      id: string;
      slug: AptitudeTrackSlug;
      title: string;
      description: string;
      orderIndex: number;
      color: string;
      dayRange: [number, number];
    }>;
    days: AptitudeDay[];
  };

  const days: AptitudeDay[] = manifest.days || [];
  const allTopics: AptitudeTopic[] = days.flatMap((d) => d.topics || []);

  // Compute track topic counts
  const trackTopicCounts = allTopics.reduce<Record<string, number>>((acc, t) => {
    acc[t.trackSlug] = (acc[t.trackSlug] || 0) + 1;
    return acc;
  }, {});

  const tracks: AptitudeTrack[] = manifest.tracks.map((tr) => ({
    id: tr.id,
    slug: tr.slug,
    title: tr.title,
    description: tr.description,
    orderIndex: tr.orderIndex,
    color: tr.color,
    totalDays: tr.dayRange[1] - tr.dayRange[0] + 1,
    totalTopics: trackTopicCounts[tr.slug] || 0,
  }));

  const enrollment: AptitudeEnrollment = {
    enrolled: false,
    enrolledAt: null,
    currentDay: 1,
    startDate: new Date().toISOString().split("T")[0],
    pacing: "standard",
    isPaused: false,
  };

  const topicProgress: Record<string, UserAptitudeTopicProgress> = {};
  const videoProgress: Record<string, UserAptitudeVideoProgress> = {};

  if (client && userId) {
    try {
      const [enrollmentRes, topicProgRes, videoProgRes] = await Promise.all([
        client
          .from("aptitude_enrollments")
          .select(
            "current_day, start_date, target_completion_date, pacing, is_paused, created_at"
          )
          .eq("user_id", userId)
          .maybeSingle(),
        client
          .from("aptitude_topic_progress")
          .select(
            "topic_id, status, user_notes, is_bookmarked, needs_revision, last_activity_at, completed_at"
          )
          .eq("user_id", userId),
        client
          .from("aptitude_video_progress")
          .select(
            "topic_id, video_id, watched, user_confirmed, watched_seconds, watched_at"
          )
          .eq("user_id", userId),
      ]);

      if (enrollmentRes?.data) {
        enrollment.enrolled = true;
        enrollment.enrolledAt = enrollmentRes.data.created_at;
        enrollment.currentDay = enrollmentRes.data.current_day ?? 1;
        enrollment.startDate = enrollmentRes.data.start_date;
        enrollment.targetCompletionDate = enrollmentRes.data.target_completion_date;
        enrollment.pacing = enrollmentRes.data.pacing || "standard";
        enrollment.isPaused = Boolean(enrollmentRes.data.is_paused);
      }

      if (topicProgRes?.data) {
        for (const row of topicProgRes.data) {
          topicProgress[row.topic_id] = {
            topicId: row.topic_id,
            status: row.status,
            userNotes: row.user_notes,
            isBookmarked: Boolean(row.is_bookmarked),
            needsRevision: Boolean(row.needs_revision),
            lastActivityAt: row.last_activity_at,
            completedAt: row.completed_at,
          };
        }
      }

      if (videoProgRes?.data) {
        for (const row of videoProgRes.data) {
          videoProgress[aptitudeVideoProgressKey(row.topic_id, row.video_id)] = {
            topicId: row.topic_id,
            videoId: row.video_id,
            watched: Boolean(row.watched),
            userConfirmed: Boolean(row.user_confirmed),
            watchedSeconds: row.watched_seconds || 0,
            watchedAt: row.watched_at,
          };
        }
      }
    } catch (err) {
      console.warn(
        "Could not retrieve aptitude user state from Supabase; falling back to guest view.",
        err
      );
    }
  }

  // Calculate real metrics
  let completedTopics = 0;
  let candidateReviewVideos = 0;
  let verifiedVideos = 0;
  let missingVideos = 0;
  let totalVideos = 0;
  let watchedVideos = 0;
  let totalEstimatedMinutes = 0;
  let completedMinutes = 0;

  const trackStats: Record<
    AptitudeTrackSlug,
    {
      totalTopics: number;
      completedTopics: number;
      percentage: number;
      accuracyPercentage: number;
    }
  > = {
    "quantitative-aptitude": {
      totalTopics: 0,
      completedTopics: 0,
      percentage: 0,
      accuracyPercentage: 0,
    },
    "logical-reasoning": {
      totalTopics: 0,
      completedTopics: 0,
      percentage: 0,
      accuracyPercentage: 0,
    },
    "verbal-ability": {
      totalTopics: 0,
      completedTopics: 0,
      percentage: 0,
      accuracyPercentage: 0,
    },
    "data-interpretation": {
      totalTopics: 0,
      completedTopics: 0,
      percentage: 0,
      accuracyPercentage: 0,
    },
    assessments: {
      totalTopics: 0,
      completedTopics: 0,
      percentage: 0,
      accuracyPercentage: 0,
    },
  };

  for (const topic of allTopics) {
    const isCompleted = topicProgress[topic.id]?.status === "completed";
    if (isCompleted) {
      completedTopics++;
      completedMinutes += topic.estimatedMinutes;
    }
    totalEstimatedMinutes += topic.estimatedMinutes;

    const trackSlug = topic.trackSlug;
    if (trackStats[trackSlug]) {
      trackStats[trackSlug].totalTopics++;
      if (isCompleted) {
        trackStats[trackSlug].completedTopics++;
      }
    }

    const lessons = getAptitudeTopicVideos(topic);
    if (lessons.length) {
      totalVideos++;
      if (lessons[0].reviewStatus === "candidate_review_required") {
        candidateReviewVideos++;
      } else if (lessons[0].reviewStatus === "verified") {
        verifiedVideos++;
      } else if (lessons[0].reviewStatus === "missing_video") {
        missingVideos++;
      }

      if (
        lessons.some(
          (v) => videoProgress[aptitudeVideoProgressKey(topic.id, v.videoId)]?.watched
        )
      ) {
        watchedVideos++;
      }
    } else {
      missingVideos++;
    }
  }

  // Calculate track percentages
  for (const slug of Object.keys(trackStats) as AptitudeTrackSlug[]) {
    const stat = trackStats[slug];
    stat.percentage =
      stat.totalTopics > 0
        ? Math.round((stat.completedTopics / stat.totalTopics) * 100)
        : 0;
  }

  const completionRate = allTopics.length > 0 ? completedTopics / allTopics.length : 0;
  const placementReadinessIndex = Math.min(
    100,
    Math.round(completionRate * 85 + (watchedVideos / Math.max(1, totalVideos)) * 15)
  );

  const metrics: AptitudeMetrics = {
    totalTopics: allTopics.length,
    completedTopics,
    totalVideos,
    watchedVideos,
    candidateReviewVideos,
    missingVideos,
    verifiedVideos,
    totalQuestionsPracticed: 0,
    overallAccuracyPercentage: 0,
    averageTimePerQuestionSeconds: 0,
    trackProgress: trackStats,
    placementReadinessIndex,
    streakDays: 0,
    estimatedMinutesRemaining: Math.max(0, totalEstimatedMinutes - completedMinutes),
  };

  return {
    tracks,
    days,
    allTopics,
    enrollment,
    topicProgress,
    videoProgress,
    metrics,
  };
}
