import type { RevisionItem, ReviewGrade } from "./types";
import { addDays, format } from "date-fns";

/**
 * Pure Spaced Repetition (SM-2 Foundation) Calculation
 * Calculates the next interval, ease factor, and due date.
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

  // Ease factor adjustment: EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  const newEaseFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  );

  let newRepetitionCount: number;
  let newIntervalDays: number;

  if (grade < 3) {
    // Failed recall: reset repetitions to 0, review again tomorrow
    newRepetitionCount = 0;
    newIntervalDays = 1;
  } else {
    // Successful recall
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
