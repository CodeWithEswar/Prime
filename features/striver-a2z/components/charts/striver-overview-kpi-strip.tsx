"use client";

import * as React from "react";
import {
  VideoReplayIcon,
  CodeCircleIcon,
  Calendar01Icon,
  Award01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import type { StriverAnalyticsOverview } from "../../types";

interface StriverOverviewKpiStripProps {
  overview: StriverAnalyticsOverview;
}

export function StriverOverviewKpiStrip({ overview }: StriverOverviewKpiStripProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
      {/* 1. Lectures Completed */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0A]/95 p-4 space-y-2 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between text-neutral-400 text-xs">
          <span className="flex items-center gap-1.5 font-semibold uppercase text-[10px] tracking-wider">
            <Icon icon={VideoReplayIcon} size={13} className="text-[#FF0000]" />
            Lectures
          </span>
          <span className="text-[10px] text-neutral-500">{overview.lecturePct}%</span>
        </div>

        <div className="space-y-1">
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {overview.completedLectures}
            <span className="text-xs text-neutral-500 font-normal"> / {overview.totalLectures}</span>
          </div>
          <Progress value={overview.lecturePct} className="h-1 bg-white/[0.06] [&>div]:bg-[#FF0000]" />
        </div>
      </div>

      {/* 2. Problems Solved */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0A]/95 p-4 space-y-2 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between text-neutral-400 text-xs">
          <span className="flex items-center gap-1.5 font-semibold uppercase text-[10px] tracking-wider">
            <Icon icon={CodeCircleIcon} size={13} className="text-emerald-400" />
            Problems
          </span>
          <span className="text-[10px] text-neutral-500">{overview.problemPct}%</span>
        </div>

        <div className="space-y-1">
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {overview.solvedProblems}
            <span className="text-xs text-neutral-500 font-normal"> / {overview.totalProblems}</span>
          </div>
          <Progress value={overview.problemPct} className="h-1 bg-white/[0.06] [&>div]:bg-emerald-500" />
        </div>
      </div>

      {/* 3. Consistency Momentum */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0A]/95 p-4 space-y-2 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between text-neutral-400 text-xs">
          <span className="flex items-center gap-1.5 font-semibold uppercase text-[10px] tracking-wider">
            <Icon icon={Calendar01Icon} size={13} className="text-amber-400" />
            Active Days
          </span>
          <span className="text-[10px] text-neutral-500">30D Window</span>
        </div>

        <div className="space-y-1">
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {overview.activeStudyDays}
            <span className="text-xs text-neutral-500 font-normal"> Days Active</span>
          </div>
          <div className="text-[11px] text-neutral-400 font-sans truncate">
            {overview.activeStudyDays > 5 ? "Strong study habit established" : "Build your daily study streak"}
          </div>
        </div>
      </div>

      {/* 4. Track Mastery */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0A]/95 p-4 space-y-2 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between text-neutral-400 text-xs">
          <span className="flex items-center gap-1.5 font-semibold uppercase text-[10px] tracking-wider">
            <Icon icon={Award01Icon} size={13} className="text-purple-400" />
            Track Mastery
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold">{overview.masteryPct}%</span>
        </div>

        <div className="space-y-1">
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {overview.masteryPct >= 70 ? "Proficient" : overview.masteryPct >= 40 ? "Developing" : "Learning"}
          </div>
          <Progress value={overview.masteryPct} className="h-1 bg-white/[0.06] [&>div]:bg-purple-500" />
        </div>
      </div>
    </div>
  );
}

