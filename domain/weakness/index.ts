import type { TopicPerformanceSignal } from "./types";

/**
 * Pure Weakness Detection Classifier
 * Flags areas requiring immediate revision or conceptual review.
 */
export function isWeakTopic(signal: TopicPerformanceSignal): boolean {
  // If failure rate exceeds 40% or there are multiple consecutive recent failures
  if (signal.failureRate >= 0.4 || signal.recentFailuresCount >= 3) {
    return true;
  }
  // Significantly exceeding expected time to solve with a moderate failure rate
  if (
    signal.averageAttemptDurationMinutes > signal.expectedDurationMinutes * 1.5 &&
    signal.failureRate >= 0.25
  ) {
    return true;
  }
  return false;
}

export * from "./types";
