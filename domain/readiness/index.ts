import type { InterviewReadinessFactors } from "./types";

/**
 * Pure Interview Readiness Score Calculator
 * Produces an aggregate score [0 - 100] based on weighted preparation pillars.
 */
export function calculateReadinessScore(factors: InterviewReadinessFactors): number {
  // Weights:
  // Roadmap completion: 40%
  // Accuracy: 35%
  // Consistency: 15% (capped at 30 days)
  // Revision backlog penalty: up to -10%

  const roadmapScore = factors.roadmapCompletionRate * 40;
  const accuracyScore = factors.overallAccuracyRate * 35;
  const consistencyScore = (Math.min(factors.consistencyStreakDays, 30) / 30) * 15;
  const backlogPenalty = Math.min(factors.revisionBacklogCount * 1.5, 10);

  const rawScore = roadmapScore + accuracyScore + consistencyScore - backlogPenalty;
  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

export * from "./types";
