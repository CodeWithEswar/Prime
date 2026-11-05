/**
 * PRIME 90-Day Adaptive Preparation Planner — Feasibility Engine
 * Evaluates whether a user's target preparation goal is achievable within
 * available capacity, accounting for curriculum workload and revision reserves.
 */

import type {
  FeasibilityStatus,
  PlanFeasibility,
  PlannerConfig,
} from "./types";
import { calculateDeadlinePressure } from "./pressure";

export interface FeasibilityInput {
  remainingCoreMinutes: number;
  expectedRevisionReserveMinutes: number;
  totalEffectiveCapacityMinutes: number;
  totalCalendarDays: number;
  activeStudyDays: number;
  restDaysCount: number;
  config: PlannerConfig;
}

/**
 * Evaluates target feasibility and generates deterministic actionable advice.
 */
export function evaluatePlanFeasibility(input: FeasibilityInput): PlanFeasibility {
  const {
    remainingCoreMinutes,
    expectedRevisionReserveMinutes,
    totalEffectiveCapacityMinutes,
    totalCalendarDays,
    activeStudyDays,
    restDaysCount,
    config,
  } = input;

  const totalWorkloadMinutes = remainingCoreMinutes + expectedRevisionReserveMinutes;
  const pressureRatio = calculateDeadlinePressure(
    totalWorkloadMinutes,
    totalEffectiveCapacityMinutes
  );

  let status: FeasibilityStatus = "on_track";
  const { pressureThresholds } = config;

  if (pressureRatio < pressureThresholds.comfortable) {
    status = "comfortable";
  } else if (pressureRatio <= pressureThresholds.onTrack) {
    status = "on_track";
  } else if (pressureRatio <= pressureThresholds.tight) {
    status = "tight";
  } else if (pressureRatio <= pressureThresholds.atRisk) {
    status = "at_risk";
  } else {
    status = "infeasible";
  }

  const recommendations: string[] = [];

  if (status === "comfortable") {
    recommendations.push(
      "Your preparation cadence is well-paced. Buffer is available for deep problem analysis and rest."
    );
  } else if (status === "on_track") {
    recommendations.push(
      "Current workload aligns with available capacity. Maintain daily consistency to protect revision buffers."
    );
  } else if (status === "tight") {
    const deficitMinutes = totalWorkloadMinutes - totalEffectiveCapacityMinutes * 0.9;
    const additionalMinsPerDay = activeStudyDays > 0 ? Math.ceil(deficitMinutes / activeStudyDays) : 30;
    recommendations.push(
      `Schedule is tight. Adding ~${Math.max(15, additionalMinsPerDay)}m per study day will recover comfortable buffer.`
    );
    recommendations.push(
      "Avoid skipping scheduled revision to prevent retention backlog."
    );
  } else if (status === "at_risk") {
    const deficitMinutes = totalWorkloadMinutes - totalEffectiveCapacityMinutes;
    const daysNeeded = activeStudyDays > 0 && totalEffectiveCapacityMinutes > 0
      ? Math.ceil((deficitMinutes / (totalEffectiveCapacityMinutes / activeStudyDays)))
      : 7;
    recommendations.push(
      `Workload exceeds 85% planning buffer by ~${Math.round(deficitMinutes / 60)}h. Consider extending target date by ${daysNeeded} days.`
    );
    recommendations.push(
      "Alternatively, add Saturday or weekend study availability to distribute the workload."
    );
  } else {
    const excessHours = Math.round((totalWorkloadMinutes - totalEffectiveCapacityMinutes) / 60);
    recommendations.push(
      `Current target requires ~${excessHours}h more study time than your calendar supports.`
    );
    recommendations.push(
      "Increase daily study hours or extend the target completion date to generate a realistic plan."
    );
  }

  return {
    status,
    pressureRatio,
    totalWorkloadMinutes,
    remainingCoreMinutes,
    expectedRevisionReserveMinutes,
    totalEffectiveCapacityMinutes,
    totalAvailableCalendarDays: totalCalendarDays,
    activeStudyDays,
    restDaysCount,
    recommendations,
  };
}

