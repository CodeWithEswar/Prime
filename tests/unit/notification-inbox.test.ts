import { describe, expect, it } from "vitest";
import {
  inboxQuerySchema,
  inboxUpdateSchema,
  notificationDayGroup,
  notificationHref,
} from "@/features/notifications/inbox";

describe("notification inbox boundaries", () => {
  it("validates filters and bounds bulk operations", () => {
    for (const input of [
      { limit: "NaN" },
      { limit: 51 },
      { tab: "invalid" },
      { category: "invalid" },
      { search: "a".repeat(101) },
    ]) {
      expect(inboxQuerySchema.safeParse(input).success).toBe(false);
    }
    const id = "11111111-1111-4111-8111-111111111111";
    expect(inboxUpdateSchema.parse({ ids: [id, id], operation: "unread" }).ids).toEqual([
      id,
    ]);
    expect(inboxUpdateSchema.safeParse({ ids: [], operation: "delete" }).success).toBe(
      false
    );
    expect(inboxUpdateSchema.safeParse({ ids: [id], operation: "archive" }).success).toBe(
      false
    );
    expect(
      inboxUpdateSchema.safeParse({ ids: Array(51).fill(id), operation: "read" }).success
    ).toBe(false);
  });

  it("only exposes relative PRIME destinations", () => {
    expect(notificationHref("/plan?date=2026-11-05")).toBe("/plan?date=2026-11-05");
    for (const value of [
      "//outside.test",
      "/\\outside.test",
      "javascript:alert(1)",
      "https://outside.test",
      "/\noutside.test",
      null,
    ]) {
      expect(notificationHref(value)).toBeNull();
    }
  });

  it("groups by the user's local calendar day around midnight and DST", () => {
    const now = new Date("2026-11-05T01:00:00Z");
    expect(notificationDayGroup("2026-11-04T23:00:00Z", "Asia/Kolkata", now)).toBe(
      "Today"
    );
    expect(notificationDayGroup("2026-11-03T23:00:00Z", "Asia/Kolkata", now)).toBe(
      "Yesterday"
    );
    expect(notificationDayGroup("2026-11-01T23:00:00Z", "Asia/Kolkata", now)).toBe(
      "Last 7 days"
    );
    expect(notificationDayGroup("2026-10-01T00:00:00Z", "Asia/Kolkata", now)).toBe(
      "Earlier"
    );
    expect(
      notificationDayGroup(
        "2026-11-01T05:00:00Z",
        "America/New_York",
        new Date("2026-11-02T05:30:00Z")
      )
    ).toBe("Yesterday");
  });
});
