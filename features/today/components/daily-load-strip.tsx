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
    plannedMinutes > 0 ? Math.min(100, Math.round((completedMinutes / plannedMinutes) * 100)) : 0;

  return (
    <div className="space-y-3 p-4 rounded-lg bg-[#080808] border border-[#161616]">
      {/* Top row: Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap font-mono">
          <div>
            <span className="text-[#666666] uppercase text-[10px] tracking-wider block mb-0.5">
              Planned
            </span>
            <span className="font-semibold text-white">{formatDuration(plannedMinutes)}</span>
          </div>

          <div className="w-[1px] h-6 bg-[#1A1A1A] hidden sm:block" />

          <div>
            <span className="text-[#666666] uppercase text-[10px] tracking-wider block mb-0.5">
              Completed
            </span>
            <span className="font-semibold text-white">{formatDuration(completedMinutes)}</span>
          </div>

          <div className="w-[1px] h-6 bg-[#1A1A1A] hidden sm:block" />

          <div>
            <span className="text-[#666666] uppercase text-[10px] tracking-wider block mb-0.5">
              Remaining
            </span>
            <span className="font-semibold text-[#FF4D4D]">{formatDuration(remainingMinutes)}</span>
          </div>
        </div>

        <div className="font-mono text-xs text-[#888888] flex items-center gap-2">
          <span>
            <strong className="text-white">{completedTaskCount}</strong> / {totalTaskCount} tasks
          </span>
          <span className="text-[#444444]">·</span>
          <span>{percentComplete}% of daily load</span>
        </div>
      </div>

      {/* Capacity Rail: Thin, precision track with red current terminal */}
      <div className="relative w-full h-1.5 bg-[#141414] rounded-full overflow-hidden">
        {/* Completed bar: Pure White */}
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${percentComplete}%` }}
        />
        {/* Current position needle: Pure Red */}
        {percentComplete > 0 && percentComplete < 100 && (
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-[#FF0000] shadow-[0_0_6px_#FF0000]"
            style={{ left: `calc(${percentComplete}% - 3px)` }}
          />
        )}
      </div>

      {/* Warning banner if today exceeds capacity */}
      {isExceeded && (
        <div className="flex items-center gap-2 px-3 py-2 rounded bg-[#1A0505] border border-[#FF0000]/30 text-xs text-[#FF4D4D]">
          <Icon icon={AlertCircleIcon} size={14} className="shrink-0" />
          <span>
            Today exceeds your configured capacity ({formatDuration(plannedMinutes)} planned vs{" "}
            {formatDuration(availableMinutes)} available).
          </span>
        </div>
      )}
    </div>
  );
}

