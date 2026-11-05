/**
 * PRIME Mastery Intelligence Engine — Freshness Utilities
 *
 * Deterministic assessment of evidence age and refresh recommendations.
 */

import type { MasteryFreshness } from "./types";
import { MASTERY_POLICY_V1, type MasteryPolicy } from "./policy";

export function getMasteryFreshness(
  lastEvidenceAt: Date | string | null,
  policy: MasteryPolicy = MASTERY_POLICY_V1,
  now: Date = new Date()
): MasteryFreshness {
  if (!lastEvidenceAt) return "stale";
  const evidenceMs = new Date(lastEvidenceAt).getTime();
  const diffDays = Math.max(0, (now.getTime() - evidenceMs) / (1000 * 60 * 60 * 24));

  if (diffDays <= policy.freshnessDays.fresh) return "fresh";
  if (diffDays <= policy.freshnessDays.aging) return "aging";
  return "stale";
}

export function isRefreshRecommended(
  freshness: MasteryFreshness,
  level: string
): boolean {
  if (freshness === "stale") return true;
  if (freshness === "aging" && (level === "mastered" || level === "proficient")) {
    return true;
  }
  return false;
}

