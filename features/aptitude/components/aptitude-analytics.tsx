"use client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AptitudeMetrics } from "../types";

export function AptitudeAnalytics({ metrics }: { metrics: AptitudeMetrics }) {
  const names = {
    "quantitative-aptitude": "Quantitative aptitude",
    "logical-reasoning": "Logical reasoning",
    "verbal-ability": "Verbal ability",
    "data-interpretation": "Data interpretation",
    assessments: "Final review",
  } as const;
  return (
    <section className="min-w-0 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Learning progress</h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Your completed concepts and topics with a lesson marked as watched.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Card elevation="base" className="p-4">
          <p className="text-xs text-[var(--text-secondary)]">Concepts completed</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {metrics.completedTopics}
            <span className="ml-2 text-sm font-normal text-[var(--text-tertiary)]">
              / {metrics.totalTopics}
            </span>
          </p>
        </Card>
        <Card elevation="base" className="p-4">
          <p className="text-xs text-[var(--text-secondary)]">Topics watched</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {metrics.watchedVideos}
            <span className="ml-2 text-sm font-normal text-[var(--text-tertiary)]">
              / {metrics.totalVideos}
            </span>
          </p>
        </Card>
      </div>
      <Card elevation="base" className="divide-y divide-[var(--border-subtle)]">
        {Object.entries(metrics.trackProgress).map(([slug, stat]) => (
          <div key={slug} className="p-4 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium">{names[slug as keyof typeof names]}</h3>
              <span className="text-xs tabular-nums text-[var(--text-secondary)]">
                {stat.completedTopics} / {stat.totalTopics} · {stat.percentage}%
              </span>
            </div>
            <Progress
              value={stat.percentage}
              aria-label={names[slug as keyof typeof names] + " completion"}
              className="h-1.5"
            />
          </div>
        ))}
      </Card>
      <p className="text-xs leading-6 text-[var(--text-tertiary)]">
        Completion and watch history track your learning activity. They do not measure
        test accuracy, solve speed, or interview readiness.
      </p>
    </section>
  );
}
