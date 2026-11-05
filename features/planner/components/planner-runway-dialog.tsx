"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar03Icon,
  CheckmarkCircle02Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
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
import { updatePlanDuration, updatePlanTarget } from "../server/actions";
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
  const initialDays = daysBetween(startDate, currentTargetDate);
  const [days, setDays] = useState<number>(initialDays);
  const [targetDate, setTargetDate] = useState<string>(currentTargetDate);
  const [mode, setMode] = useState<"presets" | "custom_days" | "date">("presets");
  const [error, setError] = useState<string>("");
  const [busy, startTransition] = useTransition();

  const maxSelectableDate = addDays(today, 365);
  const daysRemaining = Math.max(0, daysBetween(today, targetDate) - 1);

  function handleSelectPreset(d: number) {
    setDays(d);
    setTargetDate(addDays(startDate, d - 1));
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
    setTargetDate(addDays(startDate, clamped - 1));
    setError("");
  }

  function handleDateChange(dateStr: string) {
    setTargetDate(dateStr);
    const calculatedDays = daysBetween(startDate, dateStr);
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
      const res = await updatePlanTarget(targetDate);
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
      <DialogContent className="max-w-md border-[#262626] bg-[#0A0A0A] p-5 sm:p-6 text-white shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[#FF0000]/10 text-[#FF0000]">
              <Icon icon={Calendar03Icon} size={14} />
            </span>
            <DialogTitle className="text-base font-semibold text-white">
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
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#888888]">Current plan runway:</span>
              <span className="font-mono font-medium text-white">
                {initialDays} Days · Target: {dateLabel(currentTargetDate)}
              </span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-[#AAAAAA]">
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
                      "flex flex-col items-start justify-between rounded-md border p-2.5 text-left transition-all " +
                      (isSelected
                        ? "border-[#FF0000] bg-[#FF0000]/10 text-white shadow-[0_0_10px_rgba(255,0,0,0.2)]"
                        : preset.highlight
                          ? "border-[#333333] bg-[#141414] hover:border-[#FF0000]/50 text-white"
                          : "border-[#1F1F1F] bg-[#0E0E0E] hover:border-[#333333] text-[#CCCCCC]")
                    }
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-mono text-sm font-bold">
                        {preset.label}
                      </span>
                      {preset.highlight && (
                        <span className="rounded bg-[#FF0000] px-1 py-0.2 text-[9px] font-bold text-white">
                          HOT
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#888888]">{preset.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Duration or Date Options */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#1F1F1F]">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[#888888]">
                Custom Days
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min={7}
                  max={365}
                  value={days || ""}
                  onChange={(e) => {
                    setMode("custom_days");
                    handleCustomDaysChange(e.target.value);
                  }}
                  className="h-9 border-[#262626] bg-[#0E0E0E] font-mono text-sm text-white pr-12 focus-visible:border-[#FF0000]"
                  placeholder="e.g. 100"
                />
                <span className="pointer-events-none absolute right-2.5 top-2 text-xs font-mono text-[#666666]">
                  days
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-[#888888]">
                Target Date
              </label>
              <PlannerDateField
                label="Target date"
                min={today}
                max={maxSelectableDate}
                value={targetDate}
                onChange={(dateStr) => {
                  setMode("date");
                  handleDateChange(dateStr);
                }}
              />
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="rounded-md border border-[#262626] bg-[#0E0E0E] p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[#888888]">
              <span>Planned Duration:</span>
              <span className="font-mono font-semibold text-white">
                {days} Total Days
              </span>
            </div>
            <div className="flex items-center justify-between text-[#888888]">
              <span>Start — Target:</span>
              <span className="font-mono text-white">
                {dateLabel(startDate, { month: "short", day: "numeric" })} —{" "}
                {dateLabel(targetDate, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#888888]">
              <span>Runway Remaining:</span>
              <span className="font-mono font-bold text-[#FF0000]">
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

        <DialogFooter className="flex sm:justify-between gap-2 pt-2 border-t border-[#1F1F1F]">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
            className="border-[#262626] text-[#888888] hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={busy || days < 7}
            onClick={handleSave}
            className="bg-[#FF0000] text-white hover:bg-[#CC0000] font-semibold"
          >
            {busy ? "Updating..." : `Save ${days}-Day Runway`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

