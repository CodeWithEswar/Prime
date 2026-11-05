"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { addDays, daysBetween } from "@/domain/planning/capacity";
import { updatePlanTarget } from "../server/actions";
import { PlannerDateField } from "./planner-date-field";

interface PlannerRunwayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startDate: string;
  currentTargetDate: string;
  today: string;
  onSuccess?: (message: string) => void;
}

const PRESETS = [
  { days: 30, label: "30 Days", sub: "1 Mo" },
  { days: 60, label: "60 Days", sub: "2 Mo" },
  { days: 90, label: "90 Days", sub: "3 Mo (Standard)" },
  { days: 100, label: "100 Days", sub: "Mastery Sprint", highlight: true },
  { days: 120, label: "120 Days", sub: "4 Mo" },
  { days: 180, label: "180 Days", sub: "6 Mo Extended" },
];

function dateLabel(
  value: string,
  options?: Intl.DateTimeFormatOptions
) {
  const parts = value.split("-").map(Number);
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(date);
}

export function PlannerRunwayDialog({
  open,
  onOpenChange,
  startDate,
  currentTargetDate,
  today,
  onSuccess,
}: PlannerRunwayDialogProps) {
  const router = useRouter();
  const baseStart = startDate < today ? today : startDate;
  const initialDays = daysBetween(baseStart, currentTargetDate);
  const [days, setDays] = useState<number>(initialDays);
  const [targetDate, setTargetDate] = useState<string>(currentTargetDate);
  const [, setMode] = useState<"presets" | "custom_days" | "date">("presets");
  const [error, setError] = useState<string>("");
  const [busy, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      const currentBase = startDate < today ? today : startDate;
      const calculated = daysBetween(currentBase, currentTargetDate);
      setDays(calculated);
      setTargetDate(currentTargetDate);
      setError("");
    }
  }, [open, startDate, currentTargetDate, today]);

  const maxSelectableDate = addDays(today, 365);
  const daysRemaining = Math.max(0, daysBetween(today, targetDate));

  function handleSelectPreset(d: number) {
    setDays(d);
    setTargetDate(addDays(baseStart, d - 1));
    setError("");
  }

  function handleCustomDaysChange(val: string) {
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      setDays(0);
      return;
    }
    const clamped = Math.max(1, Math.min(365, num));
    setDays(clamped);
    setTargetDate(addDays(baseStart, clamped - 1));
    setError("");
  }

  function handleDateChange(dateStr: string) {
    setTargetDate(dateStr);
    const calculatedDays = daysBetween(baseStart, dateStr);
    setDays(calculatedDays);
    setError("");
  }

  function handleSave() {
    if (days < 7) {
      setError("Plan duration must be at least 7 days.");
      return;
    }
    if (targetDate < today) {
      setError("Target date must be today or in the future.");
      return;
    }

    setError("");
    startTransition(async () => {
      const res = await updatePlanTarget(targetDate, baseStart);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onOpenChange(false);
      onSuccess?.(`Planner runway customized to ${days} days (${dateLabel(targetDate)})`);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1.5rem)] sm:w-full max-w-md max-h-[92dvh] overflow-y-auto overscroll-contain border border-[#262626] bg-[#0A0A0A] p-4 sm:p-6 text-white shadow-2xl rounded-xl sm:rounded-xl">
        <DialogHeader className="space-y-1.5 pr-8 sm:pr-10">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[#FF0000]/10 text-[#FF0000] shrink-0">
              <Icon icon={Calendar03Icon} size={14} />
            </span>
            <DialogTitle className="text-sm sm:text-base font-semibold text-white leading-tight">
              Customize Preparation Runway
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#888888]">
            Customize your planner timeline duration. Select a preset (including 100-day
            sprint) or set custom days.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Current plan summary */}
          <div className="rounded-md border border-[#1F1F1F] bg-[#121212] p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs">
              <span className="text-[#888888]">Current plan runway:</span>
              <span className="font-mono font-medium text-white">
                {initialDays} Days · Target: {dateLabel(currentTargetDate)}
              </span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#AAAAAA]">
              Quick Runway Presets
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PRESETS.map((preset) => {
                const isSelected = days === preset.days;
                return (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => {
                      setMode("presets");
                      handleSelectPreset(preset.days);
                    }}
                    className={
                      "flex flex-col items-start justify-between rounded-md border p-2 sm:p-2.5 text-left transition-all min-w-0 " +
                      (isSelected
                        ? "border-[#FF0000] bg-[#FF0000]/10 text-white shadow-[0_0_10px_rgba(255,0,0,0.2)]"
                        : preset.highlight
                          ? "border-[#333333] bg-[#141414] hover:border-[#FF0000]/50 text-white"
                          : "border-[#1F1F1F] bg-[#0E0E0E] hover:border-[#333333] text-[#CCCCCC]")
                    }
                  >
                    <div className="flex w-full items-center justify-between gap-1">
                      <span className="font-mono text-xs sm:text-sm font-bold truncate">
                        {preset.label}
                      </span>
                      {preset.highlight && (
                        <span className="shrink-0 rounded bg-[#FF0000] px-1 py-0.2 text-[8px] sm:text-[9px] font-bold text-white uppercase tracking-wider">
                          HOT
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#888888] truncate w-full mt-0.5">
                      {preset.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Duration or Date Options - Responsive & Perfectly Aligned */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1F1F1F]">
            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#888888] flex items-center h-4">
                Custom Days
              </label>
              <div className="relative flex items-center h-9">
                <Input
                  type="number"
                  min={7}
                  max={365}
                  value={days || ""}
                  onChange={(e) => {
                    setMode("custom_days");
                    handleCustomDaysChange(e.target.value);
                  }}
                  className="h-9 w-full rounded-md border border-[#262626] bg-[#0E0E0E] px-3 font-mono text-sm text-white pr-14 focus-visible:border-[#FF0000] focus-visible:ring-1 focus-visible:ring-[#FF0000]"
                  placeholder="e.g. 100"
                />
                <span className="pointer-events-none absolute right-3 flex items-center text-xs font-mono text-[#666666]">
                  days
                </span>
              </div>
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#888888] flex items-center h-4">
                Target Date
              </label>
              <div className="h-9">
                <PlannerDateField
                  label="Target date"
                  min={today}
                  max={maxSelectableDate}
                  value={targetDate}
                  className="h-9 rounded-md border-[#262626] bg-[#0E0E0E] px-3 font-mono text-sm text-white hover:border-[#444444] hover:bg-[#141414] focus-visible:border-[#FF0000] focus-visible:ring-1 focus-visible:ring-[#FF0000]"
                  onChange={(dateStr) => {
                    setMode("date");
                    handleDateChange(dateStr);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="rounded-md border border-[#222222] bg-[#0E0E0E] p-3 text-xs space-y-1.5 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[#888888]">Planned Duration:</span>
              <span className="font-semibold text-white">
                {days} Total Days
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#888888]">Start — Target:</span>
              <span className="text-white">
                {dateLabel(startDate, { month: "short", day: "numeric" })} —{" "}
                {dateLabel(targetDate, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#888888]">Runway Remaining:</span>
              <span className="font-bold text-[#FF0000]">
                {daysRemaining} Days remaining
              </span>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-xs text-red-400 font-mono">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2 border-t border-[#1F1F1F]">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto border-[#262626] text-[#888888] hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={busy || days < 7}
            onClick={handleSave}
            className="w-full sm:w-auto bg-[#FF0000] text-white hover:bg-[#CC0000] font-semibold"
          >
            {busy ? "Updating..." : `Save ${days}-Day Runway`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
