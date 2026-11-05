/**
 * PRIME Weakness Intelligence Engine — Policy Configuration & Defaults
 *
 * Deterministic policy weights, thresholds, and evidence normalization formulas.
 */

import type {
  EvidenceConfidence,
  WeaknessDimensions,
} from "./types";

export const WEAKNESS_POLICY_VERSION = "1.0.0";

export interface WeaknessPolicyConfig {
  version: string;
  weights: {
    failure: number;
    hints: number;
    timing: number;
    retention: number;
  };
  thresholds: {
    needsAttentionScore: number; // e.g. 45
    persistentFailureCount: number; // e.g. 3
    highHintRate: number; // e.g. 0.5
    timeInefficiencyRatio: number; // e.g. 1.3 (30% slower than target)
    retentionFailureRate: number; // e.g. 0.35
    recencyWindowDays: number; // e.g. 60
  };
}

export const DEFAULT_WEAKNESS_POLICY: WeaknessPolicyConfig = {
  version: WEAKNESS_POLICY_VERSION,
  weights: {
    failure: 0.35,
    hints: 0.25,
    timing: 0.20,
    retention: 0.20,
  },
  thresholds: {
    needsAttentionScore: 45,
    persistentFailureCount: 3,
    highHintRate: 0.5,
    timeInefficiencyRatio: 1.3,
    retentionFailureRate: 0.35,
    recencyWindowDays: 60,
  },
};

/**
 * Deterministically combines known dimensions by renormalizing active weights.
 * If all dimensions are null, returns null.
 */
export function calculateNormalizedWeaknessScore(
  dimensions: WeaknessDimensions,
  policy: WeaknessPolicyConfig = DEFAULT_WEAKNESS_POLICY
): number | null {
  const { failure, hints, timing, retention } = dimensions;

  let activeWeightSum = 0;
  let weightedSignalSum = 0;

  if (failure !== null) {
    activeWeightSum += policy.weights.failure;
    weightedSignalSum += failure * policy.weights.failure;
  }
  if (hints !== null) {
    activeWeightSum += policy.weights.hints;
    weightedSignalSum += hints * policy.weights.hints;
  }
  if (timing !== null) {
    activeWeightSum += policy.weights.timing;
    weightedSignalSum += timing * policy.weights.timing;
  }
  if (retention !== null) {
    activeWeightSum += policy.weights.retention;
    weightedSignalSum += retention * policy.weights.retention;
  }

  if (activeWeightSum <= 0) {
    return null;
  }

  // Renormalize so weights sum to 1.0, then scale to 0-100
  const normalizedFraction = weightedSignalSum / activeWeightSum;
  return Math.round(Math.max(0, Math.min(100, normalizedFraction * 100)));
}

/**
 * Computes diagnostic confidence based on evidence breadth, depth, and diversity.
 */
export function evaluateEvidenceConfidence(params: {
  totalAttempts: number;
  distinctProblems: number;
  totalRevisions: number;
  hasIndependentSolve: boolean;
  isStale?: boolean;
}): EvidenceConfidence {
  const { totalAttempts, distinctProblems, totalRevisions, isStale } = params;

  if (totalAttempts === 0 && totalRevisions === 0) {
    return "insufficient";
  }

  // 1-2 attempts on 1 problem provides low confidence at best
  if (distinctProblems <= 1) {
    if (totalAttempts <= 1 && totalRevisions === 0) {
      return "insufficient";
    }
    return "low";
  }

  // Multi-problem with moderate attempts
  if (distinctProblems >= 3 && totalAttempts >= 5 && totalRevisions >= 1 && !isStale) {
    return "high";
  }

  if (distinctProblems >= 2 && totalAttempts >= 3) {
    return isStale ? "low" : "moderate";
  }

  return "low";
}

