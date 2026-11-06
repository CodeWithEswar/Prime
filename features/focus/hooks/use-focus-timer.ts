"use client";

import { useSyncExternalStore, useEffect, useCallback } from "react";
import { focusStore, type FocusStoreSnapshot } from "../lib/focus-store";
import type { FocusState } from "../types";

interface UseFocusTimerProps {
  sessionId: string;
  taskId: string;
  taskTitle: string;
  plannedMinutes: number;
  initialStatus: "running" | "paused";
  durationSeconds: number;
  startedAt: string;
  onComplete?: () => void;
}

export function formatFocusCountdown(remainingSeconds: number): string {
  const remMinutes = Math.floor(Math.max(0, remainingSeconds) / 60);
  const remSecs = Math.max(0, remainingSeconds) % 60;
  return `${remMinutes.toString().padStart(2, "0")}:${remSecs.toString().padStart(2, "0")}`;
}

export function formatFocusDuration(elapsedSeconds: number): string {
  const total = Math.max(0, elapsedSeconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  }
  return `${seconds}s`;
}

export function useFocusTimer({
  sessionId,
  taskId,
  taskTitle,
  plannedMinutes,
  initialStatus,
  durationSeconds,
  startedAt,
  onComplete,
}: UseFocusTimerProps) {
  // Initialize store on mount or prop sync
  useEffect(() => {
    const startedAtMs = Date.parse(startedAt);
    focusStore.init({
      sessionId,
      taskId,
      taskTitle,
      plannedMinutes,
      initialStatus,
      accumulatedSeconds: durationSeconds,
      startedAtMs,
    });
  }, [sessionId, taskId, taskTitle, plannedMinutes, initialStatus, durationSeconds, startedAt]);

  const snapshot: FocusStoreSnapshot = useSyncExternalStore(
    (onStoreChange) => focusStore.subscribe(onStoreChange),
    () => focusStore.getSnapshot(),
    () => focusStore.getSnapshot()
  );

  // Trigger completion callback when state transitions to completed
  useEffect(() => {
    if (snapshot.state === "completed" && onComplete) {
      onComplete();
    }
  }, [snapshot.state, onComplete]);

  // Derived formatted countdown: MM:SS
  const countdownFormatted = formatFocusCountdown(snapshot.remainingSeconds);

  // Formatted elapsed: "Xm Ys" / "Xh Ym"
  const elapsedFormatted = formatFocusDuration(snapshot.elapsedSeconds);

  const pause = useCallback(() => {
    focusStore.pauseImmediately();
  }, []);

  const resume = useCallback(() => {
    focusStore.resumeImmediately();
  }, []);

  return {
    state: snapshot.state,
    syncState: snapshot.syncState,
    elapsedSeconds: snapshot.elapsedSeconds,
    remainingSeconds: snapshot.remainingSeconds,
    targetMinutes: snapshot.targetMinutes,
    countdownFormatted,
    elapsedFormatted,
    isOvertime: snapshot.isOvertime,
    pause,
    resume,
  };
}
