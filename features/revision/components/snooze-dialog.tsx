"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { snoozeProblemRevisionAction } from "../mutations/snooze-revision";
import type { RevisionProblemItem } from "../types";
import { addDays, format } from "date-fns";
import { toast } from "sonner";

interface SnoozeDialogProps {
  item: RevisionProblemItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SnoozeDialog({ item, open, onOpenChange, onSuccess }: SnoozeDialogProps) {
  const [snoozeDays, setSnoozeDays] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) return null;

  const handleSnooze = async () => {
    setIsSubmitting(true);
    try {
      const targetDate = addDays(new Date(), snoozeDays);
      const res = await snoozeProblemRevisionAction({
        problemId: item.problemId,
        snoozeUntil: targetDate.toISOString(),
      });

      if (!res.success) {
        toast.error(res.error || "Failed to snooze revision");
        return;
      }

      toast.success(
        `Revision snoozed until ${format(targetDate, "MMM dd, yyyy")}`
      );
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const options = [
    { days: 1, label: "Tomorrow", date: format(addDays(new Date(), 1), "MMM dd") },
    { days: 3, label: "In 3 Days", date: format(addDays(new Date(), 3), "MMM dd") },
    { days: 7, label: "Next Week", date: format(addDays(new Date(), 7), "MMM dd") },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-[#0A0A0A] border-[#222222] text-[#EDEDED]">
        <DialogHeader className="px-6 py-4 border-b border-[#1A1A1A] bg-[#0A0A0A]">
          <DialogTitle className="text-base font-bold text-white">
            Snooze Revision
          </DialogTitle>
          <DialogDescription className="text-xs text-[#888888]">
            Temporarily postpone review for {item.title}.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-2.5">
            {options.map((opt) => {
              const isSelected = snoozeDays === opt.days;
              return (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setSnoozeDays(opt.days)}
                  className={`p-3 rounded border text-left transition-all ${
                    isSelected
                      ? "border-[#FF0000] bg-[#1A0505] text-white"
                      : "border-[#222222] bg-[#0F0F0F] text-[#888888] hover:text-white hover:border-[#333333]"
                  }`}
                >
                  <div className="font-semibold text-xs text-white">{opt.label}</div>
                  <div className="text-[10px] font-mono text-[#777777] mt-1">
                    {opt.date}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-[#777777] leading-relaxed">
            Snoozing defers the review notification without affecting your earned interval ladder.
          </p>
        </div>

        <DialogFooter className="px-6 py-3 border-t border-[#1A1A1A] bg-[#0A0A0A] flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="text-xs text-[#888888] hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSnooze}
            disabled={isSubmitting}
            className="text-xs font-semibold bg-white text-black hover:bg-[#E0E0E0]"
          >
            {isSubmitting ? "Snoozing..." : "Confirm Snooze"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

