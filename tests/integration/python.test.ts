import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getPythonDashboardData } from "@/features/python/server/service";
import playlistsManifest from "@/content/dsa/playlists-manifest.json";
import { AVAILABLE_NAVIGATION_ITEMS } from "@/components/shell/navigation-config";

describe("Python & DSA Curriculum & Playlist Integration Tests", () => {
  it("loads complete Python & DSA roadmap with 8 stages, 43 verified English videos, and 16 labs", async () => {
    const data = await getPythonDashboardData(null, null);

    // 1. Verify course metadata
    expect(data.course.slug).toBe("python-dsa");
    expect(data.course.title).toBe("Python & DSA Mastery Roadmap");
    expect(data.course.estimatedStages).toBe(8);
    expect(data.course.estimatedHours).toBeGreaterThanOrEqual(20);

    // 2. Verify all 8 stages
    expect(data.stages).toHaveLength(8);
    for (let i = 0; i < 8; i++) {
      const stage = data.stages[i];
      expect(stage.stageNumber).toBe(i + 1);
      expect(stage.modules.length).toBeGreaterThan(0);
      expect(stage.learningOutcomes.length).toBeGreaterThan(0);
      expect(stage.practicalAssignment.title).toBeTruthy();
      expect(stage.interviewQuestions.length).toBeGreaterThanOrEqual(1);
    }

    // 3. Verify video collection: 43 verified lectures
    expect(data.videos).toHaveLength(43);

    // Verify first and last videos
    expect(data.videos[0].position).toBe(1);
    expect(data.videos[0].youtubeVideoId).toBe("rfscVS0vtbw");
    expect(data.videos[0].stageNumber).toBe(1);
    expect(data.videos[0].canonicalUrl).toBe("https://www.youtube.com/watch?v=rfscVS0vtbw");

    expect(data.videos[42].position).toBe(43);
    expect(data.videos[42].youtubeVideoId).toBe("7kW34g7751E");
    expect(data.videos[42].stageNumber).toBe(8);
    expect(data.videos[42].canonicalUrl).toBe("https://www.youtube.com/watch?v=7kW34g7751E");

    // Verify all 43 videos have valid 11-char IDs and verified status
    for (const v of data.videos) {
      expect(v.verificationStatus).toBe("verified");
      expect(v.youtubeVideoId).toHaveLength(11);
      expect(v.title).toBeTruthy();
      expect(v.channel).toBeTruthy();
      expect(v.estimatedMinutes).toBeGreaterThan(0);
    }

    // 4. Verify 16 practical hands-on labs across all stages
    expect(data.exercises).toHaveLength(16);
    const exerciseStageNumbers = new Set(data.exercises.map((e) => e.stageNumber));
    for (let s = 1; s <= 8; s++) {
      expect(exerciseStageNumbers.has(s)).toBe(true);
    }

    // 5. Verify initial metrics
    expect(data.metrics.totalVideos).toBe(43);
    expect(data.metrics.watchedVideos).toBe(0);
  });

  it("includes Python DSA Mastery playlist in dsa playlists catalog with 43 English videos", () => {
    const pythonPlaylist = playlistsManifest.find((p) => p.slug === "python-dsa-mastery");
    expect(pythonPlaylist).toBeDefined();
    expect(pythonPlaylist?.title).toBe("Python DSA Mastery — Algorithms & Data Structures");
    expect(pythonPlaylist?.language).toBe("Python");
    expect(pythonPlaylist?.videoCount).toBe(43);
    expect(pythonPlaylist?.videos).toHaveLength(43);

    for (const vid of pythonPlaylist!.videos) {
      expect(vid.youtubeVideoId).toHaveLength(11);
      expect(vid.title).toBeTruthy();
      expect(vid.canonicalWatchUrl).toContain("youtube.com/watch?v=");
    }
  });

  it("registers Python DSA Mastery in sidebar navigation under practice", () => {
    const pythonNav = AVAILABLE_NAVIGATION_ITEMS.find((item) => item.id === "python-dsa");
    expect(pythonNav).toBeDefined();
    expect(pythonNav?.label).toBe("Python DSA Mastery");
    expect(pythonNav?.href).toBe("/roadmap/python");
    expect(pythonNav?.group).toBe("practice");
    expect(pythonNav?.matchPrefixes).toContain("/practice/dsa/playlists/python-dsa-mastery");
    expect(pythonNav?.matchPrefixes).toContain("/roadmap/python");
  });
});
