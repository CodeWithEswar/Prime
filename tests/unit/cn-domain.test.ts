import { describe, expect, it } from "vitest";
import {
  CN_12_DAY_CURRICULUM,
  calculateCNMetrics,
  getRecommendedNextCNDay,
  type CNVideoItem,
} from "@/domain/cn";
import manifestJson from "@/content/cn/neso-playlist-manifest.json";
import supplementaryJson from "@/content/cn/cn-supplementary-manifest.json";
import exercisesJson from "@/content/cn/cn-exercises.json";

describe("CN Domain & Curriculum Architecture", () => {
  const manifest = manifestJson as CNVideoItem[];

  it("manifest contains exactly 135 sequential positions", () => {
    expect(manifest.length).toBe(135);
    expect(new Set(manifest.map((item) => item.youtubeVideoId)).size).toBe(
      manifest.length
    );
    manifest.forEach((item, idx) => {
      expect(item.verificationStatus).toBe("verified");
      expect(item.youtubeVideoId).toMatch(/^[\w-]{11}$/);
      expect(item.canonicalWatchUrl).toBe(
        "https://www.youtube.com/watch?v=" + item.youtubeVideoId
      );
      expect(item.playlistPosition).toBe(idx + 1);
      expect(item.playlistContextUrl).toContain(`index=${idx + 1}`);
      if (item.assignedStudyDay) {
        expect(item.assignedStudyDay).toBeGreaterThanOrEqual(1);
        expect(item.assignedStudyDay).toBeLessThanOrEqual(11);
      }
    });
  });

  it("keeps the original progress key for a corrected playback ID", () => {
    expect(manifest[13]).toMatchObject({
      playlistPosition: 14,
      youtubeVideoId: "qBXmbJZQ5rY",
      progressId: "oQzueBVyAM4",
    });
    const progress = {
      oQzueBVyAM4: { videoId: "oQzueBVyAM4", watched: true, revisionDue: false },
    };
    expect(
      calculateCNMetrics(manifest, CN_12_DAY_CURRICULUM, progress, {}).watchedVideos
    ).toBe(1);
  });

  it("corroborates verified initial position (1 = VwN91x5i25g)", () => {
    const item1 = manifest.find((m) => m.playlistPosition === 1);
    expect(item1?.youtubeVideoId).toBe("VwN91x5i25g");
    expect(item1?.verificationStatus).toBe("verified");
  });

  it("marks positions 131 through 135 explicitly as chapter previews", () => {
    for (let pos = 131; pos <= 135; pos++) {
      const item = manifest.find((m) => m.playlistPosition === pos);
      expect(item?.contentKind).toBe("chapter_preview");
    }
  });

  it("contains 9 curated verified English supplementary lessons", () => {
    expect(supplementaryJson.length).toBe(9);
    supplementaryJson.forEach((supp) => {
      expect(supp.isSupplementary).toBe(true);
      expect(supp.youtubeVideoId).toBeTruthy();
      expect(supp.verificationStatus).toBe("verified");
      expect(supp.language).toBe("English");
      expect([6, 9, 10, 11]).toContain(supp.assignedStudyDay);
    });
  });

  it("contains 12 practical day-wise exercises", () => {
    expect(exercisesJson.length).toBe(12);
    exercisesJson.forEach((ex, idx) => {
      expect(ex.dayNumber).toBe(idx + 1);
      expect(ex.title.length).toBeGreaterThan(0);
      expect(ex.description.length).toBeGreaterThan(0);
    });
  });

  it("curriculum defines all 12 days with learning outcomes, deliverables, and interview questions", () => {
    expect(CN_12_DAY_CURRICULUM.length).toBe(12);
    CN_12_DAY_CURRICULUM.forEach((day, index) => {
      expect(day.dayNumber).toBe(index + 1);
      expect(day.title.length).toBeGreaterThan(0);
      expect(day.learningOutcomes.length).toBeGreaterThan(0);
      expect(day.deliverable.length).toBeGreaterThan(0);
      expect(day.interviewQuestions.length).toBeGreaterThan(0);
    });
  });

  it("calculates CN progress metrics and recommended next day correctly", () => {
    const videoProgressMap = {
      VwN91x5i25g: { videoId: "VwN91x5i25g", watched: true, revisionDue: false },
      "2": { videoId: "2", watched: true, revisionDue: true },
    };
    const dayProgressMap = {
      1: { dayNumber: 1, assignmentCompleted: true },
    };
    const labAttempts = {
      "lab-osi": { labId: "lab-osi", status: "completed" as const },
    };

    const metrics = calculateCNMetrics(
      manifest,
      CN_12_DAY_CURRICULUM,
      videoProgressMap,
      dayProgressMap,
      labAttempts
    );

    expect(metrics.totalVideos).toBe(135);
    expect(metrics.watchedVideos).toBe(2);
    expect(metrics.totalDays).toBe(12);
    expect(metrics.completedDays).toBe(1);
    expect(metrics.revisionDueCount).toBe(1);
    expect(metrics.labsCompletedCount).toBe(1);
    expect(metrics.totalLabs).toBe(10);
    expect(metrics.completionPercentage).toBeGreaterThan(0);

    const nextDay = getRecommendedNextCNDay(
      CN_12_DAY_CURRICULUM,
      dayProgressMap,
      videoProgressMap,
      manifest
    );
    expect(nextDay).toBe(2);
  });
});
