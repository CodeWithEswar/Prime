"use client";

import * as React from "react";
import Link from "next/link";
import {
  Cancel01Icon,
  RotateRight01Icon,
  SourceCodeIcon,
  Task01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDurationDetailed, formatDurationCompact } from "../domain/projection";
import { LoadRail } from "./load-rail";
import { SubjectBadge } from "./subject-badge";
import type { CalendarDayDetail, CalendarTaskItem } from "../types";

export interface DayLensProps {
  day: CalendarDayDetail | null;
  onClose: () => void;
  className?: string;
}

export function DayLens({ day, onClose, className }: DayLensProps) {
  if (!day) return null;

  const {
    date,
    displayDate,
    dayOfWeek,
    availableMinutes,
    plannedMinutes,
    completedMinutes,
    isRestDay,
    isToday,
    isTargetDate,
    tasks,
    revisionsSummary,
    coreSummary,
    customSummary,
  } = day;

  // Split tasks into semantic groups
  const revisionTasks = tasks.filter((t) => t.taskType === "revision");
  const coreTasks = tasks.filter((t) => t.taskType === "dsa_problem");
  const customTasks = tasks.filter((t) => t.taskType === "custom");

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;

  return (
    <div
      className={cn(
        "w-full lg:w-[380px] xl:w-[420px] bg-[#0A0A0A] border border-[#222222] rounded-lg p-5 flex flex-col justify-between select-none shadow-xl",
        className
      )}
      role="region"
      aria-label={`Inspection details for ${displayDate}`}
    >
      <div className="space-y-5">
        {/* Header: Date, Weekday, Close */}
        <div className="flex items-start justify-between pb-3 border-b border-[#1A1A1A]">
          <div>
            <div className="flex items-center gap-2">
              {isToday && (
                <span className="w-2 h-2 rounded-full bg-[#FF0000] shadow-[0_0_6px_rgba(255,0,0,0.9)]" />
              )}
              <h3 className="font-mono text-base font-bold text-white tracking-tight">
                {displayDate}
              </h3>
              <span className="text-[#333333]">·</span>
              <span className="font-mono text-xs uppercase tracking-wider text-[#888888]">
                {dayOfWeek}
              </span>
            </div>

            {isTargetDate && (
              <div className="pt-1">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF0000]/15 text-[#FF0000] border border-[#FF0000]/40 uppercase tracking-wider">
                  PREPARATION TARGET DATE
                </span>
              </div>
            )}

            {/* Scheduled Curriculum Tracks */}
            {day.subjects && day.subjects.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                {day.subjects.map((subj) => (
                  <SubjectBadge key={subj} subject={subj} size="sm" showLabel={true} />
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close day inspection"
            className="h-7 w-7 p-0 text-[#666666] hover:text-white hover:bg-[#1A1A1A]"
          >
            <Icon icon={Cancel01Icon} size={16} />
          </Button>
        </div>

        {/* Capacity & Completion Metrics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-white font-bold">
                {formatDurationDetailed(plannedMinutes)}
              </span>
              <span className="text-[#777777]"> planned</span>
            </div>

            <div>
              <span className="text-[#AAAAAA]">
                {formatDurationDetailed(availableMinutes)}
              </span>
              <span className="text-[#555555]"> capacity</span>
            </div>
          </div>

          <LoadRail
            plannedMinutes={plannedMinutes}
            availableMinutes={availableMinutes}
            completedMinutes={completedMinutes}
            isRestDay={isRestDay}
            size="detailed"
          />

          {!isRestDay && totalTasks > 0 && (
            <div className="flex items-center justify-between text-[11px] font-mono text-[#666666]">
              <span>
                {completedTasks} of {totalTasks} tasks completed
              </span>
              <span>
                {Math.round((completedMinutes / Math.max(1, plannedMinutes)) * 100)}% workload resolved
              </span>
            </div>
          )}
        </div>

        {/* Task Breakdown Sections */}
        {isRestDay ? (
          <div className="p-6 rounded-md bg-[#070707] border border-[#161616] text-center space-y-2">
            <div className="font-mono text-xs text-[#888888] uppercase tracking-wider">
              Rest & Recovery
            </div>
            <p className="text-xs text-[#555555] leading-relaxed">
              No tasks scheduled for this date. Recovery prevents cognitive fatigue and protects long-term retention.
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-6 rounded-md bg-[#070707] border border-[#161616] text-center space-y-2">
            <div className="font-mono text-xs text-[#777777] uppercase tracking-wider">
              No Tasks Planned
            </div>
            <p className="text-xs text-[#555555] leading-relaxed">
              No specific tasks assigned to this date yet. Open the 90-Day Planner to balance your curriculum.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[420px] overflow-y-auto prime-scrollbar-thin pr-1">
            {/* 1. Revision Tasks */}
            {revisionTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#888888] uppercase tracking-wider border-b border-[#1A1A1A] pb-1">
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <Icon icon={RotateRight01Icon} size={12} className="text-[#FF0000]" />
                    <span>01 / REVISION</span>
                  </div>
                  <span>
                    {revisionsSummary.count} tasks · {formatDurationCompact(revisionsSummary.minutes)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {revisionTasks.map((t, idx) => (
                    <TaskItemRow key={t.id} task={t} index={idx + 1} date={date} />
                  ))}
                </div>
              </div>
            )}

            {/* 2. PRIME Core Problems */}
            {coreTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#888888] uppercase tracking-wider border-b border-[#1A1A1A] pb-1">
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <Icon icon={SourceCodeIcon} size={12} className="text-white" />
                    <span>02 / PRIME CORE</span>
                  </div>
                  <span>
                    {coreSummary.count} tasks · {formatDurationCompact(coreSummary.minutes)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {coreTasks.map((t, idx) => (
                    <TaskItemRow
                      key={t.id}
                      task={t}
                      index={revisionTasks.length + idx + 1}
                      date={date}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 3. Custom Tasks */}
            {customTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#888888] uppercase tracking-wider border-b border-[#1A1A1A] pb-1">
                  <div className="flex items-center gap-1.5 text-white font-semibold">
                    <Icon icon={Task01Icon} size={12} className="text-[#888888]" />
                    <span>03 / CUSTOM</span>
                  </div>
                  <span>
                    {customSummary.count} tasks · {formatDurationCompact(customSummary.minutes)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {customTasks.map((t, idx) => (
                    <TaskItemRow
                      key={t.id}
                      task={t}
                      index={revisionTasks.length + coreTasks.length + idx + 1}
                      date={date}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Primary Action */}
      <div className="pt-4 border-t border-[#1A1A1A] mt-4">
        {isToday ? (
          <Button
            asChild
            variant="primary"
            className="w-full h-9 bg-[#FF0000] text-white hover:bg-[#CC0000] font-mono text-xs font-semibold cursor-pointer"
          >
            <Link href="/today">Open Today</Link>
          </Button>
        ) : (
          <Button
            asChild
            variant="outline"
            className="w-full h-9 border-[#2A2A2A] bg-[#121212] text-white hover:border-[#444444] hover:bg-[#1A1A1A] font-mono text-xs font-semibold cursor-pointer"
          >
            <Link href={`/plan?date=${date}`}>Open Day in Plan</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

function TaskItemRow({
  task,
  index,
  date,
}: {
  task: CalendarTaskItem;
  index: number;
  date: string;
}) {
  const isCompleted = task.status === "completed";

  return (
    <div
      className={cn(
        "group flex items-center justify-between p-2.5 rounded bg-[#0E0E0E] border transition-all text-xs",
        isCompleted ? "border-[#222222] opacity-75" : "border-[#1A1A1A] hover:border-[#2C2C2C]"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0 pr-2">
        <span className="font-mono text-[10px] text-[#555555] flex-shrink-0">
          {String(index).padStart(2, "0")}
        </span>

        {isCompleted ? (
          <Icon
            icon={CheckmarkCircle02Icon}
            size={14}
            className="text-white flex-shrink-0"
          />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-[#333333] flex-shrink-0" />
        )}

        <div className="min-w-0">
          <div
            className={cn(
              "font-medium truncate",
              isCompleted ? "text-[#888888] line-through" : "text-white"
            )}
            title={task.title}
          >
            {task.title}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#666666]">
            <SubjectBadge subject={task.subject ?? "dsa"} size="xs" showLabel={true} />
            {task.difficulty && (
              <span
                className={cn(
                  "font-semibold",
                  task.difficulty === "EASY"
                    ? "text-[#4CAF50]"
                    : task.difficulty === "HARD"
                      ? "text-[#FF0000]"
                      : "text-[#FFA116]"
                )}
              >
                {task.difficulty}
              </span>
            )}
            {task.topicName && (
              <>
                <span>·</span>
                <span className="truncate">{task.topicName}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-mono text-[11px] text-[#888888]">
          {task.plannedMinutes}m
        </span>

        {task.problemSlug && (
          <Link
            href={`/practice/dsa/${task.problemSlug}?from=calendar&date=${date}`}
            className="p-1 rounded text-[#666666] hover:text-white hover:bg-[#1C1C1C]"
            title="Practice Problem"
          >
            <Icon icon={ArrowRight01Icon} size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}

