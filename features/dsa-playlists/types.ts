/**
 * PRIME — DSA Playlists & Progress Tracking Engine Types
 */

import type { Database } from "@/lib/supabase/database.types";

export type DSAPlaylistRow = Database["public"]["Tables"]["dsa_playlists"]["Row"];
export type DSAVideoRow = Database["public"]["Tables"]["dsa_videos"]["Row"];
export type DSAPlaylistItemRow = Database["public"]["Tables"]["dsa_playlist_items"]["Row"];
export type DSAEnrollmentRow = Database["public"]["Tables"]["dsa_playlist_enrollments"]["Row"];
export type DSAVideoProgressRow = Database["public"]["Tables"]["dsa_video_progress"]["Row"];
export type DSAVideoNoteRow = Database["public"]["Tables"]["dsa_video_notes"]["Row"];
export type DSAVideoBookmarkRow = Database["public"]["Tables"]["dsa_video_bookmarks"]["Row"];

export type PlaylistDifficulty = "Beginner → Advanced" | "Intermediate" | "Intermediate → Advanced" | "Advanced";
export type PlaylistStatusFilter = "all" | "enrolled" | "in_progress" | "completed" | "not_started";

export interface DSAPlaylistSummary {
  id: string;
  slug: string;
  youtubePlaylistId: string;
  title: string;
  instructor: string;
  channelTitle: string;
  description: string | null;
  difficulty: string;
  level: string;
  focus: string;
  programmingLanguage: string;
  thumbnailUrl: string | null;
  videoCount: number;
  totalDurationSeconds: number;
  topicTags: string[];
  isFeatured: boolean;
  isDefault: boolean;
  
  // Enrolled user computed state
  isEnrolled: boolean;
  enrollmentStatus: "active" | "paused" | "completed" | "archived" | null;
  completedLessonsCount: number;
  progressPercentage: number;
  lastVideoId: string | null;
  lastActivityAt: string | null;
  nextLesson?: {
    id: string;
    youtubeVideoId: string;
    title: string;
    position: number;
    durationSeconds: number;
  } | null;
}

export interface DSALessonItem {
  id: string;
  playlistItemId: string;
  videoDbId: string;
  youtubeVideoId: string;
  position: number;
  title: string;
  durationSeconds: number;
  durationFormatted: string;
  thumbnailUrl: string | null;
  channelTitle: string;
  canonicalTopicSlug: string;
  difficulty: "easy" | "medium" | "hard";
  embedAllowed: boolean;
  
  // User progress state
  isCompleted: boolean;
  isBookmarked: boolean;
  lastPositionSeconds: number;
  watchedSeconds: number;
  completedAt: string | null;
  hasNotes: boolean;
  notesContent?: string;
  
  // Linked practice questions
  linkedProblems: {
    id: string;
    slug: string;
    title: string;
    difficulty: "easy" | "medium" | "hard";
    relationship: "theory" | "practice" | "solution" | "prerequisite";
  }[];
}

export interface DSAPlaylistDetail {
  playlist: DSAPlaylistSummary;
  lessons: DSALessonItem[];
  activeLesson: DSALessonItem;
  enrolled: boolean;
  stats: {
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    totalDurationSeconds: number;
    completedDurationSeconds: number;
  };
}

export interface DSAPlaylistFilterOptions {
  searchQuery?: string;
  instructor?: string;
  difficulty?: string;
  topic?: string;
  language?: string;
  status?: PlaylistStatusFilter;
}

export interface DSAAnalyticsData {
  enrolledPlaylistsCount: number;
  completedPlaylistsCount: number;
  completedLessonsCount: number;
  lessonsCompletedThisWeek: number;
  totalWatchTimeEstimatedMinutes: number;
  
  // Charts data
  activityByDay: {
    date: string;
    dayLabel: string;
    lessonsCompleted: number;
  }[];
  playlistProgress: {
    slug: string;
    title: string;
    instructor: string;
    completed: number;
    total: number;
    percentage: number;
  }[];
  topicCoverage: {
    topic: string;
    label: string;
    completedCount: number;
  }[];
  learningVsPractice: {
    topic: string;
    lessonsWatched: number;
    problemsSolved: number;
  }[];
}

