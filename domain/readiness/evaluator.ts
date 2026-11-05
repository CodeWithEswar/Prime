/**
 * PRIME Interview Readiness Engine — Pure Evaluator & Gap Analysis
 *
 * Deterministic evaluation of competencies, gap identification, and actionable
 * recommendation generation without React, Next.js, or database dependencies.
 */

import {
  evaluateConfidence,
  evaluateCoverage,
  evaluateReadinessStatus,
  READINESS_POLICY_VERSION,
} from "./policy";
import {
  CANONICAL_COMPETENCIES,
  getCompetencyDefinition,
  getTargetProfile,
  getCompanyEmphasis,
  TARGET_PROFILES,
} from "./profiles";
import type {
  CompetencyDefinition,
  CompetencyEvidenceInput,
  CompetencyReadiness,
  DomainReadinessSummary,
  InterviewReadinessFactors,
  ProfileCompetencyRequirement,
  ReadinessGap,
  ReadinessRecommendation,
  ReadinessStatus,
  ReadinessTargetProfile,
  TargetComparisonItem,
  TargetReadinessResult,
  TrajectoryDataPoint,
} from "./types";

export function compareTargetProfiles(
  evidenceMap: Map<string, CompetencyEvidenceInput>
): TargetComparisonItem[] {
  return TARGET_PROFILES.map((profile) => {
    const res = evaluateTargetReadiness({ profileId: profile.id, evidenceMap, skipComparisons: true });
    const coreItems = res.competencies.filter((c) => c.importance === "core");
    const alignedCore = coreItems.filter((c) => c.status === "evidence_aligned").length;
    return {
      profileId: profile.id,
      profileName: profile.name,
      totalCore: coreItems.length,
      alignedCore,
      coveragePercent: res.coreCoveragePercentage,
      overallAlignment: res.overallAlignment,
    };
  });
}

export function evaluateCompetencyReadiness(params: {
  definition: CompetencyDefinition;
  requirement: ProfileCompetencyRequirement;
  evidence: CompetencyEvidenceInput;
  now?: Date;
}): CompetencyReadiness {
  const { definition, requirement, evidence, now = new Date() } = params;

  const coverage = evaluateCoverage(evidence, requirement);
  const confidence = evaluateConfidence(evidence);
  const status = evaluateReadinessStatus(evidence, coverage, confidence);

  const supportingEvidence: string[] = [];
  const missingEvidence: string[] = [];
  const blockers: string[] = [];

  // 1. Supporting evidence
  if (evidence.attemptedProblemsCount > 0) {
    supportingEvidence.push(
      `${evidence.attemptedProblemsCount} distinct problem${evidence.attemptedProblemsCount === 1 ? "" : "s"} attempted.`
    );
  }
  if (evidence.independentSolvedCount > 0) {
    supportingEvidence.push(
      `${evidence.independentSolvedCount} solved completely independently.`
    );
  }
  if (evidence.successfulRevisions > 0) {
    supportingEvidence.push(
      `${evidence.successfulRevisions} successful retention review${evidence.successfulRevisions === 1 ? "" : "s"}.`
    );
  }

  // 2. Missing evidence & blockers
  const targetProblems = requirement.targetProblemsCount ?? 4;
  if (evidence.attemptedProblemsCount === 0) {
    missingEvidence.push("No verified attempts or assessments recorded.");
  } else if (evidence.attemptedProblemsCount < targetProblems) {
    missingEvidence.push(
      `Practiced ${evidence.attemptedProblemsCount} of ${targetProblems} target problems recommended for ${requirement.importance} coverage.`
    );
  }

  if (evidence.totalRevisions === 0 && evidence.attemptedProblemsCount > 0) {
    missingEvidence.push("No spaced retention reviews recorded yet.");
  }

  if (evidence.hasWeaknessSignal && evidence.weaknessReason) {
    blockers.push(evidence.weaknessReason);
  }
  if (evidence.forgotRevisions > 0) {
    blockers.push(`Retention decay: ${evidence.forgotRevisions} review(s) marked 'forgot'.`);
  }
  if (evidence.hintAssistedCount > 0 && evidence.hintAssistedCount >= evidence.independentSolvedCount) {
    blockers.push("High hint dependency: majority of solved attempts required assistance.");
  }

  // 3. Summary explanation
  let summary = "Evaluating preparation evidence.";
  if (status === "not_assessed") {
    summary = `No assessment evidence recorded for ${definition.name}.`;
  } else if (status === "insufficient_evidence") {
    summary = `Preliminary evidence exists for ${definition.name}, but more practice is needed for reliable evaluation.`;
  } else if (status === "needs_attention") {
    summary = blockers[0] ?? `Evidence indicates difficulty in ${definition.name}. Focused practice recommended.`;
  } else if (status === "evidence_aligned") {
    summary = `Verified independent problem-solving and retention evidence align with target requirements.`;
  } else if (status === "developing") {
    summary = `Demonstrating positive progress. Complete remaining target problems to achieve alignment.`;
  }

  // 4. Recommendation
  let recommendation: ReadinessRecommendation | undefined;
  if (status === "not_assessed") {
    recommendation = {
      id: `rec-init-${definition.id}`,
      action: definition.domain === "dsa" ? "Practice DSA" : "Start Assessment",
      title: `Assess ${definition.name}`,
      description: `Complete an initial benchmark problem or assessment in ${definition.name}.`,
      reason: `Core requirement for ${requirement.importance === "core" ? "target interview profile" : "supporting foundation"}.`,
      estimatedMinutes: 30,
      priority: requirement.importance === "core" ? 1 : 2,
      planWorkParams: {
        source: definition.domain === "dsa" ? "problem" : "custom",
        title: `Assess ${definition.name}`,
      },
    };
  } else if (status === "needs_attention") {
    recommendation = {
      id: `rec-fix-${definition.id}`,
      action: "Resolve Weakness",
      title: `Strengthen ${definition.name}`,
      description: `Retry previously assisted problems independently without opening hints.`,
      reason: blockers[0] ?? "Recent attempts indicate hint dependency or repeated struggles.",
      estimatedMinutes: 35,
      priority: 1,
      planWorkParams: {
        source: "problem",
        title: `Independent practice: ${definition.name}`,
      },
    };
  } else if (status === "developing" && coverage !== "sufficient") {
    recommendation = {
      id: `rec-cov-${definition.id}`,
      action: "Expand Coverage",
      title: `Expand ${definition.name} Breadth`,
      description: `Solve ${Math.max(1, targetProblems - evidence.attemptedProblemsCount)} more problem(s) to satisfy the target role coverage.`,
      reason: "Coverage expansion ensures pattern breadth across interview variations.",
      estimatedMinutes: 30,
      priority: 2,
      planWorkParams: {
        source: "problem",
        title: `Practice ${definition.name}`,
      },
    };
  }

  // 5. Score calculation (0-100 or null if not assessed)
  let score: number | null = null;
  if (status !== "not_assessed") {
    const coverageFraction = Math.min(1.0, evidence.attemptedProblemsCount / targetProblems);
    const masteryFraction = (evidence.masteryScore ?? 50) / 100;
    const independenceFraction = evidence.totalAttempts > 0
      ? evidence.independentSolvedCount / evidence.totalAttempts
      : 0.5;
    const penalty = evidence.hasWeaknessSignal ? 0.25 : 0;

    const raw = (coverageFraction * 0.4 + masteryFraction * 0.35 + independenceFraction * 0.25 - penalty) * 100;
    score = Math.max(10, Math.min(100, Math.round(raw)));
  }

  return {
    competencyId: definition.id,
    name: definition.name,
    slug: definition.slug,
    domain: definition.domain,
    importance: requirement.importance,
    status,
    coverage,
    confidence,
    score,
    summary,
    supportingEvidence,
    missingEvidence,
    blockers,
    recommendation,
    algorithmLabSlug: evidence.algorithmLabSlug,
    evaluatedAt: now.toISOString(),
  };
}

export function identifyReadinessGaps(
  competencies: CompetencyReadiness[]
): ReadinessGap[] {
  const gaps: ReadinessGap[] = [];

  for (const c of competencies) {
    if (c.status === "not_assessed" && c.importance === "core") {
      gaps.push({
        id: `gap-unassessed-${c.competencyId}`,
        competencyId: c.competencyId,
        competencyName: c.name,
        domain: c.domain,
        gapType: "unassessed",
        importance: c.importance,
        title: `Unassessed Core Competency: ${c.name}`,
        description: `This core requirement has no verified practice attempts or assessment results.`,
        recommendedAction: c.domain === "dsa" ? "Complete a foundational problem" : "Take a fundamentals assessment",
        actionType: c.domain === "dsa" ? "practice_dsa" : "take_assessment",
        targetSlug: c.slug,
        urgency: 1,
      });
    } else if (c.status === "needs_attention") {
      gaps.push({
        id: `gap-perf-${c.competencyId}`,
        competencyId: c.competencyId,
        competencyName: c.name,
        domain: c.domain,
        gapType: "performance_gap",
        importance: c.importance,
        title: `Performance Gap: ${c.name}`,
        description: c.blockers[0] ?? `Evidence indicates difficulty in independent execution.`,
        recommendedAction: "Retry assisted problems independently without hints",
        actionType: "practice_dsa",
        targetSlug: c.slug,
        urgency: c.importance === "core" ? 1 : 2,
      });
    } else if (c.blockers.some((b) => b.includes("Retention decay"))) {
      gaps.push({
        id: `gap-ret-${c.competencyId}`,
        competencyId: c.competencyId,
        competencyName: c.name,
        domain: c.domain,
        gapType: "retention_gap",
        importance: c.importance,
        title: `Retention Gap: ${c.name}`,
        description: `Recall decayed during scheduled spaced repetition review.`,
        recommendedAction: "Complete a memory reinforcement review",
        actionType: "complete_revision",
        targetSlug: c.slug,
        urgency: 2,
      });
    } else if (c.coverage === "limited" && c.importance === "core") {
      gaps.push({
        id: `gap-cov-${c.competencyId}`,
        competencyId: c.competencyId,
        competencyName: c.name,
        domain: c.domain,
        gapType: "coverage_gap",
        importance: c.importance,
        title: `Coverage Gap: ${c.name}`,
        description: `Practiced preliminary problems, but target requirement problem breadth is incomplete.`,
        recommendedAction: "Practice an unfamiliar variation in this pattern",
        actionType: "practice_dsa",
        targetSlug: c.slug,
        urgency: 3,
      });
    }
  }

  // Sort by urgency (1 is highest)
  return gaps.sort((a, b) => a.urgency - b.urgency);
}

export function evaluateTargetReadiness(params: {
  profileId?: string;
  companyId?: string;
  evidenceMap: Map<string, CompetencyEvidenceInput>;
  trajectory?: TrajectoryDataPoint[];
  skipComparisons?: boolean;
  now?: Date;
}): TargetReadinessResult {
  const {
    profileId = "general-sde",
    companyId,
    evidenceMap,
    trajectory = [],
    skipComparisons = false,
    now = new Date(),
  } = params;
  const profile = getTargetProfile(profileId);
  const companyEmphasis = getCompanyEmphasis(companyId) ?? null;

  const competencies: CompetencyReadiness[] = profile.competencies.map((req) => {
    const definition = getCompetencyDefinition(req.competencyId) ?? {
      id: req.competencyId,
      slug: req.competencyId,
      name: req.competencyId,
      domain: "dsa" as const,
      description: "",
      relatedTopicSlugs: [],
    };

    const evidence = evidenceMap.get(req.competencyId) ?? {
      competencyId: req.competencyId,
      domain: definition.domain,
      totalProblemsCount: req.targetProblemsCount ?? 4,
      attemptedProblemsCount: 0,
      independentSolvedCount: 0,
      hintAssistedCount: 0,
      totalAttempts: 0,
      totalRevisions: 0,
      successfulRevisions: 0,
      forgotRevisions: 0,
      masteryScore: null,
      hasWeaknessSignal: false,
    };

    return evaluateCompetencyReadiness({
      definition,
      requirement: req,
      evidence,
      now,
    });
  });

  const totalCompetencies = competencies.length;
  const assessedCount = competencies.filter((c) => c.status !== "not_assessed").length;
  const alignedCount = competencies.filter((c) => c.status === "evidence_aligned").length;
  const developingCount = competencies.filter((c) => c.status === "developing").length;
  const needsAttentionCount = competencies.filter((c) => c.status === "needs_attention").length;
  const unassessedCount = competencies.filter((c) => c.status === "not_assessed").length;
  const insufficientEvidenceCount = competencies.filter(
    (c) => c.status === "insufficient_evidence"
  ).length;

  const coreCompetencies = competencies.filter((c) => c.importance === "core");
  const assessedCore = coreCompetencies.filter((c) => c.status !== "not_assessed").length;
  const coreCoveragePercentage = coreCompetencies.length
    ? Math.round((assessedCore / coreCompetencies.length) * 100)
    : 0;

  // Domain summaries
  const domains: ("dsa" | "fundamentals" | "aptitude" | "mock")[] = [
    "dsa",
    "fundamentals",
    "aptitude",
    "mock",
  ];
  const domainSummaries = {} as Record<
    "dsa" | "fundamentals" | "aptitude" | "mock",
    DomainReadinessSummary
  >;

  for (const domain of domains) {
    const inDomain = competencies.filter((c) => c.domain === domain);
    const domainAssessed = inDomain.filter((c) => c.status !== "not_assessed").length;
    const domainAligned = inDomain.filter((c) => c.status === "evidence_aligned").length;

    let domainStatus: ReadinessStatus = "not_assessed";
    if (domainAssessed === 0) {
      domainStatus = "not_assessed";
    } else if (inDomain.some((c) => c.status === "needs_attention")) {
      domainStatus = "needs_attention";
    } else if (domainAligned >= Math.ceil(inDomain.length * 0.6)) {
      domainStatus = "evidence_aligned";
    } else {
      domainStatus = "developing";
    }

    domainSummaries[domain] = {
      total: inDomain.length,
      assessed: domainAssessed,
      aligned: domainAligned,
      status: domainStatus,
    };
  }

  // Overall readiness status
  let overallAlignment: ReadinessStatus = "developing";
  if (assessedCount === 0) {
    overallAlignment = "not_assessed";
  } else if (needsAttentionCount >= 2) {
    overallAlignment = "needs_attention";
  } else if (alignedCount >= Math.ceil(totalCompetencies * 0.65) && needsAttentionCount === 0) {
    overallAlignment = "evidence_aligned";
  } else {
    overallAlignment = "developing";
  }

  const gaps = identifyReadinessGaps(competencies);

  // Recommendations: collect and deduplicate recommendations
  const recommendations: ReadinessRecommendation[] = [];
  for (const c of competencies) {
    if (c.recommendation && !recommendations.some((r) => r.id === c.recommendation!.id)) {
      recommendations.push(c.recommendation);
    }
  }
  recommendations.sort((a, b) => a.priority - b.priority);

  const comparisons = skipComparisons ? undefined : compareTargetProfiles(evidenceMap);

  return {
    profile,
    companyEmphasis,
    overallAlignment,
    totalCompetencies,
    assessedCount,
    alignedCount,
    developingCount,
    needsAttentionCount,
    unassessedCount,
    insufficientEvidenceCount,
    coreCoveragePercentage,
    domainSummaries,
    competencies,
    gaps,
    recommendations,
    trajectory,
    comparisons,
    evaluatedAt: now.toISOString(),
    policyVersion: READINESS_POLICY_VERSION,
  };
}

/**
 * Legacy pure function preserved for backwards compatibility with tests/unit/domain.test.ts
 */
export function calculateReadinessScore(factors: InterviewReadinessFactors): number {
  const roadmapScore = factors.roadmapCompletionRate * 40;
  const accuracyScore = factors.overallAccuracyRate * 35;
  const consistencyScore = (Math.min(factors.consistencyStreakDays, 30) / 30) * 15;
  const backlogPenalty = Math.min(factors.revisionBacklogCount * 1.5, 10);

  const rawScore = roadmapScore + accuracyScore + consistencyScore - backlogPenalty;
  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

