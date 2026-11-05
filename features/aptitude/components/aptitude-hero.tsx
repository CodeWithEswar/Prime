"use client";

import { PlayIcon, Calendar03Icon, Brain02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import type { AptitudeMetrics } from "../types";

export interface AptitudeHeroProps {
  metrics: AptitudeMetrics;
  enrolled: boolean;
  onEnroll: () => void;
  onResume: () => void;
  onSchedule: () => void;
  isPending?: boolean;
}
export function AptitudeHero({
  metrics,
  enrolled,
  onEnroll,
  onResume,
  onSchedule,
  isPending,
}: AptitudeHeroProps) {
  const percentage = Math.round(
    (metrics.completedTopics / Math.max(1, metrics.totalTopics)) * 100
  );
  return (
    <Card
      elevation="base"
      className="grid min-w-0 gap-6 overflow-hidden p-4 @min-[48rem]:grid-cols-[minmax(0,1fr)_280px] sm:p-6"
    >
      <header className="min-w-0">
        <p className="mb-3 flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
          <Icon icon={Brain02Icon} size={16} className="text-[var(--accent)]" />
          40-day learning roadmap
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Aptitude &amp; Reasoning
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
          Build your foundation in quantitative aptitude, logical reasoning, verbal
          ability, and data interpretation. Learn one concept at a time, then review what
          you can solve.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            disabled={isPending}
            loading={isPending}
            onClick={enrolled ? onResume : onEnroll}
          >
            <Icon icon={PlayIcon} size={15} />
            {enrolled ? "Continue learning" : "Start roadmap"}
          </Button>
          <Button variant="outline" disabled={isPending} onClick={onSchedule}>
            <Icon icon={Calendar03Icon} size={15} />
            Schedule in Planner
          </Button>
        </div>
      </header>
      <section
        aria-label="Learning progress"
        className="min-w-0 border-t border-[var(--border-subtle)] pt-4 @min-[48rem]:border-l @min-[48rem]:border-t-0 @min-[48rem]:pl-6 @min-[48rem]:pt-0"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-medium text-[var(--text-secondary)]">
            Curriculum progress
          </h2>
          <span className="text-xl font-semibold tabular-nums">{percentage}%</span>
        </div>
        <Progress
          value={percentage}
          aria-label="Curriculum completion"
          className="mt-3 h-1.5"
        />
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
          {[
            ["Completed topics", metrics.completedTopics + " / " + metrics.totalTopics],
            ["Topics watched", metrics.watchedVideos + " / " + metrics.totalVideos],
            ["Topics with lessons", metrics.totalVideos],
            ["Study remaining", Math.round(metrics.estimatedMinutesRemaining / 60) + "h"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11px] text-[var(--text-secondary)]">{label}</dt>
              <dd className="mt-1 text-base font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </Card>
  );
}
