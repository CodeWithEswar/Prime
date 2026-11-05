/**
 * PRIME Mastery Feature — Application & UI Types
 */

import type {
  ProblemMasteryResult,
  TopicMasteryResult,
  StageMasteryResult,
  OverallMasteryResult,
} from "@/domain/mastery";

export type MasteryFilter =
  | "all"
  | "learning"
  | "practiced"
  | "proficient"
  | "mastered"
  | "needs_evidence";

export type MasterySort =
  | "curriculum"
  | "lowest_evidence"
  | "highest_evidence"
  | "recent";

export interface CoreProblemMetadata {
  id: string;
  slug: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  recommendedMinutes: number;
  priority: string;
  isRequired: boolean;
  isCheckpoint: boolean;
  topicId: string;
  topicName: string;
  stageId: string;
  stageName: string;
  stageSequence: number;
}

export interface MasteryOverviewData {
  overall: OverallMasteryResult;
  stages: StageMasteryResult[];
  topics: TopicMasteryResult[];
  problemMasteries: ProblemMasteryResult[];
  coreProblemMetadata: Record<string, CoreProblemMetadata>;
  counts: {
    mastered: number;
    proficient: number;
    practiced: number;
    learning: number;
    exposed: number;
    unseen: number;
  };
  totalCoreProblems: number;
  lastCalculatedAt: string;
  policyVersion: number;
}

export interface ProblemMasterySectionData {
  problemId: string;
  problemSlug: string;
  problemTitle: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  targetTimeMinutes: number;
  mastery: ProblemMasteryResult;
}

