/**
 * PRIME Overall Mastery Aggregator
 *
 * Synthesizes overall DSA mastery across all PRIME Core stages and problems.
 */

import type {
  OverallMasteryResult,
  StageMasteryResult,
  ProblemMasteryResult,
  MasteryLevel,
} from "./types";
import { MASTERY_POLICY_V1 } from "./policy";

export function calculateOverallMastery(
  stages: StageMasteryResult[],
  problemMasteries: ProblemMasteryResult[],
  now: Date = new Date()
): OverallMasteryResult {
  const totalCoreProblems = problemMasteries.length;
  let masteredCount = 0;
  let proficientCount = 0;
  let practicedCount = 0;
  let learningCount = 0;
  let exposedCount = 0;
  let unseenCount = 0;

  for (const p of problemMasteries) {
    switch (p.level) {
      case "mastered":
        masteredCount++;
        break;
      case "proficient":
        proficientCount++;
        break;
      case "practiced":
        practicedCount++;
        break;
      case "learning":
        learningCount++;
        break;
      case "exposed":
        exposedCount++;
        break;
      case "unseen":
      default:
        unseenCount++;
        break;
    }
  }

  // Weight overall score by stage problem count
  let totalScoreWeight = 0;
  let scoreSum = 0;
  for (const stage of stages) {
    const stageWeight = Math.max(1, stage.totalRequired);
    scoreSum += stage.score * stageWeight;
    totalScoreWeight += stageWeight;
  }

  const finalScore =
    totalScoreWeight > 0 ? Math.round((scoreSum / totalScoreWeight) * 10) / 10 : 0;

  let level: MasteryLevel = "unseen";
  const attemptedCount =
    masteredCount + proficientCount + practicedCount + learningCount + exposedCount;

  if (totalCoreProblems === 0 || attemptedCount === 0) {
    level = "unseen";
  } else if (finalScore >= 85 && masteredCount >= Math.ceil(totalCoreProblems * 0.6)) {
    level = "mastered";
  } else if (finalScore >= 70 && (masteredCount + proficientCount) >= Math.ceil(totalCoreProblems * 0.4)) {
    level = "proficient";
  } else if (finalScore >= 50 && (masteredCount + proficientCount + practicedCount) >= Math.ceil(totalCoreProblems * 0.25)) {
    level = "practiced";
  } else if (finalScore >= 25 || learningCount + practicedCount + proficientCount + masteredCount > 0) {
    level = "learning";
  } else {
    level = "exposed";
  }

  return {
    level,
    score: finalScore,
    totalCoreProblems,
    masteredCount,
    proficientCount,
    practicedCount,
    learningCount,
    exposedCount,
    unseenCount,
    stages,
    lastCalculatedAt: now,
    policyVersion: MASTERY_POLICY_V1.version,
  };
}

