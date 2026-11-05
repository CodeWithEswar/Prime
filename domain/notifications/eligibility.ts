/**
 * PRIME Notifications — Scheduling, Eligibility & Timezone Calculations
 * Pure domain functions: Zero database/UI side-effects.
 */

import type {
  NotificationCategory,
  NotificationChannel,
  NotificationPreferences,
} from "./types";

/**
 * Generates deterministic idempotency key for notification scheduling and delivery.
 */
export function generateNotificationIdempotencyKey(params: {
  userId: string;
  category: NotificationCategory;
  sourceId: string;
  channel?: NotificationChannel;
  dateKey?: string; // e.g. "2026-11-05"
}): string {
  const parts = [
    params.userId,
    params.category,
    params.sourceId,
    params.channel ?? "UNIVERSAL",
    params.dateKey ?? "ONCE",
  ];
  return parts.join(":");
}

/**
 * Parses "HH:MM:SS" or "HH:MM" into total minutes from midnight (0 - 1439).
 */
export function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(":").map((p) => parseInt(p, 10) || 0);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  return hours * 60 + minutes;
}

/**
 * Extracts current local time in minutes (0 - 1439) for a specified IANA timezone.
 */
export function getLocalMinutesFromDate(date: Date, timezone: string): number {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const hourPart = parts.find((p) => p.type === "hour")?.value ?? "0";
    const minutePart = parts.find((p) => p.type === "minute")?.value ?? "0";
    const hours = parseInt(hourPart, 10);
    const minutes = parseInt(minutePart, 10);
    return hours * 60 + minutes;
  } catch {
    // Fallback to UTC if timezone is invalid
    return date.getUTCHours() * 60 + date.getUTCMinutes();
  }
}

/**
 * Evaluates whether a given date falls inside user quiet hours in their local timezone.
 * Handles quiet hour spans that cross midnight (e.g. 22:00 to 07:00).
 */
export function isInQuietHours(
  checkDate: Date,
  timezone: string,
  quietStart: string,
  quietEnd: string
): boolean {
  const localMinutes = getLocalMinutesFromDate(checkDate, timezone);
  const startMinutes = parseTimeToMinutes(quietStart);
  const endMinutes = parseTimeToMinutes(quietEnd);

  // Case A: Quiet hours span within the same calendar day (e.g. 01:00 to 06:00)
  if (startMinutes < endMinutes) {
    return localMinutes >= startMinutes && localMinutes < endMinutes;
  }

  // Case B: Quiet hours span across midnight (e.g. 22:00 to 07:00)
  if (startMinutes > endMinutes) {
    return localMinutes >= startMinutes || localMinutes < endMinutes;
  }

  // Case C: start === end (quiet hours disabled / zero duration)
  return false;
}

/**
 * Checks whether a notification should be delivered based on channel and user preferences.
 */
export function isEligibleForDelivery(params: {
  category: NotificationCategory;
  channel: NotificationChannel;
  preferences: NotificationPreferences;
  currentTime?: Date;
  isUrgent?: boolean;
}): {
  eligible: boolean;
  reason?: string;
} {
  const { category, channel, preferences, currentTime = new Date(), isUrgent = false } = params;

  // 1. Channel master toggles
  if (channel === "IN_APP" && !preferences.inAppEnabled) {
    return { eligible: false, reason: "In-app notifications disabled by user" };
  }

  if (channel === "EMAIL" && !preferences.emailEnabled) {
    return { eligible: false, reason: "Email notifications disabled by user" };
  }

  // 2. Email category-specific permissions
  if (channel === "EMAIL") {
    switch (category) {
      case "revision_due":
      case "revision_overdue":
        if (!preferences.revisionEmailEnabled) {
          return { eligible: false, reason: "Revision emails disabled by user" };
        }
        break;
      case "study_session_upcoming":
      case "weekly_plan_reminder":
        if (!preferences.sessionEmailEnabled) {
          return { eligible: false, reason: "Session reminder emails disabled by user" };
        }
        break;
      case "assessment_upcoming":
      case "aptitude_assessment_upcoming":
        if (!preferences.assessmentEmailEnabled) {
          return { eligible: false, reason: "Assessment emails disabled by user" };
        }
        break;
      case "aptitude_daily_practice":
        if (preferences.aptitudeReminderEnabled === false) {
          return { eligible: false, reason: "Aptitude reminders disabled by user" };
        }
        break;
      case "missed_daily_task":
        if (!preferences.missedTaskEmailEnabled) {
          return { eligible: false, reason: "Missed task emails disabled by user" };
        }
        break;
      case "daily_study_digest":
        if (!preferences.dailyDigestEnabled) {
          return { eligible: false, reason: "Daily digest emails disabled by user" };
        }
        break;
      case "weekly_progress_report":
        if (!preferences.weeklyReportEnabled) {
          return { eligible: false, reason: "Weekly progress emails disabled by user" };
        }
        break;
      default:
        break;
    }
  }

  // 3. Quiet hours check (unless urgent, e.g. security or critical system announcement)
  if (!isUrgent && preferences.quietHoursEnabled) {
    const inQuiet = isInQuietHours(
      currentTime,
      preferences.timezone,
      preferences.quietHoursStart,
      preferences.quietHoursEnd
    );
    if (inQuiet) {
      return { eligible: false, reason: "Suppressed during user quiet hours" };
    }
  }

  return { eligible: true };
}

/**
 * Returns user-facing icon name and semantic accent for each category.
 */
export function getNotificationCategoryMeta(category: NotificationCategory): {
  label: string;
  badgeColor: string;
  defaultPriority: "low" | "medium" | "high" | "urgent";
} {
  switch (category) {
    case "revision_due":
      return { label: "Revision Ready", badgeColor: "#FF4D4D", defaultPriority: "high" };
    case "revision_overdue":
      return { label: "Revision Overdue", badgeColor: "#FF0000", defaultPriority: "urgent" };
    case "study_session_upcoming":
      return { label: "Study Session", badgeColor: "#3B82F6", defaultPriority: "medium" };
    case "assessment_upcoming":
      return { label: "Assessment", badgeColor: "#A855F7", defaultPriority: "high" };
    case "missed_daily_task":
      return { label: "Missed Task", badgeColor: "#F59E0B", defaultPriority: "medium" };
    case "daily_study_digest":
      return { label: "Daily Digest", badgeColor: "#10B981", defaultPriority: "low" };
    case "weekly_progress_report":
      return { label: "Weekly Progress", badgeColor: "#00E5FF", defaultPriority: "medium" };
    case "weekly_plan_reminder":
      return { label: "Plan Calibration", badgeColor: "#6366F1", defaultPriority: "medium" };
    case "streak_at_risk":
      return { label: "Streak at Risk", badgeColor: "#EC4899", defaultPriority: "medium" };
    case "goal_deadline":
      return { label: "Target Approach", badgeColor: "#FF4D4D", defaultPriority: "high" };
    case "aptitude_daily_practice":
      return { label: "Aptitude Practice", badgeColor: "#FF4D4D", defaultPriority: "medium" };
    case "aptitude_assessment_upcoming":
      return { label: "Aptitude Assessment", badgeColor: "#F59E0B", defaultPriority: "high" };
    case "system_announcement":
      return { label: "Announcement", badgeColor: "#E5E5E5", defaultPriority: "medium" };
    default:
      return { label: "Notification", badgeColor: "#888888", defaultPriority: "medium" };
  }
}

