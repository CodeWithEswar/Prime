import { describe, it, expect } from "vitest";
import {
  CANONICAL_COMPETENCIES,
  getTargetProfile,
  getCompetencyDefinition,
  getCompanyEmphasis,
  CANONICAL_COMPANIES,
  evaluateCoverage,
  evaluateConfidence,
  evaluateReadinessStatus,
  evaluateCompetencyReadiness,
  evaluateTargetReadiness,
  compareTargetProfiles,
  calculateReadinessScore,
  type CompetencyEvidenceInput,
  type ProfileCompetencyRequirement,
} from "@/domain/readiness";

describe("PRIME Interview Readiness Engine — Domain Unit Tests", () => {
  const fixedNow = new Date("2026-11-04T10:00:00Z");

  describe("1. Target Profiles and Competencies Registry", () => {
    it("provides canonical competencies across 4 domains", () => {
      expect(CANONICAL_COMPETENCIES.length).toBe(19);
      const domains = new Set(CANONICAL_COMPETENCIES.map((c) => c.domain));
      expect(domains.has("dsa")).toBe(true);
      expect(domains.has("fundamentals")).toBe(true);
      expect(domains.has("aptitude")).toBe(true);
      expect(domains.has("mock")).toBe(true);
    });

    it("retrieves valid target profiles and falls back to general-sde", () => {
      const sde = getTargetProfile("general-sde");
      expect(sde.id).toBe("general-sde");
      expect(sde.competencies.length).toBeGreaterThan(0);

      const backend = getTargetProfile("backend-dev");
      expect(backend.id).toBe("backend-dev");

      const fallback = getTargetProfile("non-existent-profile");
      expect(fallback.id).toBe("general-sde");
    });

    it("retrieves competency definitions by id", () => {
      const twoPointers = getCompetencyDefinition("dsa-two-pointers");
      expect(twoPointers).toBeDefined();
      expect(twoPointers?.name).toBe("Two Pointers");
      expect(twoPointers?.domain).toBe("dsa");

      const unknown = getCompetencyDefinition("unknown-id");
      expect(unknown).toBeUndefined();
    });
  });

  describe("2. Evidence Policy — Coverage, Confidence & Status", () => {
    const requirement: ProfileCompetencyRequirement = {
      competencyId: "dsa-arrays",
      importance: "core",
      targetProblemsCount: 10,
    };

    it("evaluates coverage thresholds deterministically", () => {
      const baseEvidence: CompetencyEvidenceInput = {
        competencyId: "dsa-arrays",
        domain: "dsa",
        totalProblemsCount: 10,
        attemptedProblemsCount: 0,
        independentSolvedCount: 0,
        hintAssistedCount: 0,
        totalAttempts: 0,
        totalRevisions: 0,
        successfulRevisions: 0,
        forgotRevisions: 0,
        masteryScore: null,
        hasWeaknessSignal: false,
      };

      expect(evaluateCoverage({ ...baseEvidence, attemptedProblemsCount: 0 }, requirement)).toBe("none");
      expect(evaluateCoverage({ ...baseEvidence, attemptedProblemsCount: 1 }, requirement)).toBe("limited");
      expect(evaluateCoverage({ ...baseEvidence, attemptedProblemsCount: 3 }, requirement)).toBe("limited");
      expect(evaluateCoverage({ ...baseEvidence, attemptedProblemsCount: 4 }, requirement)).toBe("sufficient");
      expect(evaluateCoverage({ ...baseEvidence, attemptedProblemsCount: 7 }, requirement)).toBe("sufficient");
    });

    it("evaluates evidence confidence independently of performance", () => {
      const baseEvidence: CompetencyEvidenceInput = {
        competencyId: "dsa-arrays",
        domain: "dsa",
        totalProblemsCount: 10,
        attemptedProblemsCount: 0,
        independentSolvedCount: 0,
        hintAssistedCount: 0,
        totalAttempts: 0,
        totalRevisions: 0,
        successfulRevisions: 0,
        forgotRevisions: 0,
        masteryScore: null,
        hasWeaknessSignal: false,
      };

      expect(evaluateConfidence({ ...baseEvidence, totalAttempts: 0, totalRevisions: 0 })).toBe("insufficient");
      expect(evaluateConfidence({ ...baseEvidence, attemptedProblemsCount: 1, totalAttempts: 1 })).toBe("insufficient");
      expect(evaluateConfidence({ ...baseEvidence, attemptedProblemsCount: 1, totalAttempts: 2 })).toBe("low");
      expect(evaluateConfidence({ ...baseEvidence, attemptedProblemsCount: 2, totalAttempts: 3 })).toBe("moderate");
      expect(
        evaluateConfidence({
          ...baseEvidence,
          attemptedProblemsCount: 3,
          totalAttempts: 5,
          totalRevisions: 1,
        })
      ).toBe("high");
    });

    it("evaluates readiness status faithfully without inventing predictions", () => {
      const baseEvidence: CompetencyEvidenceInput = {
        competencyId: "dsa-arrays",
        domain: "dsa",
        totalProblemsCount: 10,
        attemptedProblemsCount: 0,
        independentSolvedCount: 0,
        hintAssistedCount: 0,
        totalAttempts: 0,
        totalRevisions: 0,
        successfulRevisions: 0,
        forgotRevisions: 0,
        masteryScore: null,
        hasWeaknessSignal: false,
      };

      // 0 attempts -> not_assessed
      expect(evaluateReadinessStatus(baseEvidence, "none", "insufficient")).toBe("not_assessed");

      // 1 attempt -> insufficient_evidence
      expect(
        evaluateReadinessStatus(
          { ...baseEvidence, attemptedProblemsCount: 1, totalAttempts: 1, independentSolvedCount: 1 },
          "limited",
          "insufficient"
        )
      ).toBe("insufficient_evidence");

      // active weakness signal -> needs_attention
      expect(
        evaluateReadinessStatus(
          { ...baseEvidence, attemptedProblemsCount: 4, totalAttempts: 6, hasWeaknessSignal: true },
          "sufficient",
          "high"
        )
      ).toBe("needs_attention");

      // moderate evidence -> developing
      expect(
        evaluateReadinessStatus(
          { ...baseEvidence, attemptedProblemsCount: 3, totalAttempts: 4, independentSolvedCount: 2, masteryScore: 50 },
          "limited",
          "moderate"
        )
      ).toBe("developing");

      // strong evidence, sufficient coverage, verified retention -> evidence_aligned
      expect(
        evaluateReadinessStatus(
          {
            ...baseEvidence,
            attemptedProblemsCount: 5,
            totalAttempts: 8,
            independentSolvedCount: 4,
            successfulRevisions: 4,
            forgotRevisions: 0,
            masteryScore: 85,
          },
          "sufficient",
          "high"
        )
      ).toBe("evidence_aligned");
    });
  });

  describe("3. Competency Evaluator", () => {
    it("evaluates unassessed competency with null score and clear missing evidence", () => {
      const def = getCompetencyDefinition("dsa-binary-search")!;
      const requirement: ProfileCompetencyRequirement = {
        competencyId: "dsa-binary-search",
        importance: "core",
        targetProblemsCount: 4,
      };
      const evidence: CompetencyEvidenceInput = {
        competencyId: "dsa-binary-search",
        domain: "dsa",
        totalProblemsCount: 10,
        attemptedProblemsCount: 0,
        independentSolvedCount: 0,
        hintAssistedCount: 0,
        totalAttempts: 0,
        totalRevisions: 0,
        successfulRevisions: 0,
        forgotRevisions: 0,
        masteryScore: null,
        hasWeaknessSignal: false,
      };

      const res = evaluateCompetencyReadiness({
        definition: def,
        requirement,
        evidence,
        now: fixedNow,
      });

      expect(res.status).toBe("not_assessed");
      expect(res.score).toBeNull();
      expect(res.confidence).toBe("insufficient");
      expect(res.coverage).toBe("none");
      expect(res.missingEvidence.length).toBeGreaterThan(0);
      expect(res.recommendation).toBeDefined();
    });

    it("evaluates strong competency as evidence_aligned with high confidence", () => {
      const def = getCompetencyDefinition("dsa-two-pointers")!;
      const requirement: ProfileCompetencyRequirement = {
        competencyId: "dsa-two-pointers",
        importance: "core",
        targetProblemsCount: 4,
      };
      const evidence: CompetencyEvidenceInput = {
        competencyId: "dsa-two-pointers",
        domain: "dsa",
        totalProblemsCount: 8,
        attemptedProblemsCount: 6,
        independentSolvedCount: 5,
        hintAssistedCount: 1,
        totalAttempts: 12,
        totalRevisions: 6,
        successfulRevisions: 5,
        forgotRevisions: 0,
        masteryScore: 88,
        hasWeaknessSignal: false,
      };

      const res = evaluateCompetencyReadiness({
        definition: def,
        requirement,
        evidence,
        now: fixedNow,
      });

      expect(res.status).toBe("evidence_aligned");
      expect(res.score).toBeGreaterThanOrEqual(80);
      expect(res.confidence).toBe("high");
      expect(res.coverage).toBe("sufficient");
      expect(res.supportingEvidence.length).toBeGreaterThan(0);
    });

    it("flags retention decay as needs_attention when forgot revisions are high", () => {
      const def = getCompetencyDefinition("dsa-trees")!;
      const requirement: ProfileCompetencyRequirement = {
        competencyId: "dsa-trees",
        importance: "core",
        targetProblemsCount: 4,
      };
      const evidence: CompetencyEvidenceInput = {
        competencyId: "dsa-trees-binary",
        domain: "dsa",
        totalProblemsCount: 8,
        attemptedProblemsCount: 6,
        independentSolvedCount: 5,
        hintAssistedCount: 1,
        totalAttempts: 10,
        totalRevisions: 6,
        successfulRevisions: 1,
        forgotRevisions: 5, // High forgot rate
        masteryScore: 40,
        hasWeaknessSignal: false,
      };

      const res = evaluateCompetencyReadiness({
        definition: def,
        requirement,
        evidence,
        now: fixedNow,
      });

      expect(res.status).toBe("needs_attention");
      expect(res.blockers.some((b) => b.includes("decay") || b.includes("revision"))).toBe(true);
    });
  });

  describe("4. Target Readiness & Gaps Prioritization", () => {
    it("evaluates target profile with domain summaries and prioritized gaps", () => {
      const evidenceMap = new Map<string, CompetencyEvidenceInput>();

      // Provide some evidence for two-pointers
      evidenceMap.set("dsa-two-pointers", {
        competencyId: "dsa-two-pointers",
        domain: "dsa",
        totalProblemsCount: 6,
        attemptedProblemsCount: 5,
        independentSolvedCount: 4,
        hintAssistedCount: 1,
        totalAttempts: 9,
        totalRevisions: 4,
        successfulRevisions: 4,
        forgotRevisions: 0,
        masteryScore: 85,
        hasWeaknessSignal: false,
      });

      const result = evaluateTargetReadiness({
        profileId: "general-sde",
        evidenceMap,
        now: fixedNow,
      });

      expect(result.profile.id).toBe("general-sde");
      expect(result.totalCompetencies).toBeGreaterThan(0);
      expect(Object.keys(result.domainSummaries).length).toBe(4);
      expect(result.domainSummaries.dsa).toBeDefined();
      expect(result.domainSummaries.dsa.total).toBeGreaterThan(0);

      // Gaps must be generated for unassessed and developing competencies
      expect(result.gaps.length).toBeGreaterThan(0);
      // Gaps must prioritize core requirements over supporting
      const firstGap = result.gaps[0];
      expect(firstGap.importance).toBe("core");
    });

    it("evaluates with company emphasis and provides target profile comparisons", () => {
      const evidenceMap = new Map<string, CompetencyEvidenceInput>();
      const result = evaluateTargetReadiness({
        profileId: "general-sde",
        companyId: "amazon",
        evidenceMap,
        now: fixedNow,
      });

      expect(result.companyEmphasis).toBeDefined();
      expect(result.companyEmphasis?.name).toBe("Amazon");
      expect(result.companyEmphasis?.priorityCompetencyIds).toContain("dsa-trees");

      // Comparisons across all canonical profiles
      expect(result.comparisons).toBeDefined();
      expect(result.comparisons?.length).toBe(4);
      const backendComp = result.comparisons?.find((c) => c.profileId === "backend-dev");
      expect(backendComp).toBeDefined();
      expect(backendComp?.totalCore).toBeGreaterThan(0);
    });

    it("evaluates compareTargetProfiles independently", () => {
      const evidenceMap = new Map<string, CompetencyEvidenceInput>();
      const comparisons = compareTargetProfiles(evidenceMap);
      expect(comparisons.length).toBe(4);
      expect(comparisons.map((c) => c.profileId)).toEqual([
        "general-sde",
        "backend-dev",
        "fullstack-dev",
        "frontend-dev",
      ]);
    });
  });

  describe("5. Company Emphasis Registry", () => {
    it("retrieves canonical companies by id", () => {
      expect(CANONICAL_COMPANIES.length).toBeGreaterThanOrEqual(4);
      const amazon = getCompanyEmphasis("amazon");
      expect(amazon?.name).toBe("Amazon");

      const google = getCompanyEmphasis("google");
      expect(google?.name).toBe("Google");

      const unknown = getCompanyEmphasis("nonexistent");
      expect(unknown).toBeUndefined();
    });
  });

  describe("6. Legacy Backward Compatibility", () => {
    it("preserves calculateReadinessScore for legacy consumers without disruption", () => {
      const score = calculateReadinessScore({
        roadmapCompletionRate: 0.8,
        overallAccuracyRate: 0.85,
        consistencyStreakDays: 14,
        revisionBacklogCount: 2,
      });

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
