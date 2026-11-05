import { addDays } from "date-fns";
import type { AttemptInput, AttemptEffects, UserProblemStatus } from "./types";

/**
 * Standard Spaced Repetition base sequence for PRIME DSA Practice:
 * 1 day -> 3 days -> 7 days -> 14 days -> 30 days
 */
export const INTERVAL_SEQUENCE = [1, 3, 7, 14, 30] as const;

/**
 * Pure domain function to derive the consequences of a problem practice attempt.
 *
 * Rules:
 * - Unsolved: status becomes "attempted", near-term 1-day revision required.
 * - Solution Viewed: status becomes "needs_revision", near-term 1-day revision required.
 * - Solved with Hint: status becomes "solved", 3-day revision required.
 * - Solved Independently: status becomes "solved" (preserves "mastered" if already earned),
 *   scheduled for normal retention review (7 days, or advances interval sequence on high confidence).
 *   Never grants "mastered" on a single independent solve.
 */
export function deriveAttemptEffects(
  input: AttemptInput,
  currentDate: Date = new Date()
): AttemptEffects {
  const { outcome, confidence, currentStatus = "not_started", currentIntervalDays = 0 } = input;

  let nextStatus: UserProblemStatus;
  let nextIntervalDays: number;
  let masteryScoreEstimate: number;

  switch (outcome) {
    case "unsolved":
      // If already solved/mastered, failed attempt requires revision
      nextStatus =
        currentStatus === "solved" || currentStatus === "mastered"
          ? "needs_revision"
          : "attempted";
      nextIntervalDays = 1;
      masteryScoreEstimate = 0.1;
      break;

    case "solution_viewed":
      nextStatus = "needs_revision";
      nextIntervalDays = 1;
      masteryScoreEstimate = 0.25;
      break;

    case "hint":
      // Solved with assistance
      nextStatus = currentStatus === "mastered" ? "mastered" : "solved";
      nextIntervalDays = 3;
      masteryScoreEstimate = 0.5;
      break;

    case "independent":
      // Independent solve: preserve mastered if already earned, else solved.
      nextStatus = currentStatus === "mastered" ? "mastered" : "solved";

      if (confidence <= 2) {
        // Low confidence independent solve: schedule near-term review
        nextIntervalDays = 3;
        masteryScoreEstimate = 0.65;
      } else if (confidence === 3) {
        nextIntervalDays = 7;
        masteryScoreEstimate = 0.75;
      } else {
        // High confidence (4 or 5): advance along interval sequence
        const currentIndex = INTERVAL_SEQUENCE.findIndex((days) => days >= currentIntervalDays);
        if (currentIndex === -1 || currentIndex >= INTERVAL_SEQUENCE.length - 1) {
          nextIntervalDays = 30;
        } else {
          nextIntervalDays = INTERVAL_SEQUENCE[currentIndex + 1];
        }
        masteryScoreEstimate = confidence === 5 ? 0.9 : 0.85;
      }
      break;

    default:
      nextStatus = "attempted";
      nextIntervalDays = 1;
      masteryScoreEstimate = 0.1;
  }

  const nextRevisionDate = addDays(currentDate, nextIntervalDays);

  return {
    nextStatus,
    requiresRevision: true,
    nextIntervalDays,
    nextRevisionDate,
    masteryScoreEstimate,
  };
}

export * from "./types";

