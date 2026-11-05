"use client";

import * as React from "react";
import {
  RotateRight01Icon,
  SourceCodeIcon,
  Task01Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { formatDurationDetailed, formatDurationCompact } from "../domain/projection";
import { LoadRail } from "./load-rail";
import { SubjectBadge } from "./subject-badge";
import type { CalendarWeekSummary, CalendarDayProjection } from "../types";

export interface PreparationWeekProps {
  weeks: CalendarWeekSummary[];
  selectedDate: string;
  todayDate: string;
  onSelectDate: (date: string) => void;
  className?: string;
}

export function PreparationWeek({
  weeks,
  selectedDate,
  todayDate,
  onSelectDate,
  className,
}: PreparationWeekProps) {
  // Find which week contains the selectedDate, or default to first week
  const activeWeek =
    weeks.find((w) => w.days.some((d) => d.date === selectedDate)) ||
    weeks[0];

  if (!activeWeek) return null;

  const {
    weekLabel,
    startDate,
    endDate,
    totalPlannedMinutes,
    totalCapacityMinutes,
    totalCompletedMinutes,
    totalTasks,
    totalRevisions,
    totalCoreProblems,
    restDaysCount,
    trajectory,
    days,
  } = activeWeek;

  const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={cn("w-full space-y-6 select-none", className)}>
      {/* Top Operational Summary Strip */}
      <div className="p-3 sm:p-4 rounded-md bg-[#0C0C0C] border border-[#1E1E1E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              {weekLabel} SUMMARY
            </span>
            <span className="text-[#333333]">·</span>
            <span className="font-mono text-[11px] text-[#888888]">
              {startDate} — {endDate}
            </span>
          </div>
          <div className="text-xs text-[#888888]">
            Weekly workload capacity and allocation
          </div>
        </div>

        {/* Operational Metrics Strip */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono">
          <div>
            <span className="text-[#666666] block text-[10px] uppercase">Planned</span>
            <span className="text-white font-semibold">
              {formatDurationDetailed(totalPlannedMinutes)}
            </span>
          </div>

          <div className="hidden sm:block w-[1px] h-6 bg-[#222222]" />

          <div>
            <span className="text-[#666666] block text-[10px] uppercase">Capacity</span>
            <span className="text-[#AAAAAA]">
              {formatDurationDetailed(totalCapacityMinutes)}
            </span>
          </div>

          <div className="hidden sm:block w-[1px] h-6 bg-[#222222]" />

          <div>
            <span className="text-[#666666] block text-[10px] uppercase">Core Problems</span>
            <span className="text-white font-semibold">{totalCoreProblems}</span>
          </div>

          <div className="hidden sm:block w-[1px] h-6 bg-[#222222]" />

          <div>
            <span className="text-[#666666] block text-[10px] uppercase">Revisions</span>
            <span className="text-white font-semibold">{totalRevisions}</span>
          </div>

          <div className="hidden sm:block w-[1px] h-6 bg-[#222222]" />

          <div>
            <span className="text-[#666666] block text-[10px] uppercase">Rest Days</span>
            <span className="text-[#888888]">{restDaysCount}</span>
          </div>
        </div>
      </div>

      {/* Vertical Capacity Lanes (7 Days) */}
      <div className="space-y-2">
        {days.map((day) => {
          const isSelected = day.date === selectedDate;
          const isToday = day.date === todayDate;
          const isOverCapacity =
            !day.isRestDay &&
            day.availableMinutes > 0 &&
            day.plannedMinutes > day.availableMinutes;
          const overflowMins = Math.max(0, day.plannedMinutes - day.availableMinutes);
          const weekdayName = WEEKDAY_NAMES[day.dayOfWeek] || "";

          return (
            <button
              key={day.date}
              type="button"
              role="button"
              aria-selected={isSelected}
              onClick={() => onSelectDate(day.date)}
              className={cn(
                "w-full flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-md border text-left transition-all cursor-pointer gap-3",
                isSelected
                  ? "bg-[#141414] border-[#FF0000] ring-1 ring-[#FF0000] shadow-[0_0_12px_rgba(255,0,0,0.2)]"
                  : "bg-[#090909] border-[#181818] hover:border-[#262626] hover:bg-[#0D0D0D]"
              )}
            >
              {/* Day Name & Date Identifier */}
              <div className="flex items-center gap-3 min-w-[130px]">
                {isToday ? (
                  <span className="w-2 h-2 rounded-full bg-[#FF0000] shadow-[0_0_6px_rgba(255,0,0,0.9)]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#222222]" />
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-mono text-sm font-bold",
                        isToday ? "text-[#FF0000]" : "text-white"
                      )}
                    >
                      {weekdayName.toUpperCase()} {String(day.dayNumber).padStart(2, "0")}
                    </span>
                    {day.isTargetDate && (
                      <span className="px-1 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FF0000]/15 text-[#FF0000] border border-[#FF0000]/40 uppercase">
                        TARGET
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-[#666666]">
                    {day.date}
                  </span>
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {day.subjects && day.subjects.length > 0 ? (
                      day.subjects.map((subj) => (
                        <SubjectBadge key={subj} subject={subj} size="xs" showLabel={true} />
                      ))
                    ) : day.plannedMinutes > 0 ? (
                      <SubjectBadge subject="dsa" size="xs" showLabel={true} />
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Middle: Load Rail & Capacity Visualization */}
              <div className="flex-1 max-w-md w-full space-y-1.5 px-0 sm:px-4">
                <LoadRail
                  plannedMinutes={day.plannedMinutes}
                  availableMinutes={day.availableMinutes}
                  completedMinutes={day.completedMinutes}
                  isRestDay={day.isRestDay}
                  size="default"
                />

                <div className="flex items-center justify-between text-[11px] font-mono">
                  {day.isRestDay ? (
                    <span className="text-[#666666] uppercase">Scheduled Rest Day</span>
                  ) : (
                    <span className="text-[#AAAAAA]">
                      {formatDurationCompact(day.plannedMinutes)} /{" "}
                      {formatDurationCompact(day.availableMinutes)}
                    </span>
                  )}

                  {isOverCapacity && (
                    <span className="text-[#FF0000] font-semibold flex items-center gap-1">
                      <Icon icon={Alert02Icon} size={11} />
                      +{overflowMins}m OVER CAPACITY
                    </span>
                  )}
                </div>
              </div>

              {/* Right: Allocation Category Breakdown */}
              <div className="flex items-center gap-2.5 text-xs font-mono self-start sm:self-auto">
                {day.isRestDay ? (
                  <span className="text-xs text-[#555555]">No work scheduled</span>
                ) : (
                  <>
                    {day.taskCount > 0 ? (
                      <span className="px-2 py-1 rounded bg-[#121212] border border-[#222222] text-[#CCCCCC]">
                        {day.taskCount} tasks
                      </span>
                    ) : (
                      <span className="text-[#555555]">0 tasks</span>
                    )}

                    {day.revisionCount > 0 && (
                      <span
                        className={cn(
                          "px-2 py-1 rounded border flex items-center gap-1",
                          day.overdueRevisionCount > 0
                            ? "border-[#FF0000]/40 text-[#FF0000] bg-[#FF0000]/10"
                            : "border-[#242424] text-[#888888] bg-[#121212]"
                        )}
                      >
                        <Icon icon={RotateRight01Icon} size={12} />
                        {day.revisionCount}
                      </span>
                    )}
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

