/**
 * PRIME Weakness Intelligence Engine — Curriculum Stage Diagnostic
 *
 * Deterministic aggregation of topic diagnostics into PRIME Core curriculum stages.
 */

import type {
  DiagnosticStatus,
  EvidenceConfidence,
  ImprovementRecommendation,
  StageWeaknessResult,
  TopicWeaknessResult,
} from "./types";

export interface StageDiagnosticInput {
  stageId: string;
  stageSlug: string;
  stageName: string;
  sequence: number;
  topics: TopicWeaknessResult[];
}

export function calculateStageWeakness(
  input: StageDiagnosticInput,
  policyVersion = "1.0.0",
  now: Date = new Date()
): StageWeaknessResult {
  const { stageId, stageSlug, stageName, sequence, topics } = input;

  const assessedTopics = topics.filter((t) => t.status !== "not_assessed");
  const assessedCount = assessedTopics.length;

  if (assessedCount === 0) {
    return {
      stageId,
      stageSlug,
      stageName,
      sequence,
      status: "not_assessed",
      score: null,
      confidence: "insufficient",
      priorityRank: 999,
      primaryReason: "No topics attempted in this curriculum stage yet.",
      topics,
      recommendations: [],
      calculatedAt: now.toISOString(),
      policyVersion,
    };
  }

  const scores = assessedTopics
    .map((t) => t.score)
    .filter((s): s is number => s !== null);
  const averageScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  const needsAttentionTopics = assessedTopics.filter(
    (t) => t.status === "needs_attention" || t.status === "persistent"
  );
  const persistentTopics = assessedTopics.filter((t) => t.status === "persistent");
  const improvingTopics = assessedTopics.filter((t) => t.status === "improving");

  let status: DiagnosticStatus = "emerging";
  let primaryReason = `Evaluating progress across ${assessedCount} stage topics.`;

  if (persistentTopics.length > 0) {
    status = "persistent";
    primaryReason = `${persistentTopics.map((t) => t.topicName).join(", ")} show chronic difficulty.`;
  } else if (needsAttentionTopics.length > 0) {
    status = "needs_attention";
    primaryReason = `${needsAttentionTopics.map((t) => t.topicName).join(", ")} need focused attention.`;
  } else if (improvingTopics.length > 0) {
    status = "improving";
    primaryReason = `Demonstrating positive recovery across ${stageName}.`;
  } else if (assessedTopics.every((t) => t.status === "stable")) {
    status = "stable";
    primaryReason = `All assessed topics in ${stageName} are stable.`;
  }

  // Derive confidence from assessed topics
  let confidence: EvidenceConfidence = "low";
  if (assessedTopics.some((t) => t.confidence === "high")) {
    confidence = "high";
  } else if (assessedTopics.some((t) => t.confidence === "moderate")) {
    confidence = "moderate";
  }

  // Aggregate recommendations
  const recommendations: ImprovementRecommendation[] = [];
  for (const t of topics) {
    for (const rec of t.recommendations) {
      if (!recommendations.some((r) => r.id === rec.id)) {
        recommendations.push(rec);
      }
    }
  }

  return {
    stageId,
    stageSlug,
    stageName,
    sequence,
    status,
    score: averageScore,
    confidence,
    priorityRank: 999,
    primaryReason,
    topics,
    recommendations,
    calculatedAt: now.toISOString(),
    policyVersion,
  };
}

