"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight01Icon,
  Calendar03Icon,
  RotateRight01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { formatDurationDetailed } from "../domain/projection";
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

function formatAgendaDate(dateStr: string) {
  const parts = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(date);
  const monthDay = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
  return { weekday, monthDay, iso: dateStr };
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
    <div className={cn("w-full space-y-4 select-none", className)}>
      <div className="flex items-center justify-between pb-2.5 border-b border-[#1A1A1A]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000] shadow-[0_0_6px_rgba(255,0,0,0.8)]" />
          <h3 className="text-xs font-mono font-semibold tracking-wider text-[#888888] uppercase">
            CHRONOLOGICAL PREPARATION AGENDA
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#555555]">
          {currentMonthDays.length} days
        </span>
      </div>

      <div className="space-y-3.5">
        {currentMonthDays.map((day) => {
          const isToday = day.date === todayDate;
          const isSelected = selectedDay?.date === day.date;
          const dayTasks = isSelected ? selectedDay?.tasks || [] : [];
          const { weekday, monthDay } = formatAgendaDate(day.date);

          return (
            <Card
              elevation="base"
              key={day.date}
              className={cn(
                "rounded-md border transition-all duration-200 overflow-hidden",
                isSelected
                  ? "bg-[#101010] border-[#FF0000] ring-1 ring-[#FF0000] shadow-[0_0_12px_rgba(255,0,0,0.18)]"
                  : isToday
                    ? "bg-[#0E0E0E] border-[#2A2A2A] hover:border-[#383838]"
                    : "bg-[#080808] border-[#181818] hover:border-[#262626]"
              )}
            >
              <CardContent className="p-3.5 sm:p-4 space-y-3">
                {/* Day Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1A1A1A]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        isToday
                          ? "bg-[#FF0000] shadow-[0_0_6px_rgba(255,0,0,0.9)]"
                          : isSelected
                            ? "bg-[#FF0000]"
                            : "bg-[#333333]"
                      )}
                    />

                    <div className="flex items-baseline gap-1.5">
                      <span
                        className={cn(
                          "text-sm font-semibold tracking-tight",
                          isToday ? "text-[#FF0000]" : "text-white"
                        )}
                      >
                        {monthDay}
                      </span>
                      <span className="text-xs font-mono text-[#777777]">
                        · {weekday}
                      </span>
                      <span className="text-[10px] font-mono text-[#444444] hidden sm:inline">
                        ({day.date})
                      </span>
                    </div>

                    {isToday && (
                      <Badge
                        variant="accent"
                        className="bg-[#FF0000]/15 text-[#FF0000] border-[#FF0000]/40 text-[9px] font-mono font-bold px-1.5 py-0 rounded"
                      >
                        TODAY
                      </Badge>
                    )}

                    {day.isTargetDate && (
                      <Badge
                        variant="outline"
                        className="bg-[#FF0000]/10 text-[#FF0000] border-[#FF0000]/40 text-[9px] font-mono font-bold px-1.5 py-0 rounded"
                      >
                        TARGET
                      </Badge>
                    )}

                    <div className="flex items-center gap-1">
                      {day.subjects && day.subjects.length > 0 ? (
                        day.subjects.map((subj) => (
                          <SubjectBadge
                            key={subj}
                            subject={subj}
                            size="xs"
                            showLabel={true}
                          />
                        ))
                      ) : day.plannedMinutes > 0 ? (
                        <SubjectBadge subject="dsa" size="xs" showLabel={true} />
                      ) : null}
                    </div>
                  </div>

                  {/* Right stats */}
                  <div className="flex items-center gap-2 text-xs font-mono text-[#888888] sm:self-center">
                    {day.isRestDay ? (
                      <span className="text-[#666666] uppercase tracking-wider text-[11px]">
                        Rest Day
                      </span>
                    ) : (
                      <>
                        <span className="text-white font-medium">
                          {formatDurationDetailed(day.plannedMinutes)}
                        </span>
                        <span className="text-[#444444]">/</span>
                        <span>{formatDurationDetailed(day.availableMinutes)}</span>
                        <span className="text-[#444444]">·</span>
                        <span className="text-[#AAAAAA]">
                          {day.taskCount} {day.taskCount === 1 ? "task" : "tasks"}
                        </span>
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
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-[#666666] font-mono">
                      Scheduled recovery day. No study tasks allocated.
                    </span>
                    <Button
                      variant={isSelected ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => onSelectDate(day.date)}
                      className={cn(
                        "h-7 px-2.5 text-xs font-mono transition-colors gap-1.5",
                        isSelected
                          ? "bg-[#FF0000] text-white hover:bg-[#CC0000] border-transparent font-semibold shadow-[0_0_8px_rgba(255,0,0,0.3)]"
                          : "border-[#262626] bg-[#0E0E0E] text-[#AAAAAA] hover:text-white hover:border-[#444444] hover:bg-[#161616]"
                      )}
                    >
                      <span>{isSelected ? "Inspecting" : "Inspect Day"}</span>
                      <Icon
                        icon={isSelected ? RotateRight01Icon : ArrowRight01Icon}
                        size={12}
                      />
                    </Button>
                  </div>
                ) : isSelected && dayTasks.length > 0 ? (
                  <div className="space-y-2.5 pt-1">
                    <div className="space-y-2">
                      {dayTasks.map((t, idx) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2.5 rounded-md bg-[#0C0C0C] border border-[#1A1A1A] text-xs gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-1 flex-1">
                            <span className="font-mono text-[11px] text-[#555555] shrink-0">
                              {String(idx + 1).padStart(2, "0")}
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="text-white font-medium truncate">
                                {t.title}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-[#777777] truncate">
                                <span className="uppercase">
                                  {t.taskType.replace("_", " ")}
                                </span>
                                {t.difficulty && (
                                  <>
                                    <span>·</span>
                                    <span className="text-[#AAAAAA]">{t.difficulty}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            <span className="font-mono text-[11px] text-[#AAAAAA]">
                              {t.plannedMinutes}m
                            </span>

                            {t.problemSlug && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-6 w-6 p-0 text-[#777777] hover:text-white hover:bg-[#1A1A1A]"
                              >
                                <Link
                                  href={`/practice/dsa/${t.problemSlug}?from=calendar&date=${day.date}`}
                                  title="Open Problem"
                                >
                                  <Icon icon={ArrowRight01Icon} size={13} />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#161616]">
                      <span className="text-[11px] font-mono text-[#777777]">
                        Viewing full schedule breakdown
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectDate(day.date)}
                        className="h-6 px-2 text-[11px] font-mono border-[#FF0000]/40 text-[#FF0000] bg-[#FF0000]/10 hover:bg-[#FF0000]/20 gap-1 rounded"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000]" />
                        Active Day
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1 border-t border-[#141414]">
                    <div className="flex items-center gap-2 text-xs text-[#777777] font-mono">
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          day.taskCount > 0 ? "bg-[#FF0000]" : "bg-[#333333]"
                        )}
                      />
                      <span>
                        {day.taskCount > 0
                          ? `${day.taskCount} task${day.taskCount === 1 ? "" : "s"} scheduled.`
                          : "No tasks scheduled."}
                      </span>
                    </div>

                    <Button
                      variant={isSelected ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => onSelectDate(day.date)}
                      className={cn(
                        "h-7 px-2.5 text-xs font-mono transition-colors gap-1.5",
                        isSelected
                          ? "bg-[#FF0000] text-white hover:bg-[#CC0000] border-transparent font-semibold shadow-[0_0_8px_rgba(255,0,0,0.3)]"
                          : "border-[#262626] bg-[#0E0E0E] text-[#AAAAAA] hover:text-white hover:border-[#444444] hover:bg-[#161616]"
                      )}
                    >
                      <span>{isSelected ? "Inspecting" : "Inspect Day"}</span>
                      <Icon
                        icon={isSelected ? RotateRight01Icon : ArrowRight01Icon}
                        size={12}
                      />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
