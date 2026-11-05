/**
 * PRIME Weakness Intelligence Engine — Problem-Level Diagnostic
 *
 * Deterministic assessment of individual DSA problem attempts, hint usage,
 * timing efficiency, and retention outcomes.
 */

import {
  DEFAULT_WEAKNESS_POLICY,
  calculateNormalizedWeaknessScore,
  evaluateEvidenceConfidence,
  type WeaknessPolicyConfig,
} from "./policy";
import type {
  DiagnosticStatus,
  ImprovementRecommendation,
  ProblemDiagnosticInput,
  ProblemWeaknessResult,
  WeaknessDimensions,
  WeaknessEvidenceSummary,
  WeaknessReasonCode,
} from "./types";

export function calculateProblemWeakness(
  input: ProblemDiagnosticInput,
  policy: WeaknessPolicyConfig = DEFAULT_WEAKNESS_POLICY,
  now: Date = new Date()
): ProblemWeaknessResult {
  const { problemId, problemSlug, problemTitle, difficulty, targetTimeMinutes, attempts, revisions } =
    input;

  // 1. Sort records chronologically (oldest to newest) to detect trajectories
  const sortedAttempts = [...attempts].sort(
    (a, b) => new Date(a.attemptedAt).getTime() - new Date(b.attemptedAt).getTime()
  );
  const sortedRevisions = [...revisions].sort(
    (a, b) => new Date(a.reviewedAt).getTime() - new Date(b.reviewedAt).getTime()
  );

  const totalAttempts = sortedAttempts.length;
  const successfulAttempts = sortedAttempts.filter((a) => a.outcome !== "unsolved").length;
  const independentSolves = sortedAttempts.filter((a) => a.outcome === "independent").length;
  const hintAssistedCount = sortedAttempts.filter((a) => a.outcome === "hint").length;
  const solutionViewedCount = sortedAttempts.filter((a) => a.outcome === "solution_viewed").length;
  const unsolvedCount = sortedAttempts.filter((a) => a.outcome === "unsolved").length;

  const validDurations = sortedAttempts
    .map((a) => a.timeTakenSeconds)
    .filter((s): s is number => typeof s === "number" && s > 0);
  const averageTimeTakenSeconds = validDurations.length
    ? Math.round(validDurations.reduce((acc, curr) => acc + curr, 0) / validDurations.length)
    : null;
  const targetTimeSeconds = targetTimeMinutes ? targetTimeMinutes * 60 : null;

  const totalRevisions = sortedRevisions.length;
  const forgotRevisions = sortedRevisions.filter((r) => r.rating === "forgot").length;
  const hardRevisions = sortedRevisions.filter((r) => r.rating === "hard").length;
  const okayOrEasyRevisions = sortedRevisions.filter(
    (r) => r.rating === "okay" || r.rating === "easy"
  ).length;

  const lastAttempt = sortedAttempts[sortedAttempts.length - 1];
  const lastRevision = sortedRevisions[sortedRevisions.length - 1];

  const evidenceSummary: WeaknessEvidenceSummary = {
    totalAttempts,
    successfulAttempts,
    independentSolves,
    hintAssistedCount,
    solutionViewedCount,
    unsolvedCount,
    averageTimeTakenSeconds,
    targetTimeSeconds,
    totalRevisions,
    forgotRevisions,
    hardRevisions,
    okayOrEasyRevisions,
    distinctProblemsCount: totalAttempts > 0 || totalRevisions > 0 ? 1 : 0,
    lastAttemptAt: lastAttempt ? new Date(lastAttempt.attemptedAt).toISOString() : null,
    lastRevisionAt: lastRevision ? new Date(lastRevision.reviewedAt).toISOString() : null,
  };

  // Check staleness (last evidence older than policy window)
  const lastEvidenceDate = lastAttempt?.attemptedAt ?? lastRevision?.reviewedAt;
  const isStale = lastEvidenceDate
    ? (now.getTime() - new Date(lastEvidenceDate).getTime()) / (1000 * 60 * 60 * 24) >
      policy.thresholds.recencyWindowDays
    : false;

  // 2. Compute Individual Dimensions
  // Failure dimension
  let failureSignal: number | null = null;
  if (totalAttempts > 0) {
    const rawFailureRate = unsolvedCount / totalAttempts;
    // Check consecutive recent failures
    const recentAttempts = sortedAttempts.slice(-3);
    const recentUnsolved = recentAttempts.filter((a) => a.outcome === "unsolved").length;
    if (recentUnsolved >= 2) {
      failureSignal = Math.min(1.0, rawFailureRate + 0.3);
    } else {
      failureSignal = rawFailureRate;
    }
  }

  // Hints dimension
  let hintSignal: number | null = null;
  if (successfulAttempts > 0) {
    hintSignal = (hintAssistedCount * 0.75 + solutionViewedCount * 1.0) / successfulAttempts;
  } else if (totalAttempts > 0 && unsolvedCount === totalAttempts) {
    // Pure failures, hint dimension is null
    hintSignal = null;
  }

  // Timing dimension
  let timingSignal: number | null = null;
  if (targetTimeSeconds && averageTimeTakenSeconds && successfulAttempts > 0) {
    const ratio = averageTimeTakenSeconds / targetTimeSeconds;
    if (ratio <= 1.0) {
      timingSignal = 0.0;
    } else {
      // Scale from 1.0x to 2.0x target time into 0.0 to 1.0
      timingSignal = Math.min(1.0, (ratio - 1.0) / 1.0);
    }
  }

  // Retention dimension
  let retentionSignal: number | null = null;
  if (totalRevisions > 0) {
    retentionSignal = (forgotRevisions * 1.0 + hardRevisions * 0.5) / totalRevisions;
  }

  const dimensions: WeaknessDimensions = {
    failure: failureSignal !== null ? Math.round(failureSignal * 100) / 100 : null,
    hints: hintSignal !== null ? Math.round(hintSignal * 100) / 100 : null,
    timing: timingSignal !== null ? Math.round(timingSignal * 100) / 100 : null,
    retention: retentionSignal !== null ? Math.round(retentionSignal * 100) / 100 : null,
  };

  // 3. Trajectory & Recovery Detection
  // Check if learner previously struggled but recovered in latest attempts
  const hadEarlierStruggles =
    sortedAttempts.slice(0, -1).some((a) => a.outcome === "unsolved" || a.outcome === "hint") ||
    forgotRevisions > 0;
  const latestAttemptIsIndependent = lastAttempt?.outcome === "independent";
  const latestRevisionIsClean =
    lastRevision?.rating === "okay" || lastRevision?.rating === "easy";

  const isRecovering =
    hadEarlierStruggles &&
    latestAttemptIsIndependent &&
    (!lastRevision || latestRevisionIsClean);

  const confidence = evaluateEvidenceConfidence({
    totalAttempts,
    distinctProblems: totalAttempts > 0 || totalRevisions > 0 ? 1 : 0,
    totalRevisions,
    hasIndependentSolve: independentSolves > 0,
    isStale,
  });

  // Calculate raw weakness score
  let score = calculateNormalizedWeaknessScore(dimensions, policy);

  // Apply recovery discount if the learner has demonstrated recent independent solves
  if (isRecovering && score !== null) {
    score = Math.max(0, Math.round(score * 0.45)); // 55% reduction on demonstrated recovery
  }

  // 4. Diagnostic Status & Reason Codes
  const reasonCodes: WeaknessReasonCode[] = [];
  let status: DiagnosticStatus = "not_assessed";
  let primaryReason = "No verified practice attempts or retention reviews recorded yet.";
  let secondaryReason: string | undefined;

  if (totalAttempts === 0 && totalRevisions === 0) {
    status = "not_assessed";
    reasonCodes.push("INSUFFICIENT_EVIDENCE");
  } else if (totalAttempts <= 1 && totalRevisions === 0 && independentSolves === 1) {
    // Single initial solve
    status = "emerging";
    primaryReason = "Solved once independently. Complete retention reviews to establish stability.";
    reasonCodes.push("INSUFFICIENT_EVIDENCE");
  } else if (totalAttempts <= 1 && totalRevisions === 0 && unsolvedCount === 1) {
    // Single initial failure
    status = "emerging";
    primaryReason = "Initial attempt was unsolved. Additional practice is needed to confirm a pattern.";
    reasonCodes.push("INSUFFICIENT_EVIDENCE");
  } else if (isRecovering && independentSolves >= 1 && (hintSignal === null || hintSignal < policy.thresholds.highHintRate)) {
    status = "improving";
    primaryReason = "Recent independent solve demonstrates positive recovery from earlier struggle.";
    reasonCodes.push("RECENT_IMPROVEMENT");
    if (hintAssistedCount > 0) {
      reasonCodes.push("INDEPENDENCE_IMPROVING");
    }
  } else if (
    (score !== null && score >= policy.thresholds.needsAttentionScore) ||
    (hintSignal !== null && hintSignal >= policy.thresholds.highHintRate && hintAssistedCount >= 2)
  ) {
    const isPersistent =
      unsolvedCount >= policy.thresholds.persistentFailureCount ||
      (hintAssistedCount >= 2 && independentSolves === 0) ||
      (forgotRevisions >= 2 && successfulAttempts === 0);

    status = isPersistent ? "persistent" : "needs_attention";

    // Establish primary root cause
    if (hintSignal !== null && hintSignal >= policy.thresholds.highHintRate) {
      reasonCodes.push("HIGH_HINT_DEPENDENCY");
      primaryReason = `${hintAssistedCount} of ${successfulAttempts} successful attempts required hints.`;
      if (solutionViewedCount > 0) {
        reasonCodes.push("SOLUTION_DEPENDENCY");
        secondaryReason = "Solution was viewed before achieving independent completion.";
      }
    } else if (failureSignal !== null && failureSignal >= 0.5) {
      reasonCodes.push("REPEATED_FAILURE");
      primaryReason = `${unsolvedCount} of ${totalAttempts} practice attempts were unsolved.`;
      if (retentionSignal !== null && retentionSignal >= policy.thresholds.retentionFailureRate) {
        reasonCodes.push("RETENTION_REGRESSION");
        secondaryReason = `Spaced retention review marked "${lastRevision?.rating ?? "forgot"}".`;
      }
    } else if (retentionSignal !== null && retentionSignal >= policy.thresholds.retentionFailureRate) {
      reasonCodes.push("REVISION_FAILURE");
      primaryReason = `Retention review marked as "${lastRevision?.rating ?? "forgot"}".`;
      if (hintSignal !== null && hintSignal > 0.3) {
        reasonCodes.push("HIGH_HINT_DEPENDENCY");
        secondaryReason = "Prior solves also exhibited hint assistance.";
      }
    } else if (timingSignal !== null && timingSignal >= 0.5) {
      reasonCodes.push("TIME_INEFFICIENCY");
      primaryReason = `Average completion time exceeds target by ${Math.round(((averageTimeTakenSeconds ?? 0) / (targetTimeSeconds ?? 1) - 1) * 100)}%.`;
    } else {
      reasonCodes.push("REPEATED_FAILURE");
      primaryReason = "Performance signals indicate need for focused deliberate practice.";
    }
  } else {
    // Score is low / below threshold
    if (independentSolves >= 2 && (totalRevisions === 0 || okayOrEasyRevisions >= 1)) {
      status = "stable";
      primaryReason = "Consistent independent solves with no significant hint dependency.";
    } else {
      status = "emerging";
      primaryReason = "Demonstrating steady progress; additional repetitions will confirm stability.";
    }
  }

  if (isStale && status !== "not_assessed") {
    reasonCodes.push("STALE_EVIDENCE");
    if (!secondaryReason) {
      secondaryReason = "Last practice was over 60 days ago; evidence may be outdated.";
    }
  }

  // 5. Generate Actionable Recommendations
  const recommendations: ImprovementRecommendation[] = [];

  if (status === "needs_attention" || status === "persistent") {
    if (reasonCodes.includes("HIGH_HINT_DEPENDENCY") || reasonCodes.includes("SOLUTION_DEPENDENCY")) {
      recommendations.push({
        id: `rec-retry-${problemId}`,
        action: "RETRY_PROBLEM",
        targetType: "problem",
        targetId: problemId,
        targetTitle: problemTitle,
        targetSlug: problemSlug,
        reason: "Recent attempts required assistance. Solve this exact problem from scratch without hints.",
        reasonCode: "HIGH_HINT_DEPENDENCY",
        estimatedMinutes: targetTimeMinutes ?? 30,
        priority: 1,
        evidenceNeeded: "A successful independent solve without hints.",
      });
    } else if (reasonCodes.includes("REPEATED_FAILURE")) {
      recommendations.push({
        id: `rec-study-${problemId}`,
        action: "STUDY_CONCEPT",
        targetType: "problem",
        targetId: problemId,
        targetTitle: problemTitle,
        targetSlug: problemSlug,
        reason: "Multiple unsolved attempts. Review the underlying algorithmic pattern and edge cases.",
        reasonCode: "REPEATED_FAILURE",
        estimatedMinutes: 20,
        priority: 1,
        evidenceNeeded: "Conceptual understanding of the loop invariants and termination conditions.",
      });
      recommendations.push({
        id: `rec-retry-${problemId}`,
        action: "RETRY_PROBLEM",
        targetType: "problem",
        targetId: problemId,
        targetTitle: problemTitle,
        targetSlug: problemSlug,
        reason: "Re-attempt with clean boundary conditions after pattern review.",
        reasonCode: "REPEATED_FAILURE",
        estimatedMinutes: targetTimeMinutes ?? 30,
        priority: 2,
        evidenceNeeded: "An independent solve within target time.",
      });
    } else if (reasonCodes.includes("REVISION_FAILURE") || reasonCodes.includes("RETENTION_REGRESSION")) {
      recommendations.push({
        id: `rec-revision-${problemId}`,
        action: "COMPLETE_REVISION",
        targetType: "problem",
        targetId: problemId,
        targetTitle: problemTitle,
        targetSlug: problemSlug,
        reason: "Memory retention decayed on scheduled review. Reinforce mental model now.",
        reasonCode: "RETENTION_REGRESSION",
        estimatedMinutes: 25,
        priority: 1,
        evidenceNeeded: "A revision review rated 'okay' or 'easy'.",
      });
    } else if (reasonCodes.includes("TIME_INEFFICIENCY")) {
      recommendations.push({
        id: `rec-timing-${problemId}`,
        action: "PRACTICE_INDEPENDENTLY",
        targetType: "problem",
        targetId: problemId,
        targetTitle: problemTitle,
        targetSlug: problemSlug,
        reason: "Solve focusing on fluent implementation without hesitation.",
        reasonCode: "TIME_INEFFICIENCY",
        estimatedMinutes: targetTimeMinutes ?? 25,
        priority: 1,
        evidenceNeeded: `Independent solve within ${targetTimeMinutes ?? 25} minutes.`,
      });
    }
  } else if (status === "emerging" && unsolvedCount > 0) {
    recommendations.push({
      id: `rec-retry-${problemId}`,
      action: "RETRY_PROBLEM",
      targetType: "problem",
      targetId: problemId,
      targetTitle: problemTitle,
      targetSlug: problemSlug,
      reason: "Resolve the initial unsolved attempt to establish a solid foundation.",
      reasonCode: "INSUFFICIENT_EVIDENCE",
      estimatedMinutes: targetTimeMinutes ?? 30,
      priority: 2,
      evidenceNeeded: "A successful solve.",
    });
  }

  return {
    problemId,
    problemSlug,
    problemTitle,
    difficulty,
    status,
    score,
    confidence,
    dimensions,
    reasonCodes,
    primaryReason,
    secondaryReason,
    evidenceSummary,
    recommendations,
    calculatedAt: now.toISOString(),
    policyVersion: policy.version,
  };
}

