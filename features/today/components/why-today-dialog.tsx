"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import type { TodayTaskItem, TodayNextAction } from "../types";

interface WhyTodayDialogProps {
  task: TodayTaskItem | TodayNextAction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhyTodayDialog({ task, open, onOpenChange }: WhyTodayDialogProps) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#0C0C0C] border-white/[0.1] text-neutral-200 p-6 shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000] font-bold">
              DETERMINISTIC SCHEDULING
            </span>
            <span className="text-neutral-600">·</span>
            <span className="font-mono text-[11px] text-neutral-400">
              {"targetMinutes" in task ? task.targetMinutes : (task as TodayTaskItem).plannedMinutes}m allocated
            </span>
          </div>

          <DialogTitle className="text-lg font-bold text-white tracking-tight">
            Why is this scheduled today?
          </DialogTitle>

          <DialogDescription className="text-xs text-neutral-400 font-mono">
            {task.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* Main Reason Highlight */}
          <div className="p-3.5 rounded bg-neutral-900 border border-white/[0.08] text-white font-medium leading-relaxed font-sans">
            {task.reasonExplanation}
          </div>

          {/* Sub-signals */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-start gap-2.5 text-neutral-400">
              <Icon icon={CheckmarkCircle02Icon} size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>Deterministic scheduling decision from your active preparation plan.</span>
            </div>

            {task.taskType === "revision" && (
              <div className="flex items-start gap-2.5 text-neutral-400">
                <Icon icon={CheckmarkCircle02Icon} size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Interval-based spacing designed to reinforce memory consolidation before decay.
                </span>
              </div>
            )}

            {task.taskType === "dsa_problem" && (
              <div className="flex items-start gap-2.5 text-neutral-400">
                <Icon icon={CheckmarkCircle02Icon} size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>Topic prerequisites verified and aligned with your interview timeline.</span>
              </div>
            )}

            <div className="flex items-start gap-2.5 text-neutral-400">
              <Icon icon={CheckmarkCircle02Icon} size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>Allocated comfortably within your daily study capacity buffer.</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
