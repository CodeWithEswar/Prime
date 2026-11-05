import type { RevisionRating } from "./schema";

export type { RevisionRating };

export interface RevisionTopicTag {
  id: string;
  name: string;
  slug: string;
}

export interface RevisionProblemItem {
  id: string;
  problemId: string;
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  platform: string;
  platformUrl: string | null;
  topics: RevisionTopicTag[];
  intervalDays: number;
  nextReviewAt: string;
  snoozedUntil: string | null;
  bookmarked: boolean;
  category: "overdue" | "due_today" | "upcoming";
  timingLabel: string;
  isOverdue: boolean;
  stageLabel: string;
  lastAttempt: {
    outcome: "independent" | "hint" | "solution_viewed" | "unsolved";
    timeTakenMinutes: number;
    attemptedAt: string;
  } | null;
  lastReview: {
    rating: RevisionRating;
    reviewedAt: string;
  } | null;
  status: string;
}

export interface RevisionSummaryCounts {
  overdue: number;
  dueToday: number;
  upcoming: number;
  thisWeek: number;
}

export interface WorkloadDay {
  date: string;
  dayName: string;
  shortDate: string;
  fullLabel: string;
  count: number;
  isToday: boolean;
}

export interface RetentionPoint {
  milestone: string;
  rating: RevisionRating;
  score: number;
  label: string;
}

export interface RevisionDashboardData {
  items: RevisionProblemItem[];
  counts: RevisionSummaryCounts;
  workload: WorkloadDay[];
  retentionTrend: RetentionPoint[];
  topics: Array<{ id: string; name: string; count: number }>;
}

export type RevisionTab = "due_queue" | "upcoming" | "completed" | "all";

