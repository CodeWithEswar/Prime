/**
 * PRIME Mastery Policy V1
 *
 * Centralized, explainable, and immutable policy constants for deterministic
 * mastery calculation.
 */

import type { AttemptOutcome, RevisionRating, ProblemDifficulty } from "./types";

export interface MasteryPolicy {
  version: number;
  weights: {
    independence: number;
    retention: number;
    repetition: number;
    timing: number;
    hintIndependence: number;
    confidenceCalibration: number;
    recency: number;
  };
  thresholds: {
    learning: number;
    practiced: number;
    proficient: number;
    mastered: number;
  };
  mandatoryRequirements: {
    practiced: {
      minSuccessfulAttempts: number;
    };
    proficient: {
      minIndependentSolves: number;
      minSuccessfulRevisions: number;
      minRetentionIntervalDays: number;
    };
    mastered: {
      minIndependentSolves: number;
      minSuccessfulRevisions: number;
      minRetentionIntervalDays: number;
    };
  };
  attemptOutcomeScores: Record<AttemptOutcome, number>;
  revisionRatingScores: Record<RevisionRating, number>;
  intervalDepthMultipliers: Record<number, number>;
  difficultyBonus: Record<ProblemDifficulty, number>;
  freshnessDays: {
    fresh: number;
    aging: number;
  };
  recencyDecayHalfLifeDays: number;
  minDecayWeight: number;
}

export const MASTERY_POLICY_V1: MasteryPolicy = {
  version: 1,

  weights: {
    independence: 0.30,
    retention: 0.25,
    repetition: 0.15,
    timing: 0.10,
    hintIndependence: 0.10,
    confidenceCalibration: 0.05,
    recency: 0.05,
  },

  thresholds: {
    learning: 30.0,
    practiced: 50.0,
    proficient: 70.0,
    mastered: 85.0,
  },

  mandatoryRequirements: {
    practiced: {
      minSuccessfulAttempts: 1,
    },
    proficient: {
      minIndependentSolves: 1,
      minSuccessfulRevisions: 1,
      minRetentionIntervalDays: 3,
    },
    mastered: {
      minIndependentSolves: 2,
      minSuccessfulRevisions: 1,
      minRetentionIntervalDays: 7,
    },
  },

  attemptOutcomeScores: {
    independent: 1.0,
    hint: 0.65,
    solution_viewed: 0.25,
    unsolved: 0.0,
  },

  revisionRatingScores: {
    forgot: 0.0,
    hard: 0.40,
    okay: 0.75,
    easy: 1.0,
  },

  // Multiplier scales retention depth by verified recall interval
  intervalDepthMultipliers: {
    1: 0.25,
    3: 0.45,
    7: 0.70,
    14: 0.90,
    30: 1.00,
  },

  difficultyBonus: {
    EASY: 1.0,
    MEDIUM: 1.05,
    HARD: 1.10,
  },

  freshnessDays: {
    fresh: 30,
    aging: 90,
  },

  recencyDecayHalfLifeDays: 45,
  minDecayWeight: 0.25,
};

export function masteryDifficulty(value?: string | null): ProblemDifficulty {
  return value?.toLowerCase() === "easy"
    ? "EASY"
    : value?.toLowerCase() === "hard"
      ? "HARD"
      : "MEDIUM";
}


