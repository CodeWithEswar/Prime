import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import manifest from "@/content/dsa/kunal-bootcamp-manifest.json";
import { KunalAnalyticsView } from "@/features/kunal-bootcamp/components/kunal-analytics-view";
import { KunalAssignmentsChart } from "@/features/kunal-bootcamp/components/charts/kunal-assignments-chart";
import type { KunalAnalyticsData } from "@/features/kunal-bootcamp/types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockAnalyticsData: KunalAnalyticsData = {
  overview: {
    totalVideos: 69,
    completedVideos: 12,
    videoPct: 17,
    totalProblems: 429,
    solvedProblems: 45,
    problemPct: 10,
    totalAssignments: 18,
    completedAssignments: 3,
    assignmentPct: 17,
    activeStudyDays: 9,
    masteryPct: 28,
  },
  videoCompletionTrend: [
    { date: "11-01", completed: 2, cumulative: 2, problemsSolved: 4, cumulativeProblems: 4 },
    { date: "11-02", completed: 3, cumulative: 5, problemsSolved: 6, cumulativeProblems: 10 },
  ],
  problemsByTopic: [
    { topic: "01 Flow of Program", easy: 4, medium: 1, hard: 0, total: 5 },
    { topic: "02 First Java", easy: 7, medium: 2, hard: 0, total: 9 },
    { topic: "05 Arrays & ArrayList", easy: 15, medium: 8, hard: 2, total: 25 },
  ],
  topicCoverage: [
    { topic: "Flow of Program", videoPct: 100, practicePct: 80, assignmentPct: 100 },
    { topic: "First Java", videoPct: 100, practicePct: 65, assignmentPct: 100 },
    { topic: "Arrays & ArrayList", videoPct: 40, practicePct: 35, assignmentPct: 50 },
  ],
  assignmentProgress: [
    { number: 1, slug: "01-flow-of-program", title: "Flow of Program", solvedProblems: 5, totalProblems: 5, progressPct: 100, status: "completed" },
    { number: 2, slug: "02-first-java", title: "First Java Program", solvedProblems: 9, totalProblems: 9, progressPct: 100, status: "completed" },
    { number: 3, slug: "03-conditionals-loops", title: "Conditionals & Loops", solvedProblems: 12, totalProblems: 15, progressPct: 80, status: "in_progress" },
    { number: 4, slug: "04-functions", title: "Functions & Methods", solvedProblems: 0, totalProblems: 14, progressPct: 0, status: "not_started" },
  ],
  weeklyConsistency: [
    { day: "Mon", videosWatched: 3, problemsSolved: 5, assignmentsCompleted: 1 },
    { day: "Tue", videosWatched: 2, problemsSolved: 4, assignmentsCompleted: 0 },
  ],
  learningVsPractice: [
    { category: "Lectures Watched", value: 12 },
    { category: "Problems Solved", value: 45 },
    { category: "Assignments Completed", value: 3 },
  ],
  activityHeatmap: Array.from({ length: 84 }).map((_, i) => ({
    date: `2026-10-${(i % 30) + 1}`,
    count: i % 4,
    videos: (i % 4) > 1 ? 1 : 0,
    problems: (i % 4) > 1 ? 2 : 0,
    assignments: 0,
    level: ((i % 4) as 0 | 1 | 2 | 3),
  })),
  radarMastery: [
    { domain: "Java Basics & Setup", score: 90, solved: 14, total: 14, level: "Mastered" },
    { domain: "Arrays & Searching", score: 60, solved: 25, total: 42, level: "Developing" },
    { domain: "Sorting Algorithms", score: 40, solved: 10, total: 25, level: "Developing" },
    { domain: "Recursion & Backtracking", score: 20, solved: 5, total: 30, level: "Learning" },
  ],
  milestones: [
    {
      id: "km-1",
      title: "Enrolled in Kunal Kushwaha Java + DSA Bootcamp",
      category: "track",
      timestamp: "2026-11-01T08:00:00Z",
      description: "Started official 19-module syllabus.",
    },
    {
      id: "km-2",
      title: "Completed Flow of Program Assignment",
      category: "topic",
      timestamp: "2026-11-01T12:00:00Z",
      description: "Solved all 5 foundational problem exercises.",
    },
  ],
};

describe("Kunal Kushwaha Java + DSA Bootcamp", () => {
  describe("Manifest Integrity & Syllabus Hierarchy", () => {
    it("contains 19 syllabus modules in exact author sequence", () => {
      expect(manifest.modules).toHaveLength(19);
      expect(manifest.modules[0].title).toBe("Programming Foundations & Tooling");
      expect(manifest.modules[1].title).toBe("Java Fundamentals & Control Flow");
      expect(manifest.modules[3].title).toBe("Arrays & Dynamic ArrayList");
      expect(manifest.modules[4].title).toBe("Searching Algorithms (Linear & Binary Search)");
      expect(manifest.modules[18].title).toBe("Advanced Interview Problems & Algorithms");
    });

    it("verifies 69 YouTube videos across the playlist", () => {
      expect(manifest.course.videosCount).toBe(69);
      const totalVideosInModules = manifest.modules.reduce((sum, m) => sum + m.videos.length, 0);
      expect(totalVideosInModules).toBe(69);
      
      // Check first video is verified YouTube ID
      const firstVideo = manifest.modules[0].videos[0];
      expect(firstVideo.youtubeVideoId).toBe("rZ41y93P2Qo");
      expect(firstVideo.channelTitle).toBe("Kunal Kushwaha");
    });

    it("includes timestamp-level chapters for videos", () => {
      const allVideos = manifest.modules.flatMap((m) => m.videos);
      const videosWithChapters = allVideos.filter((v) => v.chapters && v.chapters.length > 0);
      expect(videosWithChapters.length).toBeGreaterThan(0);
      const sample = videosWithChapters[0];
      expect(sample.chapters[0].title).toBeDefined();
      expect(typeof sample.chapters[0].timestampSeconds).toBe("number");
    });

    it("contains 18 official GitHub assignment mappings", () => {
      expect(manifest.course.assignmentsCount).toBe(18);
      const allAssignments = manifest.modules.flatMap((m) => m.assignments);
      expect(allAssignments).toHaveLength(18);
      expect(allAssignments[0].slug).toBe("01-flow-of-program");
      expect(allAssignments[0].githubUrl).toContain("assignments/01-flow-of-program.md");
    });

    it("maps coding problems with difficulty and leetcode links", () => {
      const allProblems = manifest.modules.flatMap((m) => m.problems);
      expect(allProblems.length).toBeGreaterThanOrEqual(100);
      const sample = allProblems.find((p) => p.slug === "two-sum");
      expect(sample).toBeDefined();
      expect(sample?.difficulty).toBe("easy");
      expect(sample?.leetcodeUrl).toContain("leetcode.com/problems/two-sum");
    });
  });

  describe("KunalAnalyticsView Component", () => {
    it("renders track overview KPI metrics correctly", () => {
      render(<KunalAnalyticsView analytics={mockAnalyticsData} />);

      expect(screen.getByText("Java + DSA Bootcamp Analytics")).toBeDefined();
      expect(screen.getByText("Lectures Watched")).toBeDefined();
      expect(screen.getByText("Problems Solved")).toBeDefined();
      expect(screen.getByText("Assignments Done")).toBeDefined();
      expect(screen.getByText("Track Mastery")).toBeDefined();

      // Check values
      expect(screen.getByText("12")).toBeDefined(); // completed videos
      expect(screen.getByText("45")).toBeDefined(); // solved problems
      expect(screen.getByText("3")).toBeDefined(); // completed assignments
      expect(screen.getByText("28%")).toBeDefined(); // mastery percentage
    });

    it("renders export CSV button and triggers download", () => {
      const appendSpy = vi.spyOn(document.body, "appendChild");
      const removeSpy = vi.spyOn(document.body, "removeChild");

      render(<KunalAnalyticsView analytics={mockAnalyticsData} />);

      const exportBtn = screen.getByText("Export CSV");
      expect(exportBtn).toBeDefined();

      fireEvent.click(exportBtn);
      expect(appendSpy).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalled();

      appendSpy.mockRestore();
      removeSpy.mockRestore();
    });

    it("navigates back to course workspace via breadcrumb and actions", () => {
      render(<KunalAnalyticsView analytics={mockAnalyticsData} />);

      const courseLink = screen.getByText("Kunal Kushwaha Track");
      expect(courseLink.closest("a")?.getAttribute("href")).toBe(
        "/practice/dsa/playlists/kunal-kushwaha"
      );

      const backBtn = screen.getByText("Back to Course");
      expect(backBtn.closest("a")?.getAttribute("href")).toBe(
        "/practice/dsa/playlists/kunal-kushwaha"
      );
    });
  });

  describe("KunalAssignmentsChart Component", () => {
    it("renders assignment chart and switches filters", () => {
      render(<KunalAssignmentsChart data={mockAnalyticsData.assignmentProgress} />);

      expect(screen.getByText("Official Course Assignments & Practice Progress")).toBeDefined();
      
      const allFilter = screen.getByText("All (18)");
      const completedFilter = screen.getByText("Completed");
      expect(allFilter).toBeDefined();
      expect(completedFilter).toBeDefined();

      fireEvent.click(completedFilter);
      // Filter switch does not crash
      expect(completedFilter.className).toContain("bg-white/[0.15]");
    });
  });
});
