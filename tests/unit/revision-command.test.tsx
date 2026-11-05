import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/revision/mutations/toggle-bookmark", () => ({
  toggleRevisionBookmarkAction: vi.fn().mockResolvedValue({ success: true, bookmarked: true }),
}));
import { RevisionHeader } from "@/features/revision/components/revision-header";
import { RevisionMetrics } from "@/features/revision/components/revision-metrics";
import { RevisionTabs } from "@/features/revision/components/revision-tabs";
import { RevisionRow } from "@/features/revision/components/revision-row";
import { RevisionQueue } from "@/features/revision/components/revision-queue";
import { HowRevisionWorksCard } from "@/features/revision/components/how-revision-works-card";
import type { RevisionProblemItem, RevisionSummaryCounts } from "@/features/revision/types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockItem: RevisionProblemItem = {
  id: "rev-1",
  problemId: "prob-1",
  title: "Two Sum",
  slug: "two-sum",
  difficulty: "EASY",
  platform: "LeetCode",
  platformUrl: "https://leetcode.com/problems/two-sum",
  topics: [{ id: "t1", name: "Arrays", slug: "arrays" }, { id: "t2", name: "Hashing", slug: "hashing" }],
  intervalDays: 1,
  nextReviewAt: new Date().toISOString(),
  snoozedUntil: null,
  bookmarked: false,
  category: "overdue",
  timingLabel: "Due Yesterday",
  isOverdue: true,
  stageLabel: "Stage 1-day",
  lastAttempt: {
    outcome: "independent",
    timeTakenMinutes: 18,
    attemptedAt: new Date().toISOString(),
  },
  lastReview: {
    rating: "hard",
    reviewedAt: new Date().toISOString(),
  },
  status: "active",
};

const mockCounts: RevisionSummaryCounts = {
  overdue: 2,
  dueToday: 10,
  upcoming: 24,
  thisWeek: 36,
};

describe("Revision Command Center UI", () => {
  it("renders RevisionHeader with brand beacon and title", () => {
    render(<RevisionHeader />);
    expect(screen.getByText("REVISION")).toBeDefined();
    expect(screen.getByText("Review what matters before it fades.")).toBeDefined();
    expect(screen.getByText("Spaced repetition for long-term mastery.")).toBeDefined();
    expect(screen.getByText("How it works?")).toBeDefined();
  });

  it("renders RevisionMetrics with counts and supports tab selection", () => {
    const onSelectTab = vi.fn();
    render(
      <RevisionMetrics
        counts={mockCounts}
        activeTab="due_queue"
        onSelectTab={onSelectTab}
      />
    );

    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("Overdue")).toBeDefined();
    expect(screen.getByText("10")).toBeDefined();
    expect(screen.getByText("Due Today")).toBeDefined();
    expect(screen.getByText("24")).toBeDefined();
    expect(screen.getByText("Upcoming")).toBeDefined();
    expect(screen.getByText("36")).toBeDefined();
    expect(screen.getByText("This Week")).toBeDefined();

    fireEvent.click(screen.getByText("Upcoming").closest("button")!);
    expect(onSelectTab).toHaveBeenCalledWith("upcoming");
  });

  it("renders RevisionTabs with tabs and topic filter", () => {
    const onSelectTab = vi.fn();
    const onSelectTopic = vi.fn();
    render(
      <RevisionTabs
        activeTab="due_queue"
        onSelectTab={onSelectTab}
        selectedTopic={null}
        onSelectTopic={onSelectTopic}
        topics={[{ id: "t1", name: "Arrays", count: 5 }]}
      />
    );

    expect(screen.getByText("Due Queue")).toBeDefined();
    expect(screen.getByText("Upcoming")).toBeDefined();
    expect(screen.getByText("Completed")).toBeDefined();
    expect(screen.getByText("All")).toBeDefined();
    expect(screen.getByText("All Topics")).toBeDefined();

    fireEvent.click(screen.getByText("Upcoming"));
    expect(onSelectTab).toHaveBeenCalledWith("upcoming");
  });

  it("renders RevisionRow with problem details and triggers review", () => {
    const onReview = vi.fn();
    const onSnooze = vi.fn();
    render(
      <RevisionRow
        item={mockItem}
        onReview={onReview}
        onSnooze={onSnooze}
      />
    );

    expect(screen.getByText("Two Sum")).toBeDefined();
    expect(screen.getByText("Arrays · Hashing")).toBeDefined();
    expect(screen.getByText("EASY")).toBeDefined();
    expect(screen.getByText("Due Yesterday")).toBeDefined();
    expect(screen.getByText("Independent · 18m")).toBeDefined();
    expect(screen.getByText("hard")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: /review/i }));
    expect(onReview).toHaveBeenCalledWith(mockItem);
  });

  it("renders RevisionQueue with overdue section", () => {
    const onReview = vi.fn();
    const onSnooze = vi.fn();
    render(
      <RevisionQueue
        items={[mockItem]}
        activeTab="due_queue"
        selectedTopic={null}
        onReview={onReview}
        onSnooze={onSnooze}
      />
    );

    expect(screen.getByText(/Overdue · 1/i)).toBeDefined();
    expect(screen.getByText("Two Sum")).toBeDefined();
  });

  it("renders RevisionRow with responsive inner padding, dividers, and telemetry layout", () => {
    const onReview = vi.fn();
    const onSnooze = vi.fn();
    const { container } = render(
      <RevisionRow
        item={mockItem}
        onReview={onReview}
        onSnooze={onSnooze}
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("p-4");
    expect(card.className).toContain("sm:p-5");
    expect(card.className).toContain("rounded-lg");

    // Divider between problem info and telemetry metrics
    const divider = container.querySelector(".border-t.border-\\[\\#181818\\]");
    expect(divider).not.toBeNull();
    expect(divider?.className).toContain("pt-3");
    expect(divider?.className).toContain("sm:pt-3.5");
  });

  it("renders RevisionQueue upcoming accordion with generous interior margins and responsive padding", () => {
    const onReview = vi.fn();
    const onSnooze = vi.fn();
    const futureItem: RevisionProblemItem = {
      ...mockItem,
      id: "rev-upcoming-1",
      category: "upcoming",
      nextReviewAt: new Date(Date.now() + 86400000 * 3).toISOString(),
      isOverdue: false,
    };

    const { container } = render(
      <RevisionQueue
        items={[futureItem]}
        activeTab="upcoming"
        selectedTopic={null}
        onReview={onReview}
        onSnooze={onSnooze}
      />
    );

    expect(screen.getByText("Upcoming")).toBeDefined();
    const expandButton = screen.getByRole("button", { name: /expand/i });
    expect(expandButton).toBeDefined();

    // Expand the accordion
    fireEvent.click(expandButton);

    const collapseButton = screen.getByRole("button", { name: /collapse/i });
    expect(collapseButton).toBeDefined();

    // Verify accordion inner drawer has responsive padding and top margin
    const accordionBody = container.querySelector(".bg-\\[\\#050505\\]\\/60");
    expect(accordionBody).not.toBeNull();
    expect(accordionBody?.className).toContain("pt-3.5");
    expect(accordionBody?.className).toContain("sm:pt-4.5");
    expect(accordionBody?.className).toContain("space-y-3");
  });

  it("renders HowRevisionWorksCard with 3 numbered steps", () => {
    render(<HowRevisionWorksCard />);
    expect(screen.getByText("How Revision Works")).toBeDefined();
    expect(screen.getByText("Practice a problem")).toBeDefined();
    expect(screen.getByText("Review at the right time")).toBeDefined();
    expect(screen.getByText("Build long-term recall")).toBeDefined();
  });
});
