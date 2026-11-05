/**
 * PRIME Today — Daily Execution Command Center Types
 * Authoritative types for daily execution runway, snapshot projection,
 * tasks, groups, next action, and focus sessions.
 */

export type TodayStatus =
  | "not_started"
  | "in_progress"
  | "complete"
  | "rest_day"
  | "empty";

export type PlanTrajectory =
  | "ahead"
  | "on_track"
  | "tight"
  | "at_risk"
  | "behind";

export type TaskGroupType = "overdue" | "revision" | "prime_core" | "custom";

export interface TodayTaskItem {
  id: string;
  dailyPlanId: string;
  taskType: "revision" | "dsa_problem" | "custom";
  title: string;
  status: "planned" | "in_progress" | "completed" | "skipped";
  priority: "p0" | "p1" | "p2" | "p3";
  plannedMinutes: number;
  completedMinutes: number;
  actualMinutes: number; // accumulated focused time from study_sessions
  sortOrder: number;
  isLocked: boolean;
  scheduledReason: string | null;
  reasonExplanation: string;
  carriedFromDate?: string | null;
  carryCount?: number;

  // Problem-specific metadata (for dsa_problem and revision)
  problemId?: string | null;
  problemSlug?: string | null;
  problemDifficulty?: "EASY" | "MEDIUM" | "HARD" | null;
  topicName?: string | null;

  // Curriculum-specific metadata (for dsa_problem)
  stageName?: string | null;
  stageSequence?: number | null;

  // Revision-specific metadata
  revisionItemId?: string | null;
  revisionIntervalDays?: number | null;
  revisionTimingLabel?: string | null;
  isOverdue?: boolean;

  // Historical attempt / review context
  lastAttempt?: {
    outcome: "hint" | "independent" | "solution_viewed" | "unsolved";
    timeTakenMinutes: number;
    attemptedAt: string;
  } | null;
  lastReview?: {
    rating: "easy" | "hard" | "forgot" | "okay";
    reviewedAt: string;
  } | null;

  // Runway state
  isCurrent: boolean;
}

export interface TodayTaskGroup {
  id: TaskGroupType;
  label: string; // e.g. "01 / REVISION", "02 / PRIME CORE", "03 / CUSTOM"
  tasks: TodayTaskItem[];
  totalPlannedMinutes: number;
  completedCount: number;
  totalCount: number;
  isUrgent?: boolean;
}

export interface TodayNextAction {
  taskId: string;
  taskType: "revision" | "dsa_problem" | "custom";
  title: string;
  problemSlug?: string | null;
  difficulty?: "EASY" | "MEDIUM" | "HARD" | null;
  topicName?: string | null;
  stageName?: string | null;
  stageSequence?: number | null;
  targetMinutes: number;
  reasonExplanation: string;
  actionType: "start" | "continue" | "review";
  isOverdue?: boolean;
  sessionElapsedSeconds?: number;
}

export interface ActiveStudySession {
  id: string;
  taskId: string;
  taskTitle: string;
  problemSlug?: string | null;
  startedAt: string;
  durationSeconds: number; // accumulated paused seconds
  status: "running" | "paused";
}

export interface TomorrowPreview {
  date: string;
  dayOfWeek: string;
  plannedMinutes: number;
  taskCount: number;
  revisionCount: number;
  coreCount: number;
}

export interface TodaySnapshot {
  date: string; // YYYY-MM-DD in user's timezone
  displayDate: string; // "NOV 03"
  dayOfWeek: string; // "Tuesday"
  timezone: string;
  dayNumber: number; // e.g. 3
  totalDays: number; // e.g. 92

  plan: {
    id: string | null;
    preparationPlanId: string | null;
    status: TodayStatus;
    trajectory: PlanTrajectory;
    isRestDay: boolean;
  };

  capacity: {
    availableMinutes: number;
    plannedMinutes: number;
    completedMinutes: number;
    remainingMinutes: number;
    focusedMinutes: number;
    utilizationRate: number;
    isExceeded: boolean;
  };

  progress: {
    completedTaskCount: number;
    totalTaskCount: number;
    percentage: number;
  };

  revision: {
    overdueCount: number;
    dueTodayCount: number;
  };

  tasks: TodayTaskItem[];
  groups: TodayTaskGroup[];
  nextAction: TodayNextAction | null;
  activeSession: ActiveStudySession | null;
  tomorrowPreview: TomorrowPreview | null;
}
