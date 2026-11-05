import { addDays, daysBetween, getDailyCapacity, getDayOfWeekFromDate } from "./capacity";
import {
  DEFAULT_PLANNER_CONFIG,
  type PreparationTarget,
  type TaskPriority,
} from "./types";

export type Work = {
  title: string;
  minutes: number;
  priority: TaskPriority;
  type: "custom" | "revision" | "dsa_problem";
  source: "user_created" | "planner_generated" | "revision_generated";
  problemId?: string;
  problemSlug?: string;
  curriculumId?: string;
  revisionId?: string;
  intentId?: string;
  requestIntent?: true;
  due?: string;
};
export type ScheduledWork = {
  id: string;
  date: string;
  title: string;
  minutes: number;
  priority: TaskPriority;
  locked: boolean;
  status: string;
  source: string;
  type: string;
  problemId: string | null;
  revisionId: string | null;
  reason?: string | null;
  originalDate?: string | null;
  carryCount?: number;
};
export type Placement = (
  Work | { moveId: string; title: string; minutes: number; from: string }
) & {
  date: string;
  reason: string;
  locked?: boolean;
};
export type CapacityDay = {
  date: string;
  available: number;
  budget: number;
  planned: number;
  rest: boolean;
};
export type ControlPreview = {
  days: CapacityDay[];
  placements: Placement[];
  warnings: string[];
  unplaced: string[];
};
const inactive = new Set(["cancelled", "skipped", "rescheduled", "carried_forward"]);
export const countsTowardsPlan = (status: string) => !inactive.has(status);
const priorityRank: Record<TaskPriority, number> = { P0: 0, P1: 1, P2: 2, OPTIONAL: 3 };
export function weekStart(date: string) {
  return addDays(date, -((getDayOfWeekFromDate(date) + 6) % 7));
}

export function capacityDays(
  today: string,
  target: PreparationTarget,
  tasks: ScheduledWork[],
  utilizationTarget = DEFAULT_PLANNER_CONFIG.utilizationTarget,
  horizonDays?: number
) {
  const totals = new Map<string, number>();
  for (const task of tasks)
    if (countsTowardsPlan(task.status)) {
      totals.set(task.date, (totals.get(task.date) ?? 0) + task.minutes);
    }
  const span = target.targetDate ? daysBetween(today, target.targetDate) : 90;
  const count = Math.max(90, span, horizonDays ?? 90);
  return Array.from({ length: count }, (_, index): CapacityDay => {
    const date = addDays(today, index);
    const capacity = getDailyCapacity(date, target, { utilizationTarget });
    return {
      date,
      available: capacity.availableMinutes,
      budget: capacity.planningBudgetMinutes,
      planned: totals.get(date) ?? 0,
      rest: capacity.isRestDay,
    };
  });
}

export function planControl(input: {
  today: string;
  target: PreparationTarget;
  tasks: ScheduledWork[];
  work: Work[];
  end: string;
  start?: string;
  fixedDate?: string;
  sequential?: boolean;
  locked?: boolean;
  allowOverload?: boolean;
  rebalance?: boolean;
  rebalanceScope?: (date: string) => boolean;
  move?: ScheduledWork;
  reserves?: Work[];
  utilizationTarget?: number;
}): ControlPreview {
  const { today, target, tasks } = input;
  const requiredSpan = Math.max(
    target.targetDate ? daysBetween(today, target.targetDate) : 90,
    input.end ? daysBetween(today, input.end) : 90
  );
  const days = capacityDays(today, target, tasks, input.utilizationTarget, requiredSpan);
  const byDate = new Map(days.map((day) => [day.date, day]));
  const eligible = days.filter(
    (day) =>
      day.date >= (input.start ?? today) &&
      day.date <= input.end &&
      day.date <= target.targetDate
  );
  const placements: Placement[] = [];
  const warnings: string[] = [];
  const unplaced: string[] = [];
  const reservations = new Map<string, number>();
  const dsaPerDay = new Map<string, number>();
  for (const task of tasks)
    if (task.type === "dsa_problem" && countsTowardsPlan(task.status)) {
      dsaPerDay.set(task.date, (dsaPerDay.get(task.date) ?? 0) + 1);
    }
  for (const reserve of input.reserves ?? []) {
    const earliest = reserve.due && reserve.due > today ? reserve.due : today;
    const day = days.find(
      (candidate) =>
        candidate.date >= earliest &&
        candidate.date <= target.targetDate &&
        !candidate.rest &&
        candidate.planned + (reservations.get(candidate.date) ?? 0) + reserve.minutes <=
          candidate.budget
    );
    if (day)
      reservations.set(day.date, (reservations.get(day.date) ?? 0) + reserve.minutes);
  }

  function hasRoom(day: CapacityDay, minutes: number, type: string) {
    return (
      !day.rest &&
      day.planned +
        minutes +
        (type === "revision" ? 0 : (reservations.get(day.date) ?? 0)) <=
        day.budget &&
      (type !== "dsa_problem" ||
        (dsaPerDay.get(day.date) ?? 0) < DEFAULT_PLANNER_CONFIG.maxNewDsaProblemsPerDay)
    );
  }
  function move(task: ScheduledWork, destination: CapacityDay, reason: string) {
    const previous = byDate.get(task.date);
    if (previous) previous.planned -= task.minutes;
    destination.planned += task.minutes;
    if (task.type === "dsa_problem") {
      dsaPerDay.set(task.date, Math.max(0, (dsaPerDay.get(task.date) ?? 1) - 1));
      dsaPerDay.set(destination.date, (dsaPerDay.get(destination.date) ?? 0) + 1);
    }
    placements.push({
      moveId: task.id,
      date: destination.date,
      from: task.date,
      title: task.title,
      minutes: task.minutes,
      reason,
    });
  }

  if (input.move && input.fixedDate) {
    const task = input.move;
    const day = eligible.find((candidate) => candidate.date === input.fixedDate);
    if (task.locked || task.status !== "pending")
      warnings.push("Unlock the pending commitment before changing its date.");
    else if (!day || day.date === task.date)
      warnings.push("Choose another day within your preparation target.");
    else if (!hasRoom(day, task.minutes, task.type) && !input.allowOverload)
      warnings.push(
        "This move exceeds the day’s planning budget. Adjust the date or allow the override."
      );
    else move(task, day, "USER_SELECTED_DATE");
  }

  let nextSessionDate = input.start ?? today;
  let sequenceExhausted = false;

  function place(work: Work) {
    const earliest = work.due && work.due > today ? work.due : today;
    const day = eligible.find((day) => {
      if (input.fixedDate)
        return (
          day.date === input.fixedDate &&
          (input.allowOverload || hasRoom(day, work.minutes, work.type))
        );
      return (
        day.date >= earliest &&
        (!input.sequential || (!sequenceExhausted && day.date >= nextSessionDate)) &&
        hasRoom(day, work.minutes, work.type)
      );
    });
    if (!day) {
      unplaced.push(work.title);
      if (input.sequential) sequenceExhausted = true;
      return;
    }
    if (input.sequential) nextSessionDate = addDays(day.date, 1);
    day.planned += work.minutes;
    if (work.type === "dsa_problem")
      dsaPerDay.set(day.date, (dsaPerDay.get(day.date) ?? 0) + 1);
    placements.push({
      ...work,
      date: day.date,
      locked: input.locked,
      reason: input.fixedDate
        ? "USER_SELECTED_DATE"
        : work.type === "revision"
          ? "REVISION_DUE"
          : work.curriculumId
            ? "CORE_NEXT_ELIGIBLE"
            : "AVAILABLE_CAPACITY",
    });
    if (work.due && day.date > earliest)
      warnings.push(`“${work.title}” moves past its due date to ${day.date}.`);
  }

  input.work.filter((work) => work.type === "revision").forEach(place);
  if (input.rebalance) {
    const ordered = tasks
      .filter(
        (task) =>
          task.status === "pending" &&
          !task.locked &&
          (!input.rebalanceScope || input.rebalanceScope(task.date))
      )
      .sort((a, b) => {
        const missedA = a.date < today;
        const missedB = b.date < today;
        if (missedA !== missedB) return missedA ? -1 : 1;
        const rankA = a.type === "revision" ? -1 : priorityRank[a.priority];
        const rankB = b.type === "revision" ? -1 : priorityRank[b.priority];
        return a.date.localeCompare(b.date) || (missedA ? rankA - rankB : rankB - rankA);
      });
    for (const task of ordered) {
      const missed = task.date < today;
      const previous = byDate.get(task.date);
      if (
        !missed &&
        task.date <= target.targetDate &&
        (!previous || previous.planned <= previous.budget)
      )
        continue;
      const date = eligible.find(
        (day) =>
          day.date !== task.date &&
          day.date >= (missed || task.date > target.targetDate ? today : task.date) &&
          hasRoom(day, task.minutes, task.type)
      );
      if (date) move(task, date, missed ? "CARRY_FORWARD" : "CAPACITY_REBALANCE");
      else unplaced.push(task.title);
    }
  }

  input.work.filter((work) => work.type !== "revision").forEach(place);

  for (const day of days) {
    if (day.planned > day.available)
      warnings.push(
        `${day.date} exceeds availability by ${day.planned - day.available} min.`
      );
    else if (day.planned > day.budget)
      warnings.push(`${day.date} uses ${day.planned - day.budget} min of its buffer.`);
  }
  for (const task of tasks)
    if (
      task.locked &&
      task.status === "pending" &&
      (task.date < today || task.date > target.targetDate || byDate.get(task.date)?.rest)
    ) {
      warnings.push(
        `Locked commitment “${task.title}” needs your attention on ${task.date}.`
      );
    }
  if (unplaced.length)
    warnings.push(
      `${unplaced.length} items could not fit in this window. Existing commitments keep their dates.`
    );
  return { days, placements, warnings, unplaced };
}
