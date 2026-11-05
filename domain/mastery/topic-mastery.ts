/**
 * PRIME Topic Mastery Aggregator
 *
 * Evaluates mastery at the topic level based primarily on PRIME Core curriculum
 * requirements. Untouched optional catalog questions do not penalize coverage.
 */

import type {
  TopicMasteryResult,
  ProblemMasteryResult,
  MasteryLevel,
  TopicEvidenceCoverage,
} from "./types";
import type { CurriculumItem } from "@/domain/curriculum/types";

export interface TopicAggregationInput {
  topicId: string;
  topicSlug: string;
  topicName: string;
  coreItems: CurriculumItem[];
  problemMasteryMap: Map<string, ProblemMasteryResult>;
  optionalProblemMasteries?: ProblemMasteryResult[];
}

export function calculateTopicMastery(
  input: TopicAggregationInput
): TopicMasteryResult {
  const {
    topicId,
    topicSlug,
    topicName,
    coreItems,
    problemMasteryMap,
    optionalProblemMasteries = [],
  } = input;

  const totalRequired = coreItems.length;

  // Track distribution of mastery levels across Core problems
  const levelDistribution: Record<MasteryLevel, number> = {
    unseen: 0,
    exposed: 0,
    learning: 0,
    practiced: 0,
    proficient: 0,
    mastered: 0,
  };

  const coreMasteries: ProblemMasteryResult[] = [];
  let weightedScoreSum = 0;
  let totalWeight = 0;
  let practicedCount = 0;
  let masteredCount = 0;
  let proficientCount = 0;

  for (const item of coreItems) {
    const res = problemMasteryMap.get(item.problemId) ?? {
      problemId: item.problemId,
      level: "unseen" as MasteryLevel,
      score: 0,
      evidence: {
        independence: 0,
        retention: 0,
        repetition: 0,
        timing: null,
        hintIndependence: 0,
        confidenceCalibration: null,
        recency: 0,
      },
      requirements: {
        independentEvidenceCount: 0,
        successfulRevisionCount: 0,
        longestSuccessfulIntervalDays: 0,
        totalAttemptCount: 0,
        hasRecentForgot: false,
      },
      freshness: "stale" as const,
      lastEvidenceAt: null,
      blockers: [],
      strengths: [],
      nextEvidence: "Solve this problem in the workspace.",
      policyVersion: 1,
    };

    coreMasteries.push(res);
    levelDistribution[res.level]++;

    if (res.level === "mastered") {
      masteredCount++;
      practicedCount++;
    } else if (res.level === "proficient") {
      proficientCount++;
      practicedCount++;
    } else if (res.level === "practiced") {
      practicedCount++;
    } else if (res.level === "learning" || res.level === "exposed") {
      // attempted/active
    }

    // Pedagogical weighting
    let itemWeight = 1.0;
    if (item.isCheckpoint) itemWeight *= 1.5;
    else if (item.priority === "P0") itemWeight *= 1.25;
    else if (item.priority === "P2") itemWeight *= 0.8;

    if (item.difficulty === "HARD") itemWeight *= 1.2;
    else if (item.difficulty === "MEDIUM") itemWeight *= 1.1;

    weightedScoreSum += res.score * itemWeight;
    totalWeight += itemWeight;
  }

  // Bonus evidence from optional problems if practiced (does not penalize if untouched)
  let optionalBonusScore = 0;
  let optionalBonusCount = 0;
  for (const opt of optionalProblemMasteries) {
    if (opt.level === "mastered" || opt.level === "proficient") {
      optionalBonusScore += opt.score * 0.1;
      optionalBonusCount++;
    }
  }

  const baseScore = totalWeight > 0 ? weightedScoreSum / totalWeight : 0;
  const finalScore = Math.min(100, Math.round((baseScore + Math.min(5, optionalBonusScore)) * 10) / 10);

  const coveragePercentage =
    totalRequired > 0 ? Math.round((practicedCount / totalRequired) * 100) : 0;

  const evidenceCoverage: TopicEvidenceCoverage = {
    practicedCount,
    totalCount: totalRequired,
    percentage: coveragePercentage,
  };

  // Derive Topic Mastery Level
  let level: MasteryLevel = "unseen";
  const attemptedCount =
    levelDistribution.exposed +
    levelDistribution.learning +
    levelDistribution.practiced +
    levelDistribution.proficient +
    levelDistribution.mastered;

  if (totalRequired === 0) {
    level = "unseen";
  } else if (attemptedCount === 0) {
    level = "unseen";
  } else if (finalScore >= 85 && coveragePercentage >= 70 && masteredCount >= Math.min(2, totalRequired)) {
    level = "mastered";
  } else if (finalScore >= 70 && coveragePercentage >= 50 && (masteredCount + proficientCount >= 1)) {
    level = "proficient";
  } else if (finalScore >= 50 && coveragePercentage >= 30) {
    level = "practiced";
  } else if (finalScore >= 25 || levelDistribution.learning > 0 || practicedCount > 0) {
    level = "learning";
  } else {
    level = "exposed";
  }

  // Topic Strengths & Blockers
  const strengths: string[] = [];
  const blockers: string[] = [];

  if (masteredCount >= 2) {
    strengths.push(`${masteredCount} Core problems demonstrated full independent mastery.`);
  }
  if (coveragePercentage >= 80) {
    strengths.push(`Comprehensive pattern coverage across ${practicedCount}/${totalRequired} Core problems.`);
  } else if (coveragePercentage >= 50) {
    strengths.push(`Broad pattern familiarity across ${practicedCount}/${totalRequired} Core problems.`);
  }
  if (optionalBonusCount > 0) {
    strengths.push(`Reinforced with evidence from ${optionalBonusCount} additional catalog problems.`);
  }

  if (coveragePercentage < 50) {
    blockers.push(`Coverage gap: only ${practicedCount} of ${totalRequired} Core problems practiced.`);
  }
  const forgotCount = coreMasteries.filter((m) => m.requirements.hasRecentForgot).length;
  if (forgotCount > 0) {
    blockers.push(`${forgotCount} problem(s) experienced recent retention regression ('Forgot').`);
  }
  const hintHeavyCount = coreMasteries.filter((m) =>
    m.blockers.some((b) => b.code === "HIGH_HINT_DEPENDENCY")
  ).length;
  if (hintHeavyCount > 0) {
    blockers.push(`${hintHeavyCount} problem(s) require hints to complete.`);
  }

  return {
    topicId,
    topicSlug,
    topicName,
    level,
    score: finalScore,
    requiredProblems: totalRequired,
    practicedProblems: practicedCount,
    masteredProblems: masteredCount,
    proficientProblems: proficientCount,
    evidenceCoverage,
    levelDistribution,
    strengths,
    blockers,
    problemMasteries: coreMasteries,
  };
}

