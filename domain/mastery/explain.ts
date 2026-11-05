/**
 * PRIME Mastery Intelligence Engine — Explainability
 *
 * Deterministic explanation generators answering:
 * "Why is this skill at this level?", "What evidence is strong?", and
 * "What specific evidence is needed next?"
 */

import type {
  ProblemMasteryResult,
  TopicMasteryResult,
  MasteryLevel,
} from "./types";

export interface MasteryExplanation {
  levelTitle: string;
  summary: string;
  strengths: string[];
  blockers: string[];
  nextAction: string;
}

export function formatMasteryLevel(level: MasteryLevel): string {
  switch (level) {
    case "mastered":
      return "Mastered";
    case "proficient":
      return "Proficient";
    case "practiced":
      return "Practiced";
    case "learning":
      return "Learning";
    case "exposed":
      return "Exposed";
    case "unseen":
    default:
      return "Unseen";
  }
}

export function explainProblemMastery(result: ProblemMasteryResult): MasteryExplanation {
  const levelTitle = formatMasteryLevel(result.level);
  let summary = "";

  switch (result.level) {
    case "mastered":
      summary = "Demonstrated repeated independent problem-solving and verified long-interval retention.";
      break;
    case "proficient":
      summary = "Demonstrated independent execution and verified recall. Longer-interval retention needed for Mastered.";
      break;
    case "practiced":
      summary = "Successfully solved with evidence, but requires repeated independent verification and spaced retention.";
      break;
    case "learning":
      summary = "Active practice underway, but assistance reliance or early retention gaps remain.";
      break;
    case "exposed":
      summary = "Problem attempted without successful independent solution.";
      break;
    case "unseen":
    default:
      summary = "No practice or revision evidence recorded yet.";
      break;
  }

  const strengths = result.strengths.map((s) => s.detail);
  const blockers = result.blockers.map((b) => b.detail);

  return {
    levelTitle,
    summary,
    strengths,
    blockers,
    nextAction: result.nextEvidence,
  };
}

export function explainTopicMastery(result: TopicMasteryResult): MasteryExplanation {
  const levelTitle = formatMasteryLevel(result.level);
  const { evidenceCoverage, masteredProblems, proficientProblems } = result;

  const summary = `${evidenceCoverage.practicedCount} of ${evidenceCoverage.totalCount} Core problems demonstrated (${masteredProblems} Mastered, ${proficientProblems} Proficient).`;

  let nextAction = "Continue practicing Core curriculum problems for this pattern.";
  if (result.blockers.length > 0) {
    nextAction = result.blockers[0];
  } else if (result.level === "proficient") {
    nextAction = "Deepen retention on remaining problems to reach full topic mastery.";
  } else if (result.level === "mastered") {
    nextAction = "Maintain retention through scheduled spaced queue reviews.";
  }

  return {
    levelTitle,
    summary,
    strengths: result.strengths,
    blockers: result.blockers,
    nextAction,
  };
}

