import type { ReactNode } from "react";
import Link from "next/link";
import { PlayIcon, Task01Icon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import type { FundamentalsCourse } from "@/domain/fundamentals/courses";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface CourseHeroActions {
  enrolled: boolean;
  onEnroll: (onStarted: () => void) => void;
  onResume: () => void;
  onStarted?: () => void;
  onSchedule?: () => void;
  isPending?: boolean;
}

interface CourseHeroProps extends CourseHeroActions {
  title: string;
  description: string;
  edition: string;
  links: readonly (readonly [href: string, label: string])[];
  course: FundamentalsCourse;
  progressLabel?: string;
  progress: number;
  metrics: readonly { label: string; value: string | number; total?: string | number }[];
  note?: ReactNode;
}

export function CourseHero({
  title,
  description,
  edition,
  links,
  course,
  progressLabel = "Curriculum Progress",
  progress,
  metrics,
  note,
  enrolled,
  onEnroll,
  onResume,
  onStarted = onResume,
  onSchedule,
  isPending,
}: CourseHeroProps) {
  return (
    <Card
      elevation="raised"
      className="grid min-w-0 gap-4 border-t-[var(--accent-border)] p-3.5 @min-[52rem]:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] @min-[52rem]:items-start sm:gap-5 sm:p-5"
    >
      <header className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <Badge
            variant="outline"
            className="border-[var(--accent-border)] bg-[var(--accent-muted)] text-[var(--foreground)]"
          >
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-[var(--accent)]"
            />
            CS Fundamentals
          </Badge>
          <p className="text-xs text-[var(--text-secondary)]">{edition}</p>
        </div>
        <h1 className="text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl">
          {title}
        </h1>
        <p className="max-w-prose text-sm leading-relaxed text-[var(--text-secondary)]">
          {description}
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap @min-[28rem]:flex @min-[28rem]:flex-wrap">
          <Button
            type="button"
            size="lg"
            disabled={isPending}
            onClick={enrolled ? onResume : () => onEnroll(onStarted)}
            className="w-full sm:w-auto @min-[28rem]:w-auto justify-center"
          >
            {enrolled && <Icon icon={PlayIcon} size={15} aria-hidden="true" />}
            {enrolled ? "Resume roadmap" : "Start roadmap"}
          </Button>
          {onSchedule ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isPending}
              onClick={onSchedule}
              className="w-full sm:w-auto @min-[28rem]:w-auto justify-center"
            >
              <Icon
                icon={Task01Icon}
                size={15}
                aria-hidden="true"
                className="text-[var(--accent)]"
              />
              Schedule in Planner
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto @min-[28rem]:w-auto justify-center"
            >
              <Link href={`/plan?course=${course}`}>
                <Icon
                  icon={Task01Icon}
                  size={15}
                  aria-hidden="true"
                  className="text-[var(--accent)]"
                />
                Schedule in Planner
              </Link>
            </Button>
          )}
        </div>
        <nav aria-label="Related roadmaps" className="flex flex-wrap gap-x-3 gap-y-1">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-sm py-1 text-xs text-[var(--text-secondary)] underline decoration-[var(--border-strong)] underline-offset-4 hover:text-[var(--foreground)]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <Card elevation="base" className="min-w-0 overflow-hidden">
        <div className="space-y-2 px-3 py-2.5 sm:px-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2">
            <h2 className="text-xs font-medium text-[var(--text-secondary)]">
              {progressLabel}
            </h2>
            <span className="font-mono text-lg font-semibold tabular-nums">
              {progress}%
            </span>
          </div>
          <Progress value={progress} size="sm" aria-hidden="true" />
        </div>
        <dl className="grid grid-cols-2 gap-px border-t border-[var(--border-subtle)] bg-[var(--border-subtle)]">
          {metrics.map(({ label, value, total }) => (
            <div
              key={label}
              className="min-w-0 bg-[var(--surface-base)] px-3 py-2.5 sm:px-4"
            >
              <dt className="text-xs text-[var(--text-secondary)]">{label}</dt>
              <dd className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 font-mono text-sm font-semibold tabular-nums">
                {value}
                {total !== undefined && (
                  <span className="text-xs font-normal text-[var(--text-secondary)]">
                    / {total}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
        {note && (
          <p className="border-t border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-secondary)] sm:px-4">
            {note}
          </p>
        )}
      </Card>
    </Card>
  );
}

export function CourseTabs<T extends string>({
  value,
  onValueChange,
  options,
  label,
  layoutId,
  children,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: readonly (readonly [value: T, label: string])[];
  label: string;
  layoutId: string;
  children: ReactNode;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      className="min-w-0 space-y-3 sm:space-y-4"
    >
      <TabsList
        aria-label={label}
        layoutId={layoutId}
        className="grid grid-cols-2 gap-1 @min-[36rem]:flex @min-[36rem]:flex-wrap @min-[36rem]:gap-x-3"
      >
        {options.map(([id, text]) => (
          <TabsTrigger
            key={id}
            value={id}
            className="min-h-9 min-w-0 rounded-t-[var(--radius-sm)] px-1.5 py-2 text-center text-xs leading-tight whitespace-normal data-[state=active]:bg-[var(--accent-muted)] @min-[36rem]:px-2.5"
          >
            {text}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}

export function focusCourseDay() {
  requestAnimationFrame(() => {
    const day = document.getElementById("course-day-workspace");
    day?.focus({ preventScroll: true });
    day?.scrollIntoView({ block: "start" });
  });
}
