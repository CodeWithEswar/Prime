/**
 * PRIME Weakness Intelligence Engine — Improvement Ranking & Recommendations
 *
 * Deterministic ranking separating Weakness Severity (how hard the struggle is)
 * from Improvement Priority (how urgently it should be addressed).
 */

import type {
  ImprovementRecommendation,
  StageWeaknessResult,
  TopicWeaknessResult,
} from "./types";

export interface ImprovementRankingInput {
  topics: TopicWeaknessResult[];
  stages?: StageWeaknessResult[];
  currentStageSequence?: number;
  scheduledProblemIds?: Set<string>;
  prerequisiteTopicIds?: Set<string>;
}

export interface RankedImprovementResult {
  rankedTopics: TopicWeaknessResult[];
  topPriorities: TopicWeaknessResult[];
  dedupedRecommendations: ImprovementRecommendation[];
}

export function rankImprovementCandidates(
  input: ImprovementRankingInput
): RankedImprovementResult {
  const {
    topics,
    currentStageSequence = 1,
    scheduledProblemIds = new Set<string>(),
    prerequisiteTopicIds = new Set<string>(),
  } = input;

  const scoredTopics = topics.map((topic) => {
    // Untouched topics have no weakness priority
    if (topic.status === "not_assessed") {
      return { topic, priorityScore: -1000 };
    }

    const severity = topic.severity ?? 0;

    // Confidence weighting
    let confidenceWeight = 10;
    if (topic.confidence === "high") confidenceWeight = 25;
    else if (topic.confidence === "moderate") confidenceWeight = 20;
    else if (topic.confidence === "low") confidenceWeight = 12;
    else confidenceWeight = 5;

    // Status urgency
    let statusUrgency = 0;
    if (topic.status === "persistent") statusUrgency = 35;
    else if (topic.status === "needs_attention") statusUrgency = 25;
    else if (topic.status === "improving") statusUrgency = 10;
    else if (topic.status === "emerging") statusUrgency = 5;
    else if (topic.status === "stable") statusUrgency = -50;

    // Prerequisite importance: foundational topics take precedence over downstream topics
    const isPrerequisite = prerequisiteTopicIds.has(topic.topicId) || prerequisiteTopicIds.has(topic.topicSlug);
    const prerequisiteBonus = isPrerequisite ? 20 : 0;

    // Proximity to current roadmap progression (earlier stages prioritized over far-future)
    const proximityScore = Math.max(0, 15 - Math.abs(currentStageSequence - 1) * 2);

    const priorityScore =
      severity * 0.35 +
      confidenceWeight +
      statusUrgency +
      prerequisiteBonus +
      proximityScore;

    return { topic, priorityScore };
  });

  // Sort descending by priority score
  scoredTopics.sort((a, b) => b.priorityScore - a.priorityScore);

  const rankedTopics = scoredTopics.map(({ topic }, index) => ({
    ...topic,
    priorityRank: index + 1,
  }));

  // Top priorities are topics that actually need attention or are persistent
  const topPriorities = rankedTopics.filter(
    (t) => t.status === "needs_attention" || t.status === "persistent" || (t.status === "improving" && (t.severity ?? 0) > 40)
  );

  // Collect and deduplicate recommendations, excluding already scheduled work
  const dedupedRecommendations: ImprovementRecommendation[] = [];
  const seenTargets = new Set<string>();

  for (const topic of rankedTopics) {
    for (const rec of topic.recommendations) {
      if (scheduledProblemIds.has(rec.targetId)) {
        continue; // Already scheduled in Today / daily plan
      }
      const key = `${rec.action}:${rec.targetId}`;
      if (!seenTargets.has(key)) {
        seenTargets.add(key);
        dedupedRecommendations.push(rec);
      }
    }
  }

  // Sort recommendations by priority (1 is highest)
  dedupedRecommendations.sort((a, b) => a.priority - b.priority);

  return {
    rankedTopics,
    topPriorities,
    dedupedRecommendations,
  };
}

