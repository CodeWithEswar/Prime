"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  CheckmarkBadge01Icon,
  Clock01Icon,
  Task01Icon,
  Layers01Icon,
  Globe02Icon,
} from "@hugeicons/core-free-icons";
import type { CNProgressMetrics, CNDaySchedule } from "@/domain/cn";

interface CNAnalyticsProps {
  metrics: CNProgressMetrics;
  days: CNDaySchedule[];
}

export function CNAnalytics({ metrics, days }: CNAnalyticsProps) {
  return (
    <div className="space-y-6 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 text-white">
      <div>
        <h2 className="text-lg font-semibold text-white">Computer Networks Learning Analytics & Observability</h2>
        <p className="text-xs text-[#888888] mt-0.5">
          Authentic evidence-based metrics tracking verified video completion, 10 interactive network engineering laboratories, and interview readiness.
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-4 text-center">
          <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
            Overall Completion
          </span>
          <span className="mt-1 block text-2xl font-bold font-mono text-[#FF4D4D]">
            {metrics.completionPercentage}%
          </span>
          <Progress value={metrics.completionPercentage} className="h-1.5 mt-2 bg-[#1A1A1A]" />
        </div>

        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-4 text-center">
          <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
            Video Lessons
          </span>
          <span className="mt-1 block text-2xl font-bold font-mono text-white">
            {metrics.watchedVideos} / {metrics.totalVideos}
          </span>
          <span className="text-[10px] text-[#777777] block mt-1">
            {Math.round((metrics.watchedVideos / metrics.totalVideos) * 100) || 0}% covered
          </span>
        </div>

        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-4 text-center">
          <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
            Labs Completed
          </span>
          <span className="mt-1 block text-2xl font-bold font-mono text-[#4ade80]">
            {metrics.labsCompletedCount} / {metrics.totalLabs}
          </span>
          <span className="text-[10px] text-[#777777] block mt-1">
            Deterministic verifications
          </span>
        </div>

        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-4 text-center">
          <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
            Revisions Due
          </span>
          <span className="mt-1 block text-2xl font-bold font-mono text-amber-400">
            {metrics.revisionDueCount}
          </span>
          <span className="text-[10px] text-[#777777] block mt-1">
            FSRS spaced interval items
          </span>
        </div>
      </div>

      {/* Curriculum Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
          Day-by-Day Mastery Distribution
        </h3>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {days.map((day) => (
            <div
              key={day.dayNumber}
              className="rounded-lg border border-[#1A1A1A] bg-[#0E0E0E] p-3 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#FF4D4D]">
                  DAY {day.dayNumber.toString().padStart(2, "0")}
                </span>
                <Badge variant="outline" className="border-white/10 text-[9px] text-[#AAAAAA]">
                  {day.level}
                </Badge>
              </div>
              <div className="font-semibold text-white truncate">{day.title}</div>
              <div className="text-[11px] text-[#777777] truncate">{day.focus}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

