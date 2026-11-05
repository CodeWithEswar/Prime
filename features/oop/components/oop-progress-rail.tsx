"use client";

import { Badge } from "@/components/ui/badge";
import type { OOPDaySchedule, UserOOPDayProgress } from "@/domain/oop";

interface OOPProgressRailProps {
  days: OOPDaySchedule[];
  activeDay: number;
  dayProgress: Record<number, UserOOPDayProgress>;
  onSelectDay: (dayNumber: number) => void;
}

export function OOPProgressRail({
  days,
  activeDay,
  dayProgress,
  onSelectDay,
}: OOPProgressRailProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
          12-Day Study Sequence
        </span>
        <span className="text-xs text-[var(--text-secondary)]">
          Click day to open workspace
        </span>
      </div>

      <div className="grid min-w-0 grid-cols-3 gap-1.5 @min-[46rem]:grid-cols-4 @min-[64rem]:grid-cols-6">
        {days.map((day) => {
          const isSelected = day.dayNumber === activeDay;
          const isCompleted = Boolean(dayProgress[day.dayNumber]?.assignmentCompleted);

          return (
            <button
              key={day.dayNumber}
              onClick={() => onSelectDay(day.dayNumber)}
              aria-pressed={isSelected}
              className={`group flex min-w-0 flex-col rounded-[var(--radius-sm)] border p-2.5 text-left transition-all ${
                isSelected
                  ? "border-[var(--accent-border)] bg-[var(--accent-muted)]"
                  : isCompleted
                    ? "border-[#2A2A2A] bg-[#0E0E0E] hover:border-[#3A3A3A]"
                    : "border-[#1F1F1F] bg-[#0A0A0A] hover:border-[#2F2F2F]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-xs font-bold ${
                    isSelected
                      ? "text-[var(--foreground)]"
                      : isCompleted
                        ? "text-green-400"
                        : "text-[#888888]"
                  }`}
                >
                  DAY {day.dayNumber.toString().padStart(2, "0")}
                </span>
                {isCompleted && <span className="text-xs text-green-400">✓</span>}
              </div>

              <div className="mt-2 line-clamp-2 text-xs font-semibold text-white">
                {day.title}
              </div>

              <div className="mt-1 hidden items-center justify-between text-[10px] @min-[32rem]:flex text-[var(--text-secondary)]">
                <span>{day.estimatedMinutes}m</span>
                <span className="capitalize">{day.difficulty}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
