import type { TopicMasteryState, MasteryLevel } from "./types";

/**
 * Pure Mastery Level Classifier
 */
export function classifyMasteryLevel(state: TopicMasteryState): MasteryLevel {
  if (state.solvedProblems === 0) return "unseen";

  const solveRatio = state.solvedProblems / Math.max(state.totalProblems, 1);

  if (solveRatio >= 0.9 && state.accuracyRate >= 0.85) {
    return "mastered";
  }
  if (solveRatio >= 0.7 && state.accuracyRate >= 0.75) {
    return "proficient";
  }
  if (solveRatio >= 0.4 && state.accuracyRate >= 0.6) {
    return "competent";
  }
  return "learning";
}

export * from "./types";
