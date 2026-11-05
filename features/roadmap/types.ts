import type {
  Curriculum,
  CurriculumStage,
  CurriculumItem,
  CurriculumDependency,
  CurriculumProgressSummary,
  StageProgressSummary,
  CurriculumNextRecommendation,
  ProblemProgressStatus,
} from "@/domain/curriculum/types";

export type RoadmapFilter = "all" | "current" | "completed" | "revision_due";

export interface RoadmapProblemItem extends CurriculumItem {
  userStatus: ProblemProgressStatus;
  isRevisionDue: boolean;
  masteryLevel?: import("@/domain/mastery").MasteryLevel;
  prerequisites: Array<{
    problemTitle: string;
    problemSlug: string;
    isSatisfied: boolean;
  }>;
}

export interface RoadmapStageData extends StageProgressSummary {
  description: string | null;
  items: RoadmapProblemItem[];
}

export interface FundamentalsCourseStatus {
  course: "dbms" | "os" | "cn" | "oop";
  title: string;
  label: string;
  slug: string;
  href: string;
  enrolled: boolean;
  completedDays: number;
  totalDays: number;
  watchedVideos: number;
  totalVideos: number;
  progressPercentage: number;
}

export interface RoadmapDashboardData {
  curriculum: Curriculum;
  stages: RoadmapStageData[];
  progress: CurriculumProgressSummary;
  nextRecommendation: CurriculumNextRecommendation | null;
  currentStageId: string | null;
  fundamentals?: FundamentalsCourseStatus[];
}

