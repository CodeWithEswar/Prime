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
import { completeProblemRevisionAction } from "../mutations/complete-revision";
import type { RevisionProblemItem, RevisionRating } from "../types";
import { calculateNextRevisionInterval, getStageLabel } from "@/domain/revision";
import { cleanProblemTitle } from "@/lib/utils";
import { toast } from "sonner";

interface RecordRevisionDialogProps {
  item: RevisionProblemItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RecordRevisionDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: RecordRevisionDialogProps) {
  const [rating, setRating] = useState<RevisionRating>("okay");
  const [timeSpentMinutes, setTimeSpentMinutes] = useState(5);
  const [confidence, setConfidence] = useState(3);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) return null;

  const nextInterval = calculateNextRevisionInterval(item.intervalDays, rating);
  const nextStage = getStageLabel(nextInterval);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await completeProblemRevisionAction({
        problemId: item.problemId,
        rating,
        timeSpentMinutes,
        confidence,
        notes: notes.trim() || null,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to record revision");
        return;
      }

      toast.success(
        `Revision recorded: Scheduled for review in ${nextInterval} day${
          nextInterval > 1 ? "s" : ""
        } (${nextStage})`
      );
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const outcomes: Array<{
    id: RevisionRating;
    title: string;
    subtitle: string;
    effect: string;
    activeBorder: string;
    activeBg: string;
    accentColor: string;
  }> = [
    {
      id: "forgot",
      title: "Forgot",
      subtitle: "Recall failed completely",
      effect: "Resets to 1 day",
      activeBorder: "border-[#FF0000]",
      activeBg: "bg-[#1A0505]",
      accentColor: "text-[#FF4D4D]",
    },
    {
      id: "hard",
      title: "Hard",
      subtitle: "Recalled with great effort",
      effect: "Repeats stage",
      activeBorder: "border-[#F59E0B]",
      activeBg: "bg-[#181105]",
      accentColor: "text-[#F59E0B]",
    },
    {
      id: "okay",
      title: "Okay",
      subtitle: "Recalled with moderate effort",
      effect: "+1 interval stage",
      activeBorder: "border-[#FFFFFF]",
      activeBg: "bg-[#141414]",
      accentColor: "text-white",
    },
    {
      id: "easy",
      title: "Easy",
      subtitle: "Effortless, instant recall",
      effect: "+2 interval stages",
      activeBorder: "border-[#10B981]",
      activeBg: "bg-[#05170F]",
      accentColor: "text-[#10B981]",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 flex flex-col overflow-hidden bg-[#0A0A0A] border-[#222222] text-[#EDEDED] max-h-[90vh]">
        <DialogHeader className="sticky top-0 z-10 px-6 py-4 border-b border-[#1A1A1A] bg-[#0A0A0A]">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#FF0000]" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000] font-semibold">
              RECORD REVISION
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-[#333333] text-[#AAAAAA] ml-auto">
              {item.difficulty}
            </span>
          </div>
          <DialogTitle className="text-lg font-bold text-white tracking-tight">
            {cleanProblemTitle(item.title)}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#888888]">
            Current stage: {item.stageLabel} ({item.intervalDays} day
            {item.intervalDays > 1 ? "s" : ""})
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Outcome Selection */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#888888] tracking-wider mb-2.5">
              Retention Recall Outcome
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {outcomes.map((opt) => {
                const isSelected = rating === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRating(opt.id)}
                    className={`p-3.5 rounded-md border text-left transition-all ${
                      isSelected
                        ? `${opt.activeBorder} ${opt.activeBg} shadow-[0_0_8px_rgba(255,255,255,0.05)]`
                        : "border-[#222222] bg-[#0F0F0F] hover:border-[#333333]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-sm ${opt.accentColor}`}>
                        {opt.title}
                      </span>
                      <span className="font-mono text-[10px] text-[#777777]">
                        {opt.effect}
                      </span>
                    </div>
                    <div className="text-xs text-[#777777] mt-1 leading-snug">
                      {opt.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Spent & Confidence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#888888] tracking-wider mb-2">
                Time Spent (Minutes)
              </label>
              <input
                type="number"
                min={1}
                max={180}
                value={timeSpentMinutes}
                onChange={(e) => setTimeSpentMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-sm bg-[#050505] border border-[#262626] rounded text-white font-mono focus:border-[#FF0000] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#888888] tracking-wider mb-2">
                Confidence Level (1-5)
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setConfidence(lvl)}
                    className={`flex-1 py-2 text-xs font-mono font-bold rounded border transition-colors ${
                      confidence === lvl
                        ? "bg-[#FF0000] border-[#FF0000] text-white"
                        : "bg-[#050505] border-[#262626] text-[#888888] hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Key Insight / Notes */}
          <div>
            <label className="block text-xs font-mono uppercase text-[#888888] tracking-wider mb-2">
              Retention Notes & Key Insights (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What core pattern or tricky edge case did you recall? e.g. Monotonic stack boundary check..."
              className="w-full p-3 text-xs bg-[#050505] border border-[#262626] rounded text-[#EDEDED] placeholder-[#555555] focus:border-[#FF0000] focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Consequence Preview */}
          <div className="p-3.5 rounded bg-[#080808] border border-[#1A1A1A] flex items-center justify-between text-xs font-mono">
            <span className="text-[#888888]">Scheduled Next Review:</span>
            <span className="text-white font-semibold">
              In {nextInterval} day{nextInterval > 1 ? "s" : ""} ({nextStage})
            </span>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 z-10 px-6 py-3.5 border-t border-[#1A1A1A] bg-[#0A0A0A] flex flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="text-xs text-[#888888] hover:text-white hover:bg-[#1A1A1A]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="text-xs font-semibold bg-[#FF0000] hover:bg-[#CC0000] text-white px-5"
          >
            {isSubmitting ? "Saving..." : "Complete Revision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

