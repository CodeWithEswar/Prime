/**
 * Domain Weakness Detection Types
 */

export interface TopicPerformanceSignal {
  topicId: string;
  topicTitle: string;
  failureRate: number; // 0.0 - 1.0
  averageAttemptDurationMinutes: number;
  expectedDurationMinutes: number;
  recentFailuresCount: number;
}
