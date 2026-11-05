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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDurationDetailed, formatDurationCompact } from "../domain/projection";
import { LoadRail } from "./load-rail";
import { SubjectBadge } from "./subject-badge";
import type { CalendarDayProjection, CalendarDayDetail } from "../types";

export interface MobileCalendarViewProps {
  days: CalendarDayProjection[];
  selectedDate: string;
  todayDate: string;
  selectedDay: CalendarDayDetail | null;
  onSelectDate: (date: string) => void;
  className?: string;
}

const WEEKDAY_INITIALS = ["M", "T", "W", "T", "F", "S", "S"];

export function MobileCalendarView({
  days,
  selectedDate,
  todayDate,
  selectedDay,
  onSelectDate,
  className,
}: MobileCalendarViewProps) {
  return (
    <div className={cn("w-full space-y-6 select-none", className)}>
      {/* 1. Compact Month Map */}
      <div
        role="region"
        aria-label="Mobile Month Map"
        className="space-y-2 p-3 rounded-lg bg-[#080808] border border-[#1A1A1A]"
      >
        {/* Weekday Initials */}
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-[#666666] font-semibold pb-1 border-b border-[#141414]">
          {WEEKDAY_INITIALS.map((init, i) => (
            <div key={i}>{init}</div>
          ))}
        </div>

        {/* Compact Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const isSelected = day.date === selectedDate;
            const isToday = day.date === todayDate;

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => onSelectDate(day.date)}
                className={cn(
                  "flex flex-col items-center justify-between py-1.5 px-0.5 rounded border min-h-[46px] transition-all cursor-pointer relative",
                  day.isCurrentMonth ? "text-white" : "text-[#444444] opacity-40",
                  isSelected
                    ? "bg-[#181818] border-[#FF0000] ring-1 ring-[#FF0000] shadow-[0_0_8px_rgba(255,0,0,0.35)] z-10"
                    : "bg-[#0A0A0A] border-[#161616] hover:border-[#262626]"
                )}
              >
                {/* Date Number + Today Beacon */}
                <div className="flex items-center gap-0.5">
                  {isToday && (
                    <span className="w-1 h-1 rounded-full bg-[#FF0000]" />
                  )}
                  <span
                    className={cn(
                      "font-mono text-[11px] font-semibold",
                      isSelected
                        ? "text-white font-bold"
                        : isToday
                        ? "text-[#FF0000]"
                        : ""
                    )}
                  >
                    {day.dayNumber}
                  </span>
                </div>

                {/* Subjects Mini Badges */}
                <div className="flex items-center gap-0.5 my-0.5 min-h-[14px]">
                  {day.subjects && day.subjects.length > 0 ? (
                    day.subjects.map((subj) => (
                      <SubjectBadge key={subj} subject={subj} size="xs" showLabel={false} />
                    ))
                  ) : day.plannedMinutes > 0 ? (
                    <SubjectBadge subject="dsa" size="xs" showLabel={false} />
                  ) : null}
                </div>

                {/* Micro Load Rail */}
                <div className="w-4/5 pt-1">
                  <LoadRail
                    plannedMinutes={day.plannedMinutes}
                    availableMinutes={day.availableMinutes}
                    isRestDay={day.isRestDay}
                    size="compact"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Selected Day Agenda Below */}
      {selectedDay && (
        <div className="space-y-4 p-4 rounded-lg bg-[#0A0A0A] border border-[#222222]">
          {/* Day Identity */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A] gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {selectedDay.isToday && (
                <span className="w-2 h-2 rounded-full bg-[#FF0000] shadow-[0_0_6px_rgba(255,0,0,0.9)] flex-shrink-0" />
              )}
              <span className="font-mono text-sm font-bold text-white truncate">
                {selectedDay.displayDate}
              </span>
              <span className="text-[#333333] flex-shrink-0">·</span>
              <span className="font-mono text-xs uppercase text-[#888888] flex-shrink-0">
                {selectedDay.dayOfWeek}
              </span>
            </div>

            <span className="font-mono text-xs text-[#AAAAAA] flex-shrink-0">
              {formatDurationCompact(selectedDay.plannedMinutes)} /{" "}
              {formatDurationCompact(selectedDay.availableMinutes)}
            </span>
          </div>

          {/* Load Rail */}
          <LoadRail
            plannedMinutes={selectedDay.plannedMinutes}
            availableMinutes={selectedDay.availableMinutes}
            completedMinutes={selectedDay.completedMinutes}
            isRestDay={selectedDay.isRestDay}
            size="default"
          />

          {/* Tasks List */}
          {selectedDay.isRestDay ? (
            <div className="py-4 text-center text-xs text-[#666666] font-mono">
              Scheduled Rest Day · Recovery prevents fatigue
            </div>
          ) : selectedDay.tasks.length === 0 ? (
            <div className="py-4 text-center text-xs text-[#666666] font-mono">
              No tasks scheduled for this date
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              {selectedDay.tasks.map((t, idx) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2.5 rounded bg-[#0E0E0E] border border-[#1A1A1A] text-xs gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1 flex-1">
                    <span className="font-mono text-[10px] text-[#555555] flex-shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="text-white font-medium truncate">
                        {t.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#666666] truncate">
                        {t.subject && (
                          <SubjectBadge subject={t.subject} size="xs" showLabel={true} />
                        )}
                        <span className="uppercase">{t.taskType.replace("_", " ")}</span>
                        {t.difficulty && (
                          <>
                            <span>·</span>
                            <span
                              className={cn(
                                t.difficulty === "EASY"
                                  ? "text-[#4CAF50]"
                                  : t.difficulty === "HARD"
                                    ? "text-[#FF0000]"
                                    : "text-[#FFA116]"
                              )}
                            >
                              {t.difficulty}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-[11px] text-[#888888]">
                      {t.plannedMinutes}m
                    </span>
                    {t.problemSlug && (
                      <Link
                        href={`/practice/dsa/${t.problemSlug}?from=calendar&date=${selectedDay.date}`}
                        className="p-1 rounded text-[#777777] hover:text-white"
                      >
                        <Icon icon={ArrowRight01Icon} size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-2">
            {selectedDay.isToday ? (
              <Button
                asChild
                className="w-full h-9 bg-[#FF0000] text-white hover:bg-[#CC0000] font-mono text-xs font-semibold"
              >
                <Link href="/today">Open Today</Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
                className="w-full h-9 border-[#2A2A2A] bg-[#121212] text-white hover:border-[#444444] font-mono text-xs font-semibold"
              >
                <Link href={`/plan?date=${selectedDay.date}`}>Open Day in Plan</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

