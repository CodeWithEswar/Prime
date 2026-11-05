/**
 * PRIME Preparation Calendar — Pure Domain Projection Functions
 * Pure calculations for calendar grids, load rails, week lanes, and temporal signals.
 * Zero UI/database dependencies.
 */

import { addDays, parseDateParts, getDayOfWeekFromDate } from "@/domain/planning/capacity";
import type {
  CalendarAttention,
  CalendarDayProjection,
  CalendarWeekSummary,
  CalendarMonthSummary,
} from "../types";

/**
 * Formats duration compactly for month grid cells (e.g. "3h", "2h30", "45m").
 */
export function formatDurationCompact(minutes: number): string {
  if (minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  if (hours > 0 && remainingMins === 0) {
    return `${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h${remainingMins}`;
  }
  return `${minutes}m`;
}

/**
 * Formats duration cleanly for Day Lens / Week summaries (e.g. "3h 45m").
 */
export function formatDurationDetailed(minutes: number): string {
  if (minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  if (hours > 0 && remainingMins > 0) {
    return `${hours}h ${remainingMins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Derives deterministic temporal attention according to strict precedence rules:
 * 1. Over capacity (planned > available on non-rest day)
 * 2. Overdue revision (revisitation debt)
 * 3. Plan at-risk trajectory
 * 4. None
 */
export function deriveCalendarAttention(params: {
  plannedMinutes: number;
  availableMinutes: number;
  overdueRevisionCount: number;
  isRestDay: boolean;
  trajectory?: string;
}): CalendarAttention {
  if (!params.isRestDay && params.availableMinutes > 0 && params.plannedMinutes > params.availableMinutes) {
    return "over-capacity";
  }
  if (params.overdueRevisionCount > 0) {
    return "overdue";
  }
  if (params.trajectory === "at_risk" || params.trajectory === "infeasible") {
    return "at-risk";
  }
  return "none";
}

/**
 * Calculates metrics for the Day Load Rail.
 */
export function getLoadRailMetrics(
  plannedMinutes: number,
  availableMinutes: number,
  completedMinutes = 0
): {
  fillRatio: number;
  completedRatio: number;
  isOverCapacity: boolean;
  overflowMinutes: number;
} {
  const isOverCapacity = availableMinutes > 0 && plannedMinutes > availableMinutes;
  const overflowMinutes = Math.max(0, plannedMinutes - availableMinutes);
  const fillRatio =
    availableMinutes > 0 ? Math.min(1, plannedMinutes / availableMinutes) : plannedMinutes > 0 ? 1 : 0;
  const completedRatio =
    plannedMinutes > 0 ? Math.min(1, completedMinutes / plannedMinutes) : 0;

  return {
    fillRatio,
    completedRatio,
    isOverCapacity,
    overflowMinutes,
  };
}

/**
 * Computes month-level aggregation summary from day projections.
 */
export function calculateMonthSummary(
  monthKey: string, // YYYY-MM
  days: CalendarDayProjection[],
  trajectory = "on_track"
): CalendarMonthSummary {
  const currentMonthDays = days.filter((d) => d.date.startsWith(monthKey));

  let totalPlannedMinutes = 0;
  let totalCapacityMinutes = 0;
  let totalCompletedMinutes = 0;
  let totalTasks = 0;
  let totalRevisions = 0;
  let restDaysCount = 0;

  for (const day of currentMonthDays) {
    totalPlannedMinutes += day.plannedMinutes;
    totalCapacityMinutes += day.availableMinutes;
    totalCompletedMinutes += day.completedMinutes;
    totalTasks += day.taskCount;
    totalRevisions += day.revisionCount;
    if (day.isRestDay) restDaysCount++;
  }

  const { year, month } = parseDateParts(`${monthKey}-01`);
  const date = new Date(Date.UTC(year, month, 1, 12, 0, 0));
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date).toUpperCase();

  return {
    monthLabel,
    monthKey,
    totalPlannedMinutes,
    totalCapacityMinutes,
    totalCompletedMinutes,
    totalTasks,
    totalRevisions,
    restDaysCount,
    trajectory,
  };
}

/**
 * Groups calendar day projections into structured 7-day Monday–Sunday weeks.
 */
export function groupRangeByWeek(
  days: CalendarDayProjection[],
  trajectory = "on_track"
): CalendarWeekSummary[] {
  if (days.length === 0) return [];

  const weeks: CalendarWeekSummary[] = [];
  let currentWeekDays: CalendarDayProjection[] = [];
  let weekIndex = 1;

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    currentWeekDays.push(day);

    // If day is Sunday (dayOfWeek === 0) or last day of input
    if (day.dayOfWeek === 0 || i === days.length - 1) {
      let totalPlannedMinutes = 0;
      let totalCapacityMinutes = 0;
      let totalCompletedMinutes = 0;
      let totalTasks = 0;
      let totalRevisions = 0;
      let totalCoreProblems = 0;
      let restDaysCount = 0;

      for (const d of currentWeekDays) {
        totalPlannedMinutes += d.plannedMinutes;
        totalCapacityMinutes += d.availableMinutes;
        totalCompletedMinutes += d.completedMinutes;
        totalTasks += d.taskCount;
        totalRevisions += d.revisionCount;
        totalCoreProblems += Math.max(0, d.taskCount - d.revisionCount);
        if (d.isRestDay) restDaysCount++;
      }

      const startDate = currentWeekDays[0].date;
      const endDate = currentWeekDays[currentWeekDays.length - 1].date;

      weeks.push({
        weekNumber: weekIndex,
        weekLabel: `W${String(weekIndex).padStart(2, "0")}`,
        startDate,
        endDate,
        totalPlannedMinutes,
        totalCapacityMinutes,
        totalCompletedMinutes,
        totalTasks,
        totalRevisions,
        totalCoreProblems,
        restDaysCount,
        trajectory,
        days: [...currentWeekDays],
      });

      weekIndex++;
      currentWeekDays = [];
    }
  }

  return weeks;
}

/**
 * Builds the full month matrix (starting Monday, ending Sunday) for calendar grid rendering.
 */
export function buildMonthMatrix(
  year: number,
  month: number, // 1 - 12
  daysMap: Map<string, CalendarDayProjection>,
  selectedDate: string,
  todayDate: string
): CalendarDayProjection[] {
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const firstDayDateStr = `${monthKey}-01`;
  const firstDayOfWeek = getDayOfWeekFromDate(firstDayDateStr); // 0 = Sun, 1 = Mon...

  // Monday = 1. Calculate how many padding days before the 1st
  // If firstDay is Sun (0), padding is 6 days (Mon-Sat).
  // If firstDay is Mon (1), padding is 0 days.
  // If firstDay is Tue (2), padding is 1 day (Mon).
  const daysBefore = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Determine number of days in the month
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lastDayDateStr = `${monthKey}-${String(daysInMonth).padStart(2, "0")}`;
  const lastDayOfWeek = getDayOfWeekFromDate(lastDayDateStr);

  // If lastDay is Sun (0), padding is 0 days.
  // If lastDay is Mon (1), padding is 6 days.
  const daysAfter = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;

  const totalGridDays = daysBefore + daysInMonth + daysAfter;
  const startDateStr = addDays(firstDayDateStr, -daysBefore);

  const grid: CalendarDayProjection[] = [];

  for (let offset = 0; offset < totalGridDays; offset++) {
    const dateStr = addDays(startDateStr, offset);
    const { year: y, month: m, day: d } = parseDateParts(dateStr);
    const dayOfWeek = getDayOfWeekFromDate(dateStr);
    const isCurrentMonth = m + 1 === month && y === year;

    const existing = daysMap.get(dateStr);
    if (existing) {
      grid.push({
        ...existing,
        dayOfWeek,
        dayNumber: d,
        isCurrentMonth,
        isSelected: dateStr === selectedDate,
        isToday: dateStr === todayDate,
      });
    } else {
      grid.push({
        date: dateStr,
        dayOfWeek,
        dayNumber: d,
        isToday: dateStr === todayDate,
        isSelected: dateStr === selectedDate,
        isCurrentMonth,
        isPlanStart: false,
        isTargetDate: false,
        isRestDay: dayOfWeek === 0, // default Sunday rest if unspecified
        availableMinutes: dayOfWeek === 0 ? 0 : 180,
        plannedMinutes: 0,
        completedMinutes: 0,
        taskCount: 0,
        completedTaskCount: 0,
        revisionCount: 0,
        overdueRevisionCount: 0,
        carriedTaskCount: 0,
        attention: "none",
        subjects: [],
      });
    }
  }

  return grid;
}

/**
 * Detects curriculum subject (dsa, dbms, os, cn, oop) from task properties.
 */
export function detectTaskSubject(task: {
  task_type?: string;
  taskType?: string;
  problem_id?: string | null;
  problemId?: string | null;
  curriculum_item_id?: string | null;
  curriculumId?: string | null;
  title?: string | null;
}): import("../types").CalendarSubject | undefined {
  const title = (task.title || "").trim();
  const titleUpper = title.toUpperCase();

  // 1. Check title signals first for accurate CS fundamentals routing
  // DBMS routing
  if (
    titleUpper.startsWith("DBMS") ||
    titleUpper.includes("DATABASE") ||
    titleUpper.includes("SQL") ||
    titleUpper.includes("NORMALIZATION") ||
    titleUpper.includes("RELATIONAL MODEL") ||
    titleUpper.includes("TRANSACTIONS, ACID") ||
    titleUpper.includes("CONCURRENCY CONTROL") ||
    titleUpper.includes("B-TREE") ||
    titleUpper.includes("B+ TREE") ||
    titleUpper.includes("QUERY EXECUTION") ||
    titleUpper.includes("ER DIAGRAM") ||
    /\bDBMS\b/.test(titleUpper) ||
    /\bSQL\b/.test(titleUpper)
  ) {
    return "dbms";
  }

  // OS routing
  if (
    titleUpper.startsWith("OS ") ||
    titleUpper.startsWith("OS:") ||
    titleUpper.startsWith("OS ·") ||
    titleUpper.startsWith("OS -") ||
    titleUpper.includes("OPERATING SYSTEM") ||
    /\bOS\b/.test(titleUpper) ||
    titleUpper.includes("PROCESS MANAGEMENT") ||
    titleUpper.includes("CPU SCHEDULING") ||
    titleUpper.includes("PROCESS SYNCHRONIZATION") ||
    titleUpper.includes("DEADLOCK") ||
    titleUpper.includes("PAGE REPLACEMENT") ||
    titleUpper.includes("DISK SCHEDULING") ||
    titleUpper.includes("VIRTUAL MEMORY") ||
    titleUpper.includes("SEMAPHORE") ||
    titleUpper.includes("BANKER") ||
    titleUpper.includes("PHILOSOPHER")
  ) {
    return "os";
  }

  // CN routing
  if (
    titleUpper.startsWith("CN ") ||
    titleUpper.startsWith("CN:") ||
    titleUpper.startsWith("CN ·") ||
    titleUpper.startsWith("CN -") ||
    titleUpper.includes("COMPUTER NETWORK") ||
    /\bCN\b/.test(titleUpper) ||
    titleUpper.includes("TCP/IP") ||
    titleUpper.includes("TCP") ||
    titleUpper.includes("UDP") ||
    titleUpper.includes("OSI MODEL") ||
    titleUpper.includes("ROUTING ALGORITHM") ||
    titleUpper.includes("DATA LINK LAYER") ||
    titleUpper.includes("TRANSPORT LAYER") ||
    titleUpper.includes("APPLICATION LAYER") ||
    titleUpper.includes("SUBNET")
  ) {
    return "cn";
  }

  // OOP / OOPS routing
  if (
    titleUpper.startsWith("OOP ") ||
    titleUpper.startsWith("OOP:") ||
    titleUpper.startsWith("OOP ·") ||
    titleUpper.startsWith("OOP -") ||
    titleUpper.startsWith("OOPS ") ||
    titleUpper.startsWith("OOPS:") ||
    titleUpper.startsWith("OOPS ·") ||
    titleUpper.includes("OBJECT-ORIENTED") ||
    titleUpper.includes("OBJECT ORIENTED") ||
    /\bOOP\b/.test(titleUpper) ||
    /\bOOPS\b/.test(titleUpper) ||
    titleUpper.includes("JAVA AND OOP") ||
    titleUpper.includes("CONSTRUCTORS AND OBJECT") ||
    titleUpper.includes("ENCAPSULATION") ||
    titleUpper.includes("INHERITANCE") ||
    titleUpper.includes("POLYMORPHISM") ||
    titleUpper.includes("DYNAMIC METHOD DISPATCH") ||
    titleUpper.includes("SOLID PRINCIPLES") ||
    titleUpper.includes("DESIGN PATTERNS")
  ) {
    return "oop";
  }

  // Aptitude & Reasoning routing
  if (
    titleUpper.startsWith("APTITUDE") ||
    titleUpper.includes("QUANTITATIVE") ||
    titleUpper.includes("LOGICAL REASONING") ||
    titleUpper.includes("VERBAL ABILITY") ||
    titleUpper.includes("DATA INTERPRETATION") ||
    titleUpper.includes("TCS NQT") ||
    titleUpper.includes("PLACEMENT MOCK") ||
    titleUpper.includes("PERCENTAGE") ||
    titleUpper.includes("PROFIT AND LOSS") ||
    titleUpper.includes("TIME AND WORK") ||
    titleUpper.includes("SPEED DISTANCE") ||
    titleUpper.includes("SYLLOGISM") ||
    titleUpper.includes("BLOOD RELATION") ||
    /\bAPT\b/.test(titleUpper)
  ) {
    return "aptitude";
  }

  // 2. DSA / Problem intelligence routing
  const type = task.task_type || task.taskType;
  const prob = task.problem_id || task.problemId;
  const curr = task.curriculum_item_id || task.curriculumId;

  if (
    type === "dsa_problem" ||
    prob ||
    curr ||
    titleUpper.startsWith("DSA ") ||
    titleUpper.includes("LEETCODE") ||
    titleUpper.includes("DATA STRUCTURE") ||
    titleUpper.includes("ALGORITHM") ||
    titleUpper.includes("DYNAMIC PROGRAMMING") ||
    titleUpper.includes("BINARY SEARCH") ||
    titleUpper.includes("LINKED LIST") ||
    titleUpper.includes("TWO SUM") ||
    titleUpper.includes("BINARY TREE")
  ) {
    return "dsa";
  }

  if (type === "revision") {
    return "dsa";
  }

  return undefined;
}

