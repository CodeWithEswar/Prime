/**
 * PRIME Mastery Intelligence Engine — Domain Types
 *
 * Deterministic, evidence-based mastery modeling across canonical DSA problems,
 * curriculum topics, and stages.
 */

export type MasteryLevel =
  | "unseen"
  | "exposed"
  | "learning"
  | "practiced"
  | "proficient"
  | "mastered";

export type MasteryFreshness = "fresh" | "aging" | "stale";

export type ProblemDifficulty = "EASY" | "MEDIUM" | "HARD";

export type AttemptOutcome =
  | "independent"
  | "hint"
  | "solution_viewed"
  | "unsolved";

export type RevisionRating = "forgot" | "hard" | "okay" | "easy";

export interface AttemptRecord {
  id?: string;
  outcome: AttemptOutcome;
  timeTakenSeconds: number;
  confidence: number; // 1 to 5
  attemptedAt: Date | string;
}

export interface RevisionRecord {
  id?: string;
  rating: RevisionRating;
  previousIntervalDays: number;
  nextIntervalDays: number;
  reviewedAt: Date | string;
}

export interface ProblemEvidenceInput {
  problemId: string;
  difficulty: ProblemDifficulty;
  targetTimeMinutes?: number | null;
  attempts: AttemptRecord[];
  revisions: RevisionRecord[];
}

export interface MasteryEvidenceDimensions {
  independence: number; // 0 - 100
  retention: number; // 0 - 100
  repetition: number; // 0 - 100
  timing: number | null; // 0 - 100 or null if no duration/target
  hintIndependence: number; // 0 - 100
  confidenceCalibration: number | null; // 0 - 100 or null if no confidence
  recency: number; // 0 - 100
}

export interface MasteryRequirementsBreakdown {
  independentEvidenceCount: number;
  successfulRevisionCount: number;
  longestSuccessfulIntervalDays: number;
  totalAttemptCount: number;
  hasRecentForgot: boolean;
}

export type MasteryBlockerCode =
  | "NO_INDEPENDENT_SOLVE"
  | "NO_RETENTION_EVIDENCE"
  | "RECENT_FORGOT"
  | "HIGH_HINT_DEPENDENCY"
  | "INSUFFICIENT_REPETITION"
  | "SHORT_INTERVAL_RETENTION"
  | "STALE_EVIDENCE";

export interface MasteryBlocker {
  code: MasteryBlockerCode;
  label: string;
  detail: string;
}

export type MasteryStrengthCode =
  | "REPEATED_INDEPENDENT_SOLVES"
  | "LONG_INTERVAL_RETENTION"
  | "STRONG_RETENTION"
  | "CONSISTENT_TIMING"
  | "GOOD_CONFIDENCE_CALIBRATION"
  | "RECENT_EVIDENCE";

export interface MasteryStrength {
  code: MasteryStrengthCode;
  label: string;
  detail: string;
}

export interface ProblemMasteryResult {
  problemId: string;
  level: MasteryLevel;
  score: number; // 0.0 - 100.0
  evidence: MasteryEvidenceDimensions;
  requirements: MasteryRequirementsBreakdown;
  freshness: MasteryFreshness;
  lastEvidenceAt: Date | null;
  blockers: MasteryBlocker[];
  strengths: MasteryStrength[];
  nextEvidence: string;
  policyVersion: number;
}

export interface TopicEvidenceCoverage {
  practicedCount: number;
  totalCount: number;
  percentage: number;
}

export interface TopicMasteryResult {
  topicId: string;
  topicSlug: string;
  topicName: string;
  level: MasteryLevel;
  score: number;
  requiredProblems: number;
  practicedProblems: number;
  masteredProblems: number;
  proficientProblems: number;
  evidenceCoverage: TopicEvidenceCoverage;
  levelDistribution: Record<MasteryLevel, number>;
  strengths: string[];
  blockers: string[];
  problemMasteries: ProblemMasteryResult[];
}

export interface StageMasteryResult {
  stageId: string;
  stageSlug: string;
  stageName: string;
  sequence: number;
  level: MasteryLevel;
  score: number;
  totalRequired: number;
  masteredCount: number;
  proficientCount: number;
  practicedCount: number;
  learningCount: number;
  topics: TopicMasteryResult[];
}

export interface OverallMasteryResult {
  level: MasteryLevel;
  score: number;
  totalCoreProblems: number;
  masteredCount: number;
  proficientCount: number;
  practicedCount: number;
  learningCount: number;
  exposedCount: number;
  unseenCount: number;
  stages: StageMasteryResult[];
  lastCalculatedAt: Date;
  policyVersion: number;
}

/**
 * Weakness Intelligence Engine Contract
 * Exposes a structured signal consumed by the Weakness Engine.
 */
export interface MasterySignal {
  entityId: string;
  entityType: "problem" | "topic";
  level: MasteryLevel;
  score: number;
  blockers: MasteryBlocker[];
  freshness: MasteryFreshness;
}
