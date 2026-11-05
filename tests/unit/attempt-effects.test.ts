import { describe, it, expect } from "vitest";
import { deriveAttemptEffects } from "../../domain/attempts";

describe("Pure Domain Attempt Effects Verification", () => {
  const baseDate = new Date("2026-11-01T12:00:00Z");

  it("handles unsolved attempts: status becomes 'attempted' with 1-day revision", () => {
    const result = deriveAttemptEffects(
      {
        outcome: "unsolved",
        confidence: 1,
        timeTakenMinutes: 35,
        currentStatus: "not_started",
      },
      baseDate
    );

    expect(result.nextStatus).toBe("attempted");
    expect(result.requiresRevision).toBe(true);
    expect(result.nextIntervalDays).toBe(1);
    expect(result.nextRevisionDate.toISOString().slice(0, 10)).toBe("2026-11-02");
  });

  it("demotes previously solved problem to 'needs_revision' on unsolved attempt", () => {
    const result = deriveAttemptEffects(
      {
        outcome: "unsolved",
        confidence: 1,
        currentStatus: "solved",
      },
      baseDate
    );

    expect(result.nextStatus).toBe("needs_revision");
    expect(result.nextIntervalDays).toBe(1);
  });

  it("handles solution_viewed: status becomes 'needs_revision' with 1-day revision", () => {
    const result = deriveAttemptEffects(
      {
        outcome: "solution_viewed",
        confidence: 2,
        timeTakenMinutes: 20,
      },
      baseDate
    );

    expect(result.nextStatus).toBe("needs_revision");
    expect(result.requiresRevision).toBe(true);
    expect(result.nextIntervalDays).toBe(1);
  });

  it("handles hint: status becomes 'solved' with 3-day revision", () => {
    const result = deriveAttemptEffects(
      {
        outcome: "hint",
        confidence: 3,
        timeTakenMinutes: 25,
      },
      baseDate
    );

    expect(result.nextStatus).toBe("solved");
    expect(result.requiresRevision).toBe(true);
    expect(result.nextIntervalDays).toBe(3);
    expect(result.nextRevisionDate.toISOString().slice(0, 10)).toBe("2026-11-04");
  });

  it("handles independent solves with varying confidence", () => {
    // Low confidence independent
    const lowConf = deriveAttemptEffects(
      {
        outcome: "independent",
        confidence: 2,
      },
      baseDate
    );
    expect(lowConf.nextStatus).toBe("solved");
    expect(lowConf.nextIntervalDays).toBe(3);

    // Moderate confidence independent (first solve)
    const midConf = deriveAttemptEffects(
      {
        outcome: "independent",
        confidence: 3,
      },
      baseDate
    );
    expect(midConf.nextStatus).toBe("solved");
    expect(midConf.nextIntervalDays).toBe(7);

    // High confidence independent advancing interval
    const highConf = deriveAttemptEffects(
      {
        outcome: "independent",
        confidence: 5,
        currentIntervalDays: 7,
      },
      baseDate
    );
    expect(highConf.nextStatus).toBe("solved");
    expect(highConf.nextIntervalDays).toBe(14);
    expect(highConf.nextRevisionDate.toISOString().slice(0, 10)).toBe("2026-11-15");
  });

  it("preserves mastered status on independent solve and never prematurely grants mastered", () => {
    const fromNotStarted = deriveAttemptEffects({
      outcome: "independent",
      confidence: 5,
      currentStatus: "not_started",
    });
    // Never grants mastered on a single solve
    expect(fromNotStarted.nextStatus).toBe("solved");

    const fromMastered = deriveAttemptEffects({
      outcome: "independent",
      confidence: 5,
      currentStatus: "mastered",
    });
    // Preserves mastered
    expect(fromMastered.nextStatus).toBe("mastered");
  });
});

