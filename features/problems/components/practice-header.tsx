import * as React from "react";
import type { UserPracticeSummary } from "../types";

interface PracticeHeaderProps {
  summary?: UserPracticeSummary;
  totalCatalogCount?: number;
}

export function PracticeHeader({
  summary,
  totalCatalogCount = 4411,
}: PracticeHeaderProps) {
  const hasAttempts =
    summary &&
    (summary.totalSolved > 0 ||
      summary.totalAttempted > 0 ||
      summary.totalNeedsRevision > 0 ||
      (summary.totalMastered ?? 0) > 0);

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0 animate-pulse"
            aria-hidden="true"
          />
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
            DSA Practice
          </h1>
          <span className="hidden sm:inline-block text-[11px] font-mono uppercase px-2 py-0.5 rounded-[var(--radius-xs)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] tracking-wider">
            Catalog
          </span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] font-normal max-w-xl">
          Practice deliberately. Track what you can reproduce.
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs font-mono w-full md:w-auto overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 shrink-0">
        {hasAttempts ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--surface-base)] border border-[var(--border-subtle)] w-fit shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-semibold">{summary.totalSolved}</span>
              <span className="text-[var(--text-tertiary)] text-[11px]">solved</span>
            </div>
            <span className="text-[var(--border-strong)]">·</span>
            <div className="flex items-center gap-1.5">
              <span
                className={
                  summary.revisionDueCount > 0
                    ? "text-[var(--accent)] font-semibold"
                    : "text-[var(--text-secondary)]"
                }
              >
                {summary.revisionDueCount}
              </span>
              <span
                className={
                  summary.revisionDueCount > 0
                    ? "text-[rgba(255,0,0,0.85)] text-[11px]"
                    : "text-[var(--text-tertiary)] text-[11px]"
                }
              >
                revision due
              </span>
            </div>
            <span className="text-[var(--border-strong)]">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-semibold" title={summary.totalMastered === null ? "Mastery evidence unavailable" : undefined}>{summary.totalMastered ?? "—"}</span>
              <span className="text-[var(--text-tertiary)] text-[11px]">mastered</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--surface-base)] border border-[var(--border-subtle)] text-[var(--text-secondary)] w-fit shrink-0">
            <span className="text-white font-medium">
              {totalCatalogCount.toLocaleString()}
            </span>
            <span className="text-[var(--text-tertiary)]">problems available</span>
            <span className="text-[var(--border-strong)]">·</span>
            <span className="text-[var(--text-tertiary)]">Ready to practice</span>
          </div>
        )}
      </div>
    </header>
  );
}
