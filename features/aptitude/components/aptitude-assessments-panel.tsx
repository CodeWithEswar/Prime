"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AptitudeDay } from "../types";

export function AptitudeAssessmentsPanel({
  days,
  onOpenDay,
}: {
  days: AptitudeDay[];
  onOpenDay: (day: number) => void;
}) {
  return (
    <section className="min-w-0 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Review &amp; practice</h2>
        <p className="mt-1 text-xs leading-6 text-[var(--text-secondary)]">
          Pause at each milestone to work through the questions before watching the
          solution. These lessons are walkthroughs, with no automatic scoring.
        </p>
      </div>
      <div className="grid gap-3 @min-[40rem]:grid-cols-2">
        {days
          .filter((day) => day.isAssessmentDay)
          .map((day) => (
            <Card
              key={day.id}
              elevation="base"
              className="flex min-w-0 flex-col p-4 sm:p-5"
            >
              <p className="text-xs text-[var(--text-tertiary)]">Day {day.dayNumber}</p>
              <h3 className="mt-2 text-base font-semibold">{day.title}</h3>
              <ul className="my-4 flex-1 space-y-2 text-xs leading-5 text-[var(--text-secondary)]">
                {day.topics.map((topic) => (
                  <li key={topic.id}>{topic.title}</li>
                ))}
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => onOpenDay(day.dayNumber)}
              >
                Open review day
              </Button>
            </Card>
          ))}
      </div>
    </section>
  );
}
