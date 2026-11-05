"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  CheckmarkBadge01Icon,
  Clock01Icon,
  Task01Icon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";
import type { OSProgressMetrics, OSDaySchedule } from "@/domain/os";

interface OSAnalyticsProps {
  metrics: OSProgressMetrics;
  days: OSDaySchedule[];
}

export function OSAnalytics({ metrics, days }: OSAnalyticsProps) {
  return (
    <div className="space-y-6 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 text-white">
      <div>
        <h2 className="text-lg font-semibold text-white">Operating Systems Learning Intelligence Analytics</h2>
        <p className="text-xs text-[#888888] mt-0.5">
          Authentic evidence-based metrics tracking verified video completion, interactive lab verification, and revision readiness.
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
            FSRS Spaced Repetition
          </span>
        </div>
      </div>

      {/* 12-Day Curriculum Topic Breakdown */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#888888]">
          Curriculum Coverage by Day
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {days.map((day) => (
            <div key={day.dayNumber} className="rounded-lg border border-[#1A1A1A] bg-[#121212] p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[#888888] font-bold">DAY {day.dayNumber}</span>
                <span className="text-[10px] text-[#666666]">~{day.estimatedMinutes}m</span>
              </div>
              <span className="mt-1 block font-semibold text-white line-clamp-1">{day.title}</span>
              <span className="text-[11px] text-[#777777] block line-clamp-1">{day.focus}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

