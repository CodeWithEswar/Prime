/**
 * PRIME Weakness Intelligence Engine — Topic-Level Diagnostic
 *
 * Deterministic aggregation across problems in a topic, ensuring individual
 * problem outliers do not skew the topic diagnosis and respecting topic coverage.
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
  ProblemWeaknessResult,
  TopicWeaknessResult,
  WeaknessDimensions,
  WeaknessEvidenceSummary,
  WeaknessReasonCode,
} from "./types";

export interface TopicDiagnosticInput {
  topicId: string;
  topicSlug: string;
  topicName: string;
  problems: ProblemWeaknessResult[];
  totalTopicProblemsCount?: number;
  algorithmLabSlug?: string;
  isPrerequisite?: boolean;
}

export function calculateTopicWeakness(
  input: TopicDiagnosticInput,
  policy: WeaknessPolicyConfig = DEFAULT_WEAKNESS_POLICY,
  now: Date = new Date()
): TopicWeaknessResult {
  const {
    topicId,
    topicSlug,
    topicName,
    problems,
    totalTopicProblemsCount = problems.length,
    algorithmLabSlug,
  } = input;

  const assessedProblems = problems.filter((p) => p.status !== "not_assessed");
  const assessedCount = assessedProblems.length;

  // If untouched: NOT ASSESSED
  if (assessedCount === 0) {
    return {
      topicId,
      topicSlug,
      topicName,
      status: "not_assessed",
      score: null,
      confidence: "insufficient",
      severity: null,
      priorityRank: 999,
      dimensions: { failure: null, hints: null, timing: null, retention: null },
      reasonCodes: ["INSUFFICIENT_EVIDENCE"],
      primaryReason: "No problems attempted in this topic yet.",
      evidenceSummary: {
        totalAttempts: 0,
        successfulAttempts: 0,
        independentSolves: 0,
        hintAssistedCount: 0,
        solutionViewedCount: 0,
        unsolvedCount: 0,
        averageTimeTakenSeconds: null,
        targetTimeSeconds: null,
        totalRevisions: 0,
        forgotRevisions: 0,
        hardRevisions: 0,
        okayOrEasyRevisions: 0,
        distinctProblemsCount: 0,
        lastAttemptAt: null,
        lastRevisionAt: null,
      },
      problemCount: totalTopicProblemsCount,
      assessedProblemCount: 0,
      problemResults: problems,
      recommendations: [],
      algorithmLabSlug,
      calculatedAt: now.toISOString(),
      policyVersion: policy.version,
    };
  }

  // Aggregate Evidence Summaries
  let totalAttempts = 0;
  let successfulAttempts = 0;
  let independentSolves = 0;
  let hintAssistedCount = 0;
  let solutionViewedCount = 0;
  let unsolvedCount = 0;
  let totalRevisions = 0;
  let forgotRevisions = 0;
  let hardRevisions = 0;
  let okayOrEasyRevisions = 0;
  let latestAttemptTime = 0;
  let latestRevisionTime = 0;

  for (const p of assessedProblems) {
    const s = p.evidenceSummary;
    totalAttempts += s.totalAttempts;
    successfulAttempts += s.successfulAttempts;
    independentSolves += s.independentSolves;
    hintAssistedCount += s.hintAssistedCount;
    solutionViewedCount += s.solutionViewedCount;
    unsolvedCount += s.unsolvedCount;
    totalRevisions += s.totalRevisions;
    forgotRevisions += s.forgotRevisions;
    hardRevisions += s.hardRevisions;
    okayOrEasyRevisions += s.okayOrEasyRevisions;
    if (s.lastAttemptAt) {
      latestAttemptTime = Math.max(latestAttemptTime, new Date(s.lastAttemptAt).getTime());
    }
    if (s.lastRevisionAt) {
      latestRevisionTime = Math.max(latestRevisionTime, new Date(s.lastRevisionAt).getTime());
    }
  }

  const evidenceSummary: WeaknessEvidenceSummary = {
    totalAttempts,
    successfulAttempts,
    independentSolves,
    hintAssistedCount,
    solutionViewedCount,
    unsolvedCount,
    averageTimeTakenSeconds: null,
    targetTimeSeconds: null,
    totalRevisions,
    forgotRevisions,
    hardRevisions,
    okayOrEasyRevisions,
    distinctProblemsCount: assessedCount,
    lastAttemptAt: latestAttemptTime > 0 ? new Date(latestAttemptTime).toISOString() : null,
    lastRevisionAt: latestRevisionTime > 0 ? new Date(latestRevisionTime).toISOString() : null,
  };

  // Dimensions: average across distinct assessed problems so one problem doesn't dominate
  const failureValues = assessedProblems
    .map((p) => p.dimensions.failure)
    .filter((v): v is number => v !== null);
  const hintValues = assessedProblems
    .map((p) => p.dimensions.hints)
    .filter((v): v is number => v !== null);
  const timingValues = assessedProblems
    .map((p) => p.dimensions.timing)
    .filter((v): v is number => v !== null);
  const retentionValues = assessedProblems
    .map((p) => p.dimensions.retention)
    .filter((v): v is number => v !== null);

  const mean = (arr: number[]) =>
    arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100 : null;

  const dimensions: WeaknessDimensions = {
    failure: mean(failureValues),
    hints: mean(hintValues),
    timing: mean(timingValues),
    retention: mean(retentionValues),
  };

  const isStale = latestAttemptTime > 0
    ? (now.getTime() - latestAttemptTime) / (1000 * 60 * 60 * 24) > policy.thresholds.recencyWindowDays
    : false;

  const confidence = evaluateEvidenceConfidence({
    totalAttempts,
    distinctProblems: assessedCount,
    totalRevisions,
    hasIndependentSolve: independentSolves > 0,
    isStale,
  });

  const rawScore = calculateNormalizedWeaknessScore(dimensions, policy);

  // Check counts of problem statuses
  const needsAttentionProblems = assessedProblems.filter(
    (p) => p.status === "needs_attention" || p.status === "persistent"
  );
  const persistentProblems = assessedProblems.filter((p) => p.status === "persistent");
  const improvingProblems = assessedProblems.filter((p) => p.status === "improving");
  const stableProblems = assessedProblems.filter((p) => p.status === "stable");

  let status: DiagnosticStatus = "emerging";
  const reasonCodes: WeaknessReasonCode[] = [];
  let primaryReason = "Evaluating practice patterns across problems.";
  let secondaryReason: string | undefined;

  // Single-problem coverage check
  const isLimitedCoverage = assessedCount === 1 && totalTopicProblemsCount > 1;
  if (isLimitedCoverage) {
    reasonCodes.push("LIMITED_PROBLEM_COVERAGE");
  }

  if (persistentProblems.length >= 2) {
    status = "persistent";
    reasonCodes.push("REPEATED_FAILURE");
    primaryReason = `Persistent difficulty observed across ${persistentProblems.length} ${topicName} problems.`;
  } else if (
    persistentProblems.length > 0 ||
    needsAttentionProblems.length > 0 ||
    (rawScore !== null && rawScore >= policy.thresholds.needsAttentionScore)
  ) {
    status = "needs_attention";
    if (dimensions.hints !== null && dimensions.hints >= policy.thresholds.highHintRate) {
      reasonCodes.push("HIGH_HINT_DEPENDENCY");
      primaryReason = `High hint dependency across ${assessedCount} practiced ${topicName} problems.`;
      secondaryReason = `${hintAssistedCount} of ${successfulAttempts} solved attempts required hints.`;
    } else if (dimensions.failure !== null && dimensions.failure >= 0.4) {
      reasonCodes.push("REPEATED_FAILURE");
      primaryReason = `Repeated unsolved attempts across ${needsAttentionProblems.length} ${topicName} problems.`;
    } else if (dimensions.retention !== null && dimensions.retention >= policy.thresholds.retentionFailureRate) {
      reasonCodes.push("RETENTION_REGRESSION");
      primaryReason = `Retention decay detected during ${topicName} spaced repetition reviews.`;
    } else {
      primaryReason = `${topicName} shows patterns of difficulty that warrant focused practice.`;
    }
  } else if (improvingProblems.length > 0 && needsAttentionProblems.length === 0) {
    status = "improving";
    reasonCodes.push("RECENT_IMPROVEMENT");
    primaryReason = `Recent attempts show improving independence in ${topicName}.`;
  } else if (
    (stableProblems.length >= 2 ||
      (stableProblems.length >= 1 &&
        assessedProblems.every(
          (p) => p.evidenceSummary.unsolvedCount === 0 && p.evidenceSummary.hintAssistedCount === 0
        ))) &&
    needsAttentionProblems.length === 0
  ) {
    status = "stable";
    primaryReason = `Consistent independent solves across ${assessedCount} ${topicName} problems.`;
  } else {
    status = "emerging";
    primaryReason = `Initial evidence gathered across ${assessedCount} problem(s); more practice needed to confirm stability.`;
    reasonCodes.push("INSUFFICIENT_EVIDENCE");
  }

  // Actionable Topic-Level Recommendations
  const recommendations: ImprovementRecommendation[] = [];

  // Algorithm Lab recommendation if struggle is present and lab exists
  if ((status === "needs_attention" || status === "persistent") && algorithmLabSlug) {
    recommendations.push({
      id: `rec-lab-${topicSlug}`,
      action: "REVIEW_ALGORITHM",
      targetType: "lab",
      targetId: algorithmLabSlug,
      targetTitle: `${topicName} Simulation`,
      targetSlug: algorithmLabSlug,
      reason: `Struggling with pointer or loop invariant movement in ${topicName}. Walk through the interactive visualization.`,
      reasonCode: "HIGH_HINT_DEPENDENCY",
      estimatedMinutes: 15,
      priority: 1,
      evidenceNeeded: "Interactive visual trace in Algorithm Lab.",
      algorithmLabSlug,
    });
  }

  // Include top problem recommendations from weak problems
  for (const prob of needsAttentionProblems) {
    for (const rec of prob.recommendations) {
      if (!recommendations.some((r) => r.targetId === rec.targetId && r.action === rec.action)) {
        recommendations.push(rec);
      }
    }
  }

  // If limited coverage, recommend practicing another problem in the topic
  if (isLimitedCoverage && status !== "needs_attention") {
    recommendations.push({
      id: `rec-assess-${topicSlug}`,
      action: "PRACTICE_SIMILAR",
      targetType: "topic",
      targetId: topicId,
      targetTitle: `Another ${topicName} problem`,
      targetSlug: topicSlug,
      reason: `Only 1 of ${totalTopicProblemsCount} problems attempted. Practice another problem to build topic breadth.`,
      reasonCode: "LIMITED_PROBLEM_COVERAGE",
      estimatedMinutes: 30,
      priority: 2,
      evidenceNeeded: "A successful solve on a second problem in this topic.",
    });
  }

  return {
    topicId,
    topicSlug,
    topicName,
    status,
    score: rawScore,
    confidence,
    severity: rawScore,
    priorityRank: 999, // Ranked later by priority engine
    dimensions,
    reasonCodes,
    primaryReason,
    secondaryReason,
    evidenceSummary,
    problemCount: totalTopicProblemsCount,
    assessedProblemCount: assessedCount,
    problemResults: problems,
    recommendations,
    algorithmLabSlug,
    calculatedAt: now.toISOString(),
    policyVersion: policy.version,
  };
}

