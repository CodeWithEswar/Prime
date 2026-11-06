"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
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
  BookOpen01Icon,
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
  EASY: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  MEDIUM: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  HARD: "text-rose-400 bg-rose-500/10 border-rose-500/30",
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
      className={`group relative flex items-start sm:items-center justify-between gap-3 p-3.5 sm:px-4 sm:py-3 rounded-md transition-all duration-150 overflow-hidden ${
        isCurrent
          ? "bg-[#0C0505] border border-[#FF0000]/40 shadow-[0_0_16px_rgba(255,0,0,0.08)]"
          : isCompleted
            ? "bg-[#060606] border border-white/[0.04] opacity-65 hover:opacity-100"
            : isSkipped
              ? "bg-[#050505] border border-white/[0.03] opacity-40"
              : "bg-[#080808] border border-white/[0.06] hover:border-white/[0.14] hover:bg-[#0C0C0C]"
      }`}
    >
      {/* Current Task Red Accent Edge Marker */}
      {isCurrent && (
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#FF0000] shadow-[0_0_8px_#FF0000]" />
      )}

      {/* Left: Terminal Node + Title + Metadata */}
      <div className="flex items-start gap-3 min-w-0 flex-1 pl-1">
        {/* Terminal Indicator Node */}
        <div className="pt-0.5 sm:pt-1 shrink-0">
          {isCompleted ? (
            <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-emerald-500 text-black shadow-[0_0_6px_rgba(16,185,129,0.5)]">
              <Icon icon={CheckmarkCircle02Icon} size={11} className="stroke-[3]" />
            </span>
          ) : isCurrent ? (
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0000] opacity-75" />
              <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-[#FF0000] shadow-[0_0_8px_#FF0000]">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </span>
            </span>
          ) : isInProgress ? (
            <span className="inline-flex h-3.5 w-3.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
          ) : (
            <span className="inline-flex h-3.5 w-3.5 rounded-full border border-neutral-700 bg-neutral-900 group-hover:border-neutral-500 transition-colors" />
          )}
        </div>

        {/* Task Details Content */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-1 sm:gap-2">
            {problemHref ? (
              <Link
                href={problemHref}
                className={`text-xs sm:text-sm font-semibold transition-colors leading-snug line-clamp-2 sm:line-clamp-none ${
                  isCompleted
                    ? "text-neutral-500 line-through"
                    : isCurrent
                      ? "text-white hover:text-[#FF4D4D] font-bold"
                      : "text-neutral-200 hover:text-white"
                }`}
              >
                {task.title}
              </Link>
            ) : (
              <span
                className={`text-xs sm:text-sm font-semibold leading-snug line-clamp-2 sm:line-clamp-none ${
                  isCompleted
                    ? "text-neutral-500 line-through"
                    : isCurrent
                      ? "text-white font-bold"
                      : "text-neutral-200"
                }`}
              >
                {task.title}
              </span>
            )}

            {/* Badges strip: Difficulty, Topic, Overdue, Carried */}
            <div className="flex items-center flex-wrap gap-1.5 shrink-0">
              {task.problemDifficulty && (
                <span
                  className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                    difficultyColors[task.problemDifficulty]
                  }`}
                >
                  {task.problemDifficulty}
                </span>
              )}

              {task.topicName && (
                <span className="inline-flex items-center gap-1 text-neutral-400 font-mono text-[10px] bg-neutral-900 px-1.5 py-0.5 rounded border border-white/[0.05]">
                  <Icon icon={BookOpen01Icon} size={10} className="text-neutral-500" />
                  {task.topicName}
                </span>
              )}

              {/* Mobile-visible duration pill */}
              <span className="inline-flex items-center gap-1 text-neutral-400 font-mono text-[10px] bg-neutral-900 px-1.5 py-0.5 rounded border border-white/[0.05] sm:hidden">
                <Icon icon={Clock01Icon} size={10} className="text-neutral-500" />
                {task.plannedMinutes}m
              </span>

              {task.revisionIntervalDays && (
                <span className="text-neutral-400 font-mono text-[10px]">
                  {task.revisionIntervalDays}d interval
                </span>
              )}

              {task.isOverdue && (
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-[#FF4D4D] bg-[#2A0505] border border-[#FF0000]/30">
                  OVERDUE
                </span>
              )}

              {task.carryCount && task.carryCount > 0 ? (
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded text-amber-400 bg-amber-500/10 border border-amber-500/30">
                  CARRIED
                </span>
              ) : null}
            </div>
          </div>

          {/* Sub-row: Telemetry & deterministic rationale */}
          <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-sans">
            <span className="line-clamp-1">{task.reasonExplanation}</span>
          </div>
        </div>
      </div>

      {/* Right Action Cluster: Duration + Action Button + Overflow Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-center sm:self-auto">
        {/* Desktop Duration */}
        <span className="font-mono text-xs text-neutral-400 hidden sm:inline-block">
          {task.plannedMinutes}m
        </span>

        {/* Primary Action Button */}
        {!isCompleted && !isSkipped ? (
          task.taskType === "dsa_problem" && problemHref ? (
            <Button
              variant={isCurrent ? "primary" : "secondary"}
              size="sm"
              asChild
              className="gap-1.5 shrink-0"
            >
              <Link href={problemHref}>
                <span>{isCurrent ? "Solve" : "Open"}</span>
                <Icon icon={ArrowRight01Icon} size={13} />
              </Link>
            </Button>
          ) : task.taskType === "revision" ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                onRecordReview ? onRecordReview(task) : onComplete(task.id)
              }
              className="gap-1.5 shrink-0"
            >
              <span>Review</span>
              <Icon icon={RotateRight01Icon} size={13} />
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onComplete(task.id)}
              className="gap-1.5 shrink-0 hover:border-emerald-500/50 hover:text-emerald-400"
            >
              <span>Done</span>
              <Icon icon={CheckmarkCircle02Icon} size={13} />
            </Button>
          )
        ) : isCompleted ? (
          <span className="font-mono text-xs text-emerald-400 inline-flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-[var(--radius-sm)] border border-emerald-500/20">
            <Icon icon={CheckmarkCircle02Icon} size={12} />
            Done
          </span>
        ) : (
          <span className="font-mono text-xs text-neutral-500 bg-neutral-900/50 px-2.5 py-1 rounded-[var(--radius-sm)]">
            Skipped
          </span>
        )}

        {/* Overflow Menu with Full Context Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="More task options"
              className="text-neutral-400 hover:text-white"
            >
              <Icon icon={MoreVerticalIcon} size={15} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 bg-[#0C0C0C] border-white/[0.1] text-neutral-200 shadow-xl"
          >
            <DropdownMenuItem
              onClick={() => onWhyToday(task)}
              className="text-xs py-2 cursor-pointer focus:bg-neutral-800 focus:text-white"
            >
              <Icon icon={HelpCircleIcon} size={14} className="mr-2 text-[#FF0000]" />
              Why Today?
            </DropdownMenuItem>

            {!isCompleted && (
              <>
                <DropdownMenuItem
                  onClick={() => onStartSession(task)}
                  className="text-xs py-2 cursor-pointer focus:bg-neutral-800 focus:text-white"
                >
                  <Icon icon={Clock01Icon} size={14} className="mr-2" />
                  Start Focus Timer...
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/[0.08]" />

                {!task.isLocked && task.status === "planned" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onMoveTomorrow(task.id)}
                      className="text-xs py-2 cursor-pointer focus:bg-neutral-800 focus:text-white"
                    >
                      <Icon icon={ArrowRight02Icon} size={14} className="mr-2" />
                      Move to Tomorrow
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => onReschedule(task)}
                      className="text-xs py-2 cursor-pointer focus:bg-neutral-800 focus:text-white"
                    >
                      <Icon icon={Calendar01Icon} size={14} className="mr-2" />
                      Reschedule in Planner...
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuItem
                  onClick={() => onSkip(task.id)}
                  className="text-xs py-2 cursor-pointer text-neutral-400 hover:text-[#FF4D4D] focus:bg-neutral-800 focus:text-[#FF4D4D]"
                >
                  <Icon icon={Cancel01Icon} size={14} className="mr-2" />
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
