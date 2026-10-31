import {
  format,
  parseISO,
  isValid,
  isToday,
  isTomorrow,
  isYesterday,
  addDays,
  subDays,
  differenceInDays,
} from "date-fns";

/**
 * Standard PRIME Date Conventions
 * - All persisted timestamps are ISO-8601 UTC strings.
 * - Daily preparation plans are keyed by calendar day string: YYYY-MM-DD.
 */

export const DATE_FORMATS = {
  // ISO calendar day for preparation plans and revision queues
  planDay: "yyyy-MM-dd",
  // Human readable short date
  displayShort: "MMM d",
  // Human readable full date
  displayFull: "MMMM d, yyyy",
  // Precise timestamp
  timestamp: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

/**
 * Formats a Date or ISO string into the standard plan day key (YYYY-MM-DD).
 */
export function toPlanDayKey(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, DATE_FORMATS.planDay);
}

/**
 * Formats a date for human-readable display with relative highlights.
 */
export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "Invalid date";

  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isYesterday(d)) return "Yesterday";

  return format(d, DATE_FORMATS.displayShort);
}

/**
 * Validates whether a string matches the required YYYY-MM-DD format.
 */
export function isValidPlanDay(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const parsed = parseISO(dateStr);
  return isValid(parsed);
}

export {
  addDays,
  subDays,
  differenceInDays,
  format,
  parseISO,
  isValid,
  isToday,
  isTomorrow,
  isYesterday,
};
