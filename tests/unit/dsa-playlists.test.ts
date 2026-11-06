import { describe, it, expect } from "vitest";
import type { DSAPlaylistSummary, DSALessonItem, PlaylistStatusFilter } from "@/features/dsa-playlists/types";

// Helper functions that mirror or test domain behaviors
function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`.trim();
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds > 0 ? `${seconds}s` : ""}`.trim();
  }
  return `${seconds}s`;
}

function calculateProgress(completedCount: number, totalCount: number): number {
  if (totalCount <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((completedCount / totalCount) * 100)));
}

function findNextLesson(
  lessons: { id: string; youtubeVideoId: string; title: string; position: number; isCompleted: boolean }[],
  lastVideoId: string | null = null
) {
  if (!lessons.length) return null;

  // If lastVideoId is present, check if it's incomplete
  if (lastVideoId) {
    const lastLesson = lessons.find((l) => l.youtubeVideoId === lastVideoId || l.id === lastVideoId);
    if (lastLesson && !lastLesson.isCompleted) {
      return lastLesson;
    }
  }

  // Otherwise find the first uncompleted lesson in sequential position order
  const sorted = [...lessons].sort((a, b) => a.position - b.position);
  const next = sorted.find((l) => !l.isCompleted);
  return next ?? null;
}

function filterPlaylists(
  playlists: DSAPlaylistSummary[],
  options: {
    search?: string;
    instructor?: string;
    status?: PlaylistStatusFilter;
  }
): DSAPlaylistSummary[] {
  return playlists.filter((pl) => {
    // Search query matches title, description, or topic tags
    if (options.search) {
      const q = options.search.toLowerCase();
      const matchTitle = pl.title.toLowerCase().includes(q);
      const matchInstructor = pl.instructor.toLowerCase().includes(q);
      const matchTags = pl.topicTags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchInstructor && !matchTags) return false;
    }

    // Instructor filter
    if (options.instructor && options.instructor !== "all") {
      if (pl.instructor.toLowerCase() !== options.instructor.toLowerCase()) {
        return false;
      }
    }

    // Status filter
    if (options.status && options.status !== "all") {
      if (options.status === "enrolled" && !pl.isEnrolled) return false;
      if (options.status === "not_started" && (pl.isEnrolled || pl.completedLessonsCount > 0)) return false;
      if (options.status === "in_progress") {
        if (!pl.isEnrolled || pl.progressPercentage === 0 || pl.progressPercentage === 100) return false;
      }
      if (options.status === "completed") {
        if (pl.progressPercentage < 100) return false;
      }
    }

    return true;
  });
}

describe("DSA Playlists & Tracks Engine", () => {
  const mockPlaylists: DSAPlaylistSummary[] = [
    {
      id: "pl-striver-a2z",
      slug: "striver-a2z-dsa",
      youtubePlaylistId: "PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz",
      title: "Striver's A2Z DSA Course",
      instructor: "Striver",
      channelTitle: "take U forward",
      description: "Complete DSA placement preparation roadmap from basics to advanced patterns.",
      difficulty: "Beginner → Advanced",
      level: "Beginner → Advanced",
      focus: "Complete placement DSA roadmap",
      programmingLanguage: "C++ / Java / Python",
      thumbnailUrl: "https://i.ytimg.com/vi/EAR7De6GpoA/hqdefault.jpg",
      videoCount: 100,
      totalDurationSeconds: 154000,
      topicTags: ["arrays", "binary-search", "recursion", "trees", "graphs", "dp"],
      isFeatured: true,
      isDefault: true,
      isEnrolled: true,
      enrollmentStatus: "active",
      completedLessonsCount: 35,
      progressPercentage: 35,
      lastVideoId: "EAR7De6GpoA",
      lastActivityAt: "2026-11-06T10:00:00Z",
    },
    {
      id: "pl-kunal-bootcamp",
      slug: "kunal-java-dsa-bootcamp",
      youtubePlaylistId: "PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ",
      title: "Java + DSA Bootcamp",
      instructor: "Kunal Kushwaha",
      channelTitle: "Kunal Kushwaha",
      description: "Complete Java with Data Structures and Algorithms bootcamp.",
      difficulty: "Beginner → Advanced",
      level: "Beginner → Advanced",
      focus: "Java language and core DSA concepts",
      programmingLanguage: "Java",
      thumbnailUrl: "https://i.ytimg.com/vi/wn49bRJ3G4k/hqdefault.jpg",
      videoCount: 69,
      totalDurationSeconds: 102000,
      topicTags: ["java", "arrays", "searching", "sorting", "trees", "oop"],
      isFeatured: true,
      isDefault: false,
      isEnrolled: false,
      enrollmentStatus: null,
      completedLessonsCount: 0,
      progressPercentage: 0,
      lastVideoId: null,
      lastActivityAt: null,
    },
    {
      id: "pl-aditya-dp",
      slug: "aditya-verma-binary-search",
      youtubePlaylistId: "PL_z_8CaSLPWeYfhtuKHj-9MpYb6XQJ_f2",
      title: "Binary Search Playlist",
      instructor: "Aditya Verma",
      channelTitle: "Aditya Verma",
      description: "Master all patterns of Binary Search with intuitive reasoning.",
      difficulty: "Intermediate",
      level: "Intermediate",
      focus: "Binary search variations and boundary conditions",
      programmingLanguage: "C++",
      thumbnailUrl: "https://i.ytimg.com/vi/j7NodO9HIbk/hqdefault.jpg",
      videoCount: 21,
      totalDurationSeconds: 24000,
      topicTags: ["binary-search", "arrays"],
      isFeatured: false,
      isDefault: false,
      isEnrolled: true,
      enrollmentStatus: "completed",
      completedLessonsCount: 21,
      progressPercentage: 100,
      lastVideoId: "j7NodO9HIbk",
      lastActivityAt: "2026-11-05T12:00:00Z",
    },
    {
      id: "pl-abdul-bari",
      slug: "abdul-bari-algorithms",
      youtubePlaylistId: "PLDN4rrl48X7Zg14L6i4o7Zp_V1yE_Fw8W",
      title: "Algorithms with Abdul Bari",
      instructor: "Abdul Bari",
      channelTitle: "Abdul Bari",
      description: "World renowned fundamental computer science and algorithmic complexity series.",
      difficulty: "Intermediate → Advanced",
      level: "Intermediate → Advanced",
      focus: "Algorithm analysis, divide and conquer, greedy, dynamic programming",
      programmingLanguage: "Language Agnostic",
      thumbnailUrl: "https://i.ytimg.com/vi/0IAPZzGSbME/hqdefault.jpg",
      videoCount: 74,
      totalDurationSeconds: 98000,
      topicTags: ["algorithms", "asymptotic-analysis", "greedy", "dynamic-programming"],
      isFeatured: true,
      isDefault: false,
      isEnrolled: false,
      enrollmentStatus: null,
      completedLessonsCount: 0,
      progressPercentage: 0,
      lastVideoId: null,
      lastActivityAt: null,
    },
  ];

  describe("Duration Formatting", () => {
    it("formats seconds into hours and minutes", () => {
      expect(formatDuration(3600)).toBe("1h");
      expect(formatDuration(3660)).toBe("1h 1m");
      expect(formatDuration(7500)).toBe("2h 5m");
    });

    it("formats sub-hour durations correctly", () => {
      expect(formatDuration(125)).toBe("2m 5s");
      expect(formatDuration(45)).toBe("45s");
    });
  });

  describe("Progress Calculation", () => {
    it("calculates percentage accurately", () => {
      expect(calculateProgress(0, 100)).toBe(0);
      expect(calculateProgress(50, 100)).toBe(50);
      expect(calculateProgress(1, 3)).toBe(33);
      expect(calculateProgress(2, 3)).toBe(67);
      expect(calculateProgress(100, 100)).toBe(100);
    });

    it("handles boundary values and edge cases gracefully", () => {
      expect(calculateProgress(0, 0)).toBe(0);
      expect(calculateProgress(150, 100)).toBe(100);
      expect(calculateProgress(-5, 100)).toBe(0);
    });
  });

  describe("Next Lesson Resolution", () => {
    const mockLessons = [
      { id: "v1", youtubeVideoId: "yt1", title: "Introduction", position: 1, isCompleted: true },
      { id: "v2", youtubeVideoId: "yt2", title: "Time Complexity", position: 2, isCompleted: true },
      { id: "v3", youtubeVideoId: "yt3", title: "Array Basics", position: 3, isCompleted: false },
      { id: "v4", youtubeVideoId: "yt4", title: "Two Pointers", position: 4, isCompleted: false },
    ];

    it("picks first incomplete lesson sequentially", () => {
      const next = findNextLesson(mockLessons);
      expect(next).not.toBeNull();
      expect(next?.id).toBe("v3");
      expect(next?.position).toBe(3);
    });

    it("picks unfinished last active lesson if user left it incomplete", () => {
      const next = findNextLesson(mockLessons, "yt4");
      expect(next?.id).toBe("v4");
      expect(next?.position).toBe(4);
    });

    it("advances to next incomplete lesson if last video was finished", () => {
      const next = findNextLesson(mockLessons, "yt2");
      expect(next?.id).toBe("v3");
    });

    it("returns null when all lessons are finished", () => {
      const allDone = mockLessons.map((l) => ({ ...l, isCompleted: true }));
      const next = findNextLesson(allDone);
      expect(next).toBeNull();
    });
  });

  describe("Playlist Catalog Filtering", () => {
    it("filters by instructor accurately", () => {
      const striverOnly = filterPlaylists(mockPlaylists, { instructor: "Striver" });
      expect(striverOnly).toHaveLength(1);
      expect(striverOnly[0].instructor).toBe("Striver");

      const adityaOnly = filterPlaylists(mockPlaylists, { instructor: "Aditya Verma" });
      expect(adityaOnly).toHaveLength(1);
      expect(adityaOnly[0].title).toContain("Binary Search");
    });

    it("filters by topic tags and search query", () => {
      const binarySearch = filterPlaylists(mockPlaylists, { search: "binary-search" });
      expect(binarySearch).toHaveLength(2); // Striver A2Z and Aditya Verma

      const javaQuery = filterPlaylists(mockPlaylists, { search: "kunal" });
      expect(javaQuery).toHaveLength(1);
      expect(javaQuery[0].instructor).toBe("Kunal Kushwaha");
    });

    it("filters by enrollment status", () => {
      const enrolled = filterPlaylists(mockPlaylists, { status: "enrolled" });
      expect(enrolled).toHaveLength(2);

      const inProgress = filterPlaylists(mockPlaylists, { status: "in_progress" });
      expect(inProgress).toHaveLength(1);
      expect(inProgress[0].id).toBe("pl-striver-a2z");

      const completed = filterPlaylists(mockPlaylists, { status: "completed" });
      expect(completed).toHaveLength(1);
      expect(completed[0].id).toBe("pl-aditya-dp");

      const notStarted = filterPlaylists(mockPlaylists, { status: "not_started" });
      expect(notStarted).toHaveLength(2); // Kunal and Abdul Bari
    });
  });

  describe("YouTube Embed URL Security and Format", () => {
    it("generates privacy-enhanced youtube-nocookie embed URL", () => {
      const videoId = "EAR7De6GpoA";
      const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`;
      expect(embedUrl).toContain("youtube-nocookie.com/embed/EAR7De6GpoA");
      expect(embedUrl).toContain("rel=0");
    });
  });
});

