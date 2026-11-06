"use client";

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
import { Icon } from "@/components/ui/icon";
import { PauseIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";

interface ExitConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPauseAndExit: () => void;
  isPending?: boolean;
}

export function ExitConfirmDialog({
  open,
  onOpenChange,
  onPauseAndExit,
  isPending = false,
}: ExitConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md bg-[#0D0D0D] border-white/[0.1] text-neutral-200 p-6 shadow-2xl">
        <AlertDialogHeader className="space-y-2">
          <AlertDialogTitle className="text-xl font-bold text-white tracking-tight">
            Leave Focus Mode?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-xs text-neutral-400 font-sans leading-relaxed">
            Your focus timer is currently active. You can pause the sprint and return to your daily plan, or remain focused.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-4 gap-2">
          <AlertDialogCancel
            disabled={isPending}
            className="text-xs font-mono border-white/[0.1] bg-neutral-900 hover:bg-neutral-800 text-neutral-300"
          >
            Keep Focusing
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              onPauseAndExit();
            }}
            className="text-xs font-mono btn-neumorphic-secondary text-white gap-1.5"
          >
            <Icon icon={PauseIcon} size={14} className="text-[#FF0000]" />
            <span>Pause & Exit</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

