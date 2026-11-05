"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MasteryFilter, MasteryOverviewData } from "../types";

export interface MasteryStripProps {
  counts: MasteryOverviewData["counts"];
  total: number;
  className?: string;
  selectedFilter?: MasteryFilter;
  onSelectFilter?: (filter: MasteryFilter) => void;
}

const metrics = [
  { id: "mastered", label: "Mastered", detail: "Repeated independent solves and recall" },
  {
    id: "proficient",
    label: "Proficient",
    detail: "Independent solve and verified recall",
  },
  {
    id: "practiced",
    label: "Practiced",
    detail: "Successful practice with early evidence",
  },
  { id: "learning", label: "Learning", detail: "Assisted practice or partial recall" },
] as const;

export function MasteryStrip({
  counts,
  total,
  className,
  selectedFilter,
  onSelectFilter,
}: MasteryStripProps) {
  return (
    <div
      className={cn("grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4", className)}
      role="region"
      aria-label="Core DSA Mastery Distribution"
    >
      {metrics.map(({ id, label, detail }) => {
        const count = counts[id];
        const selected = selectedFilter === id;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <Card key={id} elevation={selected ? "raised" : "base"} className="min-w-0">
            <Button
              variant="outline"
              type="button"
              aria-pressed={selected}
              title={detail}
              onClick={() => onSelectFilter?.(id)}
              className={cn(
                "h-auto w-full min-w-0 flex-col items-stretch gap-1 whitespace-normal border-transparent px-3 py-2 text-left sm:py-3",
                selected && "border-[var(--border-strong)]"
              )}
            >
              <span className="text-xs text-[var(--text-secondary)]">{label}</span>
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                  {count}
                </span>
                <span className="text-xs font-normal tabular-nums text-[var(--text-secondary)]">
                  {pct}%
                </span>
              </span>
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
