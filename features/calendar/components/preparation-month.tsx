"use client";

import * as React from "react";
import {
  RotateRight01Icon,
  Alert02Icon,
  ArrowDownRightIcon,
  Target01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { formatDurationCompact } from "../domain/projection";
import { LoadRail } from "./load-rail";
import { SubjectBadge } from "./subject-badge";
import type { CalendarDayProjection } from "../types";

export interface PreparationMonthProps {
  days: CalendarDayProjection[];
  selectedDate: string;
  todayDate: string;
  onSelectDate: (date: string) => void;
  className?: string;
}

const WEEKDAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const WEEKDAY_SHORT = ["M", "T", "W", "T", "F", "S", "S"];

export function PreparationMonth({
  days,
  selectedDate,
  todayDate,
  onSelectDate,
  className,
}: PreparationMonthProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Keyboard navigation across the month grid
  const handleKeyDown = (
    e: React.KeyboardEvent,
    index: number,
    currentDate: string
  ) => {
    let targetIndex = -1;
    if (e.key === "ArrowRight") {
      targetIndex = index + 1;
    } else if (e.key === "ArrowLeft") {
      targetIndex = index - 1;
    } else if (e.key === "ArrowDown") {
      targetIndex = index + 7;
    } else if (e.key === "ArrowUp") {
      targetIndex = index - 7;
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectDate(currentDate);
      return;
    }

    if (targetIndex >= 0 && targetIndex < days.length) {
      e.preventDefault();
      const targetDate = days[targetIndex].date;
      onSelectDate(targetDate);
      // Focus target element
      const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>(
        "button[data-calendar-date]"
      );
      buttons?.[targetIndex]?.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("w-full space-y-2 select-none", className)}
      role="region"
      aria-label="Monthly Preparation Canvas"
    >
      {/* Weekday Column Headers */}
      <div
        className="grid grid-cols-7 gap-1 sm:gap-1.5 pb-1 border-b border-[#1A1A1A] text-center"
        role="row"
      >
        {WEEKDAY_NAMES.map((weekday, i) => (
          <div
            key={weekday}
            role="columnheader"
            aria-label={weekday}
            className={cn(
              "font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase py-1",
              i === 6 ? "text-[#666666]" : "text-[#888888]"
            )}
          >
            <span className="hidden sm:inline">{weekday}</span>
            <span className="sm:hidden">{WEEKDAY_SHORT[i]}</span>
          </div>
        ))}
      </div>

      {/* Preparation Pulse Grid */}
      <div
        className="grid grid-cols-7 gap-1 sm:gap-1.5 auto-rows-fr"
        role="grid"
        aria-label="Month days"
      >
        {days.map((day, idx) => {
          const isSelected = day.date === selectedDate;
          const isToday = day.date === todayDate;
          const isOverCapacity =
            !day.isRestDay &&
            day.availableMinutes > 0 &&
            day.plannedMinutes > day.availableMinutes;
          const overflowMins = Math.max(0, day.plannedMinutes - day.availableMinutes);

          // Accessible screen reader label
          const a11yLabel = [
            day.date,
            isToday ? "Today." : "",
            day.isRestDay
              ? "Rest day."
              : `${formatDurationCompact(day.plannedMinutes)} planned of ${formatDurationCompact(day.availableMinutes)} capacity.`,
            day.taskCount > 0 ? `${day.taskCount} tasks.` : "",
            day.revisionCount > 0 ? `${day.revisionCount} revisions.` : "",
            isOverCapacity ? `${overflowMins} minutes over capacity.` : "",
            day.isTargetDate ? "Target completion date." : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={day.date}
              type="button"
              data-calendar-date={day.date}
              role="gridcell"
              aria-selected={isSelected}
              aria-label={a11yLabel}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelectDate(day.date)}
              onKeyDown={(e) => handleKeyDown(e, idx, day.date)}
              className={cn(
                "group relative flex flex-col justify-between p-1.5 sm:p-2 min-h-[74px] sm:min-h-[92px] rounded-md border text-left transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#FF0000]",
                // Current month vs adjacent month
                day.isCurrentMonth
                  ? "bg-[#090909] border-[#181818] hover:border-[#2A2A2A] hover:bg-[#0E0E0E]"
                  : "bg-[#050505] border-[#121212] opacity-45 hover:opacity-75 hover:bg-[#0A0A0A]",
                // Selected date styling
                isSelected &&
                  "border-[#FF0000] ring-1 ring-[#FF0000] bg-[#121212] shadow-[0_0_12px_rgba(255,0,0,0.25)] z-10"
              )}
            >
              {/* Top Row: Date Number & Signal Terminals */}
              <div className="w-full flex items-center justify-between">
                {/* Date Number + Today Beacon */}
                <div className="flex items-center gap-1.5">
                  {isToday && (
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF0000] shadow-[0_0_6px_rgba(255,0,0,0.9)]"
                      title="Today"
                    />
                  )}
                  <span
                    className={cn(
                      "font-mono text-xs font-semibold",
                      isToday
                        ? "text-[#FF0000] font-bold"
                        : day.isCurrentMonth
                          ? "text-white"
                          : "text-[#666666]"
                    )}
                  >
                    {String(day.dayNumber).padStart(2, "0")}
                  </span>
                </div>

                {/* Right Badges: Target, Overdue, Carry */}
                <div className="flex items-center gap-1">
                  {day.isTargetDate && (
                    <span
                      className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-[#FF0000]/15 text-[#FF0000] border border-[#FF0000]/40 uppercase tracking-tighter"
                      title="Preparation Target Date"
                    >
                      TARGET
                    </span>
                  )}

                  {day.overdueRevisionCount > 0 && (
                    <span
                      className="flex items-center text-[#FF0000] text-[10px] font-mono font-semibold"
                      title={`${day.overdueRevisionCount} overdue revision item(s)`}
                    >
                      <Icon icon={RotateRight01Icon} size={11} className="mr-0.5" />
                      {day.overdueRevisionCount}
                    </span>
                  )}

                  {day.overdueRevisionCount === 0 && day.revisionCount > 0 && (
                    <span
                      className="flex items-center text-[#888888] text-[10px] font-mono"
                      title={`${day.revisionCount} scheduled revision item(s)`}
                    >
                      <Icon icon={RotateRight01Icon} size={11} className="mr-0.5 text-[#666666]" />
                      {day.revisionCount}
                    </span>
                  )}

                  {day.carriedTaskCount > 0 && (
                    <span
                      className="flex items-center text-[#888888] text-[10px] font-mono"
                      title={`${day.carriedTaskCount} carried task(s)`}
                    >
                      <Icon icon={ArrowDownRightIcon} size={11} className="text-[#666666]" />
                      {day.carriedTaskCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Middle: Scheduled Course & Subject Badges (DBMS, OS, OOP, CN, DSA) */}
              <div className="w-full min-h-[22px] flex flex-wrap items-center gap-1 my-1">
                {day.subjects && day.subjects.length > 0 ? (
                  day.subjects.map((subj) => (
                    <SubjectBadge key={subj} subject={subj} size="xs" showLabel={true} />
                  ))
                ) : day.plannedMinutes > 0 ? (
                  <SubjectBadge subject="dsa" size="xs" showLabel={true} />
                ) : null}
              </div>

              {/* Middle / Bottom Load Rail & Metrics */}
              <div className="w-full space-y-1.5 pt-1">
                {/* Day Load Rail */}
                <LoadRail
                  plannedMinutes={day.plannedMinutes}
                  availableMinutes={day.availableMinutes}
                  completedMinutes={day.completedMinutes}
                  isRestDay={day.isRestDay}
                  size="compact"
                />

                {/* Bottom Status Text */}
                <div className="flex items-center justify-between text-[10px] font-mono">
                  {day.isRestDay ? (
                    <span className="text-[#666666] tracking-wider uppercase">
                      REST
                    </span>
                  ) : (
                    <span
                      className={cn(
                        day.plannedMinutes > 0 ? "text-[#AAAAAA]" : "text-[#444444]"
                      )}
                    >
                      {formatDurationCompact(day.plannedMinutes)}
                    </span>
                  )}

                  {/* Over-capacity callout */}
                  {isOverCapacity && (
                    <span
                      className="flex items-center gap-0.5 text-[#FF0000] font-semibold"
                      title={`${overflowMins}m over capacity`}
                    >
                      <Icon icon={Alert02Icon} size={10} />
                      <span>{overflowMins}m</span>
                    </span>
                  )}

                  {/* Completed Checkmark if completed */}
                  {!day.isRestDay &&
                    day.taskCount > 0 &&
                    day.completedTaskCount === day.taskCount && (
                      <span className="text-white text-[9px]">✓ ALL</span>
                    )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

