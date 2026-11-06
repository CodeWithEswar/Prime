"use client";

import { Icon } from "@/components/ui/icon";
import {
  DashboardSpeed01Icon,
  RotateRight01Icon,
  TimelineIcon,
} from "@hugeicons/core-free-icons";
import type { TodaySnapshot } from "../types";
import { formatDuration } from "./daily-load-strip";

interface DayContextRailProps {
  snapshot: TodaySnapshot;
}

/**
 * Desktop Context Rail
 * High-clarity sidebar showing capacity utilization gauge, retention metrics, and sprint trajectory.
 */
export function DayContextRail({ snapshot }: DayContextRailProps) {
  const { capacity, revision, plan, dayNumber, totalDays } = snapshot;

  const sprintPercentage =
    totalDays > 0 ? Math.min(100, Math.round((dayNumber / totalDays) * 100)) : 0;

  return (
    <aside
      aria-label="Today preparation context telemetry"
      className="hidden lg:block w-80 shrink-0 space-y-4"
    >
      <div className="p-5 rounded-lg bg-[#070707] border border-white/[0.08] space-y-5 shadow-sm">
        {/* Module 1: Day Capacity Allocation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-bold flex items-center gap-1.5">
              <Icon icon={DashboardSpeed01Icon} size={13} className="text-[#FF0000]" />
              Capacity Allocation
            </span>
            <span className="font-mono text-xs font-semibold text-white">
              {formatDuration(capacity.plannedMinutes)} / {formatDuration(capacity.availableMinutes)}
            </span>
          </div>

          <div className="relative w-full h-1.5 bg-[#121212] rounded-full overflow-hidden border border-white/[0.05]">
            <div
              className={`h-full transition-all duration-300 ${
                capacity.isExceeded
                  ? "bg-[#FF0000]"
                  : capacity.utilizationRate > 85
                    ? "bg-amber-400"
                    : "bg-white"
              }`}
              style={{ width: `${Math.min(100, capacity.utilizationRate)}%` }}
            />
          </div>

          <p className="font-mono text-[11px] text-neutral-500 leading-relaxed">
            {capacity.utilizationRate}% utilized.{" "}
            {capacity.isExceeded
              ? "Exceeds daily target buffer."
              : "Fits within optimal 85% planning buffer."}
          </p>
        </div>

        <div className="h-[1px] bg-white/[0.06]" />

        {/* Module 2: Retention Obligations */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-bold flex items-center gap-1.5">
              <Icon icon={RotateRight01Icon} size={13} className="text-neutral-400" />
              Retention Backlog
            </span>
            <span
              className={`font-mono text-xs font-bold ${
                revision.dueTodayCount > 0 ? "text-[#FF4D4D]" : "text-white"
              }`}
            >
              {revision.dueTodayCount} due today
            </span>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
            {revision.dueTodayCount === 0
              ? "All spaced reviews clear. Retention ladder intact."
              : `${revision.dueTodayCount} spaced repetition problem${
                  revision.dueTodayCount !== 1 ? "s" : ""
                } scheduled to reinforce memory retention.`}
          </p>
        </div>

        <div className="h-[1px] bg-white/[0.06]" />

        {/* Module 3: Active Preparation Plan Trajectory */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-bold flex items-center gap-1.5">
              <Icon icon={TimelineIcon} size={13} className="text-neutral-400" />
              Plan Trajectory
            </span>
            <span className="font-mono text-xs font-bold uppercase text-emerald-400">
              {plan.trajectory.replace(/_/g, " ")}
            </span>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
            Day {dayNumber} of {totalDays} ({sprintPercentage}%). Workload remains deterministic and aligned with your interview timeline.
          </p>
        </div>
      </div>
    </aside>
  );
}
