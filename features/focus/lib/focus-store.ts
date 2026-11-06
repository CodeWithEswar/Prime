/**
 * PRIME Focus Mode — Instant Local State Machine & Store
 * Provides <50ms visual response for all timer actions, decoupling
 * visual state and the countdown clock from Supabase latency.
 */

import type { FocusState } from "../types";

export type FocusSyncState = "idle" | "pending" | "synced" | "failed";

export interface FocusStoreSnapshot {
  state: FocusState;
  syncState: FocusSyncState;
  sessionId: string;
  taskId: string;
  taskTitle: string;
  targetMinutes: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  isOvertime: boolean;
  version: number;
  errorMessage?: string | null;
}

type Listener = () => void;

class FocusStore {
  private snapshot: FocusStoreSnapshot = {
    state: "ready",
    syncState: "idle",
    sessionId: "",
    taskId: "",
    taskTitle: "",
    targetMinutes: 25,
    elapsedSeconds: 0,
    remainingSeconds: 25 * 60,
    isOvertime: false,
    version: 0,
    errorMessage: null,
  };

  private listeners = new Set<Listener>();

  // Monotonic timer tracking
  private monotonicAnchorMs = 0;
  private accumulatedSeconds = 0;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  public getSnapshot(): FocusStoreSnapshot {
    return this.snapshot;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * Initializes or re-anchors the store with a session
   */
  public init(config: {
    sessionId: string;
    taskId: string;
    taskTitle: string;
    plannedMinutes: number;
    initialStatus: "running" | "paused";
    accumulatedSeconds: number;
    startedAtMs?: number;
  }): void {
    const targetMinutes = config.plannedMinutes > 0 ? config.plannedMinutes : 25;
    const targetSeconds = targetMinutes * 60;

    this.accumulatedSeconds = config.accumulatedSeconds || 0;
    this.monotonicAnchorMs = performance.now();

    const isRunning = config.initialStatus === "running";
    const state: FocusState = isRunning ? "running" : "paused";

    // If already running prior to mount, compute elapsed from wall clock
    let currentElapsed = this.accumulatedSeconds;
    if (isRunning && config.startedAtMs && Number.isFinite(config.startedAtMs)) {
      const wallDiff = Math.max(0, Math.floor((Date.now() - config.startedAtMs) / 1000));
      currentElapsed += wallDiff;
    }

    const remainingSeconds = Math.max(0, targetSeconds - currentElapsed);

    this.snapshot = {
      state,
      syncState: "synced",
      sessionId: config.sessionId,
      taskId: config.taskId,
      taskTitle: config.taskTitle,
      targetMinutes,
      elapsedSeconds: currentElapsed,
      remainingSeconds,
      isOvertime: currentElapsed > targetSeconds,
      version: this.snapshot.version + 1,
      errorMessage: null,
    };

    this.emit();

    if (isRunning) {
      this.startTicker();
    } else {
      this.stopTicker();
    }
  }

  /**
   * Instant Pause (<16ms, next frame)
   */
  public pauseImmediately(): void {
    if (this.snapshot.state !== "running") return;

    // Freeze monotonic elapsed time
    const elapsedSinceAnchor = (performance.now() - this.monotonicAnchorMs) / 1000;
    this.accumulatedSeconds += Math.floor(elapsedSinceAnchor);

    this.stopTicker();

    const targetSeconds = this.snapshot.targetMinutes * 60;
    const remainingSeconds = Math.max(0, targetSeconds - this.accumulatedSeconds);

    this.snapshot = {
      ...this.snapshot,
      state: "paused",
      syncState: "pending",
      elapsedSeconds: this.accumulatedSeconds,
      remainingSeconds,
      isOvertime: this.accumulatedSeconds > targetSeconds,
      version: this.snapshot.version + 1,
    };

    this.emit();
  }

  /**
   * Instant Resume (<16ms, next frame)
   */
  public resumeImmediately(): void {
    if (this.snapshot.state !== "paused") return;

    this.monotonicAnchorMs = performance.now();

    this.snapshot = {
      ...this.snapshot,
      state: "running",
      syncState: "pending",
      version: this.snapshot.version + 1,
    };

    this.emit();
    this.startTicker();
  }

  /**
   * Instant Start (<16ms, next frame)
   */
  public startImmediately(config: {
    sessionId: string;
    taskId: string;
    taskTitle: string;
    plannedMinutes: number;
  }): void {
    const targetMinutes = config.plannedMinutes > 0 ? config.plannedMinutes : 25;
    this.accumulatedSeconds = 0;
    this.monotonicAnchorMs = performance.now();

    this.snapshot = {
      state: "running",
      syncState: "pending",
      sessionId: config.sessionId,
      taskId: config.taskId,
      taskTitle: config.taskTitle,
      targetMinutes,
      elapsedSeconds: 0,
      remainingSeconds: targetMinutes * 60,
      isOvertime: false,
      version: this.snapshot.version + 1,
      errorMessage: null,
    };

    this.emit();
    this.startTicker();
  }

  /**
   * Instant Finish (<16ms)
   */
  public finishImmediately(): void {
    this.stopTicker();
    this.snapshot = {
      ...this.snapshot,
      state: "finishing",
      syncState: "pending",
      version: this.snapshot.version + 1,
    };
    this.emit();
  }

  /**
   * Mark Completed
   */
  public completeImmediately(): void {
    this.stopTicker();
    this.snapshot = {
      ...this.snapshot,
      state: "completed",
      syncState: "synced",
      remainingSeconds: 0,
      version: this.snapshot.version + 1,
    };
    this.emit();
  }

  /**
   * Update real server sessionId after optimistic creation
   */
  public reconcileSessionId(realSessionId: string): void {
    if (this.snapshot.sessionId === realSessionId) return;
    this.snapshot = {
      ...this.snapshot,
      sessionId: realSessionId,
      syncState: "synced",
      version: this.snapshot.version + 1,
    };
    this.emit();
  }

  /**
   * Mark synchronization success
   */
  public markSynced(): void {
    if (this.snapshot.syncState === "synced") return;
    this.snapshot = {
      ...this.snapshot,
      syncState: "synced",
    };
    this.emit();
  }

  /**
   * Reconcile failure without destroying elapsed focus time
   */
  public reconcileFailure(errorMsg: string): void {
    this.snapshot = {
      ...this.snapshot,
      syncState: "failed",
      errorMessage: errorMsg,
    };
    this.emit();
  }

  public markFailed(errorMsg: string): void {
    this.reconcileFailure(errorMsg);
  }

  /**
   * High-precision monotonic ticker (fires once per second, updates only on integer boundary)
   */
  private startTicker(): void {
    this.stopTicker();

    this.timerInterval = setInterval(() => {
      if (this.snapshot.state !== "running") return;

      const elapsedSinceAnchor = (performance.now() - this.monotonicAnchorMs) / 1000;
      const currentTotal = this.accumulatedSeconds + Math.floor(elapsedSinceAnchor);

      // Only emit if integer second actually changed
      if (currentTotal !== this.snapshot.elapsedSeconds) {
        const targetSeconds = this.snapshot.targetMinutes * 60;
        const remaining = Math.max(0, targetSeconds - currentTotal);

        if (currentTotal >= targetSeconds) {
          this.completeImmediately();
          return;
        }

        this.snapshot = {
          ...this.snapshot,
          elapsedSeconds: currentTotal,
          remainingSeconds: remaining,
          isOvertime: currentTotal > targetSeconds,
        };
        this.emit();
      }
    }, 250); // Checks 4x per second to catch second boundaries cleanly without drift
  }

  private stopTicker(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public reset(): void {
    this.stopTicker();
    this.listeners.clear();
    this.snapshot = {
      state: "ready",
      syncState: "idle",
      sessionId: "",
      taskId: "",
      taskTitle: "",
      targetMinutes: 25,
      elapsedSeconds: 0,
      remainingSeconds: 25 * 60,
      isOvertime: false,
      version: 0,
      errorMessage: null,
    };
  }

  public destroy(): void {
    this.reset();
  }
}

export const focusStore = new FocusStore();
