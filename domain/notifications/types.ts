/**
 * PRIME Notifications & Reminders Engine — Domain Types & Contracts
 */

export type NotificationCategory =
  | "revision_due"
  | "revision_overdue"
  | "study_session_upcoming"
  | "assessment_upcoming"
  | "missed_daily_task"
  | "daily_study_digest"
  | "weekly_progress_report"
  | "weekly_plan_reminder"
  | "streak_at_risk"
  | "goal_deadline"
  | "system_announcement"
  | "aptitude_daily_practice"
  | "aptitude_assessment_upcoming";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export type NotificationChannel = "IN_APP" | "EMAIL";

export type NotificationScheduleStatus =
  | "PENDING"
  | "CLAIMED"
  | "QUEUED"
  | "COMPLETED"
  | "CANCELED"
  | "SUPPRESSED"
  | "FAILED";

export type NotificationDeliveryStatus =
  | "PENDING"
  | "PROCESSING"
  | "SENT"
  | "DELIVERED"
  | "DEFERRED"
  | "FAILED"
  | "BOUNCED"
  | "SUPPRESSED";

export interface NotificationPreferences {
  id: string;
  userId: string;
  timezone: string; // IANA timezone, e.g. "Asia/Kolkata"
  inAppEnabled: boolean;
  emailEnabled: boolean;
  revisionEmailEnabled: boolean;
  sessionEmailEnabled: boolean;
  assessmentEmailEnabled: boolean;
  missedTaskEmailEnabled: boolean;
  aptitudeReminderEnabled: boolean;
  dailyDigestEnabled: boolean;
  weeklyReportEnabled: boolean;
  sessionLeadTimeMinutes: 5 | 10 | 15 | 30 | 60;
  dailyDigestLocalTime: string; // "HH:MM:SS" or "HH:MM"
  weeklyReportDay: number; // 0 = Sunday, 1 = Monday, ...
  weeklyReportLocalTime: string; // "HH:MM:SS" or "HH:MM"
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00:00"
  quietHoursEnd: string; // "07:00:00"
  unsubscribeToken: string;
  createdAt: string;
  updatedAt: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  eventId?: string | null;
  category: NotificationCategory;
  title: string;
  body: string;
  actionUrl?: string | null;
  priority: NotificationPriority;
  readAt?: string | null;
  dismissedAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
}

export interface NotificationSchedule {
  id: string;
  userId: string;
  eventType: string;
  sourceType: string;
  sourceId: string;
  sourceVersion: number;
  scheduledFor: string;
  timezone: string;
  status: NotificationScheduleStatus;
  idempotencyKey: string;
  attemptCount: number;
  leaseOwner?: string | null;
  leaseExpiresAt?: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDelivery {
  id: string;
  notificationId?: string | null;
  userId: string;
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
  idempotencyKey: string;
  provider: string;
  providerMessageId?: string | null;
  attemptCount: number;
  nextAttemptAt?: string | null;
  lastAttemptAt?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  failedAt?: string | null;
  failureCode?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDeliveryAttempt {
  id: string;
  deliveryId: string;
  attemptNumber: number;
  startedAt: string;
  completedAt?: string | null;
  outcome: "success" | "transient_failure" | "permanent_failure";
  errorCategory?: string | null;
  providerResponseCode?: string | null;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  createdAt: string;
}

export interface NotificationQueueMessage {
  version: 1;
  deliveryId: string;
  notificationId?: string | null;
  userId: string;
  channel: NotificationChannel;
  idempotencyKey: string;
  enqueuedAt: string;
}

// Payload models for domain events and templates
export interface RevisionReminderPayload {
  items: Array<{
    id: string;
    title: string;
    topicName?: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    intervalDays?: number;
  }>;
  overdueCount: number;
  dueTodayCount: number;
  actionUrl: string;
}

export interface StudySessionReminderPayload {
  sessionId: string;
  title: string;
  subject: string;
  plannedMinutes: number;
  scheduledTime: string;
  leadTimeMinutes: number;
  actionUrl: string;
}

export interface AssessmentReminderPayload {
  assessmentId: string;
  title: string;
  category: "aptitude" | "dsa" | "fundamentals" | "mock_interview";
  scheduledTime: string;
  estimatedMinutes?: number;
  actionUrl: string;
}

export interface MissedTaskSummaryPayload {
  date: string;
  missedTasks: Array<{
    id: string;
    title: string;
    plannedMinutes: number;
    priority?: string;
  }>;
  totalMissedMinutes: number;
  actionUrl: string;
}

export interface DailyDigestPayload {
  date: string;
  plannedMinutes: number;
  availableMinutes: number;
  taskCount: number;
  revisionCount: number;
  tasks: Array<{
    id: string;
    title: string;
    plannedMinutes: number;
    priority?: string;
  }>;
  actionUrl: string;
}

export interface WeeklyProgressReportPayload {
  weekLabel: string;
  startDate: string;
  endDate: string;
  tasksCompleted: number;
  tasksTotal: number;
  studyTimeMinutes: number;
  dsaAttemptedCount: number;
  dsaSolveRatePercent: number;
  revisionCompletionRatePercent: number;
  strongestTopic?: string;
  focusNextWeekTopic?: string;
  actionUrl: string;
}

