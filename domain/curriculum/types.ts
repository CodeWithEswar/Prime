/**
 * PRIME Curriculum Domain Types
 * Core interfaces for Curricula, Stages, Items, Dependencies, and Derived Progress.
 */

export type PriorityLevel = "P0" | "P1" | "P2";

export type DependencyType = "required" | "recommended";

export type CurriculumStatus = "draft" | "published" | "archived";

export interface Curriculum {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  version: string;
  status: CurriculumStatus;
  estimatedProblemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumStage {
  id: string;
  curriculumId: string;
  slug: string;
  name: string;
  description: string | null;
  sequence: number;
  estimatedProblemCount: number;
  estimatedMinutes: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurriculumItem {
  id: string;
  curriculumId: string;
  stageId: string;
  problemId: string;
  sequence: number;
  priority: PriorityLevel;
  recommendedMinutes: number;
  isRequired: boolean;
  isCheckpoint: boolean;
  selectionReason: string;
  createdAt?: string;
  updatedAt?: string;
  // Joined problem details
  problemSlug?: string;
  title?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  source?: string;
  externalUrl?: string | null;
  primaryTopicName?: string;
}

export interface CurriculumDependency {
  id?: string;
  curriculumId: string;
  prerequisiteItemId: string;
  dependentItemId: string;
  dependencyType: DependencyType;
  createdAt?: string;
}

export type ProblemProgressStatus =
  | "not_started"
  | "attempted"
  | "solved"
  | "needs_revision"
  | "mastered";

export interface UserProblemState {
  status: ProblemProgressStatus;
  masteryScore?: number;
  lastAttemptAt?: string | null;
  nextRevisionAt?: string | null;
  isRevisionDue?: boolean;
}

export interface CurriculumProgressSummary {
  totalRequired: number;
  completedRequired: number;
  totalOptional: number;
  completedOptional: number;
  totalAttempted: number;
  revisionDueCount: number;
  remainingRequiredCount: number;
  completionPercentage: number;
}

export interface StageProgressSummary {
  stageId: string;
  stageSlug: string;
  stageName: string;
  sequence: number;
  totalRequired: number;
  completedRequired: number;
  totalProblems: number;
  completedProblems: number;
  revisionDueCount: number;
  completionPercentage: number;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface CurriculumNextRecommendation {
  item: CurriculumItem;
  stage: CurriculumStage;
  reason: "next_in_sequence" | "current_stage_continuation" | "prerequisites_satisfied";
}

export interface DAGValidationResult {
  isValid: boolean;
  cycles: string[][];
  missingPrerequisites: Array<{ dependentId: string; prerequisiteId: string }>;
  selfDependencies: string[];
  invertedSequences: Array<{ dependentId: string; prerequisiteId: string }>;
  errors: string[];
}

