import { describe, expect, it } from "vitest";
import {
  calculateProblemWeakness,
  calculateTopicWeakness,
  rankImprovementCandidates,
  calculateNormalizedWeaknessScore,
  DEFAULT_WEAKNESS_POLICY,
  type ProblemDiagnosticInput,
  type AttemptEvidence,
  type RevisionEvidence,
} from "@/domain/weakness";

describe("PRIME Weakness Intelligence Engine — Domain Unit Tests", () => {
  const baseProblem: ProblemDiagnosticInput = {
    problemId: "prob-1",
    problemSlug: "two-sum",
    problemTitle: "Two Sum",
    difficulty: "EASY",
    targetTimeMinutes: 20,
    attempts: [],
    revisions: [],
  };

  it("classifies untouched problems as not_assessed with null score and insufficient confidence", () => {
    const result = calculateProblemWeakness(baseProblem);
    expect(result.status).toBe("not_assessed");
    expect(result.score).toBeNull();
    expect(result.confidence).toBe("insufficient");
    expect(result.reasonCodes).toContain("INSUFFICIENT_EVIDENCE");
    expect(result.dimensions.failure).toBeNull();
    expect(result.dimensions.hints).toBeNull();
    expect(result.dimensions.timing).toBeNull();
    expect(result.dimensions.retention).toBeNull();
  });

  it("classifies a single initial failure as emerging with low/insufficient confidence (not critical weakness)", () => {
    const input: ProblemDiagnosticInput = {
      ...baseProblem,
      attempts: [
        {
          outcome: "unsolved",
          timeTakenSeconds: 900,
          attemptedAt: "2026-11-01T10:00:00Z",
        },
      ],
    };
    const result = calculateProblemWeakness(input);
    expect(result.status).toBe("emerging");
    expect(result.confidence).toBe("insufficient");
    expect(result.reasonCodes).toContain("INSUFFICIENT_EVIDENCE");
    expect(result.evidenceSummary.unsolvedCount).toBe(1);
  });

  it("detects high hint dependency when successful solves require hints", () => {
    const attempts: AttemptEvidence[] = [
      { outcome: "hint", timeTakenSeconds: 1200, attemptedAt: "2026-11-01T10:00:00Z" },
      { outcome: "hint", timeTakenSeconds: 1100, attemptedAt: "2026-11-02T10:00:00Z" },
      { outcome: "hint", timeTakenSeconds: 1000, attemptedAt: "2026-11-03T10:00:00Z" },
      { outcome: "independent", timeTakenSeconds: 800, attemptedAt: "2026-11-04T10:00:00Z" },
    ];
    const input: ProblemDiagnosticInput = {
      ...baseProblem,
      attempts,
    };
    const result = calculateProblemWeakness(input);
    expect(result.status).toBe("needs_attention");
    expect(result.reasonCodes).toContain("HIGH_HINT_DEPENDENCY");
    expect(result.dimensions.hints).toBeGreaterThan(0.5);
    expect(result.recommendations.some((r) => r.action === "RETRY_PROBLEM")).toBe(true);
  });

  it("detects persistent weakness on repeated failures", () => {
    const attempts: AttemptEvidence[] = [
      { outcome: "unsolved", timeTakenSeconds: 1500, attemptedAt: "2026-11-01T10:00:00Z" },
      { outcome: "unsolved", timeTakenSeconds: 1400, attemptedAt: "2026-11-02T10:00:00Z" },
      { outcome: "unsolved", timeTakenSeconds: 1300, attemptedAt: "2026-11-03T10:00:00Z" },
    ];
    const input: ProblemDiagnosticInput = {
      ...baseProblem,
      attempts,
    };
    const result = calculateProblemWeakness(input);
    expect(result.status).toBe("persistent");
    expect(result.reasonCodes).toContain("REPEATED_FAILURE");
    expect(result.dimensions.failure).toBe(1.0);
  });

  it("renormalizes active weights when timing or revision evidence is missing", () => {
    // Only failure and hints known; timing and retention are null
    const dimensions = {
      failure: 0.6,
      hints: 0.4,
      timing: null,
      retention: null,
    };
    const score = calculateNormalizedWeaknessScore(dimensions, DEFAULT_WEAKNESS_POLICY);
    expect(score).not.toBeNull();
    // Active weights: failure (0.35) + hints (0.25) = 0.60
    // Weighted sum: 0.6 * 0.35 + 0.4 * 0.25 = 0.21 + 0.10 = 0.31
    // Normalized fraction: 0.31 / 0.60 = ~0.5167 -> score 52
    expect(score).toBe(52);
  });

  it("recognizes learner recovery and updates status to improving without permanently penalizing early mistakes", () => {
    const attempts: AttemptEvidence[] = [
      { outcome: "unsolved", timeTakenSeconds: 1200, attemptedAt: "2026-10-15T10:00:00Z" },
      { outcome: "hint", timeTakenSeconds: 1000, attemptedAt: "2026-10-18T10:00:00Z" },
      { outcome: "independent", timeTakenSeconds: 700, attemptedAt: "2026-11-03T10:00:00Z" },
    ];
    const revisions: RevisionEvidence[] = [
      { rating: "okay", reviewedAt: "2026-11-04T10:00:00Z" },
    ];
    const input: ProblemDiagnosticInput = {
      ...baseProblem,
      attempts,
      revisions,
    };
    const result = calculateProblemWeakness(input);
    expect(result.status).toBe("improving");
    expect(result.reasonCodes).toContain("RECENT_IMPROVEMENT");
    expect(result.score).toBeLessThan(40);
  });

  it("caps topic confidence at low when all attempts are on a single problem", () => {
    const singleProblemAttempts: AttemptEvidence[] = Array.from({ length: 8 }, (_, i) => ({
      outcome: "hint",
      timeTakenSeconds: 900,
      attemptedAt: `2026-11-0${i + 1}T10:00:00Z`,
    }));
    const problem = calculateProblemWeakness({
      ...baseProblem,
      attempts: singleProblemAttempts,
    });

    const topicResult = calculateTopicWeakness({
      topicId: "arrays",
      topicSlug: "arrays",
      topicName: "Arrays",
      problems: [problem],
      totalTopicProblemsCount: 5,
    });

    // 8 attempts on 1 problem must not claim high topic confidence
    expect(topicResult.confidence).toBe("low");
    expect(topicResult.reasonCodes).toContain("LIMITED_PROBLEM_COVERAGE");
  });

  it("achieves high confidence when evidence spans multiple distinct problems with revisions", () => {
    const p1 = calculateProblemWeakness({
      ...baseProblem,
      problemId: "p1",
      attempts: [{ outcome: "independent", timeTakenSeconds: 800, attemptedAt: "2026-11-01T10:00:00Z" }],
    });
    const p2 = calculateProblemWeakness({
      ...baseProblem,
      problemId: "p2",
      attempts: [{ outcome: "independent", timeTakenSeconds: 850, attemptedAt: "2026-11-02T10:00:00Z" }],
    });
    const p3 = calculateProblemWeakness({
      ...baseProblem,
      problemId: "p3",
      attempts: [
        { outcome: "independent", timeTakenSeconds: 900, attemptedAt: "2026-11-03T10:00:00Z" },
        { outcome: "independent", timeTakenSeconds: 800, attemptedAt: "2026-11-04T10:00:00Z" },
        { outcome: "independent", timeTakenSeconds: 750, attemptedAt: "2026-11-04T12:00:00Z" },
      ],
      revisions: [{ rating: "easy", reviewedAt: "2026-11-04T14:00:00Z" }],
    });

    const topicResult = calculateTopicWeakness({
      topicId: "binary-search",
      topicSlug: "binary-search",
      topicName: "Binary Search",
      problems: [p1, p2, p3],
      totalTopicProblemsCount: 3,
    });

    expect(topicResult.confidence).toBe("high");
    expect(topicResult.status).toBe("stable");
  });

  it("recommends Algorithm Lab simulation when a weak topic has a matching lab slug", () => {
    const weakProblem = calculateProblemWeakness({
      ...baseProblem,
      attempts: [
        { outcome: "hint", timeTakenSeconds: 1200, attemptedAt: "2026-11-01T10:00:00Z" },
        { outcome: "hint", timeTakenSeconds: 1100, attemptedAt: "2026-11-02T10:00:00Z" },
      ],
    });

    const topicResult = calculateTopicWeakness({
      topicId: "binary-search",
      topicSlug: "binary-search",
      topicName: "Binary Search",
      problems: [weakProblem],
      algorithmLabSlug: "binary-search",
    });

    expect(topicResult.status).toBe("needs_attention");
    const labRec = topicResult.recommendations.find((r) => r.action === "REVIEW_ALGORITHM");
    expect(labRec).toBeDefined();
    expect(labRec?.targetSlug).toBe("binary-search");
  });

  it("prioritizes foundational prerequisites over downstream topics of similar severity", () => {
    const weakTopicArrays = calculateTopicWeakness({
      topicId: "arrays",
      topicSlug: "arrays",
      topicName: "Arrays",
      problems: [
        calculateProblemWeakness({
          ...baseProblem,
          attempts: [
            { outcome: "hint", timeTakenSeconds: 1000, attemptedAt: "2026-11-01T10:00:00Z" },
            { outcome: "hint", timeTakenSeconds: 1000, attemptedAt: "2026-11-02T10:00:00Z" },
          ],
        }),
      ],
    });

    const weakTopicDP = calculateTopicWeakness({
      topicId: "dp",
      topicSlug: "dynamic-programming",
      topicName: "Dynamic Programming",
      problems: [
        calculateProblemWeakness({
          ...baseProblem,
          problemId: "dp-1",
          attempts: [
            { outcome: "hint", timeTakenSeconds: 1000, attemptedAt: "2026-11-01T10:00:00Z" },
            { outcome: "hint", timeTakenSeconds: 1000, attemptedAt: "2026-11-02T10:00:00Z" },
          ],
        }),
      ],
    });

    const ranking = rankImprovementCandidates({
      topics: [weakTopicDP, weakTopicArrays],
      currentStageSequence: 1,
      prerequisiteTopicIds: new Set(["arrays"]), // Arrays is prerequisite
    });

    // Foundational prerequisite Arrays must be ranked before advanced DP
    expect(ranking.rankedTopics[0].topicId).toBe("arrays");
    expect(ranking.rankedTopics[0].priorityRank).toBe(1);
    expect(ranking.rankedTopics[1].topicId).toBe("dp");
  });

  it("filters out recommendations for problems that are already scheduled in Today/daily tasks", () => {
    const prob = calculateProblemWeakness({
      ...baseProblem,
      problemId: "prob-already-scheduled",
      attempts: [
        { outcome: "hint", timeTakenSeconds: 1000, attemptedAt: "2026-11-01T10:00:00Z" },
        { outcome: "hint", timeTakenSeconds: 1000, attemptedAt: "2026-11-02T10:00:00Z" },
      ],
    });

    const topic = calculateTopicWeakness({
      topicId: "arrays",
      topicSlug: "arrays",
      topicName: "Arrays",
      problems: [prob],
    });

    const scheduled = new Set(["prob-already-scheduled"]);
    const ranking = rankImprovementCandidates({
      topics: [topic],
      scheduledProblemIds: scheduled,
    });

    expect(ranking.dedupedRecommendations.some((r) => r.targetId === "prob-already-scheduled")).toBe(false);
  });
});

