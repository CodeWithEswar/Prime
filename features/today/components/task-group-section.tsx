"use client";

import { Icon } from "@/components/ui/icon";
import { Clock01Icon } from "@hugeicons/core-free-icons";
import type { TodayTaskGroup, TodayTaskItem } from "../types";
import { TodayTaskRow } from "./today-task-row";
import { formatDuration } from "./daily-load-strip";

interface TaskGroupSectionProps {
  group: TodayTaskGroup;
  onComplete: (taskId: string) => void;
  onSkip: (taskId: string) => void;
  onMoveTomorrow: (taskId: string) => void;
  onReschedule: (task: TodayTaskItem) => void;
  onWhyToday: (task: TodayTaskItem) => void;
  onStartSession: (task: TodayTaskItem) => void;
  onRecordReview?: (task: TodayTaskItem) => void;
}

export function TaskGroupSection({
  group,
  onComplete,
  onSkip,
  onMoveTomorrow,
  onReschedule,
  onWhyToday,
  onStartSession,
  onRecordReview,
}: TaskGroupSectionProps) {
  return (
    <section aria-label={group.label} className="space-y-2.5">
      {/* Group Header Strip */}
      <div className="flex items-center justify-between gap-3 px-1 pt-1">
        <div className="flex items-center gap-2.5">
          {group.isUrgent && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0000] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF0000] shadow-[0_0_6px_#FF0000]" />
            </span>
          )}
          <span className="font-mono text-xs font-bold text-white tracking-wider uppercase">
            {group.label}
          </span>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-neutral-900 border border-white/[0.06] text-neutral-400 font-semibold">
            {group.completedCount} / {group.totalCount}
          </span>
        </div>

        <div className="inline-flex items-center gap-1 font-mono text-xs text-neutral-400 bg-[#0C0C0C] px-2 py-0.5 rounded border border-white/[0.04]">
          <Icon icon={Clock01Icon} size={11} className="text-neutral-500" />
          <span>{formatDuration(group.totalPlannedMinutes)}</span>
        </div>
      </div>

      {/* Task Rows List */}
      <div className="space-y-2">
        {group.tasks.map((task) => (
          <TodayTaskRow
            key={task.id}
            task={task}
            onComplete={onComplete}
            onSkip={onSkip}
            onMoveTomorrow={onMoveTomorrow}
            onReschedule={onReschedule}
            onWhyToday={onWhyToday}
            onStartSession={onStartSession}
            onRecordReview={onRecordReview}
          />
        ))}
      </div>
    </section>
  );
}
