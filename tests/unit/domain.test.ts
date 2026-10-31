import { describe, it, expect } from "vitest";
import { calculatePlanProgress, type DayPlan } from "@/domain/planning";
import { calculateNextRevision, type RevisionItem } from "@/domain/revision";
import { classifyMasteryLevel, type TopicMasteryState } from "@/domain/mastery";
import { calculateReadinessScore } from "@/domain/readiness";

describe("Pure Domain Logic Verification", () => {
  describe("domain/planning", () => {
    it("accurately computes progress and estimated minutes", () => {
      const plan: DayPlan = {
        id: "plan-1",
        userId: "user-1",
        planDate: "2026-10-31",
        targetMinutes: 120,
        tasks: [
          {
            id: "task-1",
            planId: "plan-1",
            type: "dsa_problem",
            title: "Two Sum",
            status: "completed",
            estimatedMinutes: 30,
            orderIndex: 0,
          },
          {
            id: "task-2",
            planId: "plan-1",
            type: "revision_review",
            title: "LRU Cache",
            status: "pending",
            estimatedMinutes: 20,
            orderIndex: 1,
          },
        ],
      };

      const result = calculatePlanProgress(plan);
      expect(result.totalTasks).toBe(2);
      expect(result.completedTasks).toBe(1);
      expect(result.completionPercentage).toBe(50);
      expect(result.totalEstimatedMinutes).toBe(50);
      expect(result.completedEstimatedMinutes).toBe(30);
    });

    it("handles zero tasks gracefully", () => {
      const emptyPlan: DayPlan = {
        id: "plan-empty",
        userId: "user-1",
        planDate: "2026-10-31",
        targetMinutes: 60,
        tasks: [],
      };
      const result = calculatePlanProgress(emptyPlan);
      expect(result.completionPercentage).toBe(0);
      expect(result.totalTasks).toBe(0);
    });
  });

  describe("domain/revision", () => {
    it("increases interval on successful review", () => {
      const item: RevisionItem = {
        id: "rev-1",
        userId: "user-1",
        problemId: "prob-1",
        intervalDays: 1,
        easeFactor: 2.5,
        repetitionCount: 1,
        nextDueDate: "2026-10-31",
      };

      const result = calculateNextRevision(item, 4, new Date("2026-10-31"));
      expect(result.intervalDays).toBe(6);
      expect(result.repetitionCount).toBe(2);
      expect(result.nextDueDate).toBe("2026-11-06");
    });

    it("resets interval on failed recall (grade < 3)", () => {
      const item: RevisionItem = {
        id: "rev-1",
        userId: "user-1",
        problemId: "prob-1",
        intervalDays: 15,
        easeFactor: 2.5,
        repetitionCount: 3,
        nextDueDate: "2026-10-31",
      };

      const result = calculateNextRevision(item, 2, new Date("2026-10-31"));
      expect(result.intervalDays).toBe(1);
      expect(result.repetitionCount).toBe(0);
      expect(result.nextDueDate).toBe("2026-11-01");
    });
  });

  describe("domain/mastery", () => {
    it("classifies high solve ratio and accuracy as mastered", () => {
      const state: TopicMasteryState = {
        topicId: "arrays",
        totalProblems: 20,
        solvedProblems: 19,
        accuracyRate: 0.9,
        averageTimeToSolveMinutes: 20,
      };
      expect(classifyMasteryLevel(state)).toBe("mastered");
    });

    it("classifies untouched topics as unseen", () => {
      const state: TopicMasteryState = {
        topicId: "dp",
        totalProblems: 15,
        solvedProblems: 0,
        accuracyRate: 0,
        averageTimeToSolveMinutes: 0,
      };
      expect(classifyMasteryLevel(state)).toBe("unseen");
    });
  });

  describe("domain/readiness", () => {
    it("calculates weighted readiness score correctly", () => {
      const score = calculateReadinessScore({
        roadmapCompletionRate: 0.8, // 32
        overallAccuracyRate: 0.8, // 28
        consistencyStreakDays: 30, // 15
        revisionBacklogCount: 0, // 0
      });
      expect(score).toBe(75);
    });
  });
});
