import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import * as React from "react";
import { ReadinessSkeleton } from "@/features/readiness/components/readiness-skeleton";
import { ReadinessEvidenceSummary } from "@/features/readiness/components/readiness-evidence-summary";
import { ReadinessLandscape } from "@/features/readiness/components/readiness-landscape";
import { EvidenceMatrix } from "@/features/readiness/components/evidence-matrix";
import { ReadinessGapsList } from "@/features/readiness/components/readiness-gaps-list";
import { CompetencyInspector } from "@/features/readiness/components/competency-inspector";
import { CompetencyDependencyMap } from "@/features/readiness/components/competency-dependency-map";
import { ReadinessTrajectory } from "@/features/readiness/components/readiness-trajectory";
import { TargetComparisonModal } from "@/features/readiness/components/target-comparison-modal";
import { ReadinessAiBar } from "@/features/readiness/components/readiness-ai-bar";
import type {
  CompetencyReadiness,
  TargetReadinessResult,
  ReadinessGap,
} from "@/domain/readiness";

const mockCompetency: CompetencyReadiness = {
  competencyId: "dsa-two-pointers",
  name: "Two Pointers",
  slug: "two-pointers",
  domain: "dsa",
  importance: "core",
  status: "evidence_aligned",
  coverage: "sufficient",
  confidence: "high",
  score: 88,
  summary: "Strong demonstrated performance across two-pointer techniques.",
  supportingEvidence: [
    "5 distinct problems attempted.",
    "4 solved completely independently.",
    "4 successful retention reviews.",
  ],
  missingEvidence: [],
  blockers: [],
  algorithmLabSlug: "two-pointers",
  evaluatedAt: "2026-11-04T10:00:00.000Z",
  recommendation: {
    id: "rec-1",
    action: "Maintain retention",
    title: "Complete scheduled review",
    description: "Keep retention fresh for Two Pointers.",
    reason: "Retention maintenance",
    estimatedMinutes: 20,
    priority: 1,
  },
};

const mockGap: ReadinessGap = {
  id: "gap-1",
  competencyId: "dsa-binary-search",
  competencyName: "Binary Search",
  domain: "dsa",
  gapType: "performance_gap",
  importance: "core",
  title: "Performance Gap: Binary Search",
  description: "Recent attempts show low accuracy and high hint dependency.",
  recommendedAction: "Practice Binary Search pattern",
  actionType: "practice_dsa",
  urgency: 1,
};

const mockTargetResult: TargetReadinessResult = {
  profile: {
    id: "general-sde",
    name: "General Software Engineer (SDE)",
    description: "Balanced full-stack & backend foundation.",
    version: "1.0.0",
    competencies: [],
  },
  overallAlignment: "developing",
  totalCompetencies: 12,
  assessedCount: 8,
  alignedCount: 5,
  developingCount: 2,
  needsAttentionCount: 1,
  unassessedCount: 4,
  insufficientEvidenceCount: 0,
  coreCoveragePercentage: 75,
  domainSummaries: {
    dsa: { total: 6, assessed: 5, aligned: 4, status: "developing" },
    fundamentals: { total: 3, assessed: 2, aligned: 1, status: "developing" },
    aptitude: { total: 2, assessed: 1, aligned: 0, status: "developing" },
    mock: { total: 1, assessed: 0, aligned: 0, status: "not_assessed" },
  },
  competencies: [mockCompetency],
  gaps: [mockGap],
  recommendations: [],
  evaluatedAt: "2026-11-04T10:00:00.000Z",
  policyVersion: "1.0.0",
};

describe("Readiness UI Components Unit Tests", () => {
  it("renders ReadinessSkeleton without crashing", () => {
    render(<ReadinessSkeleton />);
    expect(
      screen.getByRole("status", { name: "Loading interview readiness" })
    ).toBeInTheDocument();
  });

  it("renders ReadinessEvidenceSummary metrics and domain breakdown", () => {
    render(<ReadinessEvidenceSummary data={mockTargetResult} />);
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("Core Requirements")).toBeInTheDocument();
    expect(screen.getByText("Evidence Aligned")).toBeInTheDocument();
    expect(screen.getByText("In Development")).toBeInTheDocument();
    expect(screen.getByText("Needs Attention")).toBeInTheDocument();
    expect(screen.getByText("DSA")).toBeInTheDocument();
    expect(screen.getByText("Fundamentals")).toBeInTheDocument();
  });

  it("renders ReadinessLandscape and triggers selection", () => {
    const handleSelect = vi.fn();
    render(
      <ReadinessLandscape
        competencies={[mockCompetency]}
        onSelectCompetency={handleSelect}
      />
    );

    expect(screen.getByText("Data Structures & Algorithms")).toBeInTheDocument();
    expect(screen.getByText("Two Pointers")).toBeInTheDocument();

    const card = screen.getByText("Two Pointers");
    fireEvent.click(card);
    expect(handleSelect).toHaveBeenCalledWith(mockCompetency);
  });

  it("renders EvidenceMatrix with search filtering", () => {
    const handleSelect = vi.fn();
    render(
      <EvidenceMatrix competencies={[mockCompetency]} onSelectCompetency={handleSelect} />
    );

    expect(screen.getByPlaceholderText(/Search competencies/i)).toBeInTheDocument();
    expect(screen.getByText("Two Pointers")).toBeInTheDocument();

    const inspectBtn = screen.getByRole("button", { name: /Inspect/i });
    fireEvent.click(inspectBtn);
    expect(handleSelect).toHaveBeenCalledWith(mockCompetency);
  });

  it("renders ReadinessGapsList with direct plan work link", () => {
    render(<ReadinessGapsList gaps={[mockGap]} />);
    expect(screen.getByText("Binary Search")).toBeInTheDocument();
    expect(screen.getByText("Performance Gap")).toBeInTheDocument();

    const planLink = screen.getByRole("link", { name: /Plan Work/i });
    expect(planLink).toHaveAttribute("href", expect.stringContaining("/plan?work=new"));
  });

  it("renders CompetencyInspector drawer when open", () => {
    const handleOpenChange = vi.fn();
    render(
      <CompetencyInspector
        competency={mockCompetency}
        open={true}
        onOpenChange={handleOpenChange}
      />
    );

    expect(screen.getByText("Two Pointers")).toBeInTheDocument();
    expect(screen.getByText(/Strong demonstrated performance/i)).toBeInTheDocument();
    expect(screen.getByText(/What Supports This\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Open in Algorithm Lab/i)).toBeInTheDocument();
    expect(screen.getByText(/Plan Improvement/i)).toBeInTheDocument();
  });

  it("renders CompetencyDependencyMap with chains and triggers selection", () => {
    const handleSelect = vi.fn();
    render(
      <CompetencyDependencyMap
        competencies={[mockCompetency]}
        onSelectCompetency={handleSelect}
      />
    );

    expect(screen.getByText("Linear & Pointer Sequences")).toBeInTheDocument();
    expect(screen.getByText("Two Pointers")).toBeInTheDocument();

    const nodeBtn = screen.getByRole("button", { name: /Two Pointers/i });
    fireEvent.click(nodeBtn);
    expect(handleSelect).toHaveBeenCalledWith(mockCompetency);
  });

  it("renders ReadinessTrajectory with historical points", () => {
    render(
      <ReadinessTrajectory
        trajectory={[
          {
            date: "2026-11-01",
            cumulativeAttempts: 5,
            assessedCompetencies: 2,
            alignedCompetencies: 1,
          },
          {
            date: "2026-11-04",
            cumulativeAttempts: 12,
            assessedCompetencies: 4,
            alignedCompetencies: 2,
          },
        ]}
      />
    );

    expect(
      screen.getByRole("figure", { name: "Preparation evidence growth timeline" })
    ).toBeInTheDocument();
    expect(screen.getByText("Estimated assessed skills")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument(); // Latest cumulative attempts
    expect(screen.getByText("4")).toBeInTheDocument(); // Latest assessed
  });

  it("renders TargetComparisonModal and allows target switching", () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    render(
      <TargetComparisonModal
        isOpen={true}
        onClose={handleClose}
        currentProfileId="general-sde"
        comparisons={[
          {
            profileId: "general-sde",
            profileName: "General SDE",
            totalCore: 12,
            alignedCore: 8,
            coveragePercent: 67,
            overallAlignment: "developing",
          },
          {
            profileId: "backend-dev",
            profileName: "Backend Developer",
            totalCore: 10,
            alignedCore: 6,
            coveragePercent: 60,
            overallAlignment: "developing",
          },
        ]}
        onSelectProfile={handleSelect}
      />
    );

    expect(screen.getByRole("dialog", { name: "Compare targets" })).toBeInTheDocument();
    expect(screen.getByText("Backend Developer")).toBeInTheDocument();

    const switchBtn = screen.getByRole("button", { name: /Switch Target/i });
    fireEvent.click(switchBtn);
    expect(handleSelect).toHaveBeenCalledWith("backend-dev");
  });

  it("renders ReadinessAiBar with quick action prompts", () => {
    render(<ReadinessAiBar profileId="general-sde" />);
    expect(screen.getByText("PRIME AI Readiness Assistant")).toBeInTheDocument();
    expect(screen.getByText("Explain My Readiness")).toBeInTheDocument();
    expect(screen.getByText("What Is Holding Me Back?")).toBeInTheDocument();
  });
});
