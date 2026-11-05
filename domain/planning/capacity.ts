/**
 * PRIME 90-Day Adaptive Preparation Planner — Capacity Engine
 * Pure domain calculations for weekday capacity, rest days, date exceptions,
 * and realistic utilization buffering (85% target budget).
 */

import type { PreparationTarget } from "./types";

export interface DayCapacityInfo {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 = Sunday, ..., 6 = Saturday
  isRestDay: boolean;
  availableMinutes: number;
  planningBudgetMinutes: number; // e.g. 85% of available
  exceptionReason?: string;
}

/**
 * Parses YYYY-MM-DD date parts safely without UTC offset shifting.
 */
export function parseDateParts(dateStr: string): { year: number; month: number; day: number } {
  const parts = dateStr.split("-").map(Number);
  return { year: parts[0] || 2026, month: (parts[1] || 1) - 1, day: parts[2] || 1 };
}

/**
 * Computes day of week (0 = Sunday, ..., 6 = Saturday) for YYYY-MM-DD string.
 */
export function getDayOfWeekFromDate(dateStr: string): number {
  const { year, month, day } = parseDateParts(dateStr);
  return new Date(Date.UTC(year, month, day, 12, 0, 0)).getUTCDay();
}

/**
 * Returns the next day as YYYY-MM-DD string.
 */
export function addDays(dateStr: string, days: number): string {
  const { year, month, day } = parseDateParts(dateStr);
  const d = new Date(Date.UTC(year, month, day + days, 12, 0, 0));
  return d.toISOString().slice(0, 10);
}

/**
 * Returns the number of calendar days between startDate and targetDate inclusive.
 */
export function daysBetween(startDate: string, targetDate: string): number {
  const start = Date.parse(startDate);
  const target = Date.parse(targetDate);
  if (!Number.isFinite(start) || !Number.isFinite(target)) return 1;
  const diffMs = target - start;
  return Math.max(1, Math.round(diffMs / 86400000) + 1);
}

/**
 * Calculates available preparation capacity for a single calendar date.
 * Prioritizes: Date-specific exceptions -> Weekday rules -> Default target settings.
 */
export function getDailyCapacity(
  dateStr: string,
  target: Pick<PreparationTarget, "exceptions" | "weekdayRules" | "restDays" | "defaultDailyCapacityMinutes">,
  config: { utilizationTarget: number }
): DayCapacityInfo {
  const dayOfWeek = getDayOfWeekFromDate(dateStr);

  // 1. Date-specific Exception Check
  const exception = target.exceptions?.find((e) => e.date === dateStr);
  if (exception) {
    const isRest = exception.isUnavailable || exception.availableMinutes <= 0;
    const available = isRest ? 0 : exception.availableMinutes;
    const budget = isRest ? 0 : Math.floor(available * config.utilizationTarget + 1e-9);
    return {
      date: dateStr,
      dayOfWeek,
      isRestDay: isRest,
      availableMinutes: available,
      planningBudgetMinutes: budget,
      exceptionReason: exception.reason,
    };
  }

  // 2. Weekday-specific Rule Check
  const rule = target.weekdayRules?.find((r) => r.dayOfWeek === dayOfWeek);
  if (rule) {
    const isRest = rule.isRestDay || rule.availableMinutes <= 0;
    const available = isRest ? 0 : rule.availableMinutes;
    const budget = isRest ? 0 : Math.floor(available * config.utilizationTarget + 1e-9);
    return {
      date: dateStr,
      dayOfWeek,
      isRestDay: isRest,
      availableMinutes: available,
      planningBudgetMinutes: budget,
    };
  }

  // 3. Target Defaults
  const isRest = (target.restDays?.includes(dayOfWeek) ?? false) || target.defaultDailyCapacityMinutes <= 0;
  const available = isRest ? 0 : target.defaultDailyCapacityMinutes;
  const budget = isRest ? 0 : Math.floor(available * config.utilizationTarget + 1e-9);

  return {
    date: dateStr,
    dayOfWeek,
    isRestDay: isRest,
    availableMinutes: available,
    planningBudgetMinutes: budget,
  };
}

/**
 * Computes total effective capacity across the full preparation timeline.
 */
export function calculateTimelineCapacity(
  startDate: string,
  targetDate: string,
  target: PreparationTarget,
  config: { utilizationTarget: number }
): {
  totalCalendarDays: number;
  activeStudyDays: number;
  restDaysCount: number;
  totalAvailableMinutes: number;
  totalEffectiveBudgetMinutes: number;
  dailyCapacities: DayCapacityInfo[];
} {
  const totalCalendarDays = daysBetween(startDate, targetDate);
  const dailyCapacities: DayCapacityInfo[] = [];

  let activeStudyDays = 0;
  let restDaysCount = 0;
  let totalAvailableMinutes = 0;
  let totalEffectiveBudgetMinutes = 0;

  for (let i = 0; i < totalCalendarDays; i++) {
    const date = addDays(startDate, i);
    const cap = getDailyCapacity(date, target, config);
    dailyCapacities.push(cap);

    if (cap.isRestDay || cap.availableMinutes === 0) {
      restDaysCount++;
    } else {
      activeStudyDays++;
      totalAvailableMinutes += cap.availableMinutes;
      totalEffectiveBudgetMinutes += cap.planningBudgetMinutes;
    }
  }

  return {
    totalCalendarDays,
    activeStudyDays,
    restDaysCount,
    totalAvailableMinutes,
    totalEffectiveBudgetMinutes,
    dailyCapacities,
  };
}

