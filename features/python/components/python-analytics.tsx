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
        <div className="p-4 rounded-md border border-zinc-800 bg-zinc-950/80 space-y-1 shadow-md">
          <span className="text-[10px] font-mono uppercase text-zinc-500">
            CURRICULUM COMPLETION
          </span>
          <div className="text-2xl font-bold text-zinc-100 font-mono">
            {metrics.progressPercentage}%
          </div>
          <span className="text-xs text-zinc-400">
            {metrics.watchedVideos} of {metrics.totalVideos} lectures watched
          </span>
        </div>

        <div className="p-4 rounded-md border border-zinc-800 bg-zinc-950/80 space-y-1 shadow-md">
          <span className="text-[10px] font-mono uppercase text-zinc-500">
            STAGES MASTERED
          </span>
          <div className="text-2xl font-bold text-zinc-100 font-mono">
            {metrics.completedStages} / {metrics.totalStages}
          </div>
          <span className="text-xs text-zinc-400">
            Structured engineering tiers
          </span>
        </div>

        <div className="p-4 rounded-md border border-zinc-800 bg-zinc-950/80 space-y-1 shadow-md">
          <span className="text-[10px] font-mono uppercase text-zinc-500">
            HOURS INVESTED
          </span>
          <div className="text-2xl font-bold text-zinc-100 font-mono">
            {Math.round(metrics.watchedMinutes / 60)}h
          </div>
          <span className="text-xs text-zinc-400">
            Total syllabus: ~{Math.round(metrics.totalEstimatedMinutes / 60)}h
          </span>
        </div>

        <div className="p-4 rounded-md border border-zinc-800 bg-zinc-950/80 space-y-1 shadow-md">
          <span className="text-[10px] font-mono uppercase text-zinc-500">
            PRACTICAL LABS
          </span>
          <div className="text-2xl font-bold text-zinc-100 font-mono">
            {metrics.exercisesCompleted} / {metrics.totalExercises}
          </div>
          <span className="text-xs text-zinc-400">
            Hands-on coding challenges
          </span>
        </div>
      </div>

      {/* 2. Topic Mastery Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono">
          Topic Mastery & Competencies ({topicMastery.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {topicMastery.map((tm) => (
            <div
              key={tm.topicSlug}
              className="p-3.5 rounded-md border border-zinc-800 bg-zinc-950/80 space-y-2.5 shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-zinc-100 truncate">
                  {tm.topicTitle}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  {tm.percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    tm.percentage === 100
                      ? "bg-emerald-500"
                      : tm.percentage > 0
                        ? "bg-zinc-200"
                        : "bg-transparent"
                  )}
                  style={{ width: `${tm.percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>
                  {tm.watchedVideos}/{tm.totalVideos} videos
                </span>
                <span className="capitalize">{tm.masteryStatus.replace("_", " ")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
