/**
 * PRIME Preparation Calendar — Domain Types & Contracts
 * Pure definitions for the Temporal Planning Canvas (Month, Week, Agenda, Day Lens)
 * Projection of Planner, Revision, and Today states.
 */

export type CalendarViewMode = "month" | "week" | "agenda";

export type CalendarAttention = "none" | "over-capacity" | "overdue" | "at-risk";

export type CalendarSubject = "dsa" | "dbms" | "os" | "cn" | "oop" | "aptitude";

export interface CalendarDayProjection {
  date: string; // Canonical YYYY-MM-DD
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayNumber: number; // 1 - 31
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  isPlanStart: boolean;
  isTargetDate: boolean;
  isRestDay: boolean;

  // Capacity & Durations (in minutes)
  availableMinutes: number;
  plannedMinutes: number;
  completedMinutes: number;

  // Task & Revision Counts
  taskCount: number;
  completedTaskCount: number;
  revisionCount: number;
  overdueRevisionCount: number;
  carriedTaskCount: number;

  // Scheduled Course / Subject Badges (DSA, DBMS, OS, CN, OOP)
  subjects?: CalendarSubject[];

  // Temporal Attention Signal
  attention: CalendarAttention;

  // Optional Rebalance Difference
  rebalanceDiff?: {
    previousMinutes: number;
    newMinutes: number;
  };
}

export interface CalendarTaskItem {
  id: string;
  title: string;
  taskType: "dsa_problem" | "revision" | "custom";
  status:
    | "pending"
    | "in_progress"
    | "completed"
    | "skipped"
    | "rescheduled"
    | "carried_forward";
  plannedMinutes: number;
  completedMinutes: number;
  priority: string;
  sortOrder: number;

  // Subject Context
  subject?: CalendarSubject;

  // Problem / Core Context
  problemId?: string | null;
  problemSlug?: string | null;
  difficulty?: "EASY" | "MEDIUM" | "HARD" | null;
  topicName?: string | null;
  stageName?: string | null;

  // Revision Context
  revisionItemId?: string | null;
  revisionIntervalDays?: number | null;
  isOverdue?: boolean;

  // Carried Context
  isCarried?: boolean;
  carryCount?: number;
  originalDate?: string | null;

  // Explainability
  scheduledReason?: string | null;
  reasonExplanation?: string;
}

export interface CalendarDayDetail {
  date: string; // YYYY-MM-DD
  displayDate: string; // e.g. "NOV 05"
  dayOfWeek: string; // e.g. "Thursday"
  availableMinutes: number;
  plannedMinutes: number;
  completedMinutes: number;
  isRestDay: boolean;
  isToday: boolean;
  isTargetDate: boolean;
  isPlanStart: boolean;
  trajectory: string;
  attention: CalendarAttention;

  subjects?: CalendarSubject[];
  tasks: CalendarTaskItem[];
  revisionsSummary: { count: number; minutes: number };
  coreSummary: { count: number; minutes: number };
  customSummary: { count: number; minutes: number };
}

export interface CalendarWeekSummary {
  weekNumber: number;
  weekLabel: string; // e.g. "W01", "W02"
  startDate: string; // YYYY-MM-DD (Monday)
  endDate: string; // YYYY-MM-DD (Sunday)
  totalPlannedMinutes: number;
  totalCapacityMinutes: number;
  totalCompletedMinutes: number;
  totalTasks: number;
  totalRevisions: number;
  totalCoreProblems: number;
  restDaysCount: number;
  trajectory: string;
  days: CalendarDayProjection[];
}

export interface CalendarMonthSummary {
  monthLabel: string; // e.g. "NOVEMBER 2026"
  monthKey: string; // e.g. "2026-11"
  totalPlannedMinutes: number;
  totalCapacityMinutes: number;
  totalCompletedMinutes: number;
  totalTasks: number;
  totalRevisions: number;
  restDaysCount: number;
  trajectory: string;
}

export interface CalendarPlanHeader {
  id: string;
  targetRole: string;
  startDate: string;
  targetDate: string;
  timezone: string;
  trajectory: string;
  feasibilityStatus: string;
}

export interface CalendarRangeSnapshot {
  plan: CalendarPlanHeader | null;
  selectedDate: string;
  todayDate: string;
  currentMonthKey: string; // e.g. "2026-11"
  monthLabel: string; // e.g. "NOVEMBER 2026"
  view: CalendarViewMode;
  days: CalendarDayProjection[];
  weeks: CalendarWeekSummary[];
  monthSummary: CalendarMonthSummary;
  selectedDay: CalendarDayDetail | null;
  rebalancePreview?: Array<{
    date: string;
    previousMinutes: number;
    newMinutes: number;
  }>;
}

