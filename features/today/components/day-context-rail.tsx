"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import {
  DashboardSpeed01Icon,
  RotateRight01Icon,
  TimelineIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import type { TodaySnapshot } from "../types";
import { formatDuration } from "./daily-load-strip";

interface DayContextRailProps {
  snapshot: TodaySnapshot;
}

/**
 * Mobile Telemetry Summary Strip
 * Provides mobile users instant visibility into capacity, retention obligations, and sprint trajectory.
 */
export function MobileDayContext({ snapshot }: DayContextRailProps) {
  const { capacity, revision, plan, dayNumber, totalDays } = snapshot;
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const sprintPercentage =
    totalDays > 0 ? Math.min(100, Math.round((dayNumber / totalDays) * 100)) : 0;

  return (
    <div className="block lg:hidden w-full rounded-lg bg-[#080808] border border-white/[0.08] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setMobileExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-3.5 text-xs font-mono text-neutral-300 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-neutral-300">
            <Icon icon={DashboardSpeed01Icon} size={14} className="text-[#FF0000]" />
            <span className="font-semibold">{capacity.utilizationRate}%</span> Capacity
          </span>
          <span className="text-neutral-700">·</span>
          <span className="text-neutral-400">
            <strong className="text-white font-semibold">{revision.dueTodayCount}</strong> Due
          </span>
          <span className="text-neutral-700">·</span>
          <span className="text-emerald-400 font-semibold">
            Day {dayNumber}/{totalDays}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-sans shrink-0">
          <span>{mobileExpanded ? "Hide" : "Details"}</span>
          <Icon
            icon={mobileExpanded ? ArrowUp01Icon : ArrowDown01Icon}
            size={14}
          />
        </div>
      </button>

      {mobileExpanded && (
        <div className="p-3.5 pt-0 border-t border-white/[0.05] space-y-3 font-sans text-xs animate-in fade-in">
          {/* Capacity detail */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[11px] text-neutral-400">
              <span>Capacity Allocation</span>
              <span className="text-white font-semibold">
                {formatDuration(capacity.plannedMinutes)} / {formatDuration(capacity.availableMinutes)}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              {capacity.utilizationRate}% utilized.{" "}
              {capacity.isExceeded
                ? "Exceeds daily budget."
                : "Fits within optimal 85% planning buffer."}
            </p>
          </div>

          {/* Retention detail */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[11px] text-neutral-400">
              <span>Retention Backlog</span>
              <span className="text-white font-semibold">
                {revision.dueTodayCount} due · {revision.overdueCount} overdue
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Scheduled by spaced repetition ladder before memory trace decays.
            </p>
          </div>

          {/* Plan trajectory detail */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[11px] text-neutral-400">
              <span>Runway Sprint</span>
              <span className="text-emerald-400 font-semibold uppercase">
                {plan.trajectory.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Day {dayNumber} of {totalDays} ({sprintPercentage}% of sprint completed).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Desktop Aerospace Telemetry Rail
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
            <span className="font-mono text-[10px] text-neutral-400 font-semibold">
              {capacity.utilizationRate}%
            </span>
          </div>

          <div className="text-base font-bold text-white font-mono tracking-tight">
            {formatDuration(capacity.plannedMinutes)}{" "}
            <span className="text-neutral-500 font-normal text-xs">
              / {formatDuration(capacity.availableMinutes)} available
            </span>
          </div>

          {/* Mini Capacity Gauge */}
          <div className="relative w-full h-1.5 bg-[#141414] rounded-full overflow-hidden">
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

          <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
            {capacity.isExceeded
              ? "Exceeds daily budget. Move non-critical tasks to tomorrow."
              : "Fits within optimal 85% planning buffer with time for reflection."}
          </p>
        </div>

        <div className="h-[1px] bg-white/[0.06]" />

        {/* Module 2: Retention Obligations */}
        <div className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-bold flex items-center gap-1.5">
            <Icon icon={RotateRight01Icon} size={13} className="text-neutral-400" />
            Retention Backlog
          </span>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="inline-flex items-center gap-1.5 bg-neutral-900 px-2.5 py-1 rounded border border-white/[0.06]">
              <span className="font-bold text-white">{revision.dueTodayCount}</span>
              <span className="text-neutral-400 text-[11px]">due today</span>
            </div>

            {revision.overdueCount > 0 && (
              <div className="inline-flex items-center gap-1.5 bg-[#2A0505] px-2.5 py-1 rounded border border-[#FF0000]/30 text-[#FF4D4D]">
                <span className="font-bold">{revision.overdueCount}</span>
                <span className="text-[11px]">overdue</span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
            Scheduled by spaced repetition ladder before memory trace decays.
          </p>
        </div>

        <div className="h-[1px] bg-white/[0.06]" />

        {/* Module 3: Plan Trajectory & Sprint Timeline */}
        <div className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-bold flex items-center gap-1.5">
            <Icon icon={TimelineIcon} size={13} className="text-neutral-400" />
            Plan Trajectory
          </span>

          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-white uppercase tracking-wider">
              {plan.trajectory.replace(/_/g, " ")}
            </span>
            <span className="text-neutral-400 font-semibold">
              Day {dayNumber} / {totalDays}
            </span>
          </div>

          {/* Sprint Progress Track */}
          <div className="relative w-full h-1.5 bg-[#141414] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${sprintPercentage}%` }}
            />
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
            {sprintPercentage}% of preparation sprint completed. Workload remains deterministic and aligned with your interview date.
          </p>
        </div>
      </div>
    </aside>
  );
}
