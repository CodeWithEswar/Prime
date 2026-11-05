"use client";

import type { TodaySnapshot } from "../types";
import { formatDuration } from "./daily-load-strip";

interface DayContextRailProps {
  snapshot: TodaySnapshot;
}

export function DayContextRail({ snapshot }: DayContextRailProps) {
  const { capacity, revision, plan, dayNumber, totalDays } = snapshot;

  return (
    <aside
      aria-label="Today preparation context"
      className="hidden lg:block w-72 shrink-0 space-y-5"
    >
      <div className="p-4 rounded-lg bg-[#080808] border border-[#161616] space-y-4">
        {/* Module 1: Day Capacity */}
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#666666] block mb-1">
            Capacity Allocation
          </span>
          <div className="text-sm font-semibold text-white font-mono">
            {formatDuration(capacity.plannedMinutes)}{" "}
            <span className="text-[#666666] font-normal">
              / {formatDuration(capacity.availableMinutes)}
            </span>
          </div>
          <p className="text-[11px] text-[#777777] mt-1 leading-normal">
            {capacity.utilizationRate}% utilized.{" "}
            {capacity.isExceeded
              ? "Exceeds daily budget."
              : "Fits within optimal 85% planning buffer."}
          </p>
        </div>

        <div className="h-[1px] bg-[#141414]" />

        {/* Module 2: Retention Obligations */}
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#666666] block mb-1">
            Retention Backlog
          </span>
          <div className="flex items-center gap-3 font-mono text-xs">
            <div>
              <span className="font-bold text-white">{revision.dueTodayCount}</span>{" "}
              <span className="text-[#777777]">due today</span>
            </div>
            {revision.overdueCount > 0 && (
              <>
                <span className="text-[#333333]">·</span>
                <div>
                  <span className="font-bold text-[#FF4D4D]">{revision.overdueCount}</span>{" "}
                  <span className="text-[#FF4D4D]">overdue</span>
                </div>
              </>
            )}
          </div>
          <p className="text-[11px] text-[#777777] mt-1 leading-normal">
            Scheduled by spaced repetition ladder before memory trace decays.
          </p>
        </div>

        <div className="h-[1px] bg-[#141414]" />

        {/* Module 3: Plan Trajectory */}
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#666666] block mb-1">
            Plan Trajectory
          </span>
          <div className="text-xs font-mono font-semibold text-white uppercase">
            {plan.trajectory.replace(/_/g, " ")}
          </div>
          <p className="text-[11px] text-[#777777] mt-1 leading-normal">
            Day {dayNumber} of {totalDays}. Workload remains deterministic and aligned with your interview timeline.
          </p>
        </div>
      </div>
    </aside>
  );
}

