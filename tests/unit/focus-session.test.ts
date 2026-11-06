import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { focusStore } from "@/features/focus/lib/focus-store";
import { MutationCoordinator } from "@/features/focus/lib/mutation-coordinator";
import { formatFocusCountdown, formatFocusDuration } from "@/features/focus/hooks/use-focus-timer";
import {
  polarToCartesian,
  getEllipticalBoundaryRadius,
  computeInwardProgress,
  computeInwardAcceleration,
  computeRayAlpha,
  computeEmberAlpha,
} from "@/features/focus/lib/ray-geometry";
import { RayEngine } from "@/features/focus/lib/ray-engine";
import { magneticBlazeConfig } from "@/features/focus/types";

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

  describe("360° Magnetic Blaze Ray Geometry & Physics", () => {
    it("computes polar-to-Cartesian coordinates across 360 degrees", () => {
      const cx = 500;
      const cy = 400;

      // 0 rad (right)
      const pRight = polarToCartesian(cx, cy, 0, 100);
      expect(pRight.x).toBeCloseTo(600);
      expect(pRight.y).toBeCloseTo(400);

      // PI/2 rad (bottom)
      const pBottom = polarToCartesian(cx, cy, Math.PI / 2, 100);
      expect(pBottom.x).toBeCloseTo(500);
      expect(pBottom.y).toBeCloseTo(500);

      // PI rad (left)
      const pLeft = polarToCartesian(cx, cy, Math.PI, 100);
      expect(pLeft.x).toBeCloseTo(400);
      expect(pLeft.y).toBeCloseTo(400);

      // 3*PI/2 rad (top)
      const pTop = polarToCartesian(cx, cy, (3 * Math.PI) / 2, 100);
      expect(pTop.x).toBeCloseTo(500);
      expect(pTop.y).toBeCloseTo(300);
    });

    it("calculates elliptical boundary radius matching timer aspect ratio", () => {
      const rx = 180;
      const ry = 100;

      // At 0 or PI (horizontal axis), boundary should equal rx
      expect(getEllipticalBoundaryRadius(rx, ry, 0)).toBeCloseTo(180);
      expect(getEllipticalBoundaryRadius(rx, ry, Math.PI)).toBeCloseTo(180);

      // At PI/2 or 3*PI/2 (vertical axis), boundary should equal ry
      expect(getEllipticalBoundaryRadius(rx, ry, Math.PI / 2)).toBeCloseTo(100);
      expect(getEllipticalBoundaryRadius(rx, ry, (3 * Math.PI) / 2)).toBeCloseTo(100);
    });

    it("computes normalized inward progress from outer boundary to central exclusion", () => {
      const inner = 100;
      const max = 1000;

      // At outer edge: progress 0
      expect(computeInwardProgress(1000, inner, max)).toBe(0);

      // Halfway: progress 0.5
      expect(computeInwardProgress(550, inner, max)).toBeCloseTo(0.5);

      // At inner exclusion boundary: progress 1.0
      expect(computeInwardProgress(100, inner, max)).toBe(1);

      // Past inner: clamped to 1.0
      expect(computeInwardProgress(50, inner, max)).toBe(1);
    });

    it("accelerates rays smoothly as they approach the center", () => {
      const accelOuter = computeInwardAcceleration(0.0);
      const accelMid = computeInwardAcceleration(0.5);
      const accelInner = computeInwardAcceleration(0.95);

      expect(accelOuter).toBe(1.0);
      expect(accelMid).toBeGreaterThan(accelOuter);
      expect(accelInner).toBeGreaterThan(accelMid);
    });

    it("fades ray alpha out completely before entering the timer exclusion zone", () => {
      const baseOpacity = 0.8;

      // Outer entry: fades in from 0
      expect(computeRayAlpha(baseOpacity, 0.0)).toBe(0);
      expect(computeRayAlpha(baseOpacity, 0.06)).toBeCloseTo(0.4);

      // Mid field: maintains full opacity
      expect(computeRayAlpha(baseOpacity, 0.4)).toBe(0.8);
      expect(computeRayAlpha(baseOpacity, 0.7)).toBe(0.8);

      // Inner boundary: drops sharply to 0 to preserve 100% white text contrast
      expect(computeRayAlpha(baseOpacity, 0.85)).toBeLessThan(0.8);
      expect(computeRayAlpha(baseOpacity, 1.0)).toBe(0);
    });

    it("fades flaming ember alpha before entering the timer exclusion zone", () => {
      const baseOpacity = 0.9;

      // Outer entry: fades in from 0
      expect(computeEmberAlpha(baseOpacity, 0.0)).toBe(0);
      expect(computeEmberAlpha(baseOpacity, 0.075)).toBeCloseTo(0.45);

      // Mid vortex: full warmth
      expect(computeEmberAlpha(baseOpacity, 0.4)).toBe(0.9);
      expect(computeEmberAlpha(baseOpacity, 0.65)).toBe(0.9);

      // Exclusion zone: drops smoothly to 0
      expect(computeEmberAlpha(baseOpacity, 0.85)).toBeLessThan(0.9);
      expect(computeEmberAlpha(baseOpacity, 1.0)).toBe(0);
    });
  });

  describe("RayEngine Simulation Lifecycle & Adaptive Scaling (V2)", () => {
    it("uses calibrated ~35% slower speed multiplier config", () => {
      expect(magneticBlazeConfig.speedMultiplier).toBe(0.65);
      expect(magneticBlazeConfig.attractionStrength).toBe(0.8);
      expect(magneticBlazeConfig.angularDrift).toBe(0.12);
      expect(magneticBlazeConfig.trailLengthMultiplier).toBe(1.25);
    });

    it("scales dense ray and flaming ember counts adaptively based on device width", () => {
      const engine = new RayEngine();

      // Mobile viewport (<640px)
      engine.resize(375, 667);
      expect(engine.getRayCount()).toBe(105);
      expect(engine.getEmberCount()).toBe(28);

      // Tablet viewport (640-1024px)
      engine.resize(768, 1024);
      expect(engine.getRayCount()).toBe(160);
      expect(engine.getEmberCount()).toBe(45);

      // Desktop viewport (>1024px)
      engine.resize(1920, 1080);
      expect(engine.getRayCount()).toBe(250);
      expect(engine.getEmberCount()).toBe(68);
    });

    it("moves rays and embers strictly inward toward the center", () => {
      const engine = new RayEngine();
      engine.resize(1200, 800);

      const ctxMock = {
        clearRect: vi.fn(),
        createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        globalCompositeOperation: "source-over",
      } as unknown as CanvasRenderingContext2D;

      // Update for 1 second of simulation
      engine.update(0.016, { isRunning: true, isPaused: false, reducedMotion: false });
      engine.render(ctxMock, { isRunning: true, isPaused: false, reducedMotion: false });

      expect(ctxMock.clearRect).toHaveBeenCalled();
    });
  });
});
