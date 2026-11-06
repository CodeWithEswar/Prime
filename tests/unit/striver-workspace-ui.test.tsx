import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { StriverTopicNavigator } from "@/features/striver-a2z/components/striver-topic-navigator";
import { StriverVideoPlayer } from "@/features/striver-a2z/components/striver-video-player";
import { StriverWorkspace } from "@/features/striver-a2z/components/striver-workspace";
import type { StriverSheetDetail, StriverAnalyticsData, StriverModuleDetail } from "@/features/striver-a2z/types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockModules: StriverModuleDetail[] = [
  {
    id: "step-1",
    stepNumber: 1,
    title: "Learn the Basics",
    slug: "learn-the-basics",
    description: null,
    position: 1,
    stats: {
      totalVideos: 2,
      completedVideos: 1,
      totalProblems: 2,
      solvedProblems: 1,
    },
    topics: [
      {
        id: "topic-1-1",
        moduleId: "step-1",
        substepNumber: "1.1",
        position: 1,
        title: "Things to Know in C++ / Java / Python / JavaScript",
        slug: "things-to-know-in-languages",
        description: "Foundational syntax and idioms.",
        videos: [
          {
            id: "vid-1",
            youtubeVideoId: "0bHoB32fuj0",
            title: "C++ Basics in One Shot - Striver A2Z DSA",
            durationFormatted: "1h 26m",
            durationSeconds: 5160,
            channelTitle: "take U forward",
            thumbnailUrl: "https://i.ytimg.com/vi/0bHoB32fuj0/hqdefault.jpg",
            isCompleted: false,
            isBookmarked: false,
            notesContent: "",
          },
          {
            id: "vid-2",
            youtubeVideoId: "vBq25c40",
            title: "Java Fundamentals for DSA",
            durationFormatted: "58m",
            durationSeconds: 3480,
            channelTitle: "take U forward",
            thumbnailUrl: "https://i.ytimg.com/vi/vBq25c40/hqdefault.jpg",
            isCompleted: true,
            isBookmarked: false,
            notesContent: "",
          },
        ],
        problems: [
          {
            id: "prob-1",
            topicId: "topic-1-1",
            canonicalProblemId: null,
            title: "User Input / Output",
            difficulty: "easy",
            status: "solved",
            position: 1,
            leetcodeUrl: null,
            articleUrl: null,
          },
          {
            id: "prob-2",
            topicId: "topic-1-1",
            canonicalProblemId: null,
            title: "Data Types and Memory Sizes",
            difficulty: "easy",
            status: "not_started",
            position: 2,
            leetcodeUrl: null,
            articleUrl: null,
          },
        ],
        stats: {
          totalVideos: 2,
          completedVideos: 1,
          totalProblems: 2,
          solvedProblems: 1,
          masteryLevel: "developing",
        },
      },
    ],
  },
];

const mockDetail: StriverSheetDetail = {
  sheet: {
    id: "sheet-striver",
    slug: "striver-a2z",
    title: "Striver's A2Z DSA Sheet",
    author: "Striver",
    description: "Complete DSA placement course",
    officialUrl: "https://takeuforward.org",
    version: "2026.1",
  },
  modules: mockModules,
  activeTopicId: "topic-1-1",
  activeVideoId: "vid-1",
  overallStats: {
    totalVideos: 2,
    completedVideos: 1,
    videoProgressPercentage: 50,
    totalProblems: 2,
    solvedProblems: 1,
    problemProgressPercentage: 50,
    masteryPercentage: 50,
    dueRevisionsCount: 0,
    lastActivityAt: null,
  },
};

const mockAnalytics: StriverAnalyticsData = {
  overview: {
    totalLectures: 100,
    completedLectures: 25,
    lecturePct: 25,
    totalProblems: 200,
    solvedProblems: 50,
    problemPct: 25,
    activeStudyDays: 14,
    masteryPct: 30,
  },
  videoCompletionTrend: [],
  problemsByTopic: [],
  topicCoverage: [],
  weeklyConsistency: [],
  learningVsPractice: [],
  activityHeatmap: [],
  radarMastery: [],
  milestones: [],
};

describe("Striver A2Z Learning Workspace Redesign", () => {
  describe("StriverTopicNavigator", () => {
    it("renders module header and topics without hard single-line truncation", () => {
      render(
        <StriverTopicNavigator
          modules={mockModules}
          activeTopicId="topic-1-1"
          onSelectTopic={vi.fn()}
        />
      );

      // Verify step header is displayed
      expect(screen.getByText(/Learn the Basics/i)).toBeInTheDocument();
      // Verify topic title is displayed in full
      expect(screen.getByText("Things to Know in C++ / Java / Python / JavaScript")).toBeInTheDocument();
      // Verify substep badge is displayed
      expect(screen.getByText("1.1")).toBeInTheDocument();
    });

    it("filters topics when search input is typed", () => {
      render(
        <StriverTopicNavigator
          modules={mockModules}
          activeTopicId="topic-1-1"
          onSelectTopic={vi.fn()}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search topics or steps/i);
      fireEvent.change(searchInput, { target: { value: "nonexistent" } });

      expect(screen.getByText(/no topics found/i)).toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: "c++" } });
      expect(screen.getByText("Things to Know in C++ / Java / Python / JavaScript")).toBeInTheDocument();
    });
  });

  describe("StriverVideoPlayer", () => {
    it("renders video stepper, title, duration badge, and mark watched button", () => {
      render(
        <StriverVideoPlayer
          videos={mockModules[0].topics[0].videos}
          activeVideoId="vid-1"
          onSelectVideo={vi.fn()}
          topicTitle="Things to Know in C++ / Java / Python / JavaScript"
        />
      );

      // Verify lesson indicator
      expect(screen.getByText("Lesson 1 of 2")).toBeInTheDocument();
      // Verify duration badge
      expect(screen.getByText("1h 26m")).toBeInTheDocument();
      // Verify lesson title
      expect(screen.getByText("C++ Basics in One Shot - Striver A2Z DSA")).toBeInTheDocument();
      // Verify Mark Watched button
      expect(screen.getByRole("button", { name: /mark watched/i })).toBeInTheDocument();
    });
  });

  describe("StriverWorkspace", () => {
    it("renders structured header, breadcrumbs, mastery badge, and contextual tabs", () => {
      render(
        <StriverWorkspace
          initialDetail={mockDetail}
          analytics={mockAnalytics}
        />
      );

      // Breadcrumbs (without redundant duplicate Step prefix)
      expect(screen.getByText(/Step 01: Learn the Basics/i)).toBeInTheDocument();
      expect(screen.queryByText(/Step 01: Step 01/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Substep 1.1/i)).toBeInTheDocument();

      // Mobile & desktop action buttons
      expect(screen.getByRole("button", { name: /open syllabus navigation/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /analytics/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /resume/i })).toBeInTheDocument();

      // Untruncated topic header
      const headings = screen.getAllByRole("heading", { level: 2 });
      const topicHeading = headings.find((h) =>
        h.textContent?.includes("Things to Know in C++ / Java / Python / JavaScript")
      );
      expect(topicHeading).toBeDefined();

      // Mastery Badge
      expect(screen.getByText(/Mastery: Developing/i)).toBeInTheDocument();

      // Contextual tabs
      expect(screen.getByRole("tab", { name: /practice problems/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /lesson notes/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /curriculum progress/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /resources & overview/i })).toBeInTheDocument();
    });
  });

  describe("StriverProblemsTable", () => {
    it("renders un-truncated header, solved badge, search bar, and filter buttons", async () => {
      const { StriverProblemsTable } = await import(
        "@/features/striver-a2z/components/striver-problems-table"
      );

      render(
        <StriverProblemsTable
          problems={mockModules[0].topics[0].problems}
          topicTitle="Things to Know in C++ / Java / Python / JavaScript"
        />
      );

      // Verify header and badge
      expect(screen.getByText("Target Practice Problems")).toBeInTheDocument();
      expect(screen.getByText(/Solved \(50%\)/i)).toBeInTheDocument();

      // Verify problem titles
      expect(screen.getByText("User Input / Output")).toBeInTheDocument();
      expect(screen.getByText("Data Types and Memory Sizes")).toBeInTheDocument();

      // Verify filter by difficulty
      const easyBtn = screen.getByRole("button", { name: "EASY" });
      fireEvent.click(easyBtn);
      expect(screen.getByText("User Input / Output")).toBeInTheDocument();

      const hardBtn = screen.getByRole("button", { name: "HARD" });
      fireEvent.click(hardBtn);
      expect(screen.getByText(/no practice problems match the current filter/i)).toBeInTheDocument();
    });
  });
});
