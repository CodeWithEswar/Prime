import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getDataEngineeringDashboardData } from "@/features/data-engineering/server/service";

describe("Data Engineering Service & Curriculum Integration Tests", () => {
  it("loads complete Data Engineering dashboard data with 8 stages, 54 verified videos, and 16 labs", async () => {
    const data = await getDataEngineeringDashboardData(null, null);

    // 1. Verify course metadata
    expect(data.course.slug).toBe("data-engineering-12-day");
    expect(data.course.title).toBe("Data Engineering Mastery Roadmap");
    expect(data.course.estimatedStages).toBe(8);
    expect(data.course.estimatedHours).toBe(65);

    // 2. Verify all 8 stages
    expect(data.stages).toHaveLength(8);
    for (let i = 0; i < 8; i++) {
      const stage = data.stages[i];
      expect(stage.stageNumber).toBe(i + 1);
      expect(stage.modules.length).toBeGreaterThan(0);
      expect(stage.learningOutcomes.length).toBeGreaterThan(0);
      expect(stage.practicalAssignment.title).toBeTruthy();
      expect(stage.interviewQuestions.length).toBeGreaterThanOrEqual(2);
    }

    // 3. Verify video collection: 54 verified lectures
    expect(data.videos).toHaveLength(54);

    // Verify first and last videos
    expect(data.videos[0].position).toBe(1);
    expect(data.videos[0].youtubeVideoId).toBe("T23Bs75F7ZQ");
    expect(data.videos[0].stageNumber).toBe(1);
    expect(data.videos[0].canonicalUrl).toBe("https://www.youtube.com/watch?v=T23Bs75F7ZQ");

    expect(data.videos[53].position).toBe(54);
    expect(data.videos[53].youtubeVideoId).toBe("rONGpsndzRw");
    expect(data.videos[53].stageNumber).toBe(8);
    expect(data.videos[53].canonicalUrl).toBe("https://www.youtube.com/watch?v=rONGpsndzRw");

    // Verify all 54 videos have valid 11-char IDs and verified status
    for (const v of data.videos) {
      expect(v.verificationStatus).toBe("verified");
      expect(v.youtubeVideoId).toHaveLength(11);
      expect(v.title).toBeTruthy();
      expect(v.channel).toBeTruthy();
      expect(v.estimatedMinutes).toBeGreaterThan(0);
    }

    // 4. Verify 16 practical hands-on labs
    expect(data.exercises).toHaveLength(16);
    const exerciseStageNumbers = new Set(data.exercises.map((e) => e.stageNumber));
    for (let s = 1; s <= 8; s++) {
      expect(exerciseStageNumbers.has(s)).toBe(true);
    }

    // 5. Verify initial metrics
    expect(data.metrics.totalVideos).toBe(54);
    expect(data.metrics.watchedVideos).toBe(0);
    expect(data.metrics.percentageComplete).toBe(0);
    expect(data.metrics.completedStages).toBe(0);
    expect(data.metrics.currentStage).toBe(1);
    expect(data.metrics.solvedExercises).toBe(0);
    expect(data.metrics.totalExercises).toBe(16);

    // Verify topic masteries
    expect(data.metrics.topicsMastery.length).toBeGreaterThanOrEqual(20);
  });
});
