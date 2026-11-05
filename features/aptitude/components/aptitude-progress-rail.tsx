"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AptitudeDay, UserAptitudeTopicProgress } from "../types";

const subjects = [
  ["quantitative-aptitude", "Quantitative aptitude"],
  ["logical-reasoning", "Logical reasoning"],
  ["verbal-ability", "Verbal ability"],
  ["data-interpretation", "Data interpretation"],
  ["assessments", "Final review"],
] as const;
export function AptitudeProgressRail({
  days,
  activeDay,
  onSelectDay,
  topicProgress,
}: {
  days: AptitudeDay[];
  activeDay: number;
  onSelectDay: (day: number) => void;
  topicProgress: Record<string, UserAptitudeTopicProgress>;
}) {
  const day = days.find((d) => d.dayNumber === activeDay) ?? days[0];
  const currentDays = days.filter((d) => d.trackSlug === day.trackSlug);
  return (
    <Card
      elevation="base"
      className="min-w-0 self-start space-y-4 p-4 @min-[60rem]:sticky @min-[60rem]:top-4"
    >
      <div className="grid gap-3 @min-[28rem]:grid-cols-2 @min-[60rem]:grid-cols-1">
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="aptitude-subject">Subject</Label>
          <Select
            value={day.trackSlug}
            onValueChange={(value) => {
              const first = days.find((d) => d.trackSlug === value);
              if (first) onSelectDay(first.dayNumber);
            }}
          >
            <SelectTrigger id="aptitude-subject">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(([slug, title]) => (
                <SelectItem key={slug} value={slug}>
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="aptitude-day">Jump to day</Label>
          <Select
            value={String(activeDay)}
            onValueChange={(value) => onSelectDay(Number(value))}
          >
            <SelectTrigger id="aptitude-day">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {days.map((d) => (
                <SelectItem value={String(d.dayNumber)} key={d.id}>
                  Day {d.dayNumber} · {d.topics[0]?.title ?? "Review"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="border-t border-[var(--border-subtle)] pt-3">
        <p className="mb-3 text-[11px] text-[var(--text-secondary)]">
          Days {currentDays[0]?.dayNumber}–{currentDays.at(-1)?.dayNumber}
        </p>
        <div className="grid grid-cols-8 gap-1.5 @min-[60rem]:grid-cols-4">
          {currentDays.map((d) => {
            const completed = d.topics.filter(
              (t) => topicProgress[t.id]?.status === "completed"
            ).length;
            const percent = (completed / Math.max(1, d.topics.length)) * 100;
            return (
              <Button
                key={d.id}
                variant="outline"
                size="sm"
                title={d.topics.map((t) => t.title).join(", ")}
                aria-label={`Go to day ${d.dayNumber}, ${completed} of ${d.topics.length} completed`}
                aria-pressed={activeDay === d.dayNumber}
                onClick={() => onSelectDay(d.dayNumber)}
                className={cn(
                  "relative w-full min-w-0 overflow-hidden px-0 text-xs tabular-nums",
                  activeDay === d.dayNumber &&
                    "border-[var(--accent-border)] bg-[var(--accent-muted)] text-white"
                )}
              >
                {String(d.dayNumber).padStart(2, "0")}
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 h-0.5 bg-[var(--accent)]"
                  style={{ width: percent + "%" }}
                />
              </Button>
            );
          })}
        </div>
      </div>
      <p className="text-[11px] leading-5 text-[var(--text-tertiary)]">
        Choose any day. The red line tracks completed concepts.
      </p>
    </Card>
  );
}
