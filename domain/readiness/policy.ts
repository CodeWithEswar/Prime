/**
 * PRIME Interview Readiness Engine — Evaluation Policy
 *
 * Deterministic policy rules mapping verified evidence into coverage,
 * confidence, and readiness alignment classifications.
 */

import type {
  CompetencyEvidenceInput,
  EvidenceConfidence,
  EvidenceCoverage,
  ProfileCompetencyRequirement,
  ReadinessStatus,
} from "./types";

export const READINESS_POLICY_VERSION = "1.0.0";

export function evaluateCoverage(
  evidence: CompetencyEvidenceInput,
  requirement: ProfileCompetencyRequirement
): EvidenceCoverage {
  const targetProblems = requirement.targetProblemsCount ?? 4;
  if (evidence.attemptedProblemsCount === 0) {
    return "none";
  }
  if (evidence.attemptedProblemsCount < Math.ceil(targetProblems * 0.4)) {
    return "limited";
  }
  return "sufficient";
}

export function evaluateConfidence(evidence: CompetencyEvidenceInput): EvidenceConfidence {
  if (evidence.totalAttempts === 0 && evidence.totalRevisions === 0) {
    return "insufficient";
  }
  if (evidence.attemptedProblemsCount <= 1) {
    if (evidence.totalAttempts <= 1) return "insufficient";
    return "low";
  }
  if (
    evidence.attemptedProblemsCount >= 3 &&
    evidence.totalAttempts >= 5 &&
    evidence.totalRevisions >= 1
  ) {
    return "high";
  }
  if (evidence.attemptedProblemsCount >= 2 && evidence.totalAttempts >= 3) {
    return "moderate";
  }
  return "low";
}

export function evaluateReadinessStatus(
  evidence: CompetencyEvidenceInput,
  coverage: EvidenceCoverage,
  confidence: EvidenceConfidence
): ReadinessStatus {
  // If no attempts or reviews exist
  if (coverage === "none" || evidence.totalAttempts === 0) {
    return "not_assessed";
  }

  // Very sparse initial attempt
  if (evidence.totalAttempts <= 1 && evidence.attemptedProblemsCount <= 1) {
    return "insufficient_evidence";
  }

  // Active weakness signal from Weakness Engine or severe retention decay
  const hasSevereRetentionDecay =
    evidence.forgotRevisions >= 2 && evidence.forgotRevisions > evidence.successfulRevisions;

  if (evidence.hasWeaknessSignal || hasSevereRetentionDecay) {
    return "needs_attention";
  }

  // Aligned: sufficient coverage, good independence, verified retention
  const isAligned =
    coverage === "sufficient" &&
    evidence.independentSolvedCount >= 2 &&
    (evidence.masteryScore ?? 0) >= 55 &&
    evidence.forgotRevisions === 0 &&
    confidence !== "insufficient";

  if (isAligned) {
    return "evidence_aligned";
  }

  return "developing";
}

