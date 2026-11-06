"use client";

import { Icon } from "@/components/ui/icon";
import { BookOpen01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import type { FocusSessionTask, FocusState } from "../types";

interface FocusTimerProps {
  countdownFormatted: string;
  elapsedFormatted: string;
  state: FocusState;
  targetMinutes: number;
  task?: FocusSessionTask | null;
}

const difficultyColors = {
  EASY: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  MEDIUM: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  HARD: "text-rose-400 bg-rose-500/10 border-rose-500/25",
};

export function FocusTimer({
  countdownFormatted,
  elapsedFormatted,
  state,
  targetMinutes,
  task,
}: FocusTimerProps) {
  const isRunning = state === "running";
  const isPaused = state === "paused";

  return (
    <div className="relative z-30 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 max-w-3xl mx-auto px-4">
      {/* Session State Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A0A0A] border border-white/[0.08] shadow-sm">
        <span className="relative flex h-2 w-2">
          {isRunning ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0000] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF0000] shadow-[0_0_8px_#FF0000]" />
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          )}
        </span>

        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-300">
          {isRunning ? "Deep Work Sprint" : "Sprint Paused"}
        </span>

        <span className="text-neutral-600 font-mono text-xs">·</span>
        <span className="font-mono text-xs text-neutral-400">
          {targetMinutes}m target
        </span>
      </div>

      {/* Signature Large Countdown Display */}
      <div className="relative py-2 sm:py-4">
        <h1
          className="font-mono text-7xl sm:text-8xl md:text-9xl lg:text-[10.5rem] font-extrabold tracking-tighter text-white tabular-nums select-none leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
          aria-live="polite"
          aria-atomic="true"
        >
          {countdownFormatted}
        </h1>

        {/* Small elapsed progress readout below timer */}
        <p className="font-mono text-xs text-neutral-400 tracking-wider uppercase pt-2">
          Elapsed: <span className="text-white font-semibold">{elapsedFormatted}</span>
        </p>
      </div>

      {/* Task Intelligence Header */}
      {task && (
        <div className="space-y-2.5 pt-1">
          {/* Metadata pill cluster */}
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
            {task.topicName && (
              <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-neutral-900/90 text-neutral-300 px-2.5 py-0.5 rounded border border-white/[0.08]">
                <Icon icon={BookOpen01Icon} size={11} className="text-neutral-500" />
                {task.topicName}
              </span>
            )}

            {task.problemDifficulty && (
              <span
                className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  difficultyColors[task.problemDifficulty]
                }`}
              >
                {task.problemDifficulty}
              </span>
            )}

            {task.stageName && (
              <span className="font-sans text-neutral-400 text-xs">
                {task.stageName}
              </span>
            )}
          </div>

          {/* Task Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white font-sans max-w-xl mx-auto leading-snug">
            {task.title}
          </h2>

          {/* Optional reason line */}
          {task.reasonExplanation && (
            <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-md mx-auto leading-relaxed pt-0.5">
              {task.reasonExplanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

