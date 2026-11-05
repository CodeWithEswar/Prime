import { describe, it, expect } from "vitest";
import {
  getCurriculumProgress,
  getStageProgress,
  getNextCurriculumItem,
} from "@/domain/curriculum/curriculum-selectors";
import type {
  CurriculumItem,
  CurriculumStage,
  CurriculumDependency,
  UserProblemState,
} from "@/domain/curriculum/types";

describe("Curriculum Progress & Recommendation Selectors", () => {
  const stage1: CurriculumStage = {
    id: "stage-1",
    curriculumId: "curr-1",
    slug: "foundations",
    name: "Foundations",
    description: "Foundational techniques",
    sequence: 1,
    estimatedProblemCount: 2,
    estimatedMinutes: 60,
  };

  const stage2: CurriculumStage = {
    id: "stage-2",
    curriculumId: "curr-1",
    slug: "arrays",
    name: "Arrays & Hashing",
    description: "Array transformations",
    sequence: 2,
    estimatedProblemCount: 2,
    estimatedMinutes: 60,
  };

  const items: CurriculumItem[] = [
    {
      id: "item-1",
      curriculumId: "curr-1",
      stageId: "stage-1",
      problemId: "prob-1",
      sequence: 1,
      priority: "P0",
      recommendedMinutes: 20,
      isRequired: true,
      isCheckpoint: true,
      selectionReason: "Core array traversal",
    },
    {
      id: "item-2",
      curriculumId: "curr-1",
      stageId: "stage-1",
      problemId: "prob-2",
      sequence: 2,
      priority: "P1",
      recommendedMinutes: 25,
      isRequired: true,
      isCheckpoint: false,
      selectionReason: "Two pointer basics",
    },
    {
      id: "item-3",
      curriculumId: "curr-1",
      stageId: "stage-2",
      problemId: "prob-3",
      sequence: 3,
      priority: "P0",
      recommendedMinutes: 30,
      isRequired: true,
      isCheckpoint: false,
      selectionReason: "Hash map lookup",
    },
    {
      id: "item-4",
      curriculumId: "curr-1",
      stageId: "stage-2",
      problemId: "prob-4",
      sequence: 4,
      priority: "P2",
      recommendedMinutes: 30,
      isRequired: false, // Optional reinforcement
      isCheckpoint: false,
      selectionReason: "Reinforcement variant",
    },
  ];

  const dependencies: CurriculumDependency[] = [
    {
      curriculumId: "curr-1",
      prerequisiteItemId: "item-1",
      dependentItemId: "item-3",
      dependencyType: "required",
    },
  ];

  it("calculates overall curriculum progress accurately", () => {
    const userProgressMap = new Map<string, UserProblemState>([
      ["prob-1", { status: "solved" }],
      ["prob-2", { status: "attempted" }],
      ["prob-3", { status: "not_started" }],
      ["prob-4", { status: "solved" }], // solved optional item
    ]);

    const progress = getCurriculumProgress(items, userProgressMap);

    // 3 required items (prob-1, prob-2, prob-3). 1 solved (prob-1).
    expect(progress.totalRequired).toBe(3);
    expect(progress.completedRequired).toBe(1);
    expect(progress.remainingRequiredCount).toBe(2);
    expect(progress.totalAttempted).toBe(1); // prob-2
    expect(progress.totalOptional).toBe(1); // prob-4
    expect(progress.completedOptional).toBe(1); // prob-4 solved
    expect(progress.completionPercentage).toBe(33); // 1 / 3 = 33%
  });

  it("surfaces revision due without altering completion count", () => {
    const userProgressMap = new Map<string, UserProblemState>([
      ["prob-1", { status: "solved", isRevisionDue: true }],
      ["prob-2", { status: "solved", isRevisionDue: false }],
      ["prob-3", { status: "solved", isRevisionDue: false }],
    ]);

    const progress = getCurriculumProgress(items, userProgressMap);

    expect(progress.completedRequired).toBe(3);
    expect(progress.completionPercentage).toBe(100);
    expect(progress.revisionDueCount).toBe(1); // prob-1 is due
  });

  it("calculates stage-level progress metrics", () => {
    const userProgressMap = new Map<string, UserProblemState>([
      ["prob-1", { status: "solved" }],
      ["prob-2", { status: "solved" }],
    ]);

    const stage1Progress = getStageProgress(
      stage1,
      items.filter((i) => i.stageId === stage1.id),
      userProgressMap,
      stage1.id
    );

    expect(stage1Progress.totalRequired).toBe(2);
    expect(stage1Progress.completedRequired).toBe(2);
    expect(stage1Progress.isCompleted).toBe(true);
    expect(stage1Progress.isCurrent).toBe(true);
    expect(stage1Progress.completionPercentage).toBe(100);
  });

  describe("getNextCurriculumItem (Continue Algorithm)", () => {
    it("recommends the first unsolved item when prerequisites are satisfied", () => {
      const userProgressMap = new Map<string, UserProblemState>();

      // Nothing solved yet -> should recommend item-1 (seq 1)
      const next = getNextCurriculumItem(items, [stage1, stage2], dependencies, userProgressMap);
      expect(next).not.toBeNull();
      expect(next?.item.id).toBe("item-1");
      expect(next?.stage.id).toBe("stage-1");
    });

    it("advances to item-2 after item-1 is solved", () => {
      const userProgressMap = new Map<string, UserProblemState>([
        ["prob-1", { status: "solved" }],
      ]);

      const next = getNextCurriculumItem(items, [stage1, stage2], dependencies, userProgressMap);
      expect(next).not.toBeNull();
      expect(next?.item.id).toBe("item-2");
    });

    it("respects required prerequisites and skips locked items", () => {
      // Suppose item-1 is NOT solved, but item-2 is solved.
      // item-3 requires item-1.
      // Even if item-3 is sequence 3, it cannot be done until item-1 is solved.
      // Next available should be item-1.
      const userProgressMap = new Map<string, UserProblemState>([
        ["prob-2", { status: "solved" }],
      ]);

      const next = getNextCurriculumItem(items, [stage1, stage2], dependencies, userProgressMap);
      expect(next).not.toBeNull();
      expect(next?.item.id).toBe("item-1"); // Still needs item-1
    });

    it("returns null when all required items are solved", () => {
      const userProgressMap = new Map<string, UserProblemState>([
        ["prob-1", { status: "solved" }],
        ["prob-2", { status: "mastered" }],
        ["prob-3", { status: "solved" }],
      ]);

      const next = getNextCurriculumItem(items, [stage1, stage2], dependencies, userProgressMap);
      expect(next).toBeNull();
    });
  });
});

