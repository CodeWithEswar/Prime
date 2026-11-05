import type {
  RevisionItem,
  ReviewGrade,
  RevisionRating,
  RevisionEvaluationInput,
  RevisionEvaluationResult,
  RevisionQueueCategory,
} from "./types";
import { addDays, format, isBefore, isSameDay, startOfDay } from "date-fns";

export const REVISION_INTERVAL_SEQUENCE = [1, 3, 7, 14, 30] as const;

/**
 * Deterministic Spaced Repetition interval ladder for PRIME:
 * forgot -> 1 day
 * hard   -> repeat current interval (at least 1 day)
 * okay   -> advance 1 milestone: 1 -> 3 -> 7 -> 14 -> 30
 * easy   -> advance 2 milestones: 1 -> 7, 3 -> 14, 7 -> 30, 14 -> 30, 30 -> 30
 */
export function calculateNextRevisionInterval(
  currentIntervalDays: number,
  rating: RevisionRating
): number {
  if (rating === "forgot") {
    return 1;
  }
  if (rating === "hard") {
    return Math.max(1, currentIntervalDays);
  }
  if (rating === "okay") {
    if (currentIntervalDays < 1) return 1;
    if (currentIntervalDays < 3) return 3;
    if (currentIntervalDays < 7) return 7;
    if (currentIntervalDays < 14) return 14;
    return 30;
  }
  if (rating === "easy") {
    if (currentIntervalDays < 1) return 3;
    if (currentIntervalDays < 3) return 7;
    if (currentIntervalDays < 7) return 14;
    return 30;
  }
  return 1;
}

/**
 * Returns human-readable stage badge text, e.g. "Stage 1-day", "Stage 3-day".
 */
export function getStageLabel(intervalDays: number): string {
  if (intervalDays <= 1) return "Stage 1-day";
  if (intervalDays <= 3) return "Stage 3-day";
  if (intervalDays <= 7) return "Stage 7-day";
  if (intervalDays <= 14) return "Stage 14-day";
  return "Stage 30-day";
}

/**
 * Full domain evaluation of a problem revision attempt.
 */
export function evaluateRevisionAttempt(
  input: RevisionEvaluationInput
): RevisionEvaluationResult {
  const { currentIntervalDays, rating, currentDate = new Date() } = input;
  const nextIntervalDays = calculateNextRevisionInterval(currentIntervalDays, rating);
  const nextReviewDate = addDays(currentDate, nextIntervalDays);
  const stageLabel = getStageLabel(nextIntervalDays);

  return {
    previousIntervalDays: currentIntervalDays,
    nextIntervalDays,
    nextReviewDate,
    stageLabel,
  };
}

/**
 * Categorizes a revision item into "overdue", "due_today", or "upcoming".
 */
export function categorizeRevisionItem(
  reviewDate: Date | string,
  now: Date = new Date()
): RevisionQueueCategory {
  const target = typeof reviewDate === "string" ? new Date(reviewDate) : reviewDate;
  const targetDay = startOfDay(target);
  const today = startOfDay(now);

  if (isSameDay(targetDay, today)) {
    return "due_today";
  }
  if (isBefore(targetDay, today)) {
    return "overdue";
  }
  return "upcoming";
}

/**
 * Formats due timing label relative to today:
 * e.g. "Due Yesterday", "1 day ago", "Due Today", "Tomorrow", "Nov 04".
 */
export function formatDueTiming(
  reviewDate: Date | string,
  now: Date = new Date()
): { label: string; isOverdue: boolean } {
  const target = typeof reviewDate === "string" ? new Date(reviewDate) : reviewDate;
  const targetDay = startOfDay(target);
  const today = startOfDay(now);
  const diffTime = today.getTime() - targetDay.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { label: "Due Today", isOverdue: false };
  }
  if (diffDays === 1) {
    return { label: "Due Yesterday", isOverdue: true };
  }
  if (diffDays > 1) {
    return { label: `${diffDays} days ago`, isOverdue: true };
  }
  if (diffDays === -1) {
    return { label: "Tomorrow", isOverdue: false };
  }
  return { label: format(target, "MMM dd"), isOverdue: false };
}

/**
 * Pure Spaced Repetition (SM-2 Foundation) Calculation
 * Preserved for backwards compatibility with earlier domain tests.
 */
export function calculateNextRevision(
  item: RevisionItem,
  grade: ReviewGrade,
  currentDate = new Date()
): {
  intervalDays: number;
  easeFactor: number;
  repetitionCount: number;
  nextDueDate: string;
} {
  const { intervalDays, easeFactor, repetitionCount } = item;

  const newEaseFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  );

  let newRepetitionCount: number;
  let newIntervalDays: number;

  if (grade < 3) {
    newRepetitionCount = 0;
    newIntervalDays = 1;
  } else {
    if (repetitionCount === 0) {
      newIntervalDays = 1;
    } else if (repetitionCount === 1) {
      newIntervalDays = 6;
    } else {
      newIntervalDays = Math.round(intervalDays * newEaseFactor);
    }
    newRepetitionCount = repetitionCount + 1;
  }

  const nextDue = addDays(currentDate, newIntervalDays);
  const nextDueDate = format(nextDue, "yyyy-MM-dd");

  return {
    intervalDays: newIntervalDays,
    easeFactor: Math.round(newEaseFactor * 100) / 100,
    repetitionCount: newRepetitionCount,
    nextDueDate,
  };
}

export * from "./types";
