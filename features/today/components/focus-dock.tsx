"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  PlayIcon,
  PauseIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import type { ActiveStudySession } from "../types";

interface FocusDockProps {
  session: ActiveStudySession;
  onPause: (sessionId: string) => void;
  onResume: (taskId: string) => void;
  onFinish: (sessionId: string) => void;
}

export function FocusDock({ session, onPause, onResume, onFinish }: FocusDockProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(session.durationSeconds);
  const isRunning = session.status === "running";

  useEffect(() => {
    if (!isRunning) return;

    const startMs = Date.parse(session.startedAt);
    const initialAccum = session.durationSeconds || 0;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Number.isFinite(startMs) ? Math.max(0, Math.floor((now - startMs) / 1000)) : 0;
      setElapsedSeconds(initialAccum + diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, session.startedAt, session.durationSeconds]);

  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timeFormatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  return (
    <aside
      aria-label="Active focus session"
      className="fixed z-40 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto bottom-[68px] sm:bottom-6 max-w-lg"
    >
      <div className="flex items-center justify-between gap-3 sm:gap-6 px-4 py-2.5 rounded-lg bg-[#0D0D0D]/95 backdrop-blur-md border border-[#262626] shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
        {/* Left: Terminal Node + Timer + Task Title */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            {isRunning && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0000] opacity-75" />
            )}
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF0000] shadow-[0_0_8px_#FF0000]" />
          </span>

          <span className="font-mono text-sm font-bold text-white shrink-0 tracking-wider">
            {timeFormatted}
          </span>

          <span className="text-xs text-[#CCCCCC] font-medium truncate max-w-[140px] sm:max-w-[200px]">
            {session.taskTitle}
          </span>
        </div>

        {/* Right: Controls (Pause/Resume + Finish) */}
        <div className="flex items-center gap-2 shrink-0">
          {isRunning ? (
            <button
              type="button"
              onClick={() => onPause(session.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium text-[#CCCCCC] hover:text-white bg-[#181818] hover:bg-[#222222] border border-[#2E2E2E] transition-colors"
            >
              <Icon icon={PauseIcon} size={12} />
              <span>Pause</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onResume(session.taskId)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium text-white bg-[#FF0000] hover:bg-[#CC0000] transition-colors"
            >
              <Icon icon={PlayIcon} size={12} />
              <span>Resume</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onFinish(session.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-semibold text-white bg-[#141414] hover:bg-[#22C55E] hover:text-black border border-[#2E2E2E] hover:border-[#22C55E] transition-colors"
          >
            <Icon icon={CheckmarkCircle02Icon} size={12} />
            <span>Finish</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

