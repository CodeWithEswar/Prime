"use client";

import * as React from "react";
import Link from "next/link";
import {
  RotateRight01Icon,
  SourceCodeIcon,
  Task01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { formatDurationDetailed, formatDurationCompact } from "../domain/projection";
import { LoadRail } from "./load-rail";
import { SubjectBadge } from "./subject-badge";
import type { CalendarDayProjection, CalendarDayDetail } from "../types";

export interface PreparationAgendaProps {
  days: CalendarDayProjection[];
  todayDate: string;
  selectedDay: CalendarDayDetail | null;
  onSelectDate: (date: string) => void;
  className?: string;
}

export function PreparationAgenda({
  days,
  todayDate,
  selectedDay,
  onSelectDate,
  className,
}: PreparationAgendaProps) {
  // Filter only current month days for clean agenda reading
  const currentMonthDays = days.filter((d) => d.isCurrentMonth);

  return (
    <div className={cn("w-full space-y-6 select-none", className)}>
      <div className="text-xs text-[#888888] font-mono pb-2 border-b border-[#1A1A1A]">
        CHRONOLOGICAL PREPARATION AGENDA
      </div>

      <div className="space-y-6">
        {currentMonthDays.map((day) => {
          const isToday = day.date === todayDate;
          const isSelected = selectedDay?.date === day.date;
          const dayTasks = isSelected ? selectedDay?.tasks || [] : [];

          return (
            <div
              key={day.date}
              className={cn(
                "rounded-md border p-3.5 sm:p-5 transition-all space-y-4",
                isSelected
                  ? "bg-[#101010] border-[#FF0000] ring-1 ring-[#FF0000] shadow-[0_0_12px_rgba(255,0,0,0.2)]"
                  : isToday
                    ? "bg-[#0E0E0E] border-[#2E2E2E]"
                    : "bg-[#070707] border-[#181818]"
              )}
            >
              {/* Day Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1A1A1A]">
                <div className="flex items-center gap-2.5">
                  {isToday ? (
                    <span className="w-2 h-2 rounded-full bg-[#FF0000] shadow-[0_0_6px_rgba(255,0,0,0.9)]" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#333333]" />
                  )}

                  <span
                    className={cn(
                      "font-mono text-sm font-bold tracking-tight",
                      isToday ? "text-[#FF0000]" : "text-white"
                    )}
                  >
                    {day.date}
                  </span>

                  {isToday && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF0000]/15 text-[#FF0000] border border-[#FF0000]/40 uppercase">
                      TODAY
                    </span>
                  )}

                  {day.isTargetDate && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF0000]/15 text-[#FF0000] border border-[#FF0000]/40 uppercase">
                      TARGET
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    {day.subjects && day.subjects.length > 0 ? (
                      day.subjects.map((subj) => (
                        <SubjectBadge key={subj} subject={subj} size="xs" showLabel={true} />
                      ))
                    ) : day.plannedMinutes > 0 ? (
                      <SubjectBadge subject="dsa" size="xs" showLabel={true} />
                    ) : null}
                  </div>
                </div>

                {/* Right stats */}
                <div className="flex items-center gap-3 text-xs font-mono text-[#888888]">
                  {day.isRestDay ? (
                    <span className="text-[#666666] uppercase">Scheduled Rest Day</span>
                  ) : (
                    <>
                      <span>
                        {formatDurationDetailed(day.plannedMinutes)} /{" "}
                        {formatDurationDetailed(day.availableMinutes)}
                      </span>
                      <span>·</span>
                      <span>{day.taskCount} tasks</span>
                    </>
                  )}
                </div>
              </div>

              {/* Load Rail */}
              <LoadRail
                plannedMinutes={day.plannedMinutes}
                availableMinutes={day.availableMinutes}
                completedMinutes={day.completedMinutes}
                isRestDay={day.isRestDay}
                size="default"
              />

              {/* Tasks or Rest Status */}
              {day.isRestDay ? (
                <div className="py-2 text-xs text-[#666666] font-mono">
                  Recovery day. No preparation scheduled.
                </div>
              ) : isSelected && dayTasks.length > 0 ? (
                <div className="space-y-2 pt-2">
                  {dayTasks.map((t, idx) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2.5 rounded bg-[#0C0C0C] border border-[#1A1A1A] text-xs gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-1 flex-1">
                        <span className="font-mono text-[11px] text-[#555555] flex-shrink-0">
                          {String(idx + 1).padStart(2, "0")}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="text-white font-medium truncate">{t.title}</div>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-[#777777] truncate">
                            <span className="uppercase">{t.taskType.replace("_", " ")}</span>
                            {t.difficulty && (
                              <>
                                <span>·</span>
                                <span>{t.difficulty}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <span className="font-mono text-[11px] text-[#AAAAAA]">
                          {t.plannedMinutes}m
                        </span>

                        {t.problemSlug && (
                          <Link
                            href={`/practice/dsa/${t.problemSlug}?from=calendar&date=${day.date}`}
                            className="p-1 rounded text-[#777777] hover:text-white hover:bg-[#1A1A1A]"
                            title="Open Problem"
                          >
                            <Icon icon={ArrowRight01Icon} size={14} />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-[#666666]">
                    {day.taskCount > 0
                      ? `${day.taskCount} tasks scheduled.`
                      : "No tasks scheduled."}
                  </span>

                  <button
                    type="button"
                    onClick={() => onSelectDate(day.date)}
                    className="text-xs font-mono text-[#888888] hover:text-white underline cursor-pointer"
                  >
                    Inspect Day →
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

