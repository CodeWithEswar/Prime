"use client";

import type { ReactNode } from "react";
import { Clock01Icon } from "@hugeicons/core-free-icons";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

export interface MasteryOverviewHeaderProps {
  lastCalculatedAt: string;
  totalCoreProblems: number;
  action?: ReactNode;
}

export function MasteryOverviewHeader({
  lastCalculatedAt,
  totalCoreProblems,
  action,
}: MasteryOverviewHeaderProps) {
  const evaluated = new Date(lastCalculatedAt);
  const relativeTime = Number.isNaN(evaluated.getTime())
    ? "recently"
    : formatDistanceToNow(evaluated, { addSuffix: true });

  return (
    <header className="grid min-w-0 gap-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <Badge variant="outline" className="text-[10px] uppercase tracking-[0.12em]">
          Prime Core
        </Badge>
        <span className="text-xs text-[var(--text-secondary)]">
          {totalCoreProblems} problems
        </span>
        <span className="ml-auto hidden items-center gap-1.5 text-xs text-[var(--text-secondary)] sm:inline-flex">
          <Icon icon={Clock01Icon} size={13} aria-hidden="true" />
          Evaluated <time dateTime={lastCalculatedAt}>{relativeTime}</time>
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Mastery</h1>
        {action}
      </div>
      <p className="max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
        See what you can reproduce through independent practice and spaced recall.
      </p>
    </header>
  );
}
