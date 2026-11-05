"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { recordProblemAttemptAction } from "../mutations/record-attempt";
import type { AttemptOutcome } from "../types";

interface AttemptDialogProps {
  problemId: string;
  problemTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onCloseAutoFocus?: (event: Event) => void;
}

const outcomeOptions: Array<{
  value: AttemptOutcome;
  title: string;
  subtitle: string;
}> = [
  {
    value: "independent",
    title: "Independent",
    subtitle: "Solved without hints. Advance interval.",
  },
  {
    value: "hint",
    title: "With Hints",
    subtitle: "Required conceptual nudges.",
  },
  {
    value: "solution_viewed",
    title: "Solution Consulted",
    subtitle: "Read editorial or solution. Reset interval.",
  },
  {
    value: "unsolved",
    title: "Unsolved",
    subtitle: "Timed out or blocked. Needs immediate revision.",
  },
];

const confidenceLabels: Record<number, string> = {
  1: "1 - Shaky",
  2: "2 - Uncertain",
  3: "3 - Moderate",
  4: "4 - Strong",
  5: "5 - Mastered",
};

export function AttemptDialog({
  problemId,
  problemTitle,
  isOpen,
  onOpenChange,
  onSuccess,
  onCloseAutoFocus,
}: AttemptDialogProps) {
  const [outcome, setOutcome] = React.useState<AttemptOutcome>("independent");
  const [durationMinutes, setDurationMinutes] = React.useState<number>(30);
  const [confidence, setConfidence] = React.useState<number>(3);
  const [notes, setNotes] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await recordProblemAttemptAction({
        problemId,
        outcome,
        durationMinutes,
        confidence,
        notes: notes.trim() ? notes.trim() : undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to record attempt. Please try again.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Attempt recorded. Revision schedule updated.");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="problem-attempt-dialog sm:max-w-lg max-h-[90dvh] flex flex-col p-0 overflow-hidden bg-[#050505] border-[rgba(255,255,255,0.12)] gap-0"
        onCloseAutoFocus={onCloseAutoFocus}
        onOpenAutoFocus={() => {
          setOutcome("independent");
          setDurationMinutes(30);
          setConfidence(3);
          setNotes("");
          setErrorMsg(null);
        }}
      >
        <DialogHeader className="sticky top-0 z-10 px-6 py-4 border-b border-[var(--border-subtle)] bg-[#050505] pr-12 shrink-0 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight text-white">
            Record Attempt
          </DialogTitle>
          <DialogDescription className="text-xs font-mono text-[var(--text-secondary)] truncate">
            {problemTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div
              role="alert"
              className="p-3 text-xs border border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)] rounded-[var(--radius-sm)]"
            >
              {errorMsg}
            </div>
          )}

          {/* 1. Outcome Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase text-[var(--text-tertiary)]">
              Resolution Outcome
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {outcomeOptions.map((opt) => {
                const isSelected = outcome === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setOutcome(opt.value)}
                    className={cn(
                      "text-left p-3 rounded-[var(--radius-sm)] border transition-all text-xs",
                      isSelected
                        ? "border-[rgba(255,255,255,0.85)] bg-[var(--surface-hover)] text-white shadow-xs"
                        : "border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:text-white"
                    )}
                  >
                    <div className="font-medium">{opt.title}</div>
                    <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5 leading-snug">
                      {opt.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Duration & Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="duration"
                className="text-xs font-mono uppercase text-[var(--text-tertiary)]"
              >
                Time Taken (Minutes)
              </Label>
              <div className="flex items-center gap-1.5">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    aria-pressed={durationMinutes === mins}
                    aria-label={`Set duration to ${mins} minutes`}
                    onClick={() => setDurationMinutes(mins)}
                    className={cn(
                      "px-2 py-0.5 rounded-[var(--radius-xs)] text-[11px] font-mono border transition-colors",
                      durationMinutes === mins
                        ? "border-[rgba(255,255,255,0.60)] bg-[var(--surface-hover)] text-white"
                        : "border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:text-white hover:border-[var(--border-default)]"
                    )}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
            <Input
              id="duration"
              type="number"
              min={1}
              max={600}
              value={durationMinutes}
              onChange={(e) =>
                setDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="font-mono text-sm"
              required
            />
          </div>

          {/* 3. Confidence Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-mono uppercase text-[var(--text-tertiary)]">
                Confidence Rating
              </Label>
              <span className="text-xs font-mono text-[var(--text-secondary)]">
                {confidenceLabels[confidence]}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => {
                const isSelected = confidence === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`Confidence ${lvl} out of 5`}
                    onClick={() => setConfidence(lvl)}
                    className={cn(
                      "py-2 rounded-[var(--radius-sm)] border text-xs font-mono font-medium transition-all text-center",
                      isSelected
                        ? "border-[rgba(255,255,255,0.90)] bg-white text-black font-semibold"
                        : "border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:text-white"
                    )}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Notes / Insights */}
          <div className="space-y-2">
            <Label
              htmlFor="notes"
              className="text-xs font-mono uppercase text-[var(--text-tertiary)]"
            >
              Key Insights & Edge Cases (Optional)
            </Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="e.g. Inverted binary search boundary condition; O(n) space using monotonic stack..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs resize-none"
              maxLength={2000}
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-3 border-t border-[var(--border-subtle)] bg-[#050505] shrink-0 flex flex-col-reverse sm:flex-row sm:justify-between items-stretch sm:items-center gap-2.5 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto h-11 sm:h-8 justify-center font-mono text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            className="w-full sm:w-auto h-11 sm:h-8 justify-center font-mono text-xs sm:min-w-[130px]"
          >
            {isSubmitting ? "Persisting..." : "Save Attempt"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
    </Dialog>
  );
}
