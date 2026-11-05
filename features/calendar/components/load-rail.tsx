"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getLoadRailMetrics, formatDurationCompact } from "../domain/projection";

export interface LoadRailProps {
  plannedMinutes: number;
  availableMinutes: number;
  completedMinutes?: number;
  isRestDay?: boolean;
  size?: "compact" | "default" | "detailed";
  className?: string;
  showText?: boolean;
}

/**
 * Signature Preparation Load Rail
 * Visualizes planned vs available capacity with completion fill,
 * over-capacity alerts, and rest-day states.
 * Uses semantic CSS/SVG (no heavy canvas, no color pollution).
 */
export function LoadRail({
  plannedMinutes,
  availableMinutes,
  completedMinutes = 0,
  isRestDay = false,
  size = "compact",
  className,
  showText = false,
}: LoadRailProps) {
  const { fillRatio, completedRatio, isOverCapacity, overflowMinutes } =
    getLoadRailMetrics(plannedMinutes, availableMinutes, completedMinutes);

  // Height sizing
  const railHeight =
    size === "detailed" ? "h-2" : size === "default" ? "h-1.5" : "h-1";

  if (isRestDay) {
    return (
      <div
        className={cn("w-full flex items-center gap-1.5", className)}
        title="Scheduled Rest Day"
        aria-label="Scheduled Rest Day"
      >
        <div className="w-full flex items-center justify-center gap-1 py-0.5">
          <span className="w-1 h-1 rounded-full bg-[#444444]" />
          <span className="w-1 h-1 rounded-full bg-[#333333]" />
          <span className="w-1 h-1 rounded-full bg-[#222222]" />
        </div>
        {showText && (
          <span className="font-mono text-[10px] text-[#777777] uppercase tracking-wider">
            REST
          </span>
        )}
      </div>
    );
  }

  // Width percentages
  const plannedPercent = Math.min(100, Math.round(fillRatio * 100));
  const completedPercent = Math.min(100, Math.round(completedRatio * 100));

  return (
    <div className={cn("w-full space-y-1", className)}>
      <div
        className={cn(
          "w-full bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden relative flex items-center",
          railHeight
        )}
        title={`${formatDurationCompact(plannedMinutes)} planned of ${formatDurationCompact(availableMinutes)} capacity${isOverCapacity ? ` (${overflowMinutes}m over capacity)` : ""}`}
        aria-label={`${plannedMinutes} minutes planned of ${availableMinutes} minutes capacity`}
      >
        {/* Planned Rail (Muted White) */}
        <div
          className="h-full bg-[rgba(255,255,255,0.4)] rounded-full relative"
          style={{ width: `${plannedPercent}%` }}
        >
          {/* Completed Portion (Pure White) */}
          {completedPercent > 0 && (
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${completedPercent}%` }}
            />
          )}
        </div>

        {/* Over-capacity overflow signal */}
        {isOverCapacity && (
          <div
            className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#FF0000] rounded-r-full shadow-[0_0_6px_rgba(255,0,0,0.8)]"
            title={`${overflowMinutes}m over configured capacity`}
          />
        )}
      </div>

      {showText && (
        <div className="flex items-center justify-between text-[10px] font-mono text-[#888888]">
          <span>
            {formatDurationCompact(plannedMinutes)} / {formatDurationCompact(availableMinutes)}
          </span>
          {isOverCapacity && (
            <span className="text-[#FF0000] font-semibold">
              +{overflowMinutes}m OVER
            </span>
          )}
        </div>
      )}
    </div>
  );
}

