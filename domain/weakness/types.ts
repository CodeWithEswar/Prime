/**
 * PRIME Weakness Intelligence Engine — Domain Types
 *
 * Deterministic, evidence-based diagnostic modeling across canonical DSA problems,
 * curriculum topics, and stages.
 */

export type DiagnosticStatus =
  | "not_assessed"
  | "emerging"
  | "needs_attention"
  | "persistent"
  | "improving"
  | "stable";

export type EvidenceConfidence =
  | "insufficient"
  | "low"
  | "moderate"
  | "high";

export type ProblemDifficulty = "EASY" | "MEDIUM" | "HARD";

export type AttemptOutcome =
  | "independent"
  | "hint"
  | "solution_viewed"
  | "unsolved";

export type RevisionRating = "forgot" | "hard" | "okay" | "easy";

export type WeaknessReasonCode =
  | "REPEATED_FAILURE"
  | "HIGH_HINT_DEPENDENCY"
  | "SOLUTION_DEPENDENCY"
  | "TIME_INEFFICIENCY"
  | "REVISION_FAILURE"
  | "RETENTION_REGRESSION"
  | "INSUFFICIENT_EVIDENCE"
  | "LIMITED_PROBLEM_COVERAGE"
  | "RECENT_IMPROVEMENT"
  | "STALE_EVIDENCE"
  | "INDEPENDENCE_IMPROVING";

export type ImprovementAction =
  | "RETRY_PROBLEM"
  | "PRACTICE_SIMILAR"
  | "REVIEW_PREREQUISITE"
  | "COMPLETE_REVISION"
  | "PRACTICE_INDEPENDENTLY"
  | "REVIEW_ALGORITHM"
  | "STUDY_CONCEPT"
  | "ASSESS_TOPIC";

export interface AttemptEvidence {
  id?: string;
  outcome: AttemptOutcome;
  timeTakenSeconds?: number | null;
  confidence?: number | null; // 1 to 5
  attemptedAt: Date | string;
}

export interface RevisionEvidence {
  id?: string;
  rating: RevisionRating;
  previousIntervalDays?: number;
  nextIntervalDays?: number;
  reviewedAt: Date | string;
}

export interface ProblemDiagnosticInput {
  problemId: string;
  problemSlug: string;
  problemTitle: string;
  difficulty: ProblemDifficulty;
  targetTimeMinutes?: number | null;
  attempts: AttemptEvidence[];
  revisions: RevisionEvidence[];
  primaryTopicId?: string;
  primaryTopicSlug?: string;
  primaryTopicName?: string;
  masteryScore?: number | null;
  isRevisionDue?: boolean;
}

export interface WeaknessDimensions {
  failure: number | null; // 0.0 - 1.0 (normalized failure signal)
  hints: number | null; // 0.0 - 1.0 (hint and solution dependency)
  timing: number | null; // 0.0 - 1.0 (time inefficiency ratio)
  retention: number | null; // 0.0 - 1.0 (retention decay/failure)
}

export interface WeaknessEvidenceSummary {
  totalAttempts: number;
  successfulAttempts: number;
  independentSolves: number;
  hintAssistedCount: number;
  solutionViewedCount: number;
  unsolvedCount: number;
  averageTimeTakenSeconds: number | null;
  targetTimeSeconds: number | null;
  totalRevisions: number;
  forgotRevisions: number;
  hardRevisions: number;
  okayOrEasyRevisions: number;
  distinctProblemsCount: number;
  lastAttemptAt: string | null;
  lastRevisionAt: string | null;
}

export interface ImprovementRecommendation {
  id: string;
  action: ImprovementAction;
  targetType: "problem" | "topic" | "stage" | "lab";
  targetId: string;
  targetTitle: string;
  targetSlug: string;
  reason: string;
  reasonCode: WeaknessReasonCode;
  estimatedMinutes: number;
  priority: number; // 1 = highest priority
  evidenceNeeded: string;
  algorithmLabSlug?: string;
  prerequisiteOf?: string;
}

export interface ProblemWeaknessResult {
  problemId: string;
  problemSlug: string;
  problemTitle: string;
  difficulty: ProblemDifficulty;
  status: DiagnosticStatus;
  score: number | null; // 0 - 100 weakness score (null if not_assessed)
  confidence: EvidenceConfidence;
  dimensions: WeaknessDimensions;
  reasonCodes: WeaknessReasonCode[];
  primaryReason: string;
  secondaryReason?: string;
  evidenceSummary: WeaknessEvidenceSummary;
  recommendations: ImprovementRecommendation[];
  calculatedAt: string;
  policyVersion: string;
}

export interface TopicWeaknessResult {
  topicId: string;
  topicSlug: string;
  topicName: string;
  status: DiagnosticStatus;
  score: number | null; // 0 - 100 severity score
  confidence: EvidenceConfidence;
  severity: number | null; // 0 - 100 (how strong the struggle is)
  priorityRank: number; // 1 = most urgent improvement area
  dimensions: WeaknessDimensions;
  reasonCodes: WeaknessReasonCode[];
  primaryReason: string;
  secondaryReason?: string;
  evidenceSummary: WeaknessEvidenceSummary;
  problemCount: number;
  assessedProblemCount: number;
  problemResults: ProblemWeaknessResult[];
  recommendations: ImprovementRecommendation[];
  algorithmLabSlug?: string;
  calculatedAt: string;
  policyVersion: string;
}

export interface StageWeaknessResult {
  stageId: string;
  stageSlug: string;
  stageName: string;
  sequence: number;
  status: DiagnosticStatus;
  score: number | null;
  confidence: EvidenceConfidence;
  priorityRank: number;
  primaryReason: string;
  topics: TopicWeaknessResult[];
  recommendations: ImprovementRecommendation[];
  calculatedAt: string;
  policyVersion: string;
}

export interface WeaknessOverviewSummary {
  totalAssessedTopics: number;
  needsAttentionCount: number;
  persistentCount: number;
  improvingCount: number;
  stableCount: number;
  notAssessedCount: number;
}

export interface WeaknessOverviewResult {
  summary: WeaknessOverviewSummary;
  topPriorities: TopicWeaknessResult[];
  allTopics: TopicWeaknessResult[];
  stages: StageWeaknessResult[];
  allRecommendations: ImprovementRecommendation[];
  calculatedAt: string;
  policyVersion: string;
}
