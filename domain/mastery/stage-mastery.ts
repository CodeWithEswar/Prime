/**
 * PRIME Stage Mastery Aggregator
 *
 * Aggregates topic and problem masteries across a curriculum stage.
 */

import type {
  StageMasteryResult,
  TopicMasteryResult,
  MasteryLevel,
} from "./types";
import type { CurriculumStage } from "@/domain/curriculum/types";

export interface StageAggregationInput {
  stage: CurriculumStage;
  topicResults: TopicMasteryResult[];
}

export function calculateStageMastery(
  input: StageAggregationInput
): StageMasteryResult {
  const { stage, topicResults } = input;

  let totalRequired = 0;
  let masteredCount = 0;
  let proficientCount = 0;
  let practicedCount = 0;
  let learningCount = 0;
  let exposedCount = 0;
  let totalScoreWeight = 0;
  let scoreSum = 0;

  for (const topic of topicResults) {
    totalRequired += topic.requiredProblems;
    masteredCount += topic.masteredProblems;
    proficientCount += topic.proficientProblems;
    practicedCount += topic.practicedProblems;
    learningCount += topic.levelDistribution.learning;
    exposedCount += topic.levelDistribution.exposed;

    const topicWeight = Math.max(1, topic.requiredProblems);
    scoreSum += topic.score * topicWeight;
    totalScoreWeight += topicWeight;
  }

  const finalScore =
    totalScoreWeight > 0 ? Math.round((scoreSum / totalScoreWeight) * 10) / 10 : 0;

  let level: MasteryLevel = "unseen";
  const attemptedCount = practicedCount + learningCount;

  if (totalRequired === 0 || attemptedCount + exposedCount === 0) {
    level = "unseen";
  } else if (finalScore >= 85 && masteredCount >= Math.ceil(totalRequired * 0.5)) {
    level = "mastered";
  } else if (finalScore >= 70 && (masteredCount + proficientCount) >= Math.ceil(totalRequired * 0.4)) {
    level = "proficient";
  } else if (finalScore >= 50 && practicedCount >= Math.ceil(totalRequired * 0.25)) {
    level = "practiced";
  } else if (finalScore >= 25 || attemptedCount > 0) {
    level = "learning";
  } else {
    level = "exposed";
  }

  return {
    stageId: stage.id,
    stageSlug: stage.slug,
    stageName: stage.name,
    sequence: stage.sequence,
    level,
    score: finalScore,
    totalRequired,
    masteredCount,
    proficientCount,
    practicedCount,
    learningCount,
    topics: topicResults,
  };
}

