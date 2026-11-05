import { describe, it, expect } from "vitest";
import { validateCurriculumDAG } from "@/domain/curriculum/dag-validator";
import type { CurriculumItem, CurriculumDependency } from "@/domain/curriculum/types";

describe("Curriculum DAG Validator", () => {
  const createMockItem = (id: string, sequence: number, title?: string): CurriculumItem => ({
    id,
    curriculumId: "curr-1",
    stageId: "stage-1",
    problemId: `prob-${id}`,
    sequence,
    priority: "P1",
    recommendedMinutes: 30,
    isRequired: true,
    isCheckpoint: false,
    selectionReason: "Foundational pattern",
    title: title || `Problem ${id}`,
  });

  it("passes validation for a strictly linear and valid DAG", () => {
    const items = [
      createMockItem("A", 1, "Two Sum"),
      createMockItem("B", 2, "3Sum"),
      createMockItem("C", 3, "4Sum"),
    ];

    const dependencies: CurriculumDependency[] = [
      {
        curriculumId: "curr-1",
        prerequisiteItemId: "A",
        dependentItemId: "B",
        dependencyType: "required",
      },
      {
        curriculumId: "curr-1",
        prerequisiteItemId: "B",
        dependentItemId: "C",
        dependencyType: "recommended",
      },
    ];

    const result = validateCurriculumDAG(items, dependencies);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.cycles).toHaveLength(0);
  });

  it("detects direct self-dependencies (A -> A)", () => {
    const items = [createMockItem("A", 1)];
    const dependencies: CurriculumDependency[] = [
      {
        curriculumId: "curr-1",
        prerequisiteItemId: "A",
        dependentItemId: "A",
        dependencyType: "required",
      },
    ];

    const result = validateCurriculumDAG(items, dependencies);
    expect(result.isValid).toBe(false);
    expect(result.selfDependencies).toContain("A");
    expect(result.errors.some((e) => e.includes("cannot depend on itself"))).toBe(true);
  });

  it("detects two-node cycles (A -> B -> A)", () => {
    const items = [createMockItem("A", 1), createMockItem("B", 2)];
    const dependencies: CurriculumDependency[] = [
      {
        curriculumId: "curr-1",
        prerequisiteItemId: "A",
        dependentItemId: "B",
        dependencyType: "required",
      },
      {
        curriculumId: "curr-1",
        prerequisiteItemId: "B",
        dependentItemId: "A",
        dependencyType: "required",
      },
    ];

    const result = validateCurriculumDAG(items, dependencies);
    expect(result.isValid).toBe(false);
    expect(result.cycles.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.includes("cycle"))).toBe(true);
  });

  it("detects multi-node cycles (A -> B -> C -> A)", () => {
    const items = [
      createMockItem("A", 1),
      createMockItem("B", 2),
      createMockItem("C", 3),
    ];
    const dependencies: CurriculumDependency[] = [
      {
        curriculumId: "curr-1",
        prerequisiteItemId: "A",
        dependentItemId: "B",
        dependencyType: "required",
      },
      {
        curriculumId: "curr-1",
        prerequisiteItemId: "B",
        dependentItemId: "C",
        dependencyType: "required",
      },
      {
        curriculumId: "curr-1",
        prerequisiteItemId: "C",
        dependentItemId: "A",
        dependencyType: "required",
      },
    ];

    const result = validateCurriculumDAG(items, dependencies);
    expect(result.isValid).toBe(false);
    expect(result.cycles.length).toBeGreaterThan(0);
  });

  it("detects missing prerequisite items", () => {
    const items = [createMockItem("A", 1)];
    const dependencies: CurriculumDependency[] = [
      {
        curriculumId: "curr-1",
        prerequisiteItemId: "NON_EXISTENT",
        dependentItemId: "A",
        dependencyType: "required",
      },
    ];

    const result = validateCurriculumDAG(items, dependencies);
    expect(result.isValid).toBe(false);
    expect(result.missingPrerequisites).toHaveLength(1);
    expect(result.missingPrerequisites[0].prerequisiteId).toBe("NON_EXISTENT");
  });

  it("detects inverted sequence order (prerequisite placed after dependent)", () => {
    const items = [
      createMockItem("A", 10, "Advanced DP"),
      createMockItem("B", 5, "Climbing Stairs"),
    ];
    const dependencies: CurriculumDependency[] = [
      {
        curriculumId: "curr-1",
        prerequisiteItemId: "A", // sequence 10
        dependentItemId: "B", // sequence 5!
        dependencyType: "required",
      },
    ];

    const result = validateCurriculumDAG(items, dependencies);
    expect(result.isValid).toBe(false);
    expect(result.invertedSequences).toHaveLength(1);
  });
});

