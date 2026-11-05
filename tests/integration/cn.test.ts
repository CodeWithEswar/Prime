import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getCNDashboardData } from "@/features/cn/server/service";

describe("Computer Networks Service & Data Ingestion Integration Tests", () => {
  it("loads complete CN dashboard data with 135 Neso positions, 9 supplementary modules, and 10 labs", async () => {
    const data = await getCNDashboardData(null, null);

    // 1. Verify course metadata
    expect(data.course.slug).toBe("cn-12-day");
    expect(data.course.title).toContain("Computer Networks");
    expect(data.course.estimatedDays).toBe(12);

    // 2. Verify all 12 days
    expect(data.days).toHaveLength(12);
    expect(data.days[0].dayNumber).toBe(1);
    expect(data.days[11].dayNumber).toBe(12);

    // 3. Verify Neso positions: 135
    expect(data.videos).toHaveLength(135);

    // Verify first lesson corroborated ID
    expect(data.videos[0].playlistPosition).toBe(1);
    expect(data.videos[0].youtubeVideoId).toBe("VwN91x5i25g");
    expect(data.videos[0].verificationStatus).toBe("verified");
    expect(data.videos[0].playlistContextUrl).toContain("index=1");

    // Verify last positions are chapter previews
    expect(data.videos[134].playlistPosition).toBe(135);
    expect(data.videos[134].contentKind).toBe("chapter_preview");

    // 4. Verify supplementary videos
    expect(data.supplementaryVideos).toHaveLength(9);
    for (const v of data.supplementaryVideos) {
      expect(v.isSupplementary).toBe(true);
      expect(v.youtubeVideoId).toBeTruthy();
      expect(v.language).toBe("English");
      expect([6, 9, 10, 11]).toContain(v.assignedStudyDay);
    }

    // 5. Verify initial guest metrics
    expect(data.metrics.totalVideos).toBe(144); // 135 + 9
    expect(data.metrics.watchedVideos).toBe(0);
    expect(data.metrics.completedDays).toBe(0);
    expect(data.metrics.totalLabs).toBe(10);
    expect(data.metrics.labsCompletedCount).toBe(0);
    expect(data.metrics.completionPercentage).toBe(0);
  });
});

