import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MasteryOverviewHeader } from "@/features/mastery/components/mastery-overview-header";
import { MasteryStrip } from "@/features/mastery/components/mastery-strip";
import { MasteryFilters } from "@/features/mastery/components/mastery-filters";
import { EvidenceRail } from "@/features/mastery/components/evidence-rail";
import { EvidenceLens } from "@/features/mastery/components/evidence-lens";
import { ProblemEvidenceRow } from "@/features/mastery/components/problem-evidence-row";
import type { TopicMasteryResult, ProblemMasteryResult } from "@/domain/mastery";

describe("Mastery UI Components Unit Tests", () => {
  it("renders MasteryOverviewHeader with total problems and title", () => {
    render(
      <MasteryOverviewHeader
        lastCalculatedAt={new Date().toISOString()}
        totalCoreProblems={189}
      />
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mastery");
    expect(screen.getByText(/189 Problems/i)).toBeInTheDocument();
  });

  it("renders MasteryStrip counts and triggers filter selection", () => {
    const handleFilter = vi.fn();
    render(
      <MasteryStrip
        counts={{
          mastered: 34,
          proficient: 42,
          practiced: 28,
          learning: 19,
          exposed: 5,
          unseen: 61,
        }}
        total={189}
        onSelectFilter={handleFilter}
      />
    );

    expect(screen.getByText("34")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("28")).toBeInTheDocument();
    expect(screen.getByText("19")).toBeInTheDocument();

    const masteredBtn = screen.getByRole("button", { name: /MASTERED/i });
    fireEvent.click(masteredBtn);
    expect(handleFilter).toHaveBeenCalledWith("mastered");
  });

  it("renders MasteryFilters and triggers filter and sort changes", () => {
    const handleFilter = vi.fn();
    const handleSort = vi.fn();
    render(
      <MasteryFilters
        filter="all"
        sort="curriculum"
        onFilterChange={handleFilter}
        onSortChange={handleSort}
        needsEvidenceCount={3}
      />
    );

    fireEvent.keyDown(screen.getByRole("combobox", { name: "Evidence level" }), {
      key: "ArrowDown",
    });
    expect(
      screen.getByRole("option", { name: "Needs evidence (3)" })
    ).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("option", { name: "Mastered" }), { key: "Enter" });
    expect(handleFilter).toHaveBeenCalledWith("mastered");

    fireEvent.keyDown(screen.getByRole("combobox", { name: "Sort skills" }), {
      key: "ArrowDown",
    });
    fireEvent.keyDown(screen.getByRole("option", { name: "Most recent evidence" }), {
      key: "Enter",
    });
    expect(handleSort).toHaveBeenCalledWith("recent");
  });

  it("renders EvidenceRail with correct ARIA attributes and score", () => {
    render(<EvidenceRail score={76} />);
    const progress = screen.getByRole("progressbar");
    expect(progress).toHaveAttribute("aria-valuenow", "76");
    expect(progress).toHaveAttribute("aria-valuemin", "0");
    expect(progress).toHaveAttribute("aria-valuemax", "100");
    expect(progress.querySelector(".evidence-rail-fill")).toHaveStyle({ width: "76%" });
  });

  it("renders EvidenceLens with dimensional breakdown, strengths, and blockers", () => {
    const mockProblemMastery: ProblemMasteryResult = {
      problemId: "p1",
      level: "proficient",
      score: 76,
      evidence: {
        independence: 80,
        retention: 75,
        repetition: 70,
        timing: 85,
        hintIndependence: 80,
        confidenceCalibration: 85,
        recency: 90,
      },
      requirements: {
        independentEvidenceCount: 2,
        successfulRevisionCount: 2,
        longestSuccessfulIntervalDays: 7,
        totalAttemptCount: 3,
        hasRecentForgot: false,
      },
      freshness: "fresh",
      lastEvidenceAt: new Date(),
      blockers: [
        {
          code: "SHORT_INTERVAL_RETENTION",
          label: "Short-Term Retention Only",
          detail: "Longer-term retention not yet demonstrated.",
        },
      ],
      strengths: [
        {
          code: "REPEATED_INDEPENDENT_SOLVES",
          label: "Repeated Independent Performance",
          detail: "2 verified independent solves demonstrate reproducibility.",
        },
      ],
      nextEvidence: "Advance retention by passing the scheduled 14-day review.",
      policyVersion: 1,
    };

    const mockTopic: TopicMasteryResult = {
      topicId: "topic-1",
      topicSlug: "binary-search",
      topicName: "Binary Search",
      level: "proficient",
      score: 76,
      requiredProblems: 10,
      practicedProblems: 8,
      masteredProblems: 5,
      proficientProblems: 2,
      evidenceCoverage: {
        practicedCount: 8,
        totalCount: 10,
        percentage: 80,
      },
      levelDistribution: {
        mastered: 5,
        proficient: 2,
        practiced: 1,
        learning: 0,
        exposed: 0,
        unseen: 2,
      },
      strengths: ["5 Core problems demonstrated full independent mastery."],
      blockers: ["Longer-term retention not yet demonstrated."],
      problemMasteries: [mockProblemMastery],
    };

    render(
      <EvidenceLens
        topic={mockTopic}
        coreMetadata={{
          p1: {
            id: "p1",
            slug: "binary-search",
            title: "Binary Search",
            difficulty: "EASY",
            recommendedMinutes: 20,
            priority: "P0",
            isRequired: true,
            isCheckpoint: true,
            topicId: "topic-1",
            topicName: "Binary Search",
            stageId: "stage-1",
            stageName: "Binary Search",
            stageSequence: 6,
          },
        }}
      />
    );

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Binary Search");
    expect(screen.getByText("Evidence 76 / 100")).toBeInTheDocument();
    expect(screen.getByText("8 / 10")).toBeInTheDocument();
    expect(screen.getByText("Independence")).toBeInTheDocument();
    expect(screen.getByText("Retention")).toBeInTheDocument();
    expect(screen.getByText("Repetition")).toBeInTheDocument();
    expect(
      screen.getByText(/5 Core problems demonstrated full independent mastery/i)
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Longer-term retention not yet demonstrated/i).length
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders ProblemEvidenceRow with link to problem workspace", () => {
    const mockProblemMastery: ProblemMasteryResult = {
      problemId: "p1",
      level: "mastered",
      score: 92,
      evidence: {
        independence: 100,
        retention: 90,
        repetition: 100,
        timing: 90,
        hintIndependence: 100,
        confidenceCalibration: 90,
        recency: 90,
      },
      requirements: {
        independentEvidenceCount: 3,
        successfulRevisionCount: 2,
        longestSuccessfulIntervalDays: 14,
        totalAttemptCount: 3,
        hasRecentForgot: false,
      },
      freshness: "fresh",
      lastEvidenceAt: new Date(),
      blockers: [],
      strengths: [],
      nextEvidence: "Pattern mastered.",
      policyVersion: 1,
    };

    render(
      <ProblemEvidenceRow
        mastery={mockProblemMastery}
        metadata={{
          id: "p1",
          slug: "binary-search",
          title: "Binary Search",
          difficulty: "EASY",
          recommendedMinutes: 20,
          priority: "P0",
          isRequired: true,
          isCheckpoint: true,
          topicId: "topic-1",
          topicName: "Binary Search",
          stageId: "stage-1",
          stageName: "Binary Search",
          stageSequence: 6,
        }}
        sequenceIndex={0}
      />
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/practice/dsa/binary-search#mastery-evidence");
    expect(screen.getByText("Binary Search")).toBeInTheDocument();
    expect(screen.getByText("mastered")).toBeInTheDocument();
    expect(screen.getByText(/3 independents · 14d retained/i)).toBeInTheDocument();
  });
});
