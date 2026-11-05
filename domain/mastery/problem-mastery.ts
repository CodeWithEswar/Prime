/**
 * PRIME Problem Mastery Calculator
 *
 * Pure TypeScript domain function computing deterministic, explainable
 * mastery for a single canonical problem. Zero side-effects, zero browser/DB dependencies.
 */

import type {
  ProblemEvidenceInput,
  ProblemMasteryResult,
  MasteryLevel,
  MasteryFreshness,
  MasteryEvidenceDimensions,
  MasteryRequirementsBreakdown,
  MasteryBlocker,
  MasteryStrength,
} from "./types";
import { MASTERY_POLICY_V1, type MasteryPolicy } from "./policy";

/**
 * Calculates interval depth multiplier based on revision interval.
 */
function getIntervalMultiplier(intervalDays: number, policy: MasteryPolicy): number {
  if (intervalDays <= 1) return policy.intervalDepthMultipliers[1] ?? 0.25;
  if (intervalDays <= 3) return policy.intervalDepthMultipliers[3] ?? 0.45;
  if (intervalDays <= 7) return policy.intervalDepthMultipliers[7] ?? 0.70;
  if (intervalDays <= 14) return policy.intervalDepthMultipliers[14] ?? 0.90;
  return policy.intervalDepthMultipliers[30] ?? 1.0;
}

/**
 * Computes decay weight based on age in days.
 */
function computeRecencyWeight(ageDays: number, policy: MasteryPolicy): number {
  const halfLife = policy.recencyDecayHalfLifeDays;
  const rawWeight = Math.pow(0.5, ageDays / halfLife);
  return Math.max(policy.minDecayWeight, rawWeight);
}

export function calculateProblemMastery(
  input: ProblemEvidenceInput,
  policy: MasteryPolicy = MASTERY_POLICY_V1,
  now: Date = new Date()
): ProblemMasteryResult {
  const { problemId, difficulty, targetTimeMinutes, attempts, revisions } = input;
  const nowMs = now.getTime();

  // 1. Sort attempts & revisions chronologically
  const sortedAttempts = [...attempts].sort(
    (a, b) => new Date(a.attemptedAt).getTime() - new Date(b.attemptedAt).getTime() || (a.id ?? "").localeCompare(b.id ?? "")
  );
  const sortedRevisions = [...revisions].sort(
    (a, b) => new Date(a.reviewedAt).getTime() - new Date(b.reviewedAt).getTime() || (a.id ?? "").localeCompare(b.id ?? "")
  );

  const totalAttemptCount = sortedAttempts.length;
  const totalRevisionCount = sortedRevisions.length;

  // Track timestamps for freshness
  let latestEvidenceMs = 0;
  for (const a of sortedAttempts) {
    const t = new Date(a.attemptedAt).getTime();
    if (t > latestEvidenceMs) latestEvidenceMs = t;
  }
  for (const r of sortedRevisions) {
    const t = new Date(r.reviewedAt).getTime();
    if (t > latestEvidenceMs) latestEvidenceMs = t;
  }

  // 2. Requirements & Raw Counts
  const independentAttempts = sortedAttempts.filter((a) => a.outcome === "independent");
  const hintAttempts = sortedAttempts.filter((a) => a.outcome === "hint");
  const successfulRevisions = sortedRevisions.filter(
    (r) => r.rating === "okay" || r.rating === "easy"
  );
  const longestSuccessfulIntervalDays = successfulRevisions.reduce(
    (max, r) => Math.max(max, r.previousIntervalDays),
    0
  );

  const lastRecall = sortedRevisions.findLast((review) => review.rating !== "hard");
  const hasRecentForgot = lastRecall?.rating === "forgot";

  const requirements: MasteryRequirementsBreakdown = {
    independentEvidenceCount: independentAttempts.length,
    successfulRevisionCount: successfulRevisions.length,
    longestSuccessfulIntervalDays,
    totalAttemptCount,
    hasRecentForgot,
  };

  // 3. Dimensional Evidence Calculations

  // A. Independence Dimension (30% weight)
  let independenceScore = 0;
  if (sortedAttempts.length > 0) {
    let weightedOutcomeSum = 0;
    let weightSum = 0;

    for (const a of sortedAttempts) {
      const aTime = new Date(a.attemptedAt).getTime();
      const ageDays = Math.max(0, (nowMs - aTime) / (1000 * 60 * 60 * 24));
      const decayWeight = computeRecencyWeight(ageDays, policy);

      let outcomeValue = policy.attemptOutcomeScores[a.outcome] ?? 0;
      if (a.outcome === "independent" && difficulty) {
        outcomeValue *= policy.difficultyBonus[difficulty] ?? 1.0;
      }

      weightedOutcomeSum += outcomeValue * decayWeight;
      weightSum += decayWeight;
    }

    independenceScore = Math.min(100, Math.round((weightedOutcomeSum / Math.max(weightSum, 1)) * 100));
  }

  // B. Retention Dimension (25% weight)
  let retentionScore = 0;
  if (sortedRevisions.length > 0) {
    let weightedRevisionSum = 0;
    let weightSum = 0;

    for (const r of sortedRevisions) {
      const rTime = new Date(r.reviewedAt).getTime();
      const ageDays = Math.max(0, (nowMs - rTime) / (1000 * 60 * 60 * 24));
      const decayWeight = computeRecencyWeight(ageDays, policy);

      const ratingScore = policy.revisionRatingScores[r.rating] ?? 0;
      const intervalDays = Math.max(r.previousIntervalDays, 1);
      const intervalMultiplier = getIntervalMultiplier(intervalDays, policy);

      const revScore = ratingScore * intervalMultiplier;
      weightedRevisionSum += revScore * decayWeight;
      weightSum += decayWeight;
    }

    retentionScore = Math.min(100, Math.round((weightedRevisionSum / Math.max(weightSum, 1)) * 100));

    // Severe penalty if most recent review was forgot
    if (hasRecentForgot) {
      retentionScore = Math.min(retentionScore, 35);
    }
  }

  // C. Repetition Dimension (15% weight)
  // Track proof events: independent solves + revisions (Okay/Easy) + partial hint solves
  const proofEvents =
    independentAttempts.length * 1.0 +
    hintAttempts.length * 0.4 +
    successfulRevisions.length * 1.0;

  let repetitionScore = 0;
  if (proofEvents >= 3.0) {
    repetitionScore = 100;
  } else if (proofEvents >= 2.0) {
    repetitionScore = 75;
  } else if (proofEvents >= 1.0) {
    repetitionScore = 40;
  } else if (proofEvents > 0) {
    repetitionScore = 20;
  }

  // D. Time Efficiency Dimension (10% weight, optional/nullable)
  let timingScore: number | null = null;
  const attemptsWithTime = independentAttempts.filter((a) => a.timeTakenSeconds > 0);
  if (targetTimeMinutes && targetTimeMinutes > 0 && attemptsWithTime.length > 0) {
    let timingTotal = 0;
    for (const a of attemptsWithTime) {
      const actualMinutes = a.timeTakenSeconds / 60;
      const ratio = actualMinutes / targetTimeMinutes;
      if (ratio <= 1.0) {
        timingTotal += 100;
      } else if (ratio <= 1.25) {
        timingTotal += 85;
      } else if (ratio <= 1.5) {
        timingTotal += 70;
      } else if (ratio <= 2.0) {
        timingTotal += 50;
      } else {
        timingTotal += 25;
      }
    }
    timingScore = Math.round(timingTotal / attemptsWithTime.length);
  }

  // E. Hint Independence Dimension (10% weight)
  let hintIndependenceScore = 0;
  if (sortedAttempts.length > 0) {
    const independentCount = independentAttempts.length;
    const hintCount = hintAttempts.length;
    const solutionCount = sortedAttempts.filter((a) => a.outcome === "solution_viewed").length;
    const unsolvedCount = sortedAttempts.filter((a) => a.outcome === "unsolved").length;

    const weightedScore =
      (independentCount * 1.0 + hintCount * 0.35 + solutionCount * 0.1 + unsolvedCount * 0.0) /
      sortedAttempts.length;
    hintIndependenceScore = Math.min(100, Math.round(weightedScore * 100));
  }

  // F. Confidence Calibration Dimension (5% weight, optional/nullable)
  let confidenceCalibrationScore: number | null = null;
  const attemptsWithConfidence = sortedAttempts.filter((a) => a.confidence >= 1 && a.confidence <= 5);
  if (attemptsWithConfidence.length > 0) {
    let calibrationTotal = 0;
    for (const a of attemptsWithConfidence) {
      const c = a.confidence;
      if (a.outcome === "independent") {
        if (c >= 4) calibrationTotal += 100; // Well-calibrated high confidence
        else if (c === 3) calibrationTotal += 85;
        else calibrationTotal += 65; // Modest underconfidence
      } else if (a.outcome === "hint") {
        if (c === 3 || c === 4) calibrationTotal += 80;
        else if (c <= 2) calibrationTotal += 90;
        else calibrationTotal += 40; // Overconfident (5) despite needing hint
      } else {
        // Solution viewed or unsolved
        if (c <= 2) calibrationTotal += 90; // Accurate caution
        else if (c === 3) calibrationTotal += 50;
        else calibrationTotal += 15; // Severe overconfidence
      }
    }
    confidenceCalibrationScore = Math.round(calibrationTotal / attemptsWithConfidence.length);
  }

  // G. Recency Dimension (5% weight)
  let recencyScore = 0;
  let freshness: MasteryFreshness = "stale";
  let lastEvidenceAt: Date | null = null;

  if (latestEvidenceMs > 0) {
    lastEvidenceAt = new Date(latestEvidenceMs);
    const daysSinceLast = Math.max(0, (nowMs - latestEvidenceMs) / (1000 * 60 * 60 * 24));

    if (daysSinceLast <= policy.freshnessDays.fresh) {
      freshness = "fresh";
      recencyScore = Math.max(70, Math.round(100 - (daysSinceLast / policy.freshnessDays.fresh) * 30));
    } else if (daysSinceLast <= policy.freshnessDays.aging) {
      freshness = "aging";
      recencyScore = Math.max(40, Math.round(70 - ((daysSinceLast - 30) / 60) * 30));
    } else {
      freshness = "stale";
      recencyScore = Math.max(10, Math.round(40 - Math.min(30, (daysSinceLast - 90) / 5)));
    }
  }

  const evidence: MasteryEvidenceDimensions = {
    independence: independenceScore,
    retention: retentionScore,
    repetition: repetitionScore,
    timing: timingScore,
    hintIndependence: hintIndependenceScore,
    confidenceCalibration: confidenceCalibrationScore,
    recency: recencyScore,
  };

  // 4. Normalized Score Calculation Across Valid Dimensions
  const dimensionList: Array<{ score: number | null; weight: number }> = [
    { score: evidence.independence, weight: policy.weights.independence },
    { score: evidence.retention, weight: policy.weights.retention },
    { score: evidence.repetition, weight: policy.weights.repetition },
    { score: evidence.timing, weight: policy.weights.timing },
    { score: evidence.hintIndependence, weight: policy.weights.hintIndependence },
    { score: evidence.confidenceCalibration, weight: policy.weights.confidenceCalibration },
    { score: evidence.recency, weight: policy.weights.recency },
  ];

  let totalWeightedScore = 0;
  let totalAvailableWeight = 0;

  for (const dim of dimensionList) {
    if (dim.score !== null) {
      totalWeightedScore += dim.score * dim.weight;
      totalAvailableWeight += dim.weight;
    }
  }

  let rawCompositeScore =
    totalAvailableWeight > 0 ? totalWeightedScore / totalAvailableWeight : 0;
  rawCompositeScore = Math.round(rawCompositeScore * 10) / 10;

  // 5. Semantic Level Determination with Invariants
  let level: MasteryLevel = "unseen";

  const hasAnyEvidence = totalAttemptCount > 0 || totalRevisionCount > 0;
  const hasSuccessfulAttempt = independentAttempts.length > 0 || hintAttempts.length > 0;

  if (!hasAnyEvidence) {
    level = "unseen";
    rawCompositeScore = 0;
  } else if (!hasSuccessfulAttempt && successfulRevisions.length === 0) {
    // Attempted but zero success
    level = "exposed";
  } else if (rawCompositeScore < policy.thresholds.learning) {
    level = hasSuccessfulAttempt ? "learning" : "exposed";
  } else if (rawCompositeScore < policy.thresholds.practiced) {
    level = "learning";
  } else if (rawCompositeScore < policy.thresholds.proficient) {
    // Check Practiced requirements
    if (requirements.independentEvidenceCount + hintAttempts.length >= policy.mandatoryRequirements.practiced.minSuccessfulAttempts) {
      level = "practiced";
    } else {
      level = "learning";
    }
  } else if (rawCompositeScore < policy.thresholds.mastered) {
    // Check Proficient requirements
    const meetsProficient =
      requirements.independentEvidenceCount >= policy.mandatoryRequirements.proficient.minIndependentSolves &&
      requirements.successfulRevisionCount >= policy.mandatoryRequirements.proficient.minSuccessfulRevisions &&
      requirements.longestSuccessfulIntervalDays >= policy.mandatoryRequirements.proficient.minRetentionIntervalDays;

    if (meetsProficient) {
      level = "proficient";
    } else {
      level = "practiced";
    }
  } else {
    // Score >= 85: Check Mastered requirements
    const meetsMastered =
      requirements.independentEvidenceCount >= policy.mandatoryRequirements.mastered.minIndependentSolves &&
      requirements.successfulRevisionCount >= policy.mandatoryRequirements.mastered.minSuccessfulRevisions &&
      requirements.longestSuccessfulIntervalDays >= policy.mandatoryRequirements.mastered.minRetentionIntervalDays &&
      !requirements.hasRecentForgot;

    if (meetsMastered) {
      level = "mastered";
    } else {
      // If score is high but Mastered requirements fail, fall back to Proficient or Practiced
      const meetsProficient =
        requirements.independentEvidenceCount >= policy.mandatoryRequirements.proficient.minIndependentSolves &&
        requirements.successfulRevisionCount >= policy.mandatoryRequirements.proficient.minSuccessfulRevisions &&
        requirements.longestSuccessfulIntervalDays >= policy.mandatoryRequirements.proficient.minRetentionIntervalDays;

      level = meetsProficient ? "proficient" : "practiced";
    }
  }

  // Mandatory Invariant Rule: One solve NEVER equals Mastered
  if (level === "mastered" && requirements.independentEvidenceCount < 2) {
    level = "proficient";
  }

  // 6. Explainable Blockers & Strengths
  const blockers: MasteryBlocker[] = [];
  const strengths: MasteryStrength[] = [];

  if (requirements.hasRecentForgot) {
    blockers.push({
      code: "RECENT_FORGOT",
      label: "Recent Retention Regression",
      detail: "The most recent spaced repetition review was marked 'Forgot'. Recall must be re-established.",
    });
  }

  if (requirements.independentEvidenceCount === 0 && totalAttemptCount > 0) {
    blockers.push({
      code: "NO_INDEPENDENT_SOLVE",
      label: "No Independent Solve",
      detail: "No recorded attempt demonstrates an independent solve yet.",
    });
  } else if (requirements.independentEvidenceCount === 1) {
    blockers.push({
      code: "INSUFFICIENT_REPETITION",
      label: "Needs Repeated Independent Solve",
      detail: "Solved independently once. Mastery requires consistent repeated performance.",
    });
  }

  if (requirements.successfulRevisionCount === 0) {
    blockers.push({
      code: "NO_RETENTION_EVIDENCE",
      label: "No Retention Proof",
      detail: "No spaced review has demonstrated successful recall yet.",
    });
  } else if (requirements.longestSuccessfulIntervalDays < 7) {
    blockers.push({
      code: "SHORT_INTERVAL_RETENTION",
      label: "Short-Term Retention Only",
      detail: `Verified retention is limited to ${requirements.longestSuccessfulIntervalDays} days. 7+ day retention required for Mastered.`,
    });
  }

  if (hintAttempts.length > independentAttempts.length && hintAttempts.length >= 2) {
    blockers.push({
      code: "HIGH_HINT_DEPENDENCY",
      label: "High Hint Dependency",
      detail: "More attempts succeeded with hints than independently.",
    });
  }

  if (freshness === "stale" && hasAnyEvidence) {
    blockers.push({
      code: "STALE_EVIDENCE",
      label: "Stale Evidence",
      detail: "Last practice evidence is over 90 days old. Refresh recommended.",
    });
  }

  // Strengths
  if (requirements.independentEvidenceCount >= 2) {
    strengths.push({
      code: "REPEATED_INDEPENDENT_SOLVES",
      label: "Repeated Independent Performance",
      detail: `${requirements.independentEvidenceCount} verified independent solves demonstrate reproducibility.`,
    });
  }

  if (requirements.longestSuccessfulIntervalDays >= 7) {
    strengths.push({
      code: "LONG_INTERVAL_RETENTION",
      label: "Long-Interval Retention",
      detail: `Demonstrated retention through ${requirements.longestSuccessfulIntervalDays}-day spaced review milestone.`,
    });
  } else if (requirements.successfulRevisionCount >= 1) {
    strengths.push({
      code: "STRONG_RETENTION",
      label: "Verified Spaced Retention",
      detail: `${requirements.successfulRevisionCount} successful revision review(s) completed.`,
    });
  }

  if (timingScore !== null && timingScore >= 80) {
    strengths.push({
      code: "CONSISTENT_TIMING",
      label: "Pacing Efficiency",
      detail: "Consistently completes solution within recommended target time.",
    });
  }

  if (confidenceCalibrationScore !== null && confidenceCalibrationScore >= 80) {
    strengths.push({
      code: "GOOD_CONFIDENCE_CALIBRATION",
      label: "Calibrated Confidence",
      detail: "Reported confidence closely aligns with demonstrated execution outcomes.",
    });
  }

  if (freshness === "fresh") {
    strengths.push({
      code: "RECENT_EVIDENCE",
      label: "Active Retention Window",
      detail: "Evidence is fresh within the active 30-day practice window.",
    });
  }

  // 7. Deterministic Next Evidence Action
  let nextEvidence = "Practice this problem independently in the workspace.";
  if (level === "unseen") {
    nextEvidence = "Solve this problem independently in the DSA workspace.";
  } else if (requirements.hasRecentForgot) {
    nextEvidence = "Rebuild the pattern and complete a successful revision without hints.";
  } else if (requirements.independentEvidenceCount === 0) {
    nextEvidence = "Attempt an independent solve without viewing hints or solutions.";
  } else if (requirements.successfulRevisionCount === 0) {
    nextEvidence = "Complete the upcoming scheduled spaced repetition review.";
  } else if (requirements.independentEvidenceCount < 2) {
    nextEvidence = "Complete a second independent solve to prove reproducibility.";
  } else if (requirements.longestSuccessfulIntervalDays < 7) {
    nextEvidence = "Advance retention by passing the scheduled 7-day review.";
  } else if (level === "mastered" && freshness === "stale") {
    nextEvidence = "Complete a maintenance review to keep pattern memory fresh.";
  } else if (level === "mastered") {
    nextEvidence = "Pattern mastered. Maintain retention through scheduled queue reviews.";
  }

  return {
    problemId,
    level,
    score: rawCompositeScore,
    evidence,
    requirements,
    freshness,
    lastEvidenceAt,
    blockers,
    strengths,
    nextEvidence,
    policyVersion: policy.version,
  };
}

