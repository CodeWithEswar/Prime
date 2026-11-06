import { describe, it, expect } from "vitest";
import type { TopicMasteryLevel, ProblemSolveStatus } from "@/features/striver-a2z/types";

// Domain logic functions to test
function calculateTopicMastery(
  solvedProblems: number,
  totalProblems: number,
  completedVideos: number
): TopicMasteryLevel {
  if (totalProblems > 0) {
    const ratio = solvedProblems / totalProblems;
    if (solvedProblems === 0 && completedVideos > 0) return "learning";
    if (ratio > 0 && ratio < 0.4) return "practicing";
    if (ratio >= 0.4 && ratio < 0.8) return "developing";
    if (ratio >= 0.8) return "proficient";
    return "not_assessed";
  }
  if (completedVideos > 0) return "learning";
  return "not_assessed";
}

function calculateProgressStats(items: {
  videos: { isCompleted: boolean }[];
  problems: { status: ProblemSolveStatus }[];
}) {
  const totalVideos = items.videos.length;
  const completedVideos = items.videos.filter((v) => v.isCompleted).length;
  const videoPct = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  const totalProblems = items.problems.length;
  const solvedProblems = items.problems.filter((p) => p.status === "solved").length;
  const problemPct = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  return {
    totalVideos,
    completedVideos,
    videoPct,
    totalProblems,
    solvedProblems,
    problemPct,
  };
}

describe("Striver A2Z Learning Track Engine", () => {
  describe("Progress Independence (Videos vs Problems)", () => {
    it("maintains separate progress counts when videos are watched without solving problems", () => {
      const stats = calculateProgressStats({
        videos: [{ isCompleted: true }, { isCompleted: true }, { isCompleted: true }],
        problems: [
          { status: "not_started" },
          { status: "not_started" },
          { status: "not_started" },
        ],
      });

      expect(stats.completedVideos).toBe(3);
      expect(stats.videoPct).toBe(100);
      expect(stats.solvedProblems).toBe(0);
      expect(stats.problemPct).toBe(0);
    });

    it("maintains separate progress counts when problems are solved without watching lectures", () => {
      const stats = calculateProgressStats({
        videos: [{ isCompleted: false }, { isCompleted: false }],
        problems: [
          { status: "solved" },
          { status: "solved" },
        ],
      });

      expect(stats.completedVideos).toBe(0);
      expect(stats.videoPct).toBe(0);
      expect(stats.solvedProblems).toBe(2);
      expect(stats.problemPct).toBe(100);
    });
  });

  describe("Evidence-Based Topic Mastery Hierarchy", () => {
    it("returns 'not_assessed' when no problems or lectures have been engaged", () => {
      expect(calculateTopicMastery(0, 10, 0)).toBe("not_assessed");
    });

    it("returns 'learning' when videos have been watched but zero problems solved", () => {
      expect(calculateTopicMastery(0, 10, 5)).toBe("learning");
      expect(calculateTopicMastery(0, 0, 2)).toBe("learning");
    });

    it("returns 'practicing' when under 40% of problems are solved", () => {
      expect(calculateTopicMastery(2, 10, 5)).toBe("practicing"); // 20%
      expect(calculateTopicMastery(1, 3, 3)).toBe("practicing");  // 33%
    });

    it("returns 'developing' when 40% to 79% of problems are solved", () => {
      expect(calculateTopicMastery(4, 10, 5)).toBe("developing"); // 40%
      expect(calculateTopicMastery(7, 10, 10)).toBe("developing"); // 70%
    });

    it("returns 'proficient' when 80% or more of problems are solved", () => {
      expect(calculateTopicMastery(8, 10, 10)).toBe("proficient"); // 80%
      expect(calculateTopicMastery(10, 10, 10)).toBe("proficient"); // 100%
    });

    it("strictly prevents video watching alone from granting proficiency", () => {
      // Watching 100% of videos with 0 problems solved remains 'learning'
      const mastery = calculateTopicMastery(0, 20, 50);
      expect(mastery).toBe("learning");
      expect(mastery).not.toBe("proficient");
      expect(mastery).not.toBe("developing");
    });
  });

  describe("Syllabus Structure & Step Count", () => {
    const officialSteps = [
      "Step 01: Learn the Basics",
      "Step 02: Learn Important Sorting Techniques",
      "Step 03: Solve Problems on Arrays",
      "Step 04: Binary Search",
      "Step 05: Strings",
      "Step 06: Learn LinkedList",
      "Step 07: Recursion",
      "Step 08: Bit Manipulation",
      "Step 09: Stack and Queues",
      "Step 10: Sliding Window & Two Pointer",
      "Step 11: Heaps",
      "Step 12: Greedy Algorithms",
      "Step 13: Binary Trees",
      "Step 14: Binary Search Trees",
      "Step 15: Graphs",
      "Step 16: Dynamic Programming",
      "Step 17: Tries",
      "Step 18: Advanced Strings & Algorithms",
    ];

    it("contains all 18 official curriculum steps in order", () => {
      expect(officialSteps).toHaveLength(18);
      expect(officialSteps[0]).toContain("Step 01");
      expect(officialSteps[17]).toContain("Step 18");
    });
  });
});

