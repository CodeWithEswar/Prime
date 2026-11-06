"use client";

import { Icon } from "@/components/ui/icon";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";

interface DailyLoadStripProps {
  plannedMinutes: number;
  completedMinutes: number;
  remainingMinutes: number;
  availableMinutes: number;
  completedTaskCount: number;
  totalTaskCount: number;
  isExceeded: boolean;
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function DailyLoadStrip({
  plannedMinutes,
  completedMinutes,
  remainingMinutes,
  availableMinutes,
  completedTaskCount,
  totalTaskCount,
  isExceeded,
}: DailyLoadStripProps) {
  const percentComplete =
    plannedMinutes > 0
      ? Math.min(100, Math.round((completedMinutes / plannedMinutes) * 100))
      : 0;

  return (
    <div className="relative rounded-lg bg-[#080808] border border-white/[0.08] p-4 sm:p-5 space-y-3.5 shadow-sm">
      {/* Top row: 3-column Telemetry Grid + Progress Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* 3 Metric Pillars (Mobile: 3-column grid) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6 divide-x divide-white/[0.06] font-mono">
          {/* Planned */}
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
              Planned
            </span>
            <span className="text-sm sm:text-base font-bold text-white tracking-tight">
              {formatDuration(plannedMinutes)}
            </span>
          </div>

          {/* Completed */}
          <div className="pl-3 sm:pl-6 space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
              Completed
            </span>
            <span className="text-sm sm:text-base font-bold text-emerald-400 tracking-tight">
              {formatDuration(completedMinutes)}
            </span>
          </div>

          {/* Remaining */}
          <div className="pl-3 sm:pl-6 space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block">
              Remaining
            </span>
            <span
              className={`text-sm sm:text-base font-bold tracking-tight ${
                remainingMinutes > 0 ? "text-[#FF4D4D]" : "text-neutral-400"
              }`}
            >
              {formatDuration(remainingMinutes)}
            </span>
          </div>
        </div>

        {/* Task ratio + Percentage indicator */}
        <div className="flex items-center justify-between sm:justify-end gap-2 font-mono text-xs text-neutral-400 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
          <span>
            <strong className="text-white">{completedTaskCount}</strong> / {totalTaskCount} tasks
          </span>
          <span className="text-neutral-600">·</span>
          <span className="text-neutral-300 font-medium">
            {percentComplete}% of daily load
          </span>
        </div>
      </div>

      {/* Precision Progress Track */}
      <div className="relative w-full h-1.5 bg-[#121212] rounded-full overflow-hidden border border-white/[0.04]">
        {/* Completed Bar */}
        <div
          className={`h-full transition-all duration-500 ease-out ${
            percentComplete >= 100 ? "bg-emerald-400" : "bg-white"
          }`}
          style={{ width: `${percentComplete}%` }}
        />

        {/* Pure Red Active Leading Terminal Needle */}
        {percentComplete > 0 && percentComplete < 100 && (
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-[#FF0000] shadow-[0_0_6px_#FF0000] z-20 rounded-full"
            style={{ left: `calc(${percentComplete}% - 3px)` }}
          />
        )}
      </div>

      {/* Warning banner if today exceeds capacity */}
      {isExceeded && (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded bg-[#1A0505] border border-[#FF0000]/30 text-xs text-[#FF4D4D] animate-in fade-in">
          <Icon icon={AlertCircleIcon} size={15} className="shrink-0" />
          <span className="font-sans leading-snug">
            Today exceeds your configured capacity ({formatDuration(plannedMinutes)} planned vs{" "}
            {formatDuration(availableMinutes)} available). Adjust or reschedule via the planner.
          </span>
        </div>
      )}
    </div>
  );
}
