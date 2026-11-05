import type { AttemptOutcome, UserProblemStatus } from "@/domain/attempts/types";
import type { MasteryLevel, ProblemMasteryResult } from "@/domain/mastery";

export type { AttemptOutcome, UserProblemStatus };

export type ProblemDifficulty = "easy" | "medium" | "hard";

export type CompanyWindow =
  "thirty_days" | "three_months" | "six_months" | "more_than_six_months" | "all_time";

export type PracticeSort =
  "recommended" | "difficulty_asc" | "difficulty_desc" | "title_asc" | "frequency_desc";

export interface ProblemTopicSummary {
  id: string;
  slug: string;
  name: string;
  problemCount?: number;
}

export interface ProblemCollectionSummary {
  id: string;
  slug: string;
  name: string;
  problemCount?: number;
  position?: number | null;
  section?: string | null;
}

export interface ProblemCompanyRelevance {
  companySlug: string;
  companyName: string;
  frequency: number;
  timeWindow: CompanyWindow;
}

export interface CatalogProblemItem {
  id: string;
  slug: string;
  title: string;
  difficulty: ProblemDifficulty;
  externalUrl: string | null;
  acceptanceRate: number | null;
  primePriority: string;
  primaryTopic: ProblemTopicSummary | null;
  collectionCount: number;
  collections?: ProblemCollectionSummary[];
  companyRelevance?: ProblemCompanyRelevance | null;
  status: UserProblemStatus;
  lastAttemptAt: string | null;
  nextRevisionAt: string | null;
  isRevisionDue: boolean;
  isRevisionOverdue: boolean;
  masteryScore: number;
  masteryLevel?: MasteryLevel;
}

export interface ProblemDetail extends CatalogProblemItem {
  leetcodeSlug: string | null;
  estimatedMinutes: number | null;
  allTopics: ProblemTopicSummary[];
  companies: ProblemCompanyContext[];
  attemptHistory: ProblemAttemptRecord[];
  attemptCount: number;
  revision: ProblemRevisionState | null;
  reviewHistory: ProblemReviewRecord[];
  unavailable: string[];
  mastery?: ProblemMasteryResult;
  notes?: string | null;
}

export interface ProblemCompanyContext {
  slug: string;
  name: string;
  logoUrl?: string | null;
  windows: {
    window: CompanyWindow;
    frequency: number | null;
    sourceName: string | null;
  }[];
}
export interface ProblemRevisionState {
  id: string;
  intervalDays: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  status: string;
}
export interface ProblemReviewRecord {
  id: string;
  rating: "forgot" | "hard" | "okay" | "easy";
  reviewedAt: string;
  previousIntervalDays: number;
  nextIntervalDays: number;
}

export interface ProblemAttemptRecord {
  id: string;
  outcome: AttemptOutcome;
  timeTakenSeconds: number;
  confidence: number;
  notes: string | null;
  attemptedAt: string;
}

export interface UserPracticeSummary {
  totalSolved: number;
  totalAttempted: number;
  totalNeedsRevision: number;
  totalMastered: number | null;
  revisionDueCount: number;
  topicProgress: Record<string, { solved: number; total: number }>;
}

export interface PracticeCatalogFilter {
  q?: string;
  topic?: string;
  difficulty?: ProblemDifficulty | "";
  status?: UserProblemStatus | "";
  collection?: string;
  company?: string;
  window?: CompanyWindow | "";
  revision?: "due" | "overdue" | "";
  sort?: PracticeSort;
  page?: number;
  pageSize?: number;
  userId?: string;
}

export interface PracticeCatalogResult {
  problems: CatalogProblemItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
