"use client";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  Tick02Icon,
  PlayIcon,
  Clock01Icon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";
import type { OSDaySchedule, UserOSDayProgress, UserOSVideoProgress } from "@/domain/os";

interface OSProgressRailProps {
  days: OSDaySchedule[];
  activeDay: number;
  onSelectDay: (dayNumber: number) => void;
  dayProgress: Record<number, UserOSDayProgress>;
  videoProgress: Record<string, UserOSVideoProgress>;
}

export function OSProgressRail({
  days,
  activeDay,
  onSelectDay,
  dayProgress,
  videoProgress,
}: OSProgressRailProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
          12-Day Learning Sequence
        </h3>
        <span className="text-xs text-[var(--text-secondary)]">
          Click to inspect curriculum
        </span>
      </div>

      <div className="grid min-w-0 grid-cols-3 gap-1.5 @min-[46rem]:grid-cols-4 @min-[64rem]:grid-cols-6">
        {days.map((day) => {
          const isSelected = activeDay === day.dayNumber;
          const isCompleted = Boolean(dayProgress[day.dayNumber]?.assignmentCompleted);

          return (
            <button
              key={day.dayNumber}
              onClick={() => onSelectDay(day.dayNumber)}
              aria-pressed={isSelected}
              className={`flex flex-col rounded-[var(--radius-sm)] border p-2.5 text-left transition-all ${
                isSelected
                  ? "border-[var(--accent-border)] bg-[var(--accent-muted)]"
                  : isCompleted
                    ? "border-[#262626] bg-[#0E0E0E] hover:border-[#383838]"
                    : "border-[#1A1A1A] bg-[#0A0A0A] hover:border-[#2A2A2A]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-[10px] font-bold font-mono ${isSelected ? "text-[var(--foreground)]" : "text-[var(--text-secondary)]"}`}
                >
                  DAY {day.dayNumber.toString().padStart(2, "0")}
                </span>
                {isCompleted ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#4ade80]/20 text-[#4ade80]">
                    <Icon icon={Tick02Icon} size={10} />
                  </span>
                ) : (
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    {day.videoPositions.length} vids
                  </span>
                )}
              </div>

              <span className="mt-1 text-xs font-semibold text-white line-clamp-2">
                {day.title}
              </span>

              <span className="mt-0.5 text-[10px] text-[var(--text-secondary)] line-clamp-2 @max-[32rem]:hidden">
                {day.focus}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
