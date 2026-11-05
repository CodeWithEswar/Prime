export type AttemptOutcome =
  | "independent"
  | "hint"
  | "solution_viewed"
  | "unsolved";

export type UserProblemStatus =
  | "not_started"
  | "attempted"
  | "solved"
  | "needs_revision"
  | "mastered";

export interface AttemptInput {
  outcome: AttemptOutcome;
  confidence: number; // 1 to 5
  timeTakenMinutes?: number;
  timeTakenSeconds?: number;
  currentStatus?: UserProblemStatus;
  currentIntervalDays?: number;
  notes?: string | null;
}

export interface AttemptEffects {
  nextStatus: UserProblemStatus;
  requiresRevision: boolean;
  nextIntervalDays: number;
  nextRevisionDate: Date;
  masteryScoreEstimate: number;
}

