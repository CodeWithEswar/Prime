"use client";

import { cn } from "@/lib/utils";
import type {
  PythonProgressMetrics,
  PythonTopicMastery,
} from "@/domain/python";

interface PythonAnalyticsProps {
  metrics: PythonProgressMetrics;
  topicMastery: PythonTopicMastery[];
}

export function PythonAnalytics({
  metrics,
  topicMastery,
}: PythonAnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* 1. High-Level Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-[#222228] bg-[#0A0A0E] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#71717A]">
            CURRICULUM COMPLETION
          </span>
          <div className="text-2xl font-bold text-white font-mono">
            {metrics.progressPercentage}%
          </div>
          <span className="text-xs text-[#A1A1AA]">
            {metrics.watchedVideos} of {metrics.totalVideos} lectures watched
          </span>
        </div>

        <div className="p-4 rounded-xl border border-[#222228] bg-[#0A0A0E] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#71717A]">
            STAGES MASTERED
          </span>
          <div className="text-2xl font-bold text-white font-mono">
            {metrics.completedStages} / {metrics.totalStages}
          </div>
          <span className="text-xs text-[#A1A1AA]">
            Structured engineering tiers
          </span>
        </div>

        <div className="p-4 rounded-xl border border-[#222228] bg-[#0A0A0E] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#71717A]">
            HOURS INVESTED
          </span>
          <div className="text-2xl font-bold text-white font-mono">
            {Math.round(metrics.watchedMinutes / 60)}h
          </div>
          <span className="text-xs text-[#A1A1AA]">
            Total syllabus: ~{Math.round(metrics.totalEstimatedMinutes / 60)}h
          </span>
        </div>

        <div className="p-4 rounded-xl border border-[#222228] bg-[#0A0A0E] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#71717A]">
            PRACTICAL LABS
          </span>
          <div className="text-2xl font-bold text-white font-mono">
            {metrics.exercisesCompleted} / {metrics.totalExercises}
          </div>
          <span className="text-xs text-[#A1A1AA]">
            Hands-on coding challenges
          </span>
        </div>
      </div>

      {/* 2. Topic Mastery Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          Topic Mastery & Competencies ({topicMastery.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {topicMastery.map((tm) => (
            <div
              key={tm.topicSlug}
              className="p-3.5 rounded-xl border border-[#1E1E24] bg-[#0A0A0E] space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-white truncate">
                  {tm.topicTitle}
                </span>
                <span className="text-[11px] font-mono text-[#A1A1AA]">
                  {tm.percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-[#1A1A22] rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    tm.percentage === 100
                      ? "bg-emerald-500"
                      : tm.percentage > 0
                        ? "bg-[var(--accent)]"
                        : "bg-transparent"
                  )}
                  style={{ width: `${tm.percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A]">
                <span>Stage {tm.stageNumber}</span>
                <span>
                  {tm.watchedVideos} / {tm.totalVideos} videos
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
