import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RevisionBadge } from "@/features/problems/components/revision-badge";
import { PriorityBadge } from "@/features/problems/components/priority-badge";
import { DifficultyBadge } from "@/features/problems/components/difficulty-badge";
import { StatusIcon } from "@/features/problems/components/status-icon";
import { ProblemRow } from "@/features/problems/components/problem-row";
import { AttemptHistoryList } from "@/features/problems/components/attempt-history-list";
import { PracticeHeader } from "@/features/problems/components/practice-header";
import { PracticeToolbar } from "@/features/problems/components/practice-toolbar";
import type {
  CatalogProblemItem,
  ProblemAttemptRecord,
  UserPracticeSummary,
  PracticeCatalogFilter,
} from "@/features/problems/types";
import type { FilterOptionsData } from "@/features/problems/queries/get-filter-options";

describe("DSA Practice UI Components", () => {
  describe("RevisionBadge", () => {
    it("renders nothing when not due and not overdue", () => {
      const { container } = render(
        <RevisionBadge isDue={false} isOverdue={false} nextRevisionAt={null} />
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders 'Due today' with pure red accent styling when due", () => {
      render(
        <RevisionBadge
          isDue={true}
          isOverdue={false}
          nextRevisionAt={new Date().toISOString()}
        />
      );
      const badge = screen.getByText("Due today");
      expect(badge).toBeInTheDocument();
      expect(badge.parentElement).toHaveClass("text-[var(--accent)]");
    });

    it("renders 'Overdue' when overdue", () => {
      render(
        <RevisionBadge
          isDue={true}
          isOverdue={true}
          nextRevisionAt={new Date(Date.now() - 172800000).toISOString()}
        />
      );
      const badge = screen.getByText("Overdue");
      expect(badge).toBeInTheDocument();
      expect(badge.parentElement).toHaveClass("text-[var(--accent)]");
    });
  });

  describe("PriorityBadge", () => {
    it("renders null when priority is missing or empty", () => {
      const { container } = render(<PriorityBadge priority={null} />);
      expect(container.firstChild).toBeNull();
    });

    it("renders Core badge with sparkles and accent styling for core/canonical", () => {
      render(<PriorityBadge priority="canonical" />);
      const badge = screen.getByText("Core");
      expect(badge).toBeInTheDocument();
      expect(badge.parentElement).toHaveClass("text-[var(--accent)]");
    });

    it("renders High badge with amber styling", () => {
      render(<PriorityBadge priority="high" />);
      const badge = screen.getByText("High");
      expect(badge).toBeInTheDocument();
      expect(badge.parentElement).toHaveClass("text-amber-400");
    });

    it("renders Advanced badge with purple styling", () => {
      render(<PriorityBadge priority="advanced" />);
      const badge = screen.getByText("Advanced");
      expect(badge).toBeInTheDocument();
      expect(badge.parentElement).toHaveClass("text-purple-400");
    });

    it("renders Standard badge with sky blue styling", () => {
      render(<PriorityBadge priority="standard" />);
      const badge = screen.getByText("Standard");
      expect(badge).toBeInTheDocument();
      expect(badge.parentElement).toHaveClass("text-sky-400");
    });
  });

  describe("DifficultyBadge", () => {
    it("renders Easy badge with emerald coloring and beacon dot", () => {
      render(<DifficultyBadge difficulty="easy" />);
      const badge = screen.getByText("easy");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("text-[#10B981]");
    });

    it("renders Medium badge with amber coloring and beacon dot", () => {
      render(<DifficultyBadge difficulty="medium" />);
      const badge = screen.getByText("medium");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("text-[#F59E0B]");
    });

    it("renders Hard badge with red coloring and beacon dot", () => {
      render(<DifficultyBadge difficulty="hard" />);
      const badge = screen.getByText("hard");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("text-[#EF4444]");
    });
  });

  describe("StatusIcon", () => {
    it("renders green checkmark icon for solved", () => {
      const { container } = render(<StatusIcon status="solved" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(container.querySelector("svg")).toHaveClass("text-[#10B981]");
    });

    it("renders red reload icon for needs_revision", () => {
      const { container } = render(<StatusIcon status="needs_revision" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(container.querySelector("svg")).toHaveClass("text-[var(--accent)]");
    });

    it("renders amber loading icon for attempted", () => {
      const { container } = render(<StatusIcon status="attempted" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(container.querySelector("svg")).toHaveClass("text-[#F59E0B]");
    });

    it("renders purple diamond icon for mastered", () => {
      const { container } = render(<StatusIcon status="mastered" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(container.querySelector("svg")).toHaveClass("text-purple-400");
    });

    it("renders muted circle icon for not_started or default", () => {
      const { container } = render(<StatusIcon status="not_started" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(container.querySelector("svg")).toHaveClass("text-[var(--text-disabled)]");
    });
  });

  describe("ProblemRow", () => {
    const mockProblem: CatalogProblemItem = {
      id: "b2c3d4e5-f6a7-4b2c-8d3e-4f5a6b7c8d9e",
      slug: "two-sum",
      title: "Two Sum",
      difficulty: "easy",
      externalUrl: "https://leetcode.com/problems/two-sum",
      acceptanceRate: 54.2,
      primePriority: "canonical",
      primaryTopic: {
        id: "topic-1",
        slug: "arrays",
        name: "Arrays",
      },
      collectionCount: 3,
      companyRelevance: {
        companySlug: "amazon",
        companyName: "Amazon",
        frequency: 45,
        timeWindow: "six_months",
      },
      status: "solved",
      lastAttemptAt: "2026-10-30T10:00:00Z",
      nextRevisionAt: "2026-11-03T10:00:00Z",
      isRevisionDue: false,
      isRevisionOverdue: false,
      masteryScore: 0.85,
    };

    it("renders title, primary topic, sets count, and difficulty", () => {
      const onSelect = vi.fn();
      render(<ProblemRow problem={mockProblem} onSelect={onSelect} />);

      expect(screen.getByText("Two Sum")).toBeInTheDocument();
      expect(screen.getByText("Arrays")).toBeInTheDocument();
      expect(screen.getByText("3 sets")).toBeInTheDocument();
      expect(screen.getByText("easy")).toBeInTheDocument();
      expect(screen.getByText("Amazon")).toBeInTheDocument();
    });

    it("calls onSelect when row is clicked", () => {
      const onSelect = vi.fn();
      render(<ProblemRow problem={mockProblem} onSelect={onSelect} />);

      fireEvent.click(screen.getByText("Two Sum"));
      expect(onSelect).toHaveBeenCalledWith(mockProblem);
    });

    it("contains an external practice link with target _blank and noopener", () => {
      render(<ProblemRow problem={mockProblem} onSelect={vi.fn()} />);

      const link = screen.getByRole("link", {
        name: /open two sum on external practice platform/i,
      });
      expect(link).toHaveAttribute("href", "https://leetcode.com/problems/two-sum");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
    it("keeps a question usable without exposing an unverified external link", () => {
      const onSelect = vi.fn();
      render(
        <ProblemRow problem={{ ...mockProblem, externalUrl: null }} onSelect={onSelect} />
      );
      expect(
        screen.getByLabelText("Practice link pending verification")
      ).toBeInTheDocument();
      expect(screen.queryByRole("link")).toBeNull();
      fireEvent.click(screen.getByText("Two Sum"));
      expect(onSelect).toHaveBeenCalled();
    });
  });

  describe("AttemptHistoryList", () => {
    it("renders empty state when no attempts exist", () => {
      render(<AttemptHistoryList attempts={[]} />);
      expect(screen.getByText(/no practice attempts recorded yet/i)).toBeInTheDocument();
    });

    it("renders formatted attempts with duration, outcome, and notes", () => {
      const attempts: ProblemAttemptRecord[] = [
        {
          id: "att-1",
          outcome: "independent",
          timeTakenSeconds: 1500, // 25 mins
          confidence: 4,
          notes: "Used hash map lookup with complement",
          attemptedAt: "2026-10-31T15:30:00Z",
        },
      ];

      render(<AttemptHistoryList attempts={attempts} />);

      expect(screen.getByText("Independent")).toBeInTheDocument();
      expect(screen.getByText("25m")).toBeInTheDocument();
      expect(
        screen.getByText("Used hash map lookup with complement")
      ).toBeInTheDocument();
    });
  });

  describe("PracticeHeader", () => {
    it("renders real metrics correctly", () => {
      const summary: UserPracticeSummary = {
        totalSolved: 142,
        totalAttempted: 185,
        totalNeedsRevision: 8,
        totalMastered: 35,
        revisionDueCount: 4,
        topicProgress: {},
      };

      render(<PracticeHeader summary={summary} />);

      expect(screen.getByText("142")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
      expect(screen.getByText("35")).toBeInTheDocument();
    });
  });

  describe("PracticeToolbar", () => {
    const mockFilterOptions: FilterOptionsData = {
      topics: [{ id: "t1", slug: "arrays", name: "Arrays", problemCount: 10 }],
      collections: [{ id: "c1", slug: "blind75", name: "Blind 75", problemCount: 75 }],
      companies: [{ id: "co1", slug: "google", name: "Google", problemCount: 50 }],
    };

    const emptyFilters: PracticeCatalogFilter = {
      q: "",
      difficulty: "",
      status: "",
      topic: "",
      collection: "",
      company: "",
      window: "",
      revision: "",
      sort: "recommended",
      page: 1,
      pageSize: 50,
    };

    it("renders search input, filter triggers, and sort with clean developer labels", () => {
      const onFilterChange = vi.fn();
      const onOpenMobileFilters = vi.fn();

      render(
        <PracticeToolbar
          filterOptions={mockFilterOptions}
          filters={emptyFilters}
          onFilterChange={onFilterChange}
          onOpenMobileFilters={onOpenMobileFilters}
        />
      );

      expect(
        screen.getByPlaceholderText("Search problems by title, slug, or topic...")
      ).toBeInTheDocument();
      expect(screen.getByText("Difficulty")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Recommended")).toBeInTheDocument();
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });

    it("displays active filter badges and calls onFilterChange when dismissed", () => {
      const onFilterChange = vi.fn();

      render(
        <PracticeToolbar
          filterOptions={mockFilterOptions}
          filters={{
            ...emptyFilters,
            difficulty: "easy",
            topic: "arrays",
          }}
          onFilterChange={onFilterChange}
        />
      );

      // Should render active difficulty tag and active topic tag
      expect(screen.getByText("Easy")).toBeInTheDocument();
      expect(screen.getByText("arrays")).toBeInTheDocument();

      // Dismiss difficulty
      const removeDiffBtn = screen.getByLabelText("Remove difficulty filter");
      fireEvent.click(removeDiffBtn);
      expect(onFilterChange).toHaveBeenCalledWith({ difficulty: "", page: 1 });
    });

    it("displays active count badge on mobile filters button when filters are active", () => {
      render(
        <PracticeToolbar
          filterOptions={mockFilterOptions}
          filters={{
            ...emptyFilters,
            difficulty: "medium",
            status: "solved",
          }}
          onFilterChange={vi.fn()}
          onOpenMobileFilters={vi.fn()}
        />
      );

      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });
});
