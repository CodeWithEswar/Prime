/**
 * PRIME 90-Day Adaptive Preparation Planner — Domain Types
 * Pure domain definitions for capacity planning, deterministic scheduling,
 * automatic rebalancing, and explainability.
 * Framework-independent: zero imports from React, Next.js, or database libraries.
 */

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "skipped"
  | "rescheduled"
  | "carried_forward"
  | "cancelled";

export type TaskType =
  | "dsa_problem"
  | "revision"
  | "custom"
  // Legacy aliases for backward compatibility:
  | "roadmap_concept"
  | "revision_review"
  | "mock_interview"
  | "learn"
  | "practice"
  | "revise"
  | "mock";

export type TaskSource =
  | "planner_generated"
  | "revision_generated"
  | "user_created"
  | "carry_forward"
  | "rescheduled"
  // Legacy aliases:
  | "planner"
  | "user"
  | "revision_queue";

export type TaskPriority = "P0" | "P1" | "P2" | "OPTIONAL";

export type FeasibilityStatus =
  | "comfortable"
  | "on_track"
  | "tight"
  | "at_risk"
  | "infeasible";

export type PlanStatus = "draft" | "active" | "completed" | "archived";

export interface WeekdayRule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  availableMinutes: number;
  isRestDay: boolean;
}

export interface DateException {
  date: string; // YYYY-MM-DD
  availableMinutes: number;
  isUnavailable: boolean;
  reason?: string;
}

export interface PreparationTarget {
  userId: string;
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  timezone: string; // IANA timezone e.g. "Asia/Kolkata"
  targetRole: string;
  defaultDailyCapacityMinutes: number;
  weekdayRules: WeekdayRule[];
  exceptions: DateException[];
  restDays: number[]; // e.g. [0] for Sunday
}

export interface PlanningCandidate {
  id: string; // Unique candidate ID (e.g. curriculum_item.id or revision_item.id)
  taskType: "dsa_problem" | "revision" | "custom";
  problemId?: string;
  problemSlug?: string;
  problemTitle: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  topicId?: string;
  topicSlug?: string;
  topicName?: string;
  stageId?: string;
  stageSequence?: number;
  sequence: number;
  priority: TaskPriority;
  recommendedMinutes: number;
  isCheckpoint?: boolean;
  selectionReason?: string;
  // Prerequisite tracking
  prerequisiteProblemIds: string[];
  // Revision metadata if taskType === "revision"
  revisionItemId?: string;
  revisionIntervalDays?: number;
  revisionDueDate?: string;
  isOverdue?: boolean;
  // History signal
  previousAttemptOutcome?: "independent" | "hint" | "solution_viewed" | "unsolved";
  isAttemptedUnsolved?: boolean;
}

export interface ScoreBreakdown {
  curriculumPriority: number; // 0..1 (weight 0.30)
  sequenceUrgency: number;    // 0..1 (weight 0.20)
  prerequisiteValue: number;  // 0..1 (weight 0.15)
  deadlinePressure: number;   // 0..1 (weight 0.15)
  continuity: number;         // 0..1 (weight 0.10)
  attemptSignal: number;      // 0..1 (weight 0.10)
  totalScore: number;         // 0..1 weighted sum
  reasons: string[];          // Human-readable explainability bullet points
}

export interface PlannedTask {
  id: string;
  dailyPlanId?: string;
  userId: string;
  taskType: TaskType;
  title: string;
  problemId?: string;
  problemSlug?: string;
  topicId?: string;
  topicName?: string;
  curriculumItemId?: string;
  revisionItemId?: string;
  sequence: number;
  plannedMinutes: number;
  completedMinutes: number;
  status: TaskStatus;
  source: TaskSource;
  priority: TaskPriority;
  isLocked: boolean;
  scheduledReason?: string;
  decisionMetadata?: {
    scoreBreakdown?: ScoreBreakdown;
    scheduledStage?: string;
    isOverdueRevision?: boolean;
    carryProvenance?: {
      originalDate: string;
      carriedFromTaskId?: string;
      carryCount: number;
    };
  };
  originalDate?: string;
  carriedFromTaskId?: string;
  carryCount: number;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;

  // Legacy field support for existing tests
  estimatedMinutes?: number;
  orderIndex?: number;
  planId?: string;
  type?: TaskType;
}

export interface PlannedDay {
  id?: string;
  userId: string;
  preparationPlanId?: string;
  planDate: string; // YYYY-MM-DD
  dayNumber: number; // 1-based day index from plan start
  isRestDay: boolean;
  isCommitted: boolean; // First 7 days = committed horizon; beyond = forecast horizon
  availableMinutes: number;
  planningBudgetMinutes: number; // availableMinutes * utilizationTarget
  plannedMinutes: number;
  completedMinutes: number;
  utilizationRate: number; // plannedMinutes / availableMinutes
  status: "planned" | "in_progress" | "completed" | "skipped" | "rest_day";
  tasks: PlannedTask[];
  warnings: string[];
}

export interface PlanFeasibility {
  status: FeasibilityStatus;
  pressureRatio: number; // requiredWorkload / totalEffectiveCapacity
  totalWorkloadMinutes: number;
  remainingCoreMinutes: number;
  expectedRevisionReserveMinutes: number;
  totalEffectiveCapacityMinutes: number;
  totalAvailableCalendarDays: number;
  activeStudyDays: number;
  restDaysCount: number;
  recommendations: string[];
}

export interface PlanningSummary {
  planId?: string;
  algorithmVersion: string;
  planRevision: number;
  startDate: string;
  targetDate: string;
  totalDays: number;
  committedDaysCount: number;
  forecastDaysCount: number;
  totalPlannedMinutes: number;
  totalTasksScheduled: number;
  coreProblemsScheduled: number;
  revisionsScheduled: number;
  restDaysCount: number;
  feasibility: PlanFeasibility;
}

export interface PlanningWarning {
  code: string;
  date?: string;
  message: string;
  severity: "info" | "warning" | "critical";
}

export interface PlanningDecision {
  taskId: string;
  taskTitle: string;
  date: string;
  reason: string;
  scoreBreakdown?: ScoreBreakdown;
}

export interface PlanningResult {
  days: PlannedDay[];
  summary: PlanningSummary;
  feasibility: PlanFeasibility;
  warnings: PlanningWarning[];
  decisions: PlanningDecision[];
}

export interface RebalanceDiff {
  planRevision: number;
  tasksMoved: number;
  targetDateChanged: boolean;
  netDriftMinutes: number;
  newRevisionsAllocated: number;
  weeklyWorkloadShift: Array<{
    weekNumber: number;
    weekLabel: string;
    previousPlannedMinutes: number;
    newPlannedMinutes: number;
    deltaMinutes: number;
  }>;
  summaryExplanation: string;
}

export interface PlannerConfig {
  algorithmVersion: string;
  utilizationTarget: number; // default 0.85
  maxNewDsaProblemsPerDay: number; // default 3
  minimumUsefulDsaMinutes: number; // default 15
  minimumUsefulRevisionMinutes: number; // default 10
  committedHorizonDays: number; // default 7
  scoreWeights: {
    curriculumPriority: number; // 0.30
    sequenceUrgency: number;    // 0.20
    prerequisiteValue: number;  // 0.15
    deadlinePressure: number;   // 0.15
    continuity: number;         // 0.10
    attemptSignal: number;      // 0.10
  };
  pressureThresholds: {
    comfortable: number; // < 0.70
    onTrack: number;     // 0.70..0.90
    tight: number;       // 0.90..1.00
    atRisk: number;      // 1.00..1.15
    infeasible: number;  // > 1.15
  };
}

export const DEFAULT_PLANNER_CONFIG: PlannerConfig = {
  algorithmVersion: "planner-v1",
  utilizationTarget: 0.85,
  maxNewDsaProblemsPerDay: 3,
  minimumUsefulDsaMinutes: 15,
  minimumUsefulRevisionMinutes: 10,
  committedHorizonDays: 7,
  scoreWeights: {
    curriculumPriority: 0.30,
    sequenceUrgency: 0.20,
    prerequisiteValue: 0.15,
    deadlinePressure: 0.15,
    continuity: 0.10,
    attemptSignal: 0.10,
  },
  pressureThresholds: {
    comfortable: 0.70,
    onTrack: 0.90,
    tight: 1.00,
    atRisk: 1.15,
    infeasible: 1.15,
  },
};

// Legacy DayPlan and PlanTask aliases to preserve backward compatibility for tests
export interface PlanTask {
  id: string;
  planId?: string;
  userId?: string;
  type?: string;
  taskType?: TaskType;
  title: string;
  status: "pending" | "in_progress" | "completed" | "skipped";
  estimatedMinutes?: number;
  plannedMinutes?: number;
  actualMinutes?: number;
  orderIndex?: number;
  sequence?: number;
  [key: string]: unknown;
}

export interface DayPlan {
  id: string;
  userId: string;
  planDate: string;
  targetMinutes: number;
  tasks: PlanTask[];
}
