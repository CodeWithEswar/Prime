"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  Analytics01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Award01Icon,
  SourceCodeIcon,
} from "@hugeicons/core-free-icons";
import type {
  DataEngineeringProgressMetrics,
  DataEngineeringStageSchedule,
  UserStageProgress,
} from "@/domain/data-engineering";

interface AnalyticsProps {
  metrics: DataEngineeringProgressMetrics;
  stages: DataEngineeringStageSchedule[];
  stageProgress: Record<number, UserStageProgress>;
}

export function DataEngineeringAnalytics({
  metrics,
  stages,
  stageProgress,
}: AnalyticsProps) {
  const totalHours = Math.round(metrics.totalMinutes / 60);
  const watchedHours = Math.round(metrics.watchedMinutes / 60);

  return (
    <div className="space-y-6 rounded-xl border border-[var(--border-default)] bg-[#0A0A0C] p-4 sm:p-6 lg:p-7 shadow-elevation-1">
      {/* Header */}
      <div className="border-b border-[#1A1A1E] pb-5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--accent-muted)] border border-[var(--accent-border)] text-[var(--accent)]">
            <Icon icon={Analytics01Icon} size={18} />
          </span>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Data Engineering Mastery & Platform Analytics
            </h2>
            <p className="mt-0.5 text-xs text-[#A1A1AA] sm:text-sm">
              Observability metrics tracking competency development across 8 stages, 54 verified lectures, and 16 hands-on system labs.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics 4-Card Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="relative overflow-hidden rounded-xl border border-[#1E1E24] bg-[#0E0E12] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#888888]">Curriculum Progress</span>
            <Icon icon={Award01Icon} size={14} className="text-[var(--accent)]" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {metrics.percentageComplete}%
          </p>
          <Progress
            value={metrics.percentageComplete}
            className="h-1.5 bg-[#1C1C22]"
          />
          <p className="text-[10px] text-[#71717A] font-mono">
            {metrics.watchedVideos} of {metrics.totalVideos} lectures watched
          </p>
        </div>

        {/* Metric 2 */}
        <div className="relative overflow-hidden rounded-xl border border-[#1E1E24] bg-[#0E0E12] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#888888]">Lectures Watched</span>
            <Icon icon={CheckmarkCircle02Icon} size={14} className="text-white" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {metrics.watchedVideos}
            <span className="text-sm font-normal text-[#666666]"> / {metrics.totalVideos}</span>
          </p>
          <Progress
            value={metrics.totalVideos > 0 ? (metrics.watchedVideos / metrics.totalVideos) * 100 : 0}
            className="h-1.5 bg-[#1C1C22]"
          />
          <p className="text-[10px] text-[#71717A] font-mono">
            {metrics.totalVideos - metrics.watchedVideos} lessons remaining
          </p>
        </div>

        {/* Metric 3 */}
        <div className="relative overflow-hidden rounded-xl border border-[#1E1E24] bg-[#0E0E12] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#888888]">Time Invested</span>
            <Icon icon={Clock01Icon} size={14} className="text-[#A1A1AA]" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {watchedHours}h
            <span className="text-sm font-normal text-[#666666]"> / {totalHours}h</span>
          </p>
          <Progress
            value={totalHours > 0 ? (watchedHours / totalHours) * 100 : 0}
            className="h-1.5 bg-[#1C1C22]"
          />
          <p className="text-[10px] text-[#71717A] font-mono">
            ~{Math.max(0, totalHours - watchedHours)} hours remaining
          </p>
        </div>

        {/* Metric 4 */}
        <div className="relative overflow-hidden rounded-xl border border-[#1E1E24] bg-[#0E0E12] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#888888]">Hands-On Labs</span>
            <Icon icon={SourceCodeIcon} size={14} className="text-emerald-400" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {metrics.solvedExercises}
            <span className="text-sm font-normal text-[#666666]"> / {metrics.totalExercises}</span>
          </p>
          <Progress
            value={metrics.totalExercises > 0 ? (metrics.solvedExercises / metrics.totalExercises) * 100 : 0}
            className="h-1.5 bg-[#1C1C22]"
          />
          <p className="text-[10px] text-[#71717A] font-mono">
            Stage {metrics.currentStage} active
          </p>
        </div>
      </div>

      {/* Stage Progression Status Grid */}
      <div className="space-y-3 rounded-xl border border-[#1E1E24] bg-[#0D0D10] p-4 sm:p-5">
        <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
          Milestone Stages Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {stages.map((stage) => {
            const isMilestoneDone =
              !!stageProgress[stage.stageNumber]?.assignmentCompleted;

            return (
              <div
                key={stage.stageNumber}
                className="flex items-center justify-between rounded-lg border border-[#18181E] bg-[#09090C] p-3.5 transition-colors hover:border-[#27272F]"
              >
                <div>
                  <span className="font-mono text-[10px] font-bold text-[var(--accent)]">
                    STAGE {stage.stageNumber}
                  </span>
                  <h4 className="text-xs font-semibold text-white">
                    {stage.title}
                  </h4>
                  <p className="text-[11px] text-[#71717A]">
                    {stage.videoPositions.length} lectures • ~{Math.round(stage.estimatedMinutes / 60)}h
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={
                    isMilestoneDone
                      ? "border-emerald-800 bg-emerald-950/40 text-emerald-400 text-[10px] font-semibold"
                      : "border-[#27272F] bg-[#121216] text-[#71717A] text-[10px]"
                  }
                >
                  {isMilestoneDone ? "Milestone Done" : "In Progress"}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      {/* Topic Domain Mastery Breakdown */}
      <div className="space-y-4 rounded-xl border border-[#1E1E24] bg-[#0D0D10] p-4 sm:p-5">
        <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
          Topic Domain Mastery Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.topicsMastery.map((topic) => (
            <div
              key={topic.topicSlug}
              className="space-y-1.5 rounded-lg border border-[#18181E] bg-[#09090C] p-3"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white truncate max-w-[200px]">
                    {topic.topicTitle}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      topic.masteryStatus === "mastered"
                        ? "bg-white text-black"
                        : topic.masteryStatus === "in_progress"
                          ? "bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent-border)]"
                          : "bg-[#18181D] text-[#71717A]"
                    }`}
                  >
                    {topic.masteryStatus === "mastered"
                      ? "Mastered"
                      : topic.masteryStatus === "in_progress"
                        ? "In Progress"
                        : "Not Started"}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#71717A]">
                  {topic.percentage}%
                </span>
              </div>
              <Progress
                value={topic.percentage}
                className="h-1 bg-[#1A1A20]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
