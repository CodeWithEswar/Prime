"use client";

import { Icon } from "@/components/ui/icon";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import type { PlanTrajectory } from "../types";

interface TodayHeaderProps {
  displayDate: string;
  dayOfWeek: string;
  dayNumber: number;
  totalDays: number;
  trajectory: PlanTrajectory;
  onOpenAI?: () => void;
}

const trajectoryLabels: Record<PlanTrajectory, { label: string; className: string }> = {
  ahead: {
    label: "AHEAD OF SCHEDULE",
    className: "text-white bg-white/10 border-white/20",
  },
  on_track: {
    label: "ON TRACK",
    className: "text-white bg-white/10 border-white/20",
  },
  tight: {
    label: "CAPACITY TIGHT",
    className: "text-[#EAB308] bg-[#EAB308]/10 border-[#EAB308]/30",
  },
  at_risk: {
    label: "AT RISK",
    className: "text-[#FF4D4D] bg-[#FF0000]/15 border-[#FF0000]/30",
  },
  behind: {
    label: "BEHIND SCHEDULE",
    className: "text-[#FF4D4D] bg-[#FF0000]/15 border-[#FF0000]/30",
  },
};

export function TodayHeader({
  displayDate,
  dayOfWeek,
  dayNumber,
  totalDays,
  trajectory,
  onOpenAI,
}: TodayHeaderProps) {
  const traj = trajectoryLabels[trajectory] || trajectoryLabels.on_track;
  const dayPad = dayNumber.toString().padStart(2, "0");
  const totalPad = totalDays.toString().padStart(2, "0");

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#141414]">
      {/* Left: Date, Day, Purpose */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-widest text-[#FF0000] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000]" />
            TODAY / {displayDate}
          </span>
          <span className="text-[#333333]">·</span>
          <span className="font-mono text-[11px] text-[#888888] font-medium">{dayOfWeek}</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Execute what matters.
        </h1>
      </div>

      {/* Right: Day Counter, Trajectory Badge & Ask PRIME */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
        {/* Day Number */}
        <div className="font-mono text-xs text-[#888888] bg-[#0A0A0A] px-2.5 py-1.5 rounded border border-[#1A1A1A]">
          DAY <span className="font-bold text-white">{dayPad}</span> / {totalPad}
        </div>

        {/* Trajectory */}
        <div
          className={`font-mono text-[10px] font-bold px-2.5 py-1.5 rounded border uppercase tracking-wider ${traj.className}`}
        >
          {traj.label}
        </div>

        {/* Ask PRIME Button */}
        {onOpenAI && (
          <button
            type="button"
            onClick={onOpenAI}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-[#CCCCCC] hover:text-white bg-[#0D0D0D] hover:bg-[#161616] border border-[#222222] transition-colors"
          >
            <Icon icon={SparklesIcon} size={13} className="text-[#FF0000]" />
            <span>Ask PRIME</span>
          </button>
        )}
      </div>
    </header>
  );
}

