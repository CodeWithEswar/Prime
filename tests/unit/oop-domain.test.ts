import { describe, it, expect } from "vitest";
import {
  OOP_12_DAY_CURRICULUM,
  calculateOOPMetrics,
  getRecommendedNextOOPDay,
  type OOPVideoItem,
  type OOPSegmentItem,
} from "@/domain/oop";
import primaryManifest from "@/content/oop/kunal-playlist-manifest.json";
import segmentsManifest from "@/content/oop/oop-segments-manifest.json";
import prerequisitesManifest from "@/content/oop/oop-prerequisites-manifest.json";
import supplementaryManifest from "@/content/oop/oop-supplementary-manifest.json";
import exercisesManifest from "@/content/oop/oop-exercises.json";

describe("OOP with Java — Domain Curriculum & Manifest Verification", () => {
  it("has exactly 12 days defined in the curriculum", () => {
    expect(OOP_12_DAY_CURRICULUM.length).toBe(12);
    for (let i = 1; i <= 12; i++) {
      expect(OOP_12_DAY_CURRICULUM[i - 1].dayNumber).toBe(i);
    }
  });

  it("verifies the 7 primary Kunal Kushwaha master lectures", () => {
    const videos = primaryManifest as unknown as OOPVideoItem[];
    expect(videos.length).toBe(7);

    const videoIds = videos.map((v) => v.youtubeVideoId);
    expect(videoIds).toEqual([
      "BSVKUk58K6U",
      "_Ya6CN13t8k",
      "46T2wD3IuhM",
      "W145DXs8fFg",
      "rgHZa7-Dibg",
      "OY2lPr8h93U",
      "9ogGan-R1pc",
    ]);

    for (const v of videos) {
      expect(v.verificationStatus).toBe("verified");
      expect(v.durationSeconds).toBeGreaterThan(0);
      expect(v.assignedDays.length).toBeGreaterThan(0);
    }
  });

  it("verifies all 21 concept-level timestamp segments point to valid parent videos", () => {
    const segments = segmentsManifest as unknown as OOPSegmentItem[];
    expect(segments.length).toBe(21);

    const validParentIds = new Set((primaryManifest as unknown as OOPVideoItem[]).map((v) => v.youtubeVideoId));

    for (const seg of segments) {
      expect(validParentIds.has(seg.parentVideoId)).toBe(true);
      expect(seg.startSeconds).toBeGreaterThanOrEqual(0);
      expect(seg.directTimestampUrl).toContain(seg.parentVideoId);
      expect(seg.assignedDay).toBeGreaterThanOrEqual(1);
      expect(seg.assignedDay).toBeLessThanOrEqual(12);
    }
  });

  it("verifies 7 Java foundation prerequisites", () => {
    expect(prerequisitesManifest.length).toBe(7);
    const preIds = prerequisitesManifest.map((p) => p.youtubeVideoId);
    expect(preIds).toContain("4EP8YzcN0hQ");
    expect(preIds).toContain("TAtrPoaJ7gc");
    expect(preIds).toContain("ldYLYRNaucM");
    expect(preIds).toContain("mA23x39DjbI");
    expect(preIds).toContain("vvanI8NRlSI");
    expect(preIds).toContain("n60Dn0UsbEk");
    expect(preIds).toContain("waGfV-IoOt8");
  });

  it("verifies 8 supplementary modules for Day 11 and advanced topics", () => {
    expect(supplementaryManifest.length).toBe(8);
    for (const supp of supplementaryManifest) {
      expect(supp.isSupplementary).toBe(true);
      expect(supp.verificationStatus).toBe("verified");
    }
  });

  it("verifies output prediction questions and 10 LLD cases", () => {
    expect(exercisesManifest.outputPredictions.length).toBeGreaterThanOrEqual(10);
    expect(exercisesManifest.lldCases.length).toBe(10);

    const lldTitles = exercisesManifest.lldCases.map((c) => c.title);
    expect(lldTitles.some((t) => t.includes("Parking Lot"))).toBe(true);
    expect(lldTitles.some((t) => t.includes("Library Management"))).toBe(true);
    expect(lldTitles.some((t) => t.includes("ATM"))).toBe(true);
    expect(lldTitles.some((t) => t.includes("Elevator"))).toBe(true);
    expect(lldTitles.some((t) => t.includes("Vending Machine"))).toBe(true);
  });

  it("calculates metrics accurately and without fabricated numbers", () => {
    const days = OOP_12_DAY_CURRICULUM;
    const videos = primaryManifest as unknown as OOPVideoItem[];
    const segments = segmentsManifest as unknown as OOPSegmentItem[];

    // 0 progress
    const zeroMetrics = calculateOOPMetrics(days, videos, segments, {}, {}, {}, {}, {});
    expect(zeroMetrics.completedDays).toBe(0);
    expect(zeroMetrics.coursePercentage).toBe(0);

    // Partial progress
    const partialMetrics = calculateOOPMetrics(
      days,
      videos,
      segments,
      { "BSVKUk58K6U": { videoId: "BSVKUk58K6U", watched: true, watchedAt: "2026-11-04T00:00:00Z" } },
      {},
      { "oop-lab-class-object": { labId: "oop-lab-class-object", scenarioId: "default", status: "completed" } },
      { 1: { dayNumber: 1, assignmentCompleted: true } },
      {}
    );
    expect(partialMetrics.completedDays).toBe(1);
    expect(partialMetrics.watchedVideos).toBe(1);
    expect(partialMetrics.completedLabs).toBe(1);
    expect(partialMetrics.coursePercentage).toBeGreaterThan(0);
  });

  it("determines the next recommended uncompleted study day", () => {
    expect(getRecommendedNextOOPDay(OOP_12_DAY_CURRICULUM, {})).toBe(1);

    expect(
      getRecommendedNextOOPDay(OOP_12_DAY_CURRICULUM, {
        1: { dayNumber: 1, assignmentCompleted: true },
        2: { dayNumber: 2, assignmentCompleted: true },
      })
    ).toBe(3);
  });
});

