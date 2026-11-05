"use client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { AptitudeTrack, AptitudeMetrics, AptitudeTrackSlug } from "../types";

const ranges: Record<AptitudeTrackSlug, [number, number]> = {
  "quantitative-aptitude": [1, 16],
  "logical-reasoning": [17, 26],
  "verbal-ability": [27, 33],
  "data-interpretation": [34, 38],
  assessments: [39, 40],
};
export function AptitudeTracksPanel({
  tracks,
  metrics,
  onSelectTrackStartDay,
}: {
  tracks: AptitudeTrack[];
  metrics: AptitudeMetrics;
  onSelectTrackStartDay: (day: number) => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Your subjects</h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Explore each subject or jump to its first learning day.
        </p>
      </div>
      <div className="grid min-w-0 gap-3 @min-[40rem]:grid-cols-2">
        {tracks.map((track) => {
          const [start, end] = ranges[track.slug];
          const stat = metrics.trackProgress[track.slug];
          return (
            <Card
              elevation="base"
              key={track.id}
              className="flex min-w-0 flex-col p-4 sm:p-5"
            >
              <p className="text-xs text-[var(--text-tertiary)]">
                Days {start}–{end} · {track.totalTopics} concepts
              </p>
              <h3 className="mt-2 text-base font-semibold">{track.title}</h3>
              <p className="mb-5 mt-2 flex-1 text-xs leading-6 text-[var(--text-secondary)]">
                {track.description}
              </p>
              <div className="mb-2 flex justify-between gap-3 text-xs text-[var(--text-secondary)]">
                <span>{stat.completedTopics} completed</span>
                <span className="tabular-nums">{stat.percentage}%</span>
              </div>
              <Progress
                value={stat.percentage}
                aria-label={track.title + " completion"}
                className="h-1.5"
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-5 self-start"
                onClick={() => onSelectTrackStartDay(start)}
              >
                Explore subject
              </Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
