/**
 * PRIME 90-Day Adaptive Preparation Planner — Deadline Pressure Engine
 * Calculates normalized pressure ratio between required preparation workload
 * and remaining effective study capacity.
 */

import type { PlannerConfig } from "./types";

/**
 * Calculates deadline pressure ratio:
 * Pressure = required_remaining_minutes / remaining_effective_capacity_minutes
 */
export function calculateDeadlinePressure(
  requiredWorkloadMinutes: number,
  effectiveCapacityMinutes: number
): number {
  if (effectiveCapacityMinutes <= 0) {
    return requiredWorkloadMinutes > 0 ? 2.0 : 0.0;
  }
  const ratio = requiredWorkloadMinutes / effectiveCapacityMinutes;
  return Number(ratio.toFixed(3));
}

