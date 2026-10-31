/**
 * Domain Planning Types
 * Pure domain definitions for day-wise preparation planning.
 */

export type TaskStatus = "pending" | "in_progress" | "completed" | "skipped";

export type TaskType =
  "roadmap_concept" | "dsa_problem" | "revision_review" | "mock_interview";

export interface PlanTask {
  id: string;
  planId: string;
  type: TaskType;
  title: string;
  status: TaskStatus;
  estimatedMinutes: number;
  orderIndex: number;
}

export interface DayPlan {
  id: string;
  userId: string;
  planDate: string; // YYYY-MM-DD
  targetMinutes: number;
  tasks: PlanTask[];
}
