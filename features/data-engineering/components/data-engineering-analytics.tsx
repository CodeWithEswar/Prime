"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Analytics01Icon } from "@hugeicons/core-free-icons";
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
    <div className="space-y-6 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 sm:p-7">
      {/* Header */}
      <div className="border-b border-[#1A1A1A] pb-5">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-white/10 text-white border border-white/20">
            <Icon icon={Analytics01Icon} size={16} />
          </span>
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            Data Engineering Mastery & Platform Analytics
          </h2>
        </div>
        <p className="mt-1 text-xs text-[#888888] sm:text-sm">
          Observability metrics tracking competency development across all 8 stages, 54 canonical video lectures, and hands-on system labs.
        </p>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <div className="rounded-lg border border-[#222222] bg-[#111111] p-4">
          <span className="text-xs text-[#888888]">Curriculum Completion</span>
          <p className="mt-1 font-mono text-2xl font-bold text-white">
            {metrics.percentageComplete}%
          </p>
          <Progress
            value={metrics.percentageComplete}
            className="mt-3 h-1.5 bg-[#202020]"
          />
        </div>

        <div className="rounded-lg border border-[#222222] bg-[#111111] p-4">
          <span className="text-xs text-[#888888]">Lectures Watched</span>
          <p className="mt-1 font-mono text-2xl font-bold text-white">
            {metrics.watchedVideos}{" "}
            <span className="text-xs font-normal text-[#666666]">
              / {metrics.totalVideos}
            </span>
          </p>
          <p className="mt-2 text-[11px] text-[#777777]">
            {metrics.totalVideos - metrics.watchedVideos} lessons remaining
          </p>
        </div>

        <div className="rounded-lg border border-[#222222] bg-[#111111] p-4">
          <span className="text-xs text-[#888888]">Time Invested</span>
          <p className="mt-1 font-mono text-2xl font-bold text-white">
            {watchedHours}h{" "}
            <span className="text-xs font-normal text-[#666666]">
              / {totalHours}h
            </span>
          </p>
          <p className="mt-2 text-[11px] text-[#777777]">
            ~{Math.max(0, totalHours - watchedHours)} hours remaining
          </p>
        </div>

        <div className="rounded-lg border border-[#222222] bg-[#111111] p-4">
          <span className="text-xs text-[#888888]">Hands-On Labs Solved</span>
          <p className="mt-1 font-mono text-2xl font-bold text-white">
            {metrics.solvedExercises}{" "}
            <span className="text-xs font-normal text-[#666666]">
              / {metrics.totalExercises}
            </span>
          </p>
          <p className="mt-2 text-[11px] text-[#777777]">
            Stage {metrics.currentStage} active
          </p>
        </div>
      </div>

      {/* Stage Progression Status Grid */}
      <div className="space-y-3 rounded-lg border border-[#202020] bg-[#101010] p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Milestone Stages Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {stages.map((stage) => {
            const isMilestoneDone =
              !!stageProgress[stage.stageNumber]?.assignmentCompleted;

            return (
              <div
                key={stage.stageNumber}
                className="flex items-center justify-between rounded-lg border border-[#1A1A1A] bg-[#0C0C0C] p-3"
              >
                <div>
                  <span className="font-mono text-[10px] text-[#71717A]">
                    STAGE {stage.stageNumber}
                  </span>
                  <h4 className="text-xs font-semibold text-white">
                    {stage.title}
                  </h4>
                  <p className="text-[11px] text-[#888888]">
                    {stage.videoPositions.length} lectures • ~{Math.round(stage.estimatedMinutes / 60)}h
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={
                    isMilestoneDone
                      ? "border-emerald-900 bg-emerald-950/40 text-emerald-400 text-[10px]"
                      : "border-[#262626] bg-[#141414] text-[#71717A] text-[10px]"
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
      <div className="space-y-4 rounded-lg border border-[#202020] bg-[#101010] p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Topic Domain Mastery Breakdown
        </h3>

        <div className="space-y-3.5">
          {metrics.topicsMastery.map((topic) => (
            <div key={topic.topicSlug} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">
                    {topic.topicTitle}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      topic.masteryStatus === "mastered"
                        ? "bg-white text-black"
                        : topic.masteryStatus === "in_progress"
                          ? "bg-[var(--accent-muted)] text-[var(--foreground)] border border-[var(--accent-border)]"
                          : "bg-[#1E1E1E] text-[#666666]"
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
                  {topic.watchedVideos}/{topic.totalVideos} videos ({topic.percentage}%)
                </span>
              </div>
              <Progress
                value={topic.percentage}
                className="h-1 bg-[#1A1A1A]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
