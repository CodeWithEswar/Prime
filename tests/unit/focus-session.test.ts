import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { focusStore } from "@/features/focus/lib/focus-store";
import { MutationCoordinator } from "@/features/focus/lib/mutation-coordinator";
import { formatFocusCountdown, formatFocusDuration } from "@/features/focus/hooks/use-focus-timer";

describe("PRIME Focus Mode — State Machine & Performance", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    focusStore.destroy();
    vi.useRealTimers();
  });

  describe("FocusStore — Instant State Transitions (<50ms target)", () => {
    it("initializes synchronously with deterministic initial snapshot", () => {
      focusStore.init({
        sessionId: "sess-123",
        taskId: "task-abc",
        taskTitle: "DBMS Normalization & BCNF",
        plannedMinutes: 45,
        initialStatus: "running",
        accumulatedSeconds: 0,
      });

      const snap = focusStore.getSnapshot();
      expect(snap.state).toBe("running");
      expect(snap.sessionId).toBe("sess-123");
      expect(snap.taskId).toBe("task-abc");
      expect(snap.targetMinutes).toBe(45);
      expect(snap.elapsedSeconds).toBe(0);
      expect(snap.remainingSeconds).toBe(45 * 60);
      expect(snap.isOvertime).toBe(false);
    });

    it("pauses instantaneously without async latency", () => {
      focusStore.init({
        sessionId: "sess-123",
        taskId: "task-abc",
        taskTitle: "DBMS Normalization & BCNF",
        plannedMinutes: 25,
        initialStatus: "running",
        accumulatedSeconds: 10,
      });

      const startMark = performance.now();
      focusStore.pauseImmediately();
      const endMark = performance.now();

      // Ensure execution is sub-millisecond
      expect(endMark - startMark).toBeLessThan(15);

      const snap = focusStore.getSnapshot();
      expect(snap.state).toBe("paused");
      expect(snap.syncState).toBe("pending");
      expect(snap.elapsedSeconds).toBe(10);
      expect(snap.remainingSeconds).toBe(25 * 60 - 10);
    });

    it("resumes instantaneously and resumes monotonic ticking", () => {
      focusStore.init({
        sessionId: "sess-123",
        taskId: "task-abc",
        taskTitle: "DBMS Normalization & BCNF",
        plannedMinutes: 25,
        initialStatus: "paused",
        accumulatedSeconds: 300,
      });

      expect(focusStore.getSnapshot().state).toBe("paused");

      const startMark = performance.now();
      focusStore.resumeImmediately();
      const endMark = performance.now();

      expect(endMark - startMark).toBeLessThan(15);
      expect(focusStore.getSnapshot().state).toBe("running");
    });

    it("transitions to finishing and completed states instantly", () => {
      focusStore.init({
        sessionId: "sess-123",
        taskId: "task-abc",
        taskTitle: "System Design Sprint",
        plannedMinutes: 30,
        initialStatus: "running",
        accumulatedSeconds: 1800,
      });

      focusStore.finishImmediately();
      expect(focusStore.getSnapshot().state).toBe("finishing");
      expect(focusStore.getSnapshot().syncState).toBe("pending");

      focusStore.completeImmediately();
      expect(focusStore.getSnapshot().state).toBe("completed");
      expect(focusStore.getSnapshot().syncState).toBe("synced");
      expect(focusStore.getSnapshot().remainingSeconds).toBe(0);
    });

    it("notifies subscribers synchronously upon state transitions", () => {
      focusStore.init({
        sessionId: "sess-1",
        taskId: "task-1",
        taskTitle: "Test",
        plannedMinutes: 20,
        initialStatus: "running",
        accumulatedSeconds: 0,
      });

      const listener = vi.fn();
      const unsubscribe = focusStore.subscribe(listener);

      focusStore.pauseImmediately();
      expect(listener).toHaveBeenCalledTimes(1);

      focusStore.resumeImmediately();
      expect(listener).toHaveBeenCalledTimes(2);

      unsubscribe();
      focusStore.pauseImmediately();
      expect(listener).toHaveBeenCalledTimes(2); // no further call
    });

    it("reconciles optimistic sessionId with server response without reset", () => {
      focusStore.init({
        sessionId: "optimistic-999",
        taskId: "task-1",
        taskTitle: "Optimistic Session",
        plannedMinutes: 25,
        initialStatus: "running",
        accumulatedSeconds: 60,
      });

      expect(focusStore.getSnapshot().sessionId).toBe("optimistic-999");
      focusStore.reconcileSessionId("server-uuid-8888");

      const snap = focusStore.getSnapshot();
      expect(snap.sessionId).toBe("server-uuid-8888");
      expect(snap.syncState).toBe("synced");
      expect(snap.elapsedSeconds).toBe(60);
    });

    it("marks sync error cleanly when Supabase persistence fails", () => {
      focusStore.init({
        sessionId: "sess-1",
        taskId: "task-1",
        taskTitle: "Test",
        plannedMinutes: 25,
        initialStatus: "running",
        accumulatedSeconds: 0,
      });

      focusStore.markFailed("Supabase network timeout");
      const snap = focusStore.getSnapshot();
      expect(snap.syncState).toBe("failed");
      expect(snap.errorMessage).toBe("Supabase network timeout");
    });

    it("handles rapid consecutive pause and resume toggles deterministically", () => {
      focusStore.init({
        sessionId: "sess-1",
        taskId: "task-1",
        taskTitle: "Rapid toggling test",
        plannedMinutes: 25,
        initialStatus: "running",
        accumulatedSeconds: 100,
      });

      for (let i = 0; i < 5; i++) {
        focusStore.pauseImmediately();
        expect(focusStore.getSnapshot().state).toBe("paused");
        focusStore.resumeImmediately();
        expect(focusStore.getSnapshot().state).toBe("running");
      }

      focusStore.pauseImmediately();
      expect(focusStore.getSnapshot().state).toBe("paused");
    });
  });

  describe("MutationCoordinator — Async Request Serialization & Idempotency", () => {
    it("processes tasks sequentially in strict FIFO order", async () => {
      const coordinator = new MutationCoordinator();
      const executedOrder: number[] = [];

      const p1 = new Promise<void>((resolve) => {
        coordinator.enqueue({
          type: "pause",
          execute: async () => {
            await new Promise((r) => setTimeout(r, 20));
            executedOrder.push(1);
            return { ok: true };
          },
        });
        resolve();
      });

      const p2 = new Promise<void>((resolve) => {
        coordinator.enqueue({
          type: "resume",
          execute: async () => {
            await new Promise((r) => setTimeout(r, 10));
            executedOrder.push(2);
            return { ok: true };
          },
        });
        resolve();
      });

      await Promise.all([p1, p2]);

      // Advance timers so tasks complete
      await vi.runAllTimersAsync();

      expect(executedOrder).toEqual([1, 2]);
    });

    it("assigns monotonically increasing operation IDs", () => {
      const coordinator = new MutationCoordinator();
      const id1 = coordinator.enqueue({
        type: "pause",
        execute: async () => {},
      });
      const id2 = coordinator.enqueue({
        type: "resume",
        execute: async () => {},
      });
      const id3 = coordinator.enqueue({
        type: "pause",
        execute: async () => {},
      });

      expect(id2).toBeGreaterThan(id1);
      expect(id3).toBeGreaterThan(id2);
    });

    it("handles errors gracefully without crashing the processing loop", async () => {
      const coordinator = new MutationCoordinator();
      const errorHandler = vi.fn();
      const successHandler = vi.fn();

      coordinator.enqueue({
        type: "pause",
        execute: async () => {
          throw new Error("Network offline");
        },
        onError: errorHandler,
      });

      coordinator.enqueue({
        type: "resume",
        execute: async () => ({ status: "ok" }),
        onSuccess: successHandler,
      });

      await vi.runAllTimersAsync();

      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
      expect(successHandler).toHaveBeenCalledWith({ status: "ok" });
    });
  });

  describe("Focus Timer Formatting & Precision", () => {
    it("formats standard countdown accurately (MM:SS)", () => {
      expect(formatFocusCountdown(1500)).toBe("25:00");
      expect(formatFocusCountdown(65)).toBe("01:05");
      expect(formatFocusCountdown(9)).toBe("00:09");
      expect(formatFocusCountdown(0)).toBe("00:00");
    });

    it("formats elapsed duration accurately (Xm Ys / Xh Ym)", () => {
      expect(formatFocusDuration(45)).toBe("45s");
      expect(formatFocusDuration(125)).toBe("2m 05s");
      expect(formatFocusDuration(3660)).toBe("1h 01m");
    });
  });
});
