"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

interface FinishSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elapsedFormatted: string;
  taskTitle: string;
  onConfirmFinish: (options: { markComplete: boolean }) => void;
  isPending?: boolean;
}

export function FinishSessionDialog({
  open,
  onOpenChange,
  elapsedFormatted,
  taskTitle,
  onConfirmFinish,
  isPending = false,
}: FinishSessionDialogProps) {
  const [markComplete, setMarkComplete] = useState(true);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md bg-[#0D0D0D] border-white/[0.1] text-neutral-200 p-6 shadow-2xl">
        <AlertDialogHeader className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#FF0000]">
              SESSION SUMMARY
            </span>
          </div>

          <AlertDialogTitle className="text-xl font-bold text-white tracking-tight">
            Finish Focus Session?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-xs text-neutral-400 font-sans leading-relaxed">
            Your focused study time will be saved to your learning analytics:
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Telemetry Highlight */}
        <div className="my-3 p-3.5 rounded-lg bg-neutral-950 border border-white/[0.08] flex items-center justify-between font-mono text-xs">
          <span className="text-neutral-400 truncate max-w-[200px]">{taskTitle}</span>
          <span className="text-emerald-400 font-bold text-sm">{elapsedFormatted}</span>
        </div>

        {/* Option to mark task complete */}
        <div className="flex items-center gap-3 py-1 select-none">
          <Checkbox
            id="mark-task-complete"
            checked={markComplete}
            onCheckedChange={setMarkComplete}
            aria-label="Mark task complete in daily plan"
          />
          <label
            htmlFor="mark-task-complete"
            className="text-xs text-neutral-300 hover:text-white cursor-pointer font-sans leading-none transition-colors"
          >
            Mark task complete in daily plan
          </label>
        </div>

        <AlertDialogFooter className="pt-3 gap-2">
          <AlertDialogCancel
            disabled={isPending}
            className="text-xs font-mono border-white/[0.1] bg-neutral-900 hover:bg-neutral-800 text-neutral-300"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              onConfirmFinish({ markComplete });
            }}
            className="text-xs font-mono btn-neumorphic-primary text-white font-semibold gap-1.5"
          >
            <Icon icon={CheckmarkCircle02Icon} size={14} />
            <span>Finish Session</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

