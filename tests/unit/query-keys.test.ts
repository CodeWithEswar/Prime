import { describe, it, expect } from "vitest";
import { queryKeys } from "@/lib/query/keys";

describe("Query Keys Factory", () => {
  it("generates predictable hierarchical keys", () => {
    expect(queryKeys.today.all).toEqual(["today"]);
    expect(queryKeys.today.byDate("2026-10-31")).toEqual(["today", "date", "2026-10-31"]);

    expect(queryKeys.roadmap.all).toEqual(["roadmap"]);
    expect(queryKeys.roadmap.topic("graphs")).toEqual(["roadmap", "topic", "graphs"]);

    expect(queryKeys.problems.detail("p123")).toEqual(["problems", "detail", "p123"]);

    expect(queryKeys.revision.due("2026-10-31")).toEqual([
      "revision",
      "due",
      "2026-10-31",
    ]);

    expect(queryKeys.settings.all).toEqual(["settings"]);
    expect(queryKeys.settings.user("user-123")).toEqual(["settings", "user-123"]);
    expect(queryKeys.profile.all).toEqual(["profile"]);
    expect(queryKeys.profile.user()).toEqual(["profile", "me"]);
  });
});
