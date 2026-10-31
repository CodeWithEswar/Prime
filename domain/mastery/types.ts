/**
 * Domain Mastery Types
 */

export type MasteryLevel =
  "unseen" | "learning" | "competent" | "proficient" | "mastered";

export interface TopicMasteryState {
  topicId: string;
  totalProblems: number;
  solvedProblems: number;
  accuracyRate: number; // 0.0 - 1.0
  averageTimeToSolveMinutes: number;
}
