import { describe, it, expect } from "vitest";
import {
  calculateProblemMastery,
  calculateTopicMastery,
  calculateStageMastery,
  calculateOverallMastery,
  MASTERY_POLICY_V1,
  type ProblemEvidenceInput,
} from "@/domain/mastery";
import type { CurriculumItem, CurriculumStage } from "@/domain/curriculum/types";

describe("PRIME Mastery Intelligence Engine — Domain Unit Tests", () => {
  const fixedNow = new Date("2026-11-03T10:00:00Z");

  it("1. returns UNSEEN with score 0 when no evidence exists", () => {
    const input: ProblemEvidenceInput = {
      problemId: "prob-1",
      difficulty: "MEDIUM",
      targetTimeMinutes: 30,
      attempts: [],
      revisions: [],
    };

    const res = calculateProblemMastery(input, MASTERY_POLICY_V1, fixedNow);

    expect(res.level).toBe("unseen");
    expect(res.score).toBe(0);
    expect(res.requirements.independentEvidenceCount).toBe(0);
    expect(res.requirements.successfulRevisionCount).toBe(0);
    expect(res.freshness).toBe("stale");
    expect(res.nextEvidence).toContain("Solve this problem independently");
  });

  it("2. classifies failed attempts as EXPOSED", () => {
    const input: ProblemEvidenceInput = {
      problemId: "prob-2",
      difficulty: "HARD",
      targetTimeMinutes: 45,
      attempts: [
        {
          outcome: "unsolved",
          timeTakenSeconds: 2700,
          confidence: 2,
          attemptedAt: new Date("2026-11-02T10:00:00Z"),
        },
      ],
      revisions: [],
    };

    const res = calculateProblemMastery(input, MASTERY_POLICY_V1, fixedNow);

    expect(res.level).toBe("exposed");
    expect(res.score).toBeLessThan(30);
    expect(res.blockers.some((b) => b.code === "NO_INDEPENDENT_SOLVE")).toBe(true);
  });

  it("3. classifies solution viewed as EXPOSED / low score", () => {
    const input: ProblemEvidenceInput = {
      problemId: "prob-3",
      difficulty: "MEDIUM",
      attempts: [
        {
          outcome: "solution_viewed",
          timeTakenSeconds: 1200,
          confidence: 1,
          attemptedAt: new Date("2026-11-02T10:00:00Z"),
        },
      ],
      revisions: [],
    };

    const res = calculateProblemMastery(input, MASTERY_POLICY_V1, fixedNow);
    expect(res.level).toBe("exposed");
    expect(res.blockers.some((b) => b.code === "NO_INDEPENDENT_SOLVE")).toBe(true);
  });

  it("4. MANDATORY INVARIANT: A single independent solve NEVER equals Mastered", () => {
    const input: ProblemEvidenceInput = {
      problemId: "prob-4",
      difficulty: "EASY",
      targetTimeMinutes: 20,
      attempts: [
        {
          outcome: "independent",
          timeTakenSeconds: 600, // Very fast: 10 mins
          confidence: 5, // Max confidence
          attemptedAt: new Date("2026-11-02T10:00:00Z"),
        },
      ],
      revisions: [],
    };

    const res = calculateProblemMastery(input, MASTERY_POLICY_V1, fixedNow);

    // Must never be mastered on one solve
    expect(res.level).not.toBe("mastered");
    expect(res.level).not.toBe("proficient"); // Needs retention
    expect(res.level).toBe("practiced");
    expect(res.blockers.some((b) => b.code === "NO_RETENTION_EVIDENCE")).toBe(true);
    expect(res.blockers.some((b) => b.code === "INSUFFICIENT_REPETITION")).toBe(true);
  });

  it("5. reaches PROFICIENT with 1 independent solve + verified 3-day retention review", () => {
    const input: ProblemEvidenceInput = {
      problemId: "prob-5",
      difficulty: "MEDIUM",
      targetTimeMinutes: 30,
      attempts: [
        {
          outcome: "independent",
          timeTakenSeconds: 1500, // 25 mins
          confidence: 4,
          attemptedAt: new Date("2026-10-25T10:00:00Z"),
        },
      ],
      revisions: [
        {
          rating: "okay",
          previousIntervalDays: 3,
          nextIntervalDays: 7,
          reviewedAt: new Date("2026-10-28T10:00:00Z"),
        },
      ],
    };

    const res = calculateProblemMastery(input, MASTERY_POLICY_V1, fixedNow);

    expect(res.level).toBe("proficient");
    expect(res.score).toBeGreaterThanOrEqual(70);
    expect(res.requirements.independentEvidenceCount).toBe(1);
    expect(res.requirements.successfulRevisionCount).toBe(1);
    // Needs a second independent solve to prove reproducibility for Mastered
    expect(res.nextEvidence).toContain("independent solve");
  });

  it("6. reaches MASTERED with >= 2 independent solves + verified 7+ day retention", () => {
    const input: ProblemEvidenceInput = {
      problemId: "prob-6",
      difficulty: "MEDIUM",
      targetTimeMinutes: 30,
      attempts: [
        {
          outcome: "independent",
          timeTakenSeconds: 1500,
          confidence: 4,
          attemptedAt: new Date("2026-10-15T10:00:00Z"),
        },
        {
          outcome: "independent",
          timeTakenSeconds: 1200,
          confidence: 5,
          attemptedAt: new Date("2026-10-28T10:00:00Z"),
        },
      ],
      revisions: [
        {
          rating: "okay",
          previousIntervalDays: 3,
          nextIntervalDays: 7,
          reviewedAt: new Date("2026-10-20T10:00:00Z"),
        },
        {
          rating: "easy",
          previousIntervalDays: 7,
          nextIntervalDays: 14,
          reviewedAt: new Date("2026-10-30T10:00:00Z"),
        },
      ],
    };

    const res = calculateProblemMastery(input, MASTERY_POLICY_V1, fixedNow);

    expect(res.level).toBe("mastered");
    expect(res.score).toBeGreaterThanOrEqual(85);
    expect(res.requirements.independentEvidenceCount).toBe(2);
    expect(res.requirements.longestSuccessfulIntervalDays).toBeGreaterThanOrEqual(7);
    expect(res.requirements.hasRecentForgot).toBe(false);
    expect(res.strengths.some((s) => s.code === "REPEATED_INDEPENDENT_SOLVES")).toBe(true);
    expect(res.strengths.some((s) => s.code === "LONG_INTERVAL_RETENTION")).toBe(true);
  });

  it("7. REGRESSION: recent 'Forgot' review blocks MASTERED and downgrades state", () => {
    const input: ProblemEvidenceInput = {
      problemId: "prob-7",
      difficulty: "MEDIUM",
      targetTimeMinutes: 30,
      attempts: [
        {
          outcome: "independent",
          timeTakenSeconds: 1400,
          confidence: 4,
          attemptedAt: new Date("2026-10-10T10:00:00Z"),
        },
        {
          outcome: "independent",
          timeTakenSeconds: 1300,
          confidence: 4,
          attemptedAt: new Date("2026-10-20T10:00:00Z"),
        },
      ],
      revisions: [
        {
          rating: "easy",
          previousIntervalDays: 7,
          nextIntervalDays: 14,
          reviewedAt: new Date("2026-10-25T10:00:00Z"),
        },
        {
          rating: "forgot", // Recent regression!
          previousIntervalDays: 14,
          nextIntervalDays: 1,
          reviewedAt: new Date("2026-11-02T10:00:00Z"),
        },
      ],
    };

    const res = calculateProblemMastery(input, MASTERY_POLICY_V1, fixedNow);

    // Must NOT be mastered due to recent Forgot!
    expect(res.level).not.toBe("mastered");
    expect(res.requirements.hasRecentForgot).toBe(true);
    expect(res.blockers.some((b) => b.code === "RECENT_FORGOT")).toBe(true);
    expect(res.nextEvidence).toContain("Rebuild the pattern");
  });

  it("8. DETERMINISM: Identical inputs, policy, and clock yield identical outputs", () => {
    const input: ProblemEvidenceInput = {
      problemId: "prob-8",
      difficulty: "HARD",
      targetTimeMinutes: 40,
      attempts: [
        {
          outcome: "independent",
          timeTakenSeconds: 1800,
          confidence: 4,
          attemptedAt: new Date("2026-10-28T10:00:00Z"),
        },
      ],
      revisions: [
        {
          rating: "okay",
          previousIntervalDays: 3,
          nextIntervalDays: 7,
          reviewedAt: new Date("2026-10-31T10:00:00Z"),
        },
      ],
    };

    const run1 = calculateProblemMastery(input, MASTERY_POLICY_V1, fixedNow);
    const run2 = calculateProblemMastery(input, MASTERY_POLICY_V1, fixedNow);

    expect(run1).toEqual(run2);
  });

  it("uses the reviewed interval and keeps a regression after a hard recall", () => {
    const input: ProblemEvidenceInput = {
      problemId: "retention-regression",
      difficulty: "MEDIUM",
      attempts: [
        { outcome: "independent", timeTakenSeconds: 1200, confidence: 5, attemptedAt: "2026-10-15" },
        { outcome: "independent", timeTakenSeconds: 1200, confidence: 5, attemptedAt: "2026-10-16" },
      ],
      revisions: [
        { rating: "easy", previousIntervalDays: 3, nextIntervalDays: 14, reviewedAt: "2026-10-20" },
        { rating: "forgot", previousIntervalDays: 14, nextIntervalDays: 1, reviewedAt: "2026-10-31" },
        { rating: "hard", previousIntervalDays: 1, nextIntervalDays: 1, reviewedAt: "2026-11-01" },
      ],
    };
    const result = calculateProblemMastery(input, MASTERY_POLICY_V1, fixedNow);
    expect(result.requirements.longestSuccessfulIntervalDays).toBe(3);
    expect(result.requirements.hasRecentForgot).toBe(true);
    expect(result.level).not.toBe("mastered");
  });

  it("9. Handles missing targetTime and missing confidence without zero-score penalty", () => {
    const input: ProblemEvidenceInput = {
      problemId: "prob-9",
      difficulty: "MEDIUM",
      targetTimeMinutes: null, // No target time
      attempts: [
        {
          outcome: "independent",
          timeTakenSeconds: 0, // No duration
          confidence: 0, // No valid confidence
          attemptedAt: new Date("2026-11-01T10:00:00Z"),
        },
      ],
      revisions: [],
    };

    const res = calculateProblemMastery(input, MASTERY_POLICY_V1, fixedNow);

    expect(res.evidence.timing).toBeNull();
    expect(res.evidence.confidenceCalibration).toBeNull();
    // Valid dimensions (independence, recency, repetition) should normalize without NaN or zeroes
    expect(Number.isNaN(res.score)).toBe(false);
    expect(res.score).toBeGreaterThan(0);
  });

  it("10. Marks evidence older than 90 days as STALE", () => {
    const input: ProblemEvidenceInput = {
      problemId: "prob-10",
      difficulty: "EASY",
      attempts: [
        {
          outcome: "independent",
          timeTakenSeconds: 600,
          confidence: 5,
          attemptedAt: new Date("2026-06-01T10:00:00Z"), // ~150 days ago
        },
      ],
      revisions: [],
    };

    const res = calculateProblemMastery(input, MASTERY_POLICY_V1, fixedNow);

    expect(res.freshness).toBe("stale");
    expect(res.blockers.some((b) => b.code === "STALE_EVIDENCE")).toBe(true);
  });

  it("11. TOPIC AGGREGATION: Untouched optional catalog problems do NOT penalize Core topic mastery", () => {
    const mockCoreItems: CurriculumItem[] = [
      {
        id: "item-1",
        curriculumId: "curr-1",
        stageId: "stage-1",
        problemId: "prob-core-1",
        sequence: 1,
        priority: "P0",
        recommendedMinutes: 25,
        isRequired: true,
        isCheckpoint: true,
        selectionReason: "Core pattern checkpoint",
        createdAt: "2026-10-01T00:00:00Z",
        updatedAt: "2026-10-01T00:00:00Z",
      },
      {
        id: "item-2",
        curriculumId: "curr-1",
        stageId: "stage-1",
        problemId: "prob-core-2",
        sequence: 2,
        priority: "P1",
        recommendedMinutes: 30,
        isRequired: true,
        isCheckpoint: false,
        selectionReason: "Standard core problem",
        createdAt: "2026-10-01T00:00:00Z",
        updatedAt: "2026-10-01T00:00:00Z",
      },
    ];

    const masteryMap = new Map();
    // Problem 1 is Mastered
    masteryMap.set("prob-core-1", {
      problemId: "prob-core-1",
      level: "mastered",
      score: 90,
      requirements: { independentEvidenceCount: 2, successfulRevisionCount: 2, longestSuccessfulIntervalDays: 14 },
      blockers: [],
      strengths: [],
    });
    // Problem 2 is Proficient
    masteryMap.set("prob-core-2", {
      problemId: "prob-core-2",
      level: "proficient",
      score: 75,
      requirements: { independentEvidenceCount: 1, successfulRevisionCount: 1, longestSuccessfulIntervalDays: 7 },
      blockers: [],
      strengths: [],
    });

    const topicRes = calculateTopicMastery({
      topicId: "topic-bs",
      topicSlug: "binary-search",
      topicName: "Binary Search",
      coreItems: mockCoreItems,
      problemMasteryMap: masteryMap,
      optionalProblemMasteries: [], // 0 optional problems touched
    });

    expect(topicRes.evidenceCoverage.practicedCount).toBe(2);
    expect(topicRes.evidenceCoverage.totalCount).toBe(2);
    expect(topicRes.evidenceCoverage.percentage).toBe(100);
    expect(topicRes.level).toBe("proficient");
    expect(topicRes.score).toBeGreaterThanOrEqual(75);
  });

  it("12. STAGE & OVERALL AGGREGATION: Synthesizes multi-stage mastery hierarchy cleanly", () => {
    const mockStage: CurriculumStage = {
      id: "stage-1",
      curriculumId: "curr-1",
      slug: "arrays",
      name: "Arrays & Hashing",
      sequence: 1,
      estimatedProblemCount: 10,
      estimatedMinutes: 120,
      description: null,
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-01T00:00:00Z",
    };

    const topicResult = calculateTopicMastery({
      topicId: "topic-1",
      topicSlug: "arrays",
      topicName: "Arrays",
      coreItems: [
        {
          id: "item-1",
          curriculumId: "curr-1",
          stageId: "stage-1",
          problemId: "p1",
          sequence: 1,
          priority: "P0",
          recommendedMinutes: 20,
          isRequired: true,
          isCheckpoint: false,
          selectionReason: "Core pattern",
          createdAt: "",
          updatedAt: "",
        },
      ],
      problemMasteryMap: new Map([
        [
          "p1",
          {
            ...calculateProblemMastery({ problemId: "p1", difficulty: "MEDIUM", attempts: [], revisions: [] }, MASTERY_POLICY_V1, fixedNow),
            problemId: "p1",
            level: "proficient",
            score: 78,
            requirements: { independentEvidenceCount: 1, successfulRevisionCount: 1, longestSuccessfulIntervalDays: 7, totalAttemptCount: 1, hasRecentForgot: false },
            blockers: [],
            strengths: [],
          },
        ],
      ]),
    });

    const stageRes = calculateStageMastery({
      stage: mockStage,
      topicResults: [topicResult],
    });

    expect(stageRes.score).toBe(78);
    expect(stageRes.level).toBe("proficient");

    const overall = calculateOverallMastery([stageRes], [topicResult.problemMasteries[0]]);
    expect(overall.totalCoreProblems).toBe(1);
    expect(overall.proficientCount).toBe(1);
    expect(overall.score).toBe(78);
  });

  it("14. HINT DEPENDENCY: Repeated reliance on hints reduces independence and flags blocker", () => {
    const input: ProblemEvidenceInput = {
      problemId: "prob-hint-heavy",
      difficulty: "MEDIUM",
      targetTimeMinutes: 30,
      attempts: [
        { outcome: "hint", timeTakenSeconds: 1500, confidence: 3, attemptedAt: new Date("2026-10-20T10:00:00Z") },
        { outcome: "hint", timeTakenSeconds: 1400, confidence: 3, attemptedAt: new Date("2026-10-25T10:00:00Z") },
        { outcome: "hint", timeTakenSeconds: 1600, confidence: 4, attemptedAt: new Date("2026-10-28T10:00:00Z") },
      ],
      revisions: [],
    };

    const res = calculateProblemMastery(input, MASTERY_POLICY_V1, fixedNow);
    expect(res.level).not.toBe("mastered");
    expect(res.level).not.toBe("proficient");
    expect(res.blockers.some((b) => b.code === "HIGH_HINT_DEPENDENCY")).toBe(true);
    expect(res.blockers.some((b) => b.code === "NO_INDEPENDENT_SOLVE")).toBe(true);
  });

  it("15. CONFIDENCE CALIBRATION: Overconfidence reduces calibration score", () => {
    // User reports confidence 5 but could not solve
    const overconfidentInput: ProblemEvidenceInput = {
      problemId: "prob-calib-1",
      difficulty: "MEDIUM",
      attempts: [
        { outcome: "unsolved", timeTakenSeconds: 2000, confidence: 5, attemptedAt: new Date("2026-11-01T10:00:00Z") },
      ],
      revisions: [],
    };

    // User reports confidence 5 and solves independently
    const wellCalibratedInput: ProblemEvidenceInput = {
      problemId: "prob-calib-2",
      difficulty: "MEDIUM",
      attempts: [
        { outcome: "independent", timeTakenSeconds: 1200, confidence: 5, attemptedAt: new Date("2026-11-01T10:00:00Z") },
      ],
      revisions: [],
    };

    const resOver = calculateProblemMastery(overconfidentInput, MASTERY_POLICY_V1, fixedNow);
    const resWell = calculateProblemMastery(wellCalibratedInput, MASTERY_POLICY_V1, fixedNow);

    expect(resOver.evidence.confidenceCalibration).toBeLessThan(40);
    expect(resWell.evidence.confidenceCalibration).toBe(100);
  });

  it("16. TIMING EFFICIENCY: Fast execution scores high, severe overtime scores low", () => {
    const fastInput: ProblemEvidenceInput = {
      problemId: "prob-time-1",
      difficulty: "MEDIUM",
      targetTimeMinutes: 30,
      attempts: [
        { outcome: "independent", timeTakenSeconds: 1200, confidence: 4, attemptedAt: new Date("2026-11-01T10:00:00Z") }, // 20m <= 30m
      ],
      revisions: [],
    };

    const slowInput: ProblemEvidenceInput = {
      problemId: "prob-time-2",
      difficulty: "MEDIUM",
      targetTimeMinutes: 30,
      attempts: [
        { outcome: "independent", timeTakenSeconds: 4500, confidence: 4, attemptedAt: new Date("2026-11-01T10:00:00Z") }, // 75m > 2x target
      ],
      revisions: [],
    };

    const resFast = calculateProblemMastery(fastInput, MASTERY_POLICY_V1, fixedNow);
    const resSlow = calculateProblemMastery(slowInput, MASTERY_POLICY_V1, fixedNow);

    expect(resFast.evidence.timing).toBe(100);
    expect(resSlow.evidence.timing).toBeLessThanOrEqual(25);
  });

  it("17. MANDATORY REQUIREMENT: High score without retention CANNOT become Mastered", () => {
    // Multiple independent fast solves but ZERO revisions
    const input: ProblemEvidenceInput = {
      problemId: "prob-no-rev",
      difficulty: "HARD",
      targetTimeMinutes: 40,
      attempts: [
        { outcome: "independent", timeTakenSeconds: 1200, confidence: 5, attemptedAt: new Date("2026-10-15T10:00:00Z") },
        { outcome: "independent", timeTakenSeconds: 1100, confidence: 5, attemptedAt: new Date("2026-10-25T10:00:00Z") },
        { outcome: "independent", timeTakenSeconds: 1000, confidence: 5, attemptedAt: new Date("2026-11-02T10:00:00Z") },
      ],
      revisions: [], // Zero retention proof
    };

    const res = calculateProblemMastery(input, MASTERY_POLICY_V1, fixedNow);
    expect(res.level).not.toBe("mastered");
    expect(res.blockers.some((b) => b.code === "NO_RETENTION_EVIDENCE")).toBe(true);
  });
});
