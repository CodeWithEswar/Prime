"use client";

import * as React from "react";
import { Alert02Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { formatDurationCompact } from "../domain/projection";

export interface RebalancePreviewStripProps {
  diffs: Array<{
    date: string;
    previousMinutes: number;
    newMinutes: number;
  }>;
  onConfirm?: () => void;
  onDismiss?: () => void;
}

export function RebalancePreviewStrip({
  diffs,
  onConfirm,
  onDismiss,
}: RebalancePreviewStripProps) {
  if (!diffs || diffs.length === 0) return null;

  return (
    <div className="w-full p-3 sm:p-4 rounded-md bg-[#120E08] border border-[#3A2810] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <Icon icon={Alert02Icon} size={16} className="text-[#FFA116] flex-shrink-0" />
        <div className="space-y-0.5">
          <div className="font-mono font-bold text-white uppercase tracking-wider text-[11px]">
            REBALANCE DIFF PREVIEW · {diffs.length} DATES AFFECTED
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#D0D0D0]">
            {diffs.slice(0, 3).map((d) => (
              <span key={d.date} className="bg-[#1C150C] px-1.5 py-0.5 rounded border border-[#332210]">
                {d.date}: {formatDurationCompact(d.previousMinutes)} → {formatDurationCompact(d.newMinutes)}
              </span>
            ))}
            {diffs.length > 3 && (
              <span className="text-[#888888]">+{diffs.length - 3} more</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="px-2.5 py-1 rounded text-xs font-mono text-[#AAAAAA] hover:text-white"
          >
            Dismiss
          </button>
        )}
        {onConfirm && (
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1 rounded bg-[#FFA116] text-black font-mono text-xs font-bold hover:bg-[#E08F10]"
          >
            Apply Rebalance
          </button>
        )}
      </div>
    </div>
  );
}

