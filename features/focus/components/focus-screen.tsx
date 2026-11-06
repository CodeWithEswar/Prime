"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { usePrimeReducedMotion } from "@/lib/motion";

import type { FocusSessionTask, ActiveStudySession } from "../types";
import { useFocusTimer } from "../hooks/use-focus-timer";
import { focusMutationCoordinator } from "../lib/mutation-coordinator";
import { MagneticBlaze } from "./magnetic-blaze";
import { FocusHeader } from "./focus-header";
import { FocusTimer } from "./focus-timer";
import { FocusCompletion } from "./focus-completion";
import { FinishSessionDialog } from "./finish-session-dialog";
import { ExitConfirmDialog } from "./exit-confirm-dialog";

import {
  pauseStudySessionAction,
  resumeStudySessionAction,
  finishStudySessionAction,
} from "@/features/today/server/session-actions";

export interface FocusScreenExitResult {
  markComplete?: boolean;
  taskId?: string;
  elapsedMinutes?: number;
}

interface FocusScreenProps {
  session: ActiveStudySession;
  task?: FocusSessionTask | null;
  onExit?: (result?: FocusScreenExitResult) => void;
}

export function FocusScreen({ session, task, onExit }: FocusScreenProps) {
  const router = useRouter();
  const reducedMotion = usePrimeReducedMotion();

  // Dialog visibility
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isFinishingAsync, setIsFinishingAsync] = useState(false);

  const plannedMinutes = task?.plannedMinutes || 25;

  const {
    state,
    countdownFormatted,
    elapsedFormatted,
    elapsedSeconds,
    targetMinutes,
    pause,
    resume,
  } = useFocusTimer({
    sessionId: session.id,
    taskId: session.taskId,
    taskTitle: task?.title || session.taskTitle,
    plannedMinutes,
    initialStatus: session.status,
    durationSeconds: session.durationSeconds,
    startedAt: session.startedAt,
    onComplete: () => {
      toast.success("Focus sprint completed! Great job.");
    },
  });

  const isRunning = state === "running";
  const isPaused = state === "paused";
  const isCompleted = state === "completed";

  /**
   * Instant Pause (<1ms visual response + asynchronous Supabase persistence)
   */
  const handlePause = () => {
    if (typeof performance !== "undefined") {
      performance.mark("focus-pause-click");
    }

    // 1. Instant local transition
    pause();

    if (typeof performance !== "undefined") {
      performance.mark("focus-pause-ui-updated");
      try {
        performance.measure(
          "focus-pause-response",
          "focus-pause-click",
          "focus-pause-ui-updated"
        );
      } catch {}
    }

    // 2. Asynchronous serialized mutation via coordinator
    focusMutationCoordinator.enqueue({
      type: "pause",
      sessionId: session.id,
      execute: () => pauseStudySessionAction(session.id, { taskId: session.taskId }),
      onError: (err) => {
        toast.error("Failed to sync pause state with server. Timer will keep local state.");
        console.error("Pause sync failure:", err);
      },
    });
  };

  /**
   * Instant Resume (<1ms visual response + asynchronous Supabase persistence)
   */
  const handleResume = () => {
    if (typeof performance !== "undefined") {
      performance.mark("focus-resume-click");
    }

    // 1. Instant local transition
    resume();

    if (typeof performance !== "undefined") {
      performance.mark("focus-resume-ui-updated");
      try {
        performance.measure(
          "focus-resume-response",
          "focus-resume-click",
          "focus-resume-ui-updated"
        );
      } catch {}
    }

    // 2. Asynchronous serialized mutation via coordinator
    focusMutationCoordinator.enqueue({
      type: "resume",
      sessionId: session.id,
      execute: () => resumeStudySessionAction(session.id, { taskId: session.taskId }),
      onError: (err) => {
        toast.error("Failed to sync resume state with server. Timer will keep local state.");
        console.error("Resume sync failure:", err);
      },
    });
  };

  /**
   * Instant Finish Confirmation & Durable Persistence
   */
  const handleConfirmFinish = ({ markComplete }: { markComplete: boolean }) => {
    setShowFinishDialog(false);
    setIsFinishingAsync(true);

    if (typeof performance !== "undefined") {
      performance.mark("focus-finish-click");
    }

    // Freeze timer visually immediately
    pause();

    const elapsedMins = Math.max(1, Math.round(elapsedSeconds / 60));

    focusMutationCoordinator.enqueue({
      type: "finish",
      sessionId: session.id,
      execute: () => finishStudySessionAction(session.id, { markComplete, taskId: session.taskId }),
      onSuccess: () => {
        setIsFinishingAsync(false);
        if (typeof performance !== "undefined") {
          performance.mark("focus-finish-completed");
          try {
            performance.measure(
              "focus-finish-response",
              "focus-finish-click",
              "focus-finish-completed"
            );
          } catch {}
        }
        toast.success(`Session finished. Recorded ${elapsedFormatted} of focused study.`);
        if (onExit) {
          onExit({ markComplete, taskId: session.taskId, elapsedMinutes: elapsedMins });
        } else {
          router.push("/today");
          router.refresh();
        }
      },
      onError: (err) => {
        setIsFinishingAsync(false);
        toast.error("Network error saving session. Your focus duration is preserved locally. Please retry.");
        console.error("Finish sync failure:", err);
      },
    });
  };

  /**
   * Instant Back Navigation
   */
  const handleBack = () => {
    if (isRunning) {
      setShowExitDialog(true);
    } else {
      if (onExit) {
        onExit();
      } else {
        router.push("/today");
      }
    }
  };

  /**
   * Instant Pause & Exit
   */
  const handlePauseAndExit = () => {
    setShowExitDialog(false);
    pause();

    const elapsedMins = Math.max(1, Math.round(elapsedSeconds / 60));

    focusMutationCoordinator.enqueue({
      type: "pause",
      sessionId: session.id,
      execute: () => pauseStudySessionAction(session.id, { taskId: session.taskId }),
    });

    if (onExit) {
      onExit({ markComplete: false, taskId: session.taskId, elapsedMinutes: elapsedMins });
    } else {
      router.push("/today");
    }
  };

  // Global Keyboard shortcuts: Space (Pause/Resume), Esc (Back)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (showFinishDialog || showExitDialog) return;
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (isRunning) {
          handlePause();
        } else if (isPaused) {
          handleResume();
        }
      } else if (e.code === "Escape") {
        e.preventDefault();
        handleBack();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, isPaused, showFinishDialog, showExitDialog]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[100] h-[100dvh] w-screen bg-[#000000] text-white flex flex-col justify-between overflow-hidden select-none"
      >
        {/* Signature Central Magnetic Blaze Animation (Decoupled, never remounts) */}
        <MagneticBlaze
          isRunning={isRunning}
          isPaused={isPaused}
          reducedMotion={reducedMotion}
        />

        {/* Minimal Top Controls Header */}
        <FocusHeader
          state={state}
          onBack={handleBack}
          onPause={handlePause}
          onResume={handleResume}
          onFinishRequest={() => setShowFinishDialog(true)}
          isPending={isFinishingAsync}
        />

        {/* Center Stage: Countdown or Completion Card */}
        <main className="relative z-30 flex-1 flex items-center justify-center py-6 sm:py-8">
          {isCompleted ? (
            <FocusCompletion
              elapsedFormatted={elapsedFormatted}
              taskTitle={task?.title || session.taskTitle}
              onFinish={handleConfirmFinish}
              isPending={isFinishingAsync}
            />
          ) : (
            <FocusTimer
              countdownFormatted={countdownFormatted}
              elapsedFormatted={elapsedFormatted}
              state={state}
              targetMinutes={targetMinutes}
              task={task}
            />
          )}
        </main>

        {/* Minimal Bottom Hint Strip */}
        <footer className="relative z-40 w-full flex items-center justify-center pb-5 sm:pb-6 font-mono text-[11px] text-neutral-400">
          <div className="flex items-center gap-4 hidden sm:flex">
            <span>
              <kbd className="bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">
                Space
              </kbd>{" "}
              {isRunning ? "Pause" : "Resume"}
            </span>
            <span className="text-neutral-700">·</span>
            <span>
              <kbd className="bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">
                Esc
              </kbd>{" "}
              Exit
            </span>
          </div>
        </footer>

        {/* Modals */}
        <FinishSessionDialog
          open={showFinishDialog}
          onOpenChange={setShowFinishDialog}
          elapsedFormatted={elapsedFormatted}
          taskTitle={task?.title || session.taskTitle}
          onConfirmFinish={handleConfirmFinish}
          isPending={isFinishingAsync}
        />

        <ExitConfirmDialog
          open={showExitDialog}
          onOpenChange={setShowExitDialog}
          onPauseAndExit={handlePauseAndExit}
          isPending={isFinishingAsync}
        />
      </motion.div>
    </AnimatePresence>
  );
}
