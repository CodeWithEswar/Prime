export interface EditorialOverride {
  slug?: string;
  recommendedMinutes?: number;
  priority?: "P0" | "P1" | "P2";
  isCheckpoint?: boolean;
  selectionReason?: string;
}

/**
 * Editorial overrides allow human curriculum designers to adjust
 * priorities, target times, or checkpoints without altering the automated extraction logic.
 */
export const EDITORIAL_OVERRIDES: Record<string, EditorialOverride> = {
  "two-sum": {
    priority: "P0",
    recommendedMinutes: 15,
    isCheckpoint: true,
  },
  "3sum": {
    priority: "P0",
    recommendedMinutes: 25,
    isCheckpoint: true,
  },
  "trapping-rain-water": {
    priority: "P0",
    recommendedMinutes: 35,
    isCheckpoint: true,
  },
  "longest-substring-without-repeating-characters": {
    priority: "P0",
    recommendedMinutes: 25,
    isCheckpoint: true,
  },
  "lru-cache": {
    priority: "P0",
    recommendedMinutes: 35,
    isCheckpoint: true,
  },
  "alien-dictionary": {
    priority: "P0",
    recommendedMinutes: 40,
    isCheckpoint: true,
  },
};
