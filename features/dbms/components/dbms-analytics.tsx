"use client";

import { Progress } from "@/components/ui/progress";
import { Icon } from "@/components/ui/icon";
import {
  Tick02Icon,
  CheckmarkBadge01Icon,
  Award01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import type { DBMSProgressMetrics, DBMSDaySchedule, UserDayProgress } from "@/domain/dbms";

interface DBMSAnalyticsProps {
  metrics: DBMSProgressMetrics;
  days: DBMSDaySchedule[];
  dayProgress: Record<number, UserDayProgress>;
}

export function DBMSAnalytics({ metrics, days, dayProgress }: DBMSAnalyticsProps) {
  const totalHours = Math.round(metrics.totalMinutes / 60);
  const watchedHours = Math.round(metrics.watchedMinutes / 60);

  return (
    <div className="space-y-6 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 sm:p-8">
      {/* Header */}
      <div className="border-b border-[#1A1A1A] pb-5">
        <h2 className="text-xl font-bold text-white sm:text-2xl">
          DBMS Mastery Intelligence & Learning Analytics
        </h2>
        <p className="text-xs text-[#888888] sm:text-sm">
          Evidence-based metrics tracking your progress across all 12 study units and 91 canonical video lectures.
        </p>
      </div>

      {/* High-level Metric Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[#222222] bg-[#111111] p-4">
          <span className="text-xs text-[#888888]">Curriculum Completion</span>
          <p className="mt-1 font-mono text-2xl font-bold text-white">
            {metrics.percentageComplete}%
          </p>
          <Progress
            value={metrics.percentageComplete}
            className="mt-3 h-1.5 bg-[#202020]"
            indicatorClassName="bg-[#FF0000]"
          />
        </div>

        <div className="rounded-lg border border-[#222222] bg-[#111111] p-4">
          <span className="text-xs text-[#888888]">Lectures Watched</span>
          <p className="mt-1 font-mono text-2xl font-bold text-white">
            {metrics.watchedVideos}{" "}
            <span className="text-xs font-normal text-[#666666]">/ {metrics.totalVideos}</span>
          </p>
          <p className="mt-2 text-[11px] text-[#777777]">
            {metrics.totalVideos - metrics.watchedVideos} lessons remaining
          </p>
        </div>

        <div className="rounded-lg border border-[#222222] bg-[#111111] p-4">
          <span className="text-xs text-[#888888]">Time Invested</span>
          <p className="mt-1 font-mono text-2xl font-bold text-white">
            {watchedHours}h{" "}
            <span className="text-xs font-normal text-[#666666]">/ {totalHours}h</span>
          </p>
          <p className="mt-2 text-[11px] text-[#777777]">
            ~{Math.max(0, totalHours - watchedHours)} hours remaining
          </p>
        </div>

        <div className="rounded-lg border border-[#222222] bg-[#111111] p-4">
          <span className="text-xs text-[#888888]">Days Completed</span>
          <p className="mt-1 font-mono text-2xl font-bold text-white">
            {metrics.completedDays}{" "}
            <span className="text-xs font-normal text-[#666666]">/ 12</span>
          </p>
          <p className="mt-2 text-[11px] text-[#777777]">
            Currently on Day {metrics.currentDay}
          </p>
        </div>
      </div>

      {/* Topic Mastery Progress Bars */}
      <div className="space-y-4 rounded-lg border border-[#202020] bg-[#101010] p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Topic Domain Mastery Breakdown
        </h3>

        <div className="space-y-3.5">
          {metrics.topicsMastery.map((topic) => (
            <div key={topic.topicSlug} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{topic.topicTitle}</span>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                      topic.masteryStatus === "mastered"
                        ? "bg-white text-black"
                        : topic.masteryStatus === "in_progress"
                        ? "bg-[#FF0000]/20 text-[#FF6B6B]"
                        : "bg-[#1C1C1C] text-[#777777]"
                    }`}
                  >
                    {topic.masteryStatus === "mastered"
                      ? "Mastered"
                      : topic.masteryStatus === "in_progress"
                      ? "In Progress"
                      : "Not Started"}
                  </span>
                </div>

                <span className="font-mono text-[#888888]">
                  {topic.watchedVideos} / {topic.totalVideos} ({topic.percentage}%)
                </span>
              </div>

              <Progress
                value={topic.percentage}
                className="h-1.5 bg-[#1C1C1C]"
                indicatorClassName={topic.percentage === 100 ? "bg-white" : "bg-[#FF0000]"}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 12-Day Completion Status Grid */}
      <div className="space-y-3 rounded-lg border border-[#202020] bg-[#101010] p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          12-Day Milestones
        </h3>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {days.map((day) => {
            const isDone = !!dayProgress[day.dayNumber]?.assignmentCompleted;

            return (
              <div
                key={day.dayNumber}
                className={`flex items-center justify-between rounded-md border p-2.5 text-xs ${
                  isDone
                    ? "border-[#333333] bg-[#181818] text-white"
                    : "border-[#1A1A1A] bg-[#0E0E0E] text-[#777777]"
                }`}
              >
                <span className="font-mono font-medium">Day {day.dayNumber}</span>
                {isDone ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-black">
                    <Icon icon={Tick02Icon} size={10} strokeWidth={2.5} />
                  </span>
                ) : (
                  <span className="text-[10px] text-[#555555]">Pending</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

