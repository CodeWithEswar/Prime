"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Icon } from "@/components/ui/icon";
import {
  Analytics01Icon,
  CheckmarkBadge01Icon,
  Clock01Icon,
  Layers01Icon,
  CodeIcon,
} from "@hugeicons/core-free-icons";
import type {
  OOPDaySchedule,
  OOPProgressMetrics,
  UserOOPDayProgress,
} from "@/domain/oop";

interface OOPAnalyticsProps {
  metrics: OOPProgressMetrics;
  days: OOPDaySchedule[];
  dayProgress: Record<number, UserOOPDayProgress>;
}

export function OOPAnalytics({ metrics, days, dayProgress }: OOPAnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1F1F1F] pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000]">
              Evidence-Based Intelligence
            </span>
            <Badge variant="outline" className="border-[#262626] bg-[#141414] text-[#CCCCCC]">
              Verifiable Progress
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            OOP Competency Observatory & Study Analytics
          </h2>
        </div>
      </div>

      {/* 4 Core Quantitative Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 font-mono">
          <span className="text-[10px] uppercase text-[#888888]">Course Completion</span>
          <div className="mt-2 text-2xl font-bold text-[#FF4D4D]">{metrics.coursePercentage}%</div>
          <Progress value={metrics.coursePercentage} className="mt-3 h-1.5 bg-[#161616]" />
        </div>

        <div className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 font-mono">
          <span className="text-[10px] uppercase text-[#888888]">Curriculum Days</span>
          <div className="mt-2 text-2xl font-bold text-white">
            {metrics.completedDays} / {metrics.totalDays}
          </div>
          <div className="mt-2 text-[11px] text-[#666666]">
            {metrics.totalDays - metrics.completedDays} days remaining
          </div>
        </div>

        <div className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 font-mono">
          <span className="text-[10px] uppercase text-[#888888]">Video Lessons</span>
          <div className="mt-2 text-2xl font-bold text-white">
            {metrics.watchedVideos} / {metrics.totalVideos}
          </div>
          <div className="mt-2 text-[11px] text-[#666666]">
            {metrics.completedSegments} / {metrics.totalSegments} segments
          </div>
        </div>

        <div className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 font-mono">
          <span className="text-[10px] uppercase text-[#888888]">Labs & LLD Cases</span>
          <div className="mt-2 text-2xl font-bold text-white">
            {metrics.completedLabs + metrics.completedDesignCases} / 20
          </div>
          <div className="mt-2 text-[11px] text-[#666666]">
            {metrics.completedLabs} labs, {metrics.completedDesignCases} LLD
          </div>
        </div>
      </div>

      {/* 12-Day Verification Matrix */}
      <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5">
        <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
            12-Day Competency Coverage Matrix
          </span>
          <span className="text-xs text-[#666666]">Actual evidence records</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {days.map((day) => {
            const isCompleted = Boolean(dayProgress[day.dayNumber]?.assignmentCompleted);
            return (
              <div
                key={day.dayNumber}
                className={`rounded-lg border p-3 font-mono text-xs transition-all ${
                  isCompleted
                    ? "border-green-500/30 bg-[#0E150F]"
                    : "border-[#1F1F1F] bg-[#121212]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={isCompleted ? "font-bold text-green-400" : "font-bold text-white"}>
                    Day {day.dayNumber.toString().padStart(2, "0")}: {day.title}
                  </span>
                  {isCompleted ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <span className="text-[10px] text-[#666666] uppercase">{day.difficulty}</span>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-[#888888] line-clamp-1">{day.focus}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

