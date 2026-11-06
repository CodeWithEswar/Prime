import type { Database } from "@/lib/supabase/database.types";

export type StriverSheetRow = Database["public"]["Tables"]["dsa_sheets"]["Row"];
export type StriverModuleRow = Database["public"]["Tables"]["dsa_sheet_modules"]["Row"];
export type StriverTopicRow = Database["public"]["Tables"]["dsa_sheet_topics"]["Row"];
export type StriverProblemRow = Database["public"]["Tables"]["dsa_sheet_problems"]["Row"];

export type TopicMasteryLevel = "not_assessed" | "learning" | "practicing" | "developing" | "proficient";
export type VideoProgressStatus = "not_started" | "in_progress" | "completed";
export type ProblemSolveStatus = "not_started" | "attempted" | "solved" | "revisit";

export interface StriverVideoItem {
  id: string;
  youtubeVideoId: string;
  title: string;
  durationSeconds: number;
  durationFormatted: string;
  thumbnailUrl: string | null;
  channelTitle: string;
  isCompleted: boolean;
  isBookmarked: boolean;
  notesContent?: string;
}

export interface StriverProblemItem {
  id: string;
  topicId: string;
  canonicalProblemId: string | null;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  leetcodeUrl: string | null;
  articleUrl: string | null;
  position: number;
  status: ProblemSolveStatus;
  lastAttemptOutcome?: string;
  mappedVideoId?: string | null;
}

export interface StriverTopicDetail {
  id: string;
  moduleId: string;
  substepNumber: string;
  title: string;
  slug: string;
  description: string | null;
  position: number;
  
  // Videos in this topic
  videos: StriverVideoItem[];
  
  // Problems in this topic
  problems: StriverProblemItem[];
  
  // Evidence-based stats
  stats: {
    totalVideos: number;
    completedVideos: number;
    totalProblems: number;
    solvedProblems: number;
    masteryLevel: TopicMasteryLevel;
  };
}

export interface StriverModuleDetail {
  id: string;
  stepNumber: number;
  title: string;
  slug: string;
  description: string | null;
  position: number;
  topics: StriverTopicDetail[];
  
  stats: {
    totalVideos: number;
    completedVideos: number;
    totalProblems: number;
    solvedProblems: number;
  };
}

export interface StriverSheetDetail {
  sheet: {
    id: string;
    slug: string;
    title: string;
    author: string;
    description: string | null;
    officialUrl: string;
    version: string;
  };
  modules: StriverModuleDetail[];
  activeTopicId: string;
  activeVideoId?: string | null;
  
  overallStats: {
    totalVideos: number;
    completedVideos: number;
    videoProgressPercentage: number;
    totalProblems: number;
    solvedProblems: number;
    problemProgressPercentage: number;
    masteryPercentage: number;
    dueRevisionsCount: number;
    lastActivityAt: string | null;
  };
}

export interface StriverAnalyticsOverview {
  totalLectures: number;
  completedLectures: number;
  lecturePct: number;
  totalProblems: number;
  solvedProblems: number;
  problemPct: number;
  activeStudyDays: number;
  masteryPct: number;
}

export interface StriverMilestoneItem {
  id: string;
  title: string;
  category: "video" | "problem" | "topic" | "revision" | "track";
  timestamp: string;
  description: string;
}

export interface StriverRadarDimension {
  domain: string;
  score: number; // 0 - 100
  solved: number;
  total: number;
  level: string;
}

export interface StriverHeatmapDay {
  date: string;
  count: number;
  videos: number;
  problems: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface StriverAnalyticsData {
  overview: StriverAnalyticsOverview;
  videoCompletionTrend: {
    date: string;
    completed: number;
    cumulative: number;
    problemsSolved: number;
    cumulativeProblems: number;
  }[];
  problemsByTopic: {
    topic: string;
    easy: number;
    medium: number;
    hard: number;
    total: number;
  }[];
  topicCoverage: {
    topic: string;
    videoPct: number;
    practicePct: number;
  }[];
  weeklyConsistency: {
    day: string;
    videosWatched: number;
    problemsSolved: number;
  }[];
  learningVsPractice: {
    category: string;
    value: number;
  }[];
  activityHeatmap: StriverHeatmapDay[];
  radarMastery: StriverRadarDimension[];
  milestones: StriverMilestoneItem[];
}

