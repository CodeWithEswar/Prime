/**
 * PRIME Interview Readiness Engine — Domain Types
 *
 * Deterministic assessment of preparation evidence against target role competencies.
 * Readiness is an evidence alignment assessment, NOT a hiring probability prediction.
 */

export type ReadinessStatus =
  | "not_assessed"
  | "insufficient_evidence"
  | "developing"
  | "needs_attention"
  | "evidence_aligned";

export type CompetencyDomain = "dsa" | "fundamentals" | "aptitude" | "mock";

export type EvidenceCoverage = "none" | "limited" | "sufficient";

export type EvidenceConfidence = "insufficient" | "low" | "moderate" | "high";

export type CompetencyImportance = "core" | "supporting" | "optional";

export type ReadinessGapType =
  | "unassessed"
  | "limited_evidence"
  | "performance_gap"
  | "retention_gap"
  | "coverage_gap";

export interface CompetencyDefinition {
  id: string;
  slug: string;
  name: string;
  domain: CompetencyDomain;
  description: string;
  relatedTopicSlugs: string[];
  prerequisiteCompetencyIds?: string[];
}

export interface ProfileCompetencyRequirement {
  competencyId: string;
  importance: CompetencyImportance;
  targetProblemsCount?: number;
}

export interface ReadinessTargetProfile {
  id: string;
  name: string;
  description: string;
  version: string;
  competencies: ProfileCompetencyRequirement[];
}

export interface CompetencyEvidenceInput {
  competencyId: string;
  domain: CompetencyDomain;
  totalProblemsCount: number;
  attemptedProblemsCount: number;
  independentSolvedCount: number;
  hintAssistedCount: number;
  totalAttempts: number;
  totalRevisions: number;
  successfulRevisions: number;
  forgotRevisions: number;
  masteryScore: number | null;
  hasWeaknessSignal: boolean;
  weaknessReason?: string;
  algorithmLabSlug?: string;
}

export interface ReadinessRecommendation {
  id: string;
  action: string;
  title: string;
  description: string;
  reason: string;
  estimatedMinutes: number;
  priority: number; // 1 = highest
  planWorkParams?: {
    source: "problem" | "core" | "revision" | "lab" | "custom";
    problemSlug?: string;
    stageSlug?: string;
    title: string;
  };
}

export interface CompetencyReadiness {
  competencyId: string;
  name: string;
  slug: string;
  domain: CompetencyDomain;
  importance: CompetencyImportance;
  status: ReadinessStatus;
  coverage: EvidenceCoverage;
  confidence: EvidenceConfidence;
  score: number | null; // 0 - 100 evidence alignment, null if not_assessed
  summary: string;
  supportingEvidence: string[];
  missingEvidence: string[];
  blockers: string[];
  recommendation?: ReadinessRecommendation;
  algorithmLabSlug?: string;
  evaluatedAt: string;
}

export interface ReadinessGap {
  id: string;
  competencyId: string;
  competencyName: string;
  domain: CompetencyDomain;
  gapType: ReadinessGapType;
  importance: CompetencyImportance;
  title: string;
  description: string;
  recommendedAction: string;
  actionType:
    | "practice_dsa"
    | "complete_revision"
    | "take_assessment"
    | "schedule_mock"
    | "review_prerequisite"
    | "plan_work";
  targetSlug?: string;
  urgency: number; // 1 = highest
}

export interface DomainReadinessSummary {
  total: number;
  assessed: number;
  aligned: number;
  status: ReadinessStatus;
}

export interface CompanyEmphasis {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description: string;
  priorityCompetencyIds: string[];
}

export interface TrajectoryDataPoint {
  date: string;
  assessedCompetencies: number;
  alignedCompetencies: number;
  cumulativeAttempts: number;
}

export interface TargetComparisonItem {
  profileId: string;
  profileName: string;
  totalCore: number;
  alignedCore: number;
  coveragePercent: number;
  overallAlignment: ReadinessStatus;
}

export interface TargetReadinessResult {
  profile: ReadinessTargetProfile;
  companyEmphasis?: CompanyEmphasis | null;
  overallAlignment: ReadinessStatus;
  totalCompetencies: number;
  assessedCount: number;
  alignedCount: number;
  developingCount: number;
  needsAttentionCount: number;
  unassessedCount: number;
  insufficientEvidenceCount: number;
  coreCoveragePercentage: number;
  domainSummaries: Record<CompetencyDomain, DomainReadinessSummary>;
  competencies: CompetencyReadiness[];
  gaps: ReadinessGap[];
  recommendations: ReadinessRecommendation[];
  trajectory?: TrajectoryDataPoint[];
  comparisons?: TargetComparisonItem[];
  evaluatedAt: string;
  policyVersion: string;
}

/**
 * Legacy interface preserved for backwards compatibility with tests/unit/domain.test.ts
 */
export interface InterviewReadinessFactors {
  roadmapCompletionRate: number; // 0.0 - 1.0
  overallAccuracyRate: number; // 0.0 - 1.0
  consistencyStreakDays: number;
  revisionBacklogCount: number;
}
