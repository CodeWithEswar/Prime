"use client";

import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
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

const trajectoryConfig: Record<
  PlanTrajectory,
  { label: string; dotClass: string; badgeClass: string }
> = {
  ahead: {
    label: "Ahead of schedule",
    dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
    badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  on_track: {
    label: "On track",
    dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
    badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  tight: {
    label: "Capacity tight",
    dotClass: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
    badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  at_risk: {
    label: "At risk",
    dotClass: "bg-[#FF0000] shadow-[0_0_8px_#FF0000]",
    badgeClass: "text-[#FF4D4D] bg-[#FF0000]/10 border-[#FF0000]/25",
  },
  behind: {
    label: "Behind schedule",
    dotClass: "bg-[#FF0000] shadow-[0_0_8px_#FF0000]",
    badgeClass: "text-[#FF4D4D] bg-[#FF0000]/10 border-[#FF0000]/25",
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
  const traj = trajectoryConfig[trajectory] || trajectoryConfig.on_track;
  const dayPad = dayNumber.toString().padStart(2, "0");
  const totalPad = totalDays.toString().padStart(2, "0");

  return (
    <header className="relative pb-5 border-b border-white/[0.08] space-y-4">
      {/* Top row: Eyebrow + Live Indicator on left, Action cluster on right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Eyebrow Navigation Tag */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-widest text-[#FF0000] uppercase bg-[#FF0000]/10 px-2 py-0.5 rounded border border-[#FF0000]/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF0000] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF0000]" />
            </span>
            TODAY / {displayDate}
          </div>
          <span className="text-neutral-600 font-mono text-xs">·</span>
          <span className="font-mono text-xs text-neutral-400 font-medium">
            {dayOfWeek}
          </span>
        </div>

        {/* Right HUD Badges: Day Counter, Trajectory, Ask PRIME */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Day Counter */}
          <div className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded bg-[#0A0A0A] border border-white/[0.08] text-neutral-400">
            <span>DAY</span>
            <span className="font-bold text-white">{dayPad}</span>
            <span className="text-neutral-600">/</span>
            <span>{totalPad}</span>
          </div>

          {/* Trajectory Badge */}
          <div
            className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold px-2.5 py-1 rounded border uppercase tracking-wider ${traj.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${traj.dotClass}`} />
            <span>{traj.label}</span>
          </div>

          {/* Ask PRIME Button */}
          {onOpenAI && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onOpenAI}
              className="gap-2 text-xs font-medium text-neutral-300 hover:text-white"
              title="Open PRIME AI Copilot (⌘K)"
            >
              <Icon
                icon={SparklesIcon}
                size={13}
                className="text-[#FF0000]"
              />
              <span className="font-sans">Ask PRIME</span>
              <kbd className="hidden sm:inline-block font-mono text-[10px] text-neutral-500 bg-neutral-900 px-1 rounded border border-neutral-800">
                ⌘K
              </kbd>
            </Button>
          )}
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
          Execute what matters.
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
          Daily deterministic execution runway · Retention reviews, focus sprints, and curriculum milestones.
        </p>
      </div>
    </header>
  );
}
