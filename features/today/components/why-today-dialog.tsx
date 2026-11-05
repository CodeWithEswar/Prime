"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { HelpCircleIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
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
      <DialogContent className="max-w-md bg-[#0D0D0D] border-[#222222] text-[#E0E0E0] p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000] font-semibold">
              EXPLAINABILITY
            </span>
            <span className="text-[#333333]">·</span>
            <span className="font-mono text-[11px] text-[#888888]">
              {"targetMinutes" in task ? task.targetMinutes : (task as TodayTaskItem).plannedMinutes}m target
            </span>
          </div>

          <DialogTitle className="text-lg font-bold text-white tracking-tight">
            Why today?
          </DialogTitle>

          <DialogDescription className="text-xs text-[#888888]">
            {task.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* Main Reason Highlight */}
          <div className="p-3.5 rounded bg-[#141414] border border-[#222222] text-white font-medium leading-relaxed">
            {task.reasonExplanation}
          </div>

          {/* Sub-signals */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-start gap-2.5 text-[#888888]">
              <Icon icon={CheckmarkCircle02Icon} size={14} className="text-white shrink-0 mt-0.5" />
              <span>Deterministic scheduling decision from your active preparation plan.</span>
            </div>

            {task.taskType === "revision" && (
              <div className="flex items-start gap-2.5 text-[#888888]">
                <Icon icon={CheckmarkCircle02Icon} size={14} className="text-white shrink-0 mt-0.5" />
                <span>
                  Interval-based spacing designed to reinforce memory consolidation right before forgetting.
                </span>
              </div>
            )}

            {task.taskType === "dsa_problem" && (
              <div className="flex items-start gap-2.5 text-[#888888]">
                <Icon icon={CheckmarkCircle02Icon} size={14} className="text-white shrink-0 mt-0.5" />
                <span>Prerequisites satisfied in previous roadmap stages with zero circular dependencies.</span>
              </div>
            )}

            <div className="flex items-start gap-2.5 text-[#888888]">
              <Icon icon={CheckmarkCircle02Icon} size={14} className="text-white shrink-0 mt-0.5" />
              <span>Allocated within your daily study capacity buffer.</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
