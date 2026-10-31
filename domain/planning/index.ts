import type { DayPlan } from "./types";

/**
 * Pure Domain Planning Calculations
 * Framework-independent and database-independent.
 */

export function calculatePlanProgress(plan: DayPlan): {
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  totalEstimatedMinutes: number;
  completedEstimatedMinutes: number;
} {
  const totalTasks = plan.tasks.length;
  if (totalTasks === 0) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      completionPercentage: 0,
      totalEstimatedMinutes: 0,
      completedEstimatedMinutes: 0,
    };
  }

  const completed = plan.tasks.filter((t) => t.status === "completed");
  const completedTasks = completed.length;
  const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

  const totalEstimatedMinutes = plan.tasks.reduce(
    (sum, t) => sum + (t.estimatedMinutes || 0),
    0
  );
  const completedEstimatedMinutes = completed.reduce(
    (sum, t) => sum + (t.estimatedMinutes || 0),
    0
  );

  return {
    totalTasks,
    completedTasks,
    completionPercentage,
    totalEstimatedMinutes,
    completedEstimatedMinutes,
  };
}

export * from "./types";
