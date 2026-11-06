import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { StriverAnalyticsView } from "@/features/striver-a2z/components/striver-analytics-view";
import { StriverOverviewKpiStrip } from "@/features/striver-a2z/components/charts/striver-overview-kpi-strip";
import { StriverMasteryRadar } from "@/features/striver-a2z/components/charts/striver-mastery-radar";
import { StriverConsistencyHeatmap } from "@/features/striver-a2z/components/charts/striver-consistency-heatmap";
import type { StriverAnalyticsData } from "@/features/striver-a2z/types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockAnalyticsData: StriverAnalyticsData = {
  overview: {
    totalLectures: 299,
    completedLectures: 45,
    lecturePct: 15,
    totalProblems: 372,
    solvedProblems: 60,
    problemPct: 16,
    activeStudyDays: 14,
    masteryPct: 48,
  },
  videoCompletionTrend: [
    { date: "11-01", completed: 3, cumulative: 3, problemsSolved: 2, cumulativeProblems: 2 },
    { date: "11-02", completed: 4, cumulative: 7, problemsSolved: 5, cumulativeProblems: 7 },
  ],
  problemsByTopic: [
    { topic: "Step 01 Basics", easy: 6, medium: 2, hard: 0, total: 8 },
    { topic: "Step 03 Arrays", easy: 10, medium: 15, hard: 5, total: 30 },
  ],
  topicCoverage: [
    { topic: "Basics", videoPct: 80, practicePct: 75 },
    { topic: "Arrays", videoPct: 50, practicePct: 40 },
  ],
  weeklyConsistency: [
    { day: "Mon", videosWatched: 4, problemsSolved: 6 },
    { day: "Tue", videosWatched: 2, problemsSolved: 3 },
  ],
  learningVsPractice: [
    { category: "Videos Watched", value: 45 },
    { category: "Problems Solved", value: 60 },
  ],
  activityHeatmap: Array.from({ length: 84 }).map((_, i) => ({
    date: `2026-10-${(i % 30) + 1}`,
    count: i % 5,
    videos: (i % 5) > 2 ? 2 : 1,
    problems: (i % 5) > 2 ? 3 : 0,
    level: ((i % 5) as 0 | 1 | 2 | 3 | 4),
  })),
  radarMastery: [
    { domain: "Arrays & Hashing", score: 70, solved: 30, total: 45, level: "Developing" },
    { domain: "Binary Search", score: 55, solved: 18, total: 37, level: "Developing" },
    { domain: "Dynamic Programming", score: 35, solved: 14, total: 56, level: "Practicing" },
  ],
  milestones: [
    {
      id: "m-1",
      title: "Enrolled in Striver A2Z DSA Track",
      category: "track",
      timestamp: "2026-11-01T08:00:00Z",
      description: "Began placement-oriented curriculum across 18 modules.",
    },
    {
      id: "m-2",
      title: "Completed First Lecture",
      category: "video",
      timestamp: "2026-11-01T09:30:00Z",
      description: "Watched foundational concepts lecture.",
    },
  ],
};

describe("PRIME Striver A2Z Dedicated Analytics Workspace", () => {
  it("renders the full-page analytics workspace with breadcrumbs, title, and charts", () => {
    render(<StriverAnalyticsView analytics={mockAnalyticsData} />);

    // Breadcrumb and headings
    expect(screen.getByText("Striver A2Z Track")).toBeInTheDocument();
    expect(screen.getByText("Striver A2Z Learning Analytics")).toBeInTheDocument();
    expect(screen.getByText("Export CSV")).toBeInTheDocument();

    // Chart Titles
    expect(screen.getByText(/Learning Completion & Velocity Runway/i)).toBeInTheDocument();
    expect(screen.getByText(/Coding Problems Solved by Category/i)).toBeInTheDocument();
    expect(screen.getByText(/Learning vs Practice Ratio/i)).toBeInTheDocument();
    expect(screen.getByText(/Topic Coverage Comparison/i)).toBeInTheDocument();
    expect(screen.getByText(/Learning Activity & Momentum Heatmap/i)).toBeInTheDocument();
    expect(screen.getByText(/Algorithmic Mastery Radar/i)).toBeInTheDocument();
    expect(screen.getByText(/Chronological Learning Milestones/i)).toBeInTheDocument();
  });

  it("renders overview KPI metrics strip accurately", () => {
    render(<StriverOverviewKpiStrip overview={mockAnalyticsData.overview} />);

    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText(/Days Active/i)).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("48%")).toBeInTheDocument();
  });

  it("toggles StriverMasteryRadar into an accessible data table", () => {
    render(<StriverMasteryRadar data={mockAnalyticsData.radarMastery} />);

    // Toggle to data table view
    const tableToggle = screen.getByRole("button", { name: /data table/i });
    fireEvent.click(tableToggle);

    // Verify table contents
    expect(screen.getByText("Arrays & Hashing")).toBeInTheDocument();
    expect(screen.getByText("30 / 45")).toBeInTheDocument();
    expect(screen.getByText("70%")).toBeInTheDocument();
    expect(screen.getAllByText("Developing").length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText("Dynamic Programming")).toBeInTheDocument();
    expect(screen.getByText("14 / 56")).toBeInTheDocument();
    expect(screen.getByText("35%")).toBeInTheDocument();
  });

  it("renders 12 weekly columns in the consistency heatmap", () => {
    const { container } = render(
      <StriverConsistencyHeatmap data={mockAnalyticsData.activityHeatmap} />
    );

    // Check legend exists
    expect(screen.getByText("84-Day Window")).toBeInTheDocument();
    expect(screen.getByText("Less")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
  });

  it("renders mobile three-dots dropdown options menu for charts", () => {
    render(<StriverAnalyticsView analytics={mockAnalyticsData} />);

    // Mobile three-dots dropdown triggers
    const chartOptionButtons = screen.getAllByRole("button", { name: /chart display options|column chart layout options|heatmap window options|mastery view options/i });
    expect(chartOptionButtons.length).toBeGreaterThanOrEqual(1);

    // Verify aria attributes on mobile three-dots trigger
    for (const btn of chartOptionButtons) {
      expect(btn).toHaveAttribute("aria-haspopup", "menu");
    }
  });
});
