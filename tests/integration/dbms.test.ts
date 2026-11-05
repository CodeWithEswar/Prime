import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getDBMSDashboardData } from "@/features/dbms/server/service";

describe("DBMS Service & Data Ingestion Integration Tests", () => {
  it("loads complete DBMS dashboard data with verified 91 Neso videos and supplementary items", async () => {
    const data = await getDBMSDashboardData(null, null);

    // 1. Verify course metadata
    expect(data.course.slug).toBe("dbms-12-day");
    expect(data.course.title).toBe("12-Day DBMS Mastery Curriculum");
    expect(data.course.estimatedDays).toBe(12);

    // 2. Verify all 12 days
    expect(data.days).toHaveLength(12);
    expect(data.days[0].dayNumber).toBe(1);
    expect(data.days[11].dayNumber).toBe(12);

    // 3. Verify total video collection: 91 Neso + 12 Supplementary = 103
    expect(data.videos).toHaveLength(103);

    const nesoVideos = data.videos.filter((v) => !v.isSupplementary);
    expect(nesoVideos).toHaveLength(91);

    // Verify first and last Neso positions
    expect(nesoVideos[0].position).toBe(1);
    expect(nesoVideos[0].youtubeVideoId).toBe("OMwgGL3lHlI");
    expect(nesoVideos[0].title).toBe("Introduction to Database Management Systems (DBMS)");
    expect(nesoVideos[0].canonicalUrl).toBe("https://www.youtube.com/watch?v=OMwgGL3lHlI");

    expect(nesoVideos[90].position).toBe(91);
    expect(nesoVideos[90].youtubeVideoId).toBe("zedTLRkfCz0");
    expect(nesoVideos[90].title).toBe(
      "MySQL Practicals | Chapter 5 | Database Management Systems (DBMS)"
    );
    expect(nesoVideos[90].canonicalUrl).toBe("https://www.youtube.com/watch?v=zedTLRkfCz0");

    // Verify all 91 videos are marked verified
    for (const v of nesoVideos) {
      expect(v.verificationStatus).toBe("verified");
      expect(v.channel).toBe("Neso Academy");
      expect(v.youtubeVideoId).toHaveLength(11);
    }

    // 4. Verify supplementary videos
    const suppVideos = data.videos.filter((v) => v.isSupplementary);
    expect(suppVideos).toHaveLength(12);
    for (const v of suppVideos) {
      expect(v.isSupplementary).toBe(true);
      expect(v.youtubeVideoId).toHaveLength(11);
      expect([9, 10, 11]).toContain(v.dayNumber);
    }

    // 5. Verify SQL exercises
    expect(data.exercises).toHaveLength(12);

    // 6. Verify initial metrics
    expect(data.metrics.totalVideos).toBe(103);
    expect(data.metrics.watchedVideos).toBe(0);
    expect(data.metrics.percentageComplete).toBe(0);
    expect(data.metrics.completedDays).toBe(0);
    expect(data.metrics.currentDay).toBe(1);

    // Verify topics
    expect(data.metrics.topicsMastery.length).toBeGreaterThanOrEqual(10);
  });
});
