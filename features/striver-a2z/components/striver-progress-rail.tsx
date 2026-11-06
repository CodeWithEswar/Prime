"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChartLineData02Icon,
  VideoReplayIcon,
  CodeCircleIcon,
  RepeatIcon,
  Award01Icon,
  PlayIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { StriverSheetDetail } from "../types";

interface StriverProgressRailProps {
  sheetDetail: StriverSheetDetail;
  onOpenAnalytics?: () => void;
  onContinueNext: () => void;
}

export function StriverProgressRail({
  sheetDetail,
  onOpenAnalytics,
  onContinueNext,
}: StriverProgressRailProps) {
  const { overallStats } = sheetDetail;

  return (
    <div className="space-y-4">
      {/* 1. Continue Learning Hero Card */}
      <div className="rounded-xl border border-white/[0.1] bg-gradient-to-b from-[#180000] via-[#0E0E0E] to-[#0A0A0A] p-4 space-y-3 shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#FF0000]/15 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
            Resume Curriculum
          </span>
          <Badge
            variant="outline"
            className="font-mono text-[10px] bg-[#FF0000]/10 text-[#FF0000] border-[#FF0000]/20"
          >
            ACTIVE TRACK
          </Badge>
        </div>

        <div className="space-y-1">
          <h4 className="font-mono text-xs font-semibold text-white">
            Striver A2Z Mastery Runway
          </h4>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Pick up where you left off. Jump directly into your next scheduled lecture or unsolved problem.
          </p>
        </div>

        <Button
          size="sm"
          onClick={onContinueNext}
          className="w-full h-8 text-xs font-mono font-medium bg-[#FF0000] hover:bg-[#CC0000] text-white gap-1.5 shadow-sm"
        >
          <Icon icon={PlayIcon} size={13} />
          <span>Continue Next</span>
        </Button>
      </div>

      {/* 2. Three Distinct Progress Indicators */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0A]/90 backdrop-blur-md p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
          <div className="flex items-center gap-2">
            <Icon icon={Award01Icon} size={15} className="text-[#FF0000]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
              Learning Metric Rails
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-6 px-2 text-[10px] font-mono text-neutral-400 hover:text-white gap-1"
          >
            <Link href="/practice/dsa/sheets/striver-a2z/analytics">
              <Icon icon={ChartLineData02Icon} size={12} />
              <span>Full Analytics</span>
            </Link>
          </Button>
        </div>

        {/* Video Learning Dimension */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <Icon icon={VideoReplayIcon} size={12} className="text-neutral-500" />
              Lectures Watched
            </span>
            <span className="text-white font-medium">
              {overallStats.completedVideos} / {overallStats.totalVideos} ({overallStats.videoProgressPercentage}%)
            </span>
          </div>
          <Progress
            value={overallStats.videoProgressPercentage}
            className="h-1.5 bg-neutral-900 [&>div]:bg-[#FF0000]"
          />
        </div>

        {/* Coding Problems Dimension */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <Icon icon={CodeCircleIcon} size={12} className="text-neutral-500" />
              Problems Solved
            </span>
            <span className="text-white font-medium">
              {overallStats.solvedProblems} / {overallStats.totalProblems} ({overallStats.problemProgressPercentage}%)
            </span>
          </div>
          <Progress
            value={overallStats.problemProgressPercentage}
            className="h-1.5 bg-neutral-900 [&>div]:bg-emerald-500"
          />
        </div>

        {/* Topic Mastery Dimension */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <Icon icon={Award01Icon} size={12} className="text-neutral-500" />
              Curriculum Mastery
            </span>
            <span className="text-white font-medium">
              {overallStats.masteryPercentage}%
            </span>
          </div>
          <Progress
            value={overallStats.masteryPercentage}
            className="h-1.5 bg-neutral-900 [&>div]:bg-amber-500"
          />
        </div>

        {/* Spaced Repetition Due Queue */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between font-mono text-xs">
          <span className="flex items-center gap-1.5 text-neutral-400">
            <Icon icon={RepeatIcon} size={12} className="text-neutral-500" />
            Revision Backlog
          </span>
          <span
            className={
              overallStats.dueRevisionsCount > 0
                ? "text-rose-400 font-semibold"
                : "text-neutral-500 font-medium"
            }
          >
            {overallStats.dueRevisionsCount} Due Today
          </span>
        </div>
      </div>

      {/* 3. Official Attribution Badge */}
      <div className="rounded-xl border border-white/[0.06] bg-black/40 p-3 space-y-1.5">
        <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
          Curated Syllabus
        </div>
        <p className="font-mono text-[11px] text-neutral-400">
          Created by <strong>Striver (takeUforward)</strong>. Verified against the official 20-module A2Z directory with 299 video lessons and 372 practice problems.
        </p>
      </div>
    </div>
  );
}

