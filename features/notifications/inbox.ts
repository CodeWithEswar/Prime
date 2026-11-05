import { z } from "zod";

export const notificationCategories = [
  "revision_due",
  "revision_overdue",
  "study_session_upcoming",
  "assessment_upcoming",
  "missed_daily_task",
  "daily_study_digest",
  "weekly_progress_report",
  "weekly_plan_reminder",
  "streak_at_risk",
  "goal_deadline",
  "system_announcement",
  "aptitude_daily_practice",
  "aptitude_assessment_upcoming",
] as const;
export const inboxQuerySchema = z.object({
  tab: z.enum(["all", "unread", "reminders"]).default("all"),
  category: z.enum(notificationCategories).optional(),
  unreadOnly: z.boolean().default(false),
  search: z.string().trim().max(100).default(""),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().max(512).nullish(),
});
export const inboxUpdateSchema = z.object({
  ids: z
    .array(z.uuid())
    .min(1)
    .max(50)
    .transform((ids) => [...new Set(ids)]),
  operation: z.enum(["read", "unread", "delete"]),
});
export type InboxOperation = z.infer<typeof inboxUpdateSchema>["operation"];
/** Event destinations must stay inside PRIME. */
export function notificationHref(value?: string | null) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\s\u0000-\u001f]/.test(value)
  )
    return null;
  return value;
}

export function notificationDayGroup(value: string, timeZone: string, now = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Earlier";
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dayNumber = (d: Date) => {
    const parts = formatter.formatToParts(d);
    const get = (key: string) => Number(parts.find((part) => part.type === key)?.value);
    return Date.UTC(get("year"), get("month") - 1, get("day")) / 86400000;
  };
  const days = dayNumber(now) - dayNumber(date);
  return days <= 0
    ? "Today"
    : days === 1
      ? "Yesterday"
      : days < 7
        ? "Last 7 days"
        : "Earlier";
}
