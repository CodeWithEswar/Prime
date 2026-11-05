"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import {
  CheckmarkCircle02Icon,
  Clock01Icon,
  MoreVerticalIcon,
  ArrowRight01Icon,
  RotateRight01Icon,
  Calendar01Icon,
  ArrowRight02Icon,
  Cancel01Icon,
  HelpCircleIcon,
} from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TodayTaskItem } from "../types";

interface TodayTaskRowProps {
  task: TodayTaskItem;
  onComplete: (taskId: string) => void;
  onSkip: (taskId: string) => void;
  onMoveTomorrow: (taskId: string) => void;
  onReschedule: (task: TodayTaskItem) => void;
  onWhyToday: (task: TodayTaskItem) => void;
  onStartSession: (task: TodayTaskItem) => void;
  onRecordReview?: (task: TodayTaskItem) => void;
}

const difficultyColors = {
  EASY: "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30",
  MEDIUM: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30",
  HARD: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30",
};

export function TodayTaskRow({
  task,
  onComplete,
  onSkip,
  onMoveTomorrow,
  onReschedule,
  onWhyToday,
  onStartSession,
  onRecordReview,
}: TodayTaskRowProps) {
  const isCompleted = task.status === "completed";
  const isInProgress = task.status === "in_progress";
  const isSkipped = task.status === "skipped";
  const isCurrent = task.isCurrent && !isCompleted;

  const problemHref =
    task.taskType === "dsa_problem" && task.problemSlug
      ? `/practice/dsa/${task.problemSlug}?from=today&taskId=${task.id}`
      : undefined;

  return (
    <div
      className={`relative group flex items-start sm:items-center justify-between gap-3 p-3.5 sm:px-4 sm:py-3 rounded-md transition-all ${
        isCurrent
          ? "bg-[#140808] border border-[#FF0000]/40 shadow-[0_0_12px_rgba(255,0,0,0.1)]"
          : isCompleted
            ? "bg-[#0A0A0A]/60 border border-[#161616] opacity-75 hover:opacity-100"
            : isSkipped
              ? "bg-[#070707] border border-[#141414] opacity-50"
              : "bg-[#080808] border border-[#141414] hover:border-[#222222] hover:bg-[#0C0C0C]"
      }`}
    >
      {/* Left: Terminal Node + Title + Metadata */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Terminal Indicator */}
        <div className="pt-1 shrink-0">
          {isCompleted ? (
            <span className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-white text-black shadow-[0_0_4px_rgba(255,255,255,0.6)]">
              <Icon icon={CheckmarkCircle02Icon} size={11} />
            </span>
          ) : isCurrent ? (
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0000] opacity-75" />
              <span className="relative inline-flex items-center justify-center rounded-full h-3.5 w-3.5 bg-[#FF0000] shadow-[0_0_8px_#FF0000]" />
            </span>
          ) : isInProgress ? (
            <span className="inline-flex h-3 w-3 rounded-full bg-[#EAB308]" />
          ) : (
            <span className="inline-flex h-3 w-3 rounded-full border border-[#333333] bg-[#111111]" />
          )}
        </div>

        {/* Task Details */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-1 sm:gap-2">
            {problemHref ? (
              <Link
                href={problemHref}
                className={`text-xs sm:text-sm font-semibold transition-colors leading-snug line-clamp-2 sm:line-clamp-none sm:truncate sm:max-w-md ${
                  isCompleted
                    ? "text-[#888888] line-through"
                    : isCurrent
                      ? "text-white hover:text-[#FF4D4D] font-bold"
                      : "text-[#E0E0E0] hover:text-white"
                }`}
              >
                {task.title}
              </Link>
            ) : (
              <span
                className={`text-xs sm:text-sm font-semibold leading-snug line-clamp-2 sm:line-clamp-none sm:truncate sm:max-w-md ${
                  isCompleted
                    ? "text-[#888888] line-through"
                    : isCurrent
                      ? "text-white font-bold"
                      : "text-[#E0E0E0]"
                }`}
              >
                {task.title}
              </span>
            )}

            {/* Badges strip: Difficulty, Topic, Stage, Overdue */}
            <div className="flex items-center flex-wrap gap-1.5 shrink-0">
              {task.problemDifficulty && (
                <span
                  className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${
                    difficultyColors[task.problemDifficulty]
                  }`}
                >
                  {task.problemDifficulty}
                </span>
              )}

              {task.topicName && (
                <span className="text-[#666666] font-mono text-[10px]">
                  {task.topicName}
                </span>
              )}

              {task.revisionIntervalDays && (
                <span className="text-[#888888] font-mono text-[10px]">
                  {task.revisionIntervalDays}d interval
                </span>
              )}

              {task.isOverdue && (
                <span className="font-mono text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider text-[#FF4D4D] bg-[#2A0505] border border-[#FF0000]/30">
                  OVERDUE
                </span>
              )}

              {task.carryCount && task.carryCount > 0 ? (
                <span className="font-mono text-[9px] px-1.5 py-0.2 rounded text-[#EAB308] bg-[#EAB308]/10 border border-[#EAB308]/30">
                  CARRIED
                </span>
              ) : null}
            </div>
          </div>

          {/* Sub-row: Telemetry & deterministic reason */}
          <div className="flex items-center gap-2 text-[11px] text-[#666666]">
            <span>{task.reasonExplanation}</span>
          </div>
        </div>
      </div>

      {/* Right: Target Duration + Primary Action + Overflow Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <span className="font-mono text-xs text-[#777777] hidden sm:inline-block">
          {task.plannedMinutes}m
        </span>

        {/* Primary Action Button */}
        {!isCompleted && !isSkipped ? (
          task.taskType === "dsa_problem" && problemHref ? (
            <Link
              href={problemHref}
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded font-mono text-xs font-semibold text-white bg-[#141414] hover:bg-[#FF0000] border border-[#222222] hover:border-[#FF0000] transition-colors shrink-0"
            >
              <span>{isCurrent ? "Solve" : "Open"}</span>
              <Icon icon={ArrowRight01Icon} size={12} />
            </Link>
          ) : task.taskType === "revision" ? (
            <button
              type="button"
              onClick={() => (onRecordReview ? onRecordReview(task) : onComplete(task.id))}
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded font-mono text-xs font-semibold text-white bg-[#141414] hover:bg-white hover:text-black border border-[#222222] hover:border-white transition-colors shrink-0"
            >
              <span>Review</span>
              <Icon icon={RotateRight01Icon} size={12} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onComplete(task.id)}
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded font-mono text-xs font-semibold text-white bg-[#141414] hover:bg-[#22C55E] hover:text-black border border-[#222222] hover:border-[#22C55E] transition-colors shrink-0"
            >
              <span>Done</span>
              <Icon icon={CheckmarkCircle02Icon} size={12} />
            </button>
          )
        ) : isCompleted ? (
          <span className="font-mono text-[11px] text-[#22C55E] inline-flex items-center gap-1">
            <Icon icon={CheckmarkCircle02Icon} size={11} />
            Done
          </span>
        ) : (
          <span className="font-mono text-[11px] text-[#666666]">Skipped</span>
        )}

        {/* Overflow Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="More task options"
              className="p-1 text-[#666666] hover:text-white rounded hover:bg-[#161616] transition-colors"
            >
              <Icon icon={MoreVerticalIcon} size={15} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-[#0D0D0D] border-[#222222] text-[#E0E0E0]"
          >
            <DropdownMenuItem
              onClick={() => onWhyToday(task)}
              className="text-xs py-2 cursor-pointer focus:bg-[#1A1A1A] focus:text-white"
            >
              <Icon icon={HelpCircleIcon} size={13} className="mr-2 text-[#FF0000]" />
              Why Today?
            </DropdownMenuItem>

            {!isCompleted && (
              <>
                <DropdownMenuItem
                  onClick={() => onStartSession(task)}
                  className="text-xs py-2 cursor-pointer focus:bg-[#1A1A1A] focus:text-white"
                >
                  <Icon icon={Clock01Icon} size={13} className="mr-2" />
                  Focus Session...
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-[#1C1C1C]" />

                {!task.isLocked && task.status === "planned" && <>                <DropdownMenuItem
                  onClick={() => onMoveTomorrow(task.id)}
                  className="text-xs py-2 cursor-pointer focus:bg-[#1A1A1A] focus:text-white"
                >
                  <Icon icon={ArrowRight02Icon} size={13} className="mr-2" />
                  Move to Tomorrow
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onReschedule(task)}
                  className="text-xs py-2 cursor-pointer focus:bg-[#1A1A1A] focus:text-white"
                >
                  <Icon icon={Calendar01Icon} size={13} className="mr-2" />
                  Reschedule...
                </DropdownMenuItem></>}

                <DropdownMenuItem
                  onClick={() => onSkip(task.id)}
                  className="text-xs py-2 cursor-pointer text-[#888888] hover:text-[#FF4D4D] focus:bg-[#1A1A1A] focus:text-[#FF4D4D]"
                >
                  <Icon icon={Cancel01Icon} size={13} className="mr-2" />
                  Skip Task
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}


