import type {
  AptitudeTrack,
  AptitudeTrackSlug,
  AptitudeDay,
  AptitudeTopic,
  AptitudeVideoItem,
  UserAptitudeTopicProgress,
  UserAptitudeVideoProgress,
  AptitudeMetrics,
  AptitudeDifficulty,
  AptitudePriority,
  VideoReviewStatus,
} from "@/domain/aptitude/types";

export type {
  AptitudeTrack,
  AptitudeTrackSlug,
  AptitudeDay,
  AptitudeTopic,
  AptitudeVideoItem,
  UserAptitudeTopicProgress,
  UserAptitudeVideoProgress,
  AptitudeMetrics,
  AptitudeDifficulty,
  AptitudePriority,
  VideoReviewStatus,
};

export interface AptitudeEnrollment {
  enrolled: boolean;
  enrolledAt: string | null;
  currentDay: number;
  startDate: string;
  targetCompletionDate?: string | null;
  pacing: "accelerated" | "standard" | "relaxed";
  isPaused: boolean;
}

export interface AptitudeDashboardData {
  tracks: AptitudeTrack[];
  days: AptitudeDay[];
  allTopics: AptitudeTopic[];
  enrollment: AptitudeEnrollment;
  topicProgress: Record<string, UserAptitudeTopicProgress>;
  videoProgress: Record<string, UserAptitudeVideoProgress>;
  metrics: AptitudeMetrics;
}

export interface AptitudeRecommendation {
  dayNumber: number;
  topicId: string;
  title: string;
  trackSlug: AptitudeTrackSlug;
  trackTitle: string;
  type: "topic" | "assessment";
  videoId?: string;
}
