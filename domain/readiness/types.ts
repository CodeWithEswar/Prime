/**
 * Domain Interview Readiness Types
 */

export interface InterviewReadinessFactors {
  roadmapCompletionRate: number; // 0.0 - 1.0
  overallAccuracyRate: number; // 0.0 - 1.0
  consistencyStreakDays: number;
  revisionBacklogCount: number;
}
