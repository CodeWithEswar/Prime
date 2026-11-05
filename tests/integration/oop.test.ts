import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getOOPDashboardData } from "@/features/oop/server/service";
import * as oopActions from "@/features/oop/server/actions";

describe("OOP with Java — Integration Layer", () => {
  it("loads OOP dashboard data with guest fallback when client is null", async () => {
    const data = await getOOPDashboardData(null, null);

    expect(data.course.slug).toBe("oop-12-day");
    expect(data.days.length).toBe(12);
    expect(data.videos.length).toBe(7);
    expect(data.segments.length).toBe(21);
    expect(data.prerequisites.length).toBe(7);
    expect(data.supplementaryVideos.length).toBe(8);
    expect(data.outputPredictions.length).toBeGreaterThanOrEqual(10);
    expect(data.lldCases.length).toBe(10);
    expect(data.userState.enrolled).toBe(false);
    expect(data.metrics.completedDays).toBe(0);
  });

  it("exports all required server action mutation handlers", () => {
    expect(typeof oopActions.enrollOOPCourseAction).toBe("function");
    expect(typeof oopActions.toggleOOPVideoWatchedAction).toBe("function");
    expect(typeof oopActions.toggleOOPSegmentCompletedAction).toBe("function");
    expect(typeof oopActions.saveOOPVideoNoteAction).toBe("function");
    expect(typeof oopActions.recordOOPLabAttemptAction).toBe("function");
    expect(typeof oopActions.recordOOPDesignAttemptAction).toBe("function");
    expect(typeof oopActions.completeOOPDayAssignmentAction).toBe("function");
    expect(typeof oopActions.planOOPCourseInPlannerAction).toBe("function");
  });
});
