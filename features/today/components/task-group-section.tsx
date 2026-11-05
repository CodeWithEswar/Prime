"use client";

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
    <div className="space-y-2.5">
      {/* Group Header */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          {group.isUrgent && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000] shadow-[0_0_6px_#FF0000]" />
          )}
          <span className="font-mono text-xs font-bold text-white tracking-wider">
            {group.label}
          </span>
          <span className="font-mono text-[11px] text-[#666666]">
            ({group.completedCount}/{group.totalCount})
          </span>
        </div>

        <span className="font-mono text-xs text-[#888888]">
          {formatDuration(group.totalPlannedMinutes)}
        </span>
      </div>

      {/* Task Rows */}
      <div className="space-y-1.5">
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
    </div>
  );
}

