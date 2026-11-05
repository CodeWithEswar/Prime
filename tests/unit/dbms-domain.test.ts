import { describe, it, expect } from "vitest";
import {
  DBMS_DAYS_CURRICULUM,
  calculateDBMSProgress,
  calculateTopicMastery,
  filterVideos,
  getNextRecommendedItem,
  DBMSVideoItem,
  DBMSSQLExercise,
  UserVideoProgress,
  UserDayProgress,
  UserExerciseAttempt,
} from "@/domain/dbms";
import nesoManifest from "@/content/dbms/neso-video-manifest.json";
import supplementaryManifest from "@/content/dbms/supplementary-manifest.json";
import sqlExercises from "@/content/dbms/sql-exercises.json";

describe("DBMS Curriculum & Manifest Integrity", () => {
  it("should have exactly 12 days in the curriculum specification", () => {
    expect(DBMS_DAYS_CURRICULUM).toHaveLength(12);
    expect(DBMS_DAYS_CURRICULUM.map((d) => d.dayNumber)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
  });

  it("should have all 91 Neso Academy videos with authentic IDs and positions 1 to 91", () => {
    expect(nesoManifest).toHaveLength(91);

    // Verify sequential positions
    nesoManifest.forEach((video, index) => {
      expect(video.position).toBe(index + 1);
      expect(video.youtubeVideoId).toBeTruthy();
      expect(video.youtubeVideoId).toHaveLength(11);
      expect(video.canonicalUrl).toBe(`https://www.youtube.com/watch?v=${video.youtubeVideoId}`);
      expect(video.verificationStatus).toBe("verified");
      expect(video.channel).toBe("Neso Academy");
    });

    // Check position 1 and 91 specifically
    expect(nesoManifest[0].position).toBe(1);
    expect(nesoManifest[0].youtubeVideoId).toBe("OMwgGL3lHlI");
    expect(nesoManifest[0].title).toBe("Introduction to Database Management Systems (DBMS)");

    expect(nesoManifest[90].position).toBe(91);
    expect(nesoManifest[90].youtubeVideoId).toBe("zedTLRkfCz0");
    expect(nesoManifest[90].title).toBe(
      "MySQL Practicals | Chapter 5 | Database Management Systems (DBMS)"
    );
  });

  it("should have 12 supplementary videos covering Days 9, 10, 11", () => {
    expect(supplementaryManifest).toHaveLength(12);
    for (const v of supplementaryManifest) {
      expect(v.youtubeVideoId).toHaveLength(11);
      expect([9, 10, 11]).toContain(v.dayNumber);
      expect(v.verificationStatus).toBe("verified");
    }
  });

  it("should have 12 SQL exercises mapped across practice days", () => {
    expect(sqlExercises).toHaveLength(12);
    for (const ex of sqlExercises) {
      expect(ex.id).toBeTruthy();
      expect(ex.externalUrl).toMatch(/^https?:\/\//);
      expect(ex.dayNumber).toBeGreaterThanOrEqual(6);
      expect(ex.dayNumber).toBeLessThanOrEqual(12);
    }
  });
});

describe("DBMS Calculator & Progress Engine", () => {
  const sampleVideos: DBMSVideoItem[] = [
    {
      position: 1,
      youtubeVideoId: "vid1",
      title: "Video 1",
      channel: "Neso Academy",
      canonicalUrl: "https://www.youtube.com/watch?v=vid1",
      dayNumber: 1,
      difficulty: "Easy",
      importance: "High",
      topicSlug: "dbms-fundamentals",
      estimatedMinutes: 10,
      verificationStatus: "verified",
    },
    {
      position: 2,
      youtubeVideoId: "vid2",
      title: "Video 2",
      channel: "Neso Academy",
      canonicalUrl: "https://www.youtube.com/watch?v=vid2",
      dayNumber: 1,
      difficulty: "Medium",
      importance: "Critical",
      topicSlug: "dbms-fundamentals",
      estimatedMinutes: 20,
      verificationStatus: "verified",
    },
    {
      position: 3,
      youtubeVideoId: "vid3",
      title: "Video 3",
      channel: "Neso Academy",
      canonicalUrl: "https://www.youtube.com/watch?v=vid3",
      dayNumber: 2,
      difficulty: "Hard",
      importance: "Critical",
      topicSlug: "relational-model",
      estimatedMinutes: 30,
      verificationStatus: "verified",
    },
  ];

  const sampleDays = DBMS_DAYS_CURRICULUM.slice(0, 2);

  const sampleExercises: DBMSSQLExercise[] = [
    {
      id: "ex1",
      dayNumber: 1,
      title: "Exercise 1",
      description: "Test",
      difficulty: "Easy",
      externalUrl: "https://sqlbolt.com",
      sourcePlatform: "SQLBolt",
      topic: "DDL",
      estimatedMinutes: 15,
    },
  ];

  it("calculates initial progress when nothing is completed", () => {
    const videoProgress: Record<string, UserVideoProgress> = {};
    const dayProgress: Record<number, UserDayProgress> = {};
    const exerciseAttempts: Record<string, UserExerciseAttempt> = {};

    const metrics = calculateDBMSProgress(
      sampleDays,
      sampleVideos,
      videoProgress,
      dayProgress,
      sampleExercises,
      exerciseAttempts
    );

    expect(metrics.totalVideos).toBe(3);
    expect(metrics.watchedVideos).toBe(0);
    expect(metrics.totalMinutes).toBe(60);
    expect(metrics.watchedMinutes).toBe(0);
    expect(metrics.percentageComplete).toBe(0);
    expect(metrics.completedDays).toBe(0);
    expect(metrics.currentDay).toBe(1);
  });

  it("calculates progress accurately when some videos are watched", () => {
    const videoProgress: Record<string, UserVideoProgress> = {
      vid1: { videoId: "vid1", watched: true, watchedAt: "2026-11-04" },
    };
    const dayProgress: Record<number, UserDayProgress> = {};
    const exerciseAttempts: Record<string, UserExerciseAttempt> = {};

    const metrics = calculateDBMSProgress(
      sampleDays,
      sampleVideos,
      videoProgress,
      dayProgress,
      sampleExercises,
      exerciseAttempts
    );

    expect(metrics.watchedVideos).toBe(1);
    expect(metrics.watchedMinutes).toBe(10);
    expect(metrics.percentageComplete).toBe(33); // 1 / 3 = 33%
    expect(metrics.currentDay).toBe(1);
  });

  it("marks a day complete when all day videos and assignment are done", () => {
    const videoProgress: Record<string, UserVideoProgress> = {
      vid1: { videoId: "vid1", watched: true },
      vid2: { videoId: "vid2", watched: true },
    };
    const dayProgress: Record<number, UserDayProgress> = {
      1: { dayNumber: 1, assignmentCompleted: true },
    };
    const exerciseAttempts: Record<string, UserExerciseAttempt> = {};

    const metrics = calculateDBMSProgress(
      sampleDays,
      sampleVideos,
      videoProgress,
      dayProgress,
      sampleExercises,
      exerciseAttempts
    );

    expect(metrics.completedDays).toBe(1);
    expect(metrics.currentDay).toBe(2);
  });

  it("calculates topic mastery distribution correctly", () => {
    const videoProgress: Record<string, UserVideoProgress> = {
      vid1: { videoId: "vid1", watched: true },
    };

    const mastery = calculateTopicMastery(sampleVideos, videoProgress);
    const fundamentals = mastery.find((t) => t.topicSlug === "dbms-fundamentals");
    const relational = mastery.find((t) => t.topicSlug === "relational-model");

    expect(fundamentals?.totalVideos).toBe(2);
    expect(fundamentals?.watchedVideos).toBe(1);
    expect(fundamentals?.percentage).toBe(50);
    expect(fundamentals?.masteryStatus).toBe("in_progress");

    expect(relational?.totalVideos).toBe(1);
    expect(relational?.watchedVideos).toBe(0);
    expect(relational?.percentage).toBe(0);
    expect(relational?.masteryStatus).toBe("not_started");
  });

  it("recommends the next incomplete video, then assignment, then exercise", () => {
    const videoProgress: Record<string, UserVideoProgress> = {};
    const dayProgress: Record<number, UserDayProgress> = {};
    const exerciseAttempts: Record<string, UserExerciseAttempt> = {};

    // First recommendation should be vid1
    const rec1 = getNextRecommendedItem(
      sampleDays,
      sampleVideos,
      videoProgress,
      dayProgress,
      sampleExercises,
      exerciseAttempts
    );
    expect(rec1.type).toBe("video");
    expect(rec1.videoId).toBe("vid1");

    // After vid1 watched, next is vid2
    videoProgress["vid1"] = { videoId: "vid1", watched: true };
    const rec2 = getNextRecommendedItem(
      sampleDays,
      sampleVideos,
      videoProgress,
      dayProgress,
      sampleExercises,
      exerciseAttempts
    );
    expect(rec2.type).toBe("video");
    expect(rec2.videoId).toBe("vid2");

    // After vid2 watched, assignment is recommended
    videoProgress["vid2"] = { videoId: "vid2", watched: true };
    const rec3 = getNextRecommendedItem(
      sampleDays,
      sampleVideos,
      videoProgress,
      dayProgress,
      sampleExercises,
      exerciseAttempts
    );
    expect(rec3.type).toBe("assignment");
    expect(rec3.dayNumber).toBe(1);

    // After assignment done, exercise is recommended
    dayProgress[1] = { dayNumber: 1, assignmentCompleted: true };
    const rec4 = getNextRecommendedItem(
      sampleDays,
      sampleVideos,
      videoProgress,
      dayProgress,
      sampleExercises,
      exerciseAttempts
    );
    expect(rec4.type).toBe("exercise");
    expect(rec4.exerciseId).toBe("ex1");
  });

  it("filters videos by difficulty, day, importance, and search query", () => {
    const videoProgress: Record<string, UserVideoProgress> = {
      vid1: { videoId: "vid1", watched: true, isBookmarked: true },
    };

    // Filter by day
    const day1Videos = filterVideos(sampleVideos, { dayNumber: 1 }, videoProgress);
    expect(day1Videos).toHaveLength(2);

    // Filter by difficulty
    const hardVideos = filterVideos(sampleVideos, { difficulty: "Hard" }, videoProgress);
    expect(hardVideos).toHaveLength(1);
    expect(hardVideos[0].youtubeVideoId).toBe("vid3");

    // Filter by bookmark status
    const bookmarked = filterVideos(sampleVideos, { status: "bookmarked" }, videoProgress);
    expect(bookmarked).toHaveLength(1);
    expect(bookmarked[0].youtubeVideoId).toBe("vid1");

    // Search query
    const searched = filterVideos(sampleVideos, { searchQuery: "video 3" }, videoProgress);
    expect(searched).toHaveLength(1);
    expect(searched[0].youtubeVideoId).toBe("vid3");
  });
});

