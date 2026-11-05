import { describe, expect, it } from "vitest";
import {
  OS_12_DAY_CURRICULUM,
  calculateOSMetrics,
  getRecommendedNextOSDay,
  type OSVideoItem,
} from "@/domain/os";
import manifestJson from "@/content/os/neso-video-manifest.json";
import supplementaryJson from "@/content/os/supplementary-manifest.json";
import exercisesJson from "@/content/os/os-exercises.json";

describe("OS Domain & Curriculum Architecture", () => {
  const manifest = manifestJson as unknown as OSVideoItem[];

  it("manifest contains exactly 77 sequential entries spanning days 1-11", () => {
    expect(manifest.length).toBe(77);
    expect(new Set(manifest.map((item) => item.youtubeVideoId)).size).toBe(
      manifest.length
    );
    manifest.forEach((item, idx) => {
      expect(item.verificationStatus).toBe("verified");
      expect(item.youtubeVideoId).toMatch(/^[\w-]{11}$/);
      expect(item.canonicalUrl).toBe(
        "https://www.youtube.com/watch?v=" + item.youtubeVideoId
      );
      expect(item.position).toBe(idx + 1);
      expect(item.channel).toBe("Neso Academy");
      expect(item.dayNumber).toBeGreaterThanOrEqual(1);
      expect(item.dayNumber).toBeLessThanOrEqual(11);
      expect(item.playlistUrl).toContain(`index=${idx + 1}`);
    });
  });

  it("keeps the original progress key for a corrected playback ID", () => {
    expect(manifest[16]).toMatchObject({
      position: 17,
      youtubeVideoId: "jZ_6PXoaoxo",
      progressId: "fvN98a_7AT4",
    });
    const progress = {
      fvN98a_7AT4: { videoId: "fvN98a_7AT4", watched: true, revisionDue: false },
    };
    expect(
      calculateOSMetrics(manifest, OS_12_DAY_CURRICULUM, progress, {}).watchedVideos
    ).toBe(1);
  });

  it("marks positions 72 through 77 explicitly as chapter intros", () => {
    for (let pos = 72; pos <= 77; pos++) {
      const item = manifest.find((m) => m.position === pos);
      expect(item?.isChapterIntro).toBe(true);
    }
  });

  it("contains curated supplementary lessons for Days 9, 10, and 11", () => {
    expect(supplementaryJson.length).toBe(6);
    const suppDays = supplementaryJson.map((s) => s.dayNumber);
    expect(suppDays).toContain(9);
    expect(suppDays).toContain(10);
    expect(suppDays).toContain(11);
  });

  it("curriculum defines all 12 days with learning outcomes and deliverables", () => {
    expect(OS_12_DAY_CURRICULUM.length).toBe(12);
    OS_12_DAY_CURRICULUM.forEach((day, index) => {
      expect(day.dayNumber).toBe(index + 1);
      expect(day.title.length).toBeGreaterThan(0);
      expect(day.learningOutcomes.length).toBeGreaterThan(0);
      expect(day.deliverable.length).toBeGreaterThan(0);
      expect(day.interviewQuestions.length).toBeGreaterThan(0);
    });
  });

  it("calculates progress metrics correctly", () => {
    const videoProgressMap = {
      vBURTt97EkA: { videoId: "vBURTt97EkA", watched: true, revisionDue: false },
      "2": { videoId: "2", watched: true, revisionDue: true },
    };
    const dayProgressMap = {
      1: { dayNumber: 1, assignmentCompleted: true },
    };
    const metrics = calculateOSMetrics(
      manifest,
      OS_12_DAY_CURRICULUM,
      videoProgressMap,
      dayProgressMap
    );

    expect(metrics.totalVideos).toBe(77);
    expect(metrics.watchedVideos).toBe(2);
    expect(metrics.totalDays).toBe(12);
    expect(metrics.completedDays).toBe(1);
    expect(metrics.revisionDueCount).toBe(1);
    expect(metrics.totalMinutes).toBeGreaterThan(700);
    expect(metrics.watchedMinutes).toBeGreaterThan(0);
  });

  it("recommends the first uncompleted day", () => {
    const dayProgressMap = {
      1: { dayNumber: 1, assignmentCompleted: true },
    };
    const nextDay = getRecommendedNextOSDay(
      OS_12_DAY_CURRICULUM,
      dayProgressMap,
      {},
      manifest
    );
    expect(nextDay).toBe(2);
  });

  it("provides 12 structured practice exercises corresponding to each day", () => {
    expect(exercisesJson.length).toBe(12);
    exercisesJson.forEach((ex, idx) => {
      expect(ex.dayNumber).toBe(idx + 1);
      expect(ex.problemStatement.length).toBeGreaterThan(20);
      expect(ex.sampleAnswer.length).toBeGreaterThan(20);
    });
  });
});
