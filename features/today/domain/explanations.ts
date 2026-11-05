/**
 * Deterministic Explainability Mappings for Today's Planned Tasks
 * Translates planner reason codes and decision metadata into concise,
 * transparent human-readable explanations.
 */

export function explainTaskReason(
  reasonCode: string | null | undefined,
  metadata?: Record<string, unknown> | null
): string {
  if (!reasonCode) {
    return "Scheduled for today's preparation runway";
  }

  const normalized = reasonCode.toUpperCase();

  switch (normalized) {
    case "REVISION_OVERDUE":
      return "Retention review overdue · Priority recall obligation";

    case "REVISION_DUE":
      return "Spaced repetition milestone due today · Consolidates pattern retention";

    case "CURRENT_STAGE":
    case "CURRENT_STAGE+PREREQUISITES_MET":
    case "CURRENT_STAGE_CORE":
      return "Current PRIME Core stage · Prerequisites satisfied";

    case "CORE_PRIORITY":
    case "HIGH_YIELD_PATTERN":
      return "High-yield interview pattern · Core curriculum requirement";

    case "CARRY_FORWARD":
      return "Carried forward from an earlier date · Preserved preparation continuity";

    case "USER_SELECTED_DATE":
      return "Scheduled on the date you selected";

    case "CAPACITY_REBALANCE":
      return "Moved to fit your updated availability";

    case "CORE_NEXT_ELIGIBLE":
      return "Prime Core practice with prerequisites satisfied";

    case "AVAILABLE_CAPACITY":
      return "Scheduled within your available study budget";

    case "LOCKED_COMMITMENT":
      return "User commitment · Locked daily schedule";

    case "CAPACITY_FIT":
      return "Allocated to fill available daily study capacity";

    case "USER_CREATED":
    case "CUSTOM":
      return "Custom preparation task added by you";

    case "REST_DAY_REVISION":
      return "Retention review due during active recovery";

    default:
      return reasonCode.replace(/_/g, " ").toLowerCase();
  }
}

