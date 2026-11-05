"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { RevisionBadge } from "./revision-badge";
import { cn, cleanProblemTitle } from "@/lib/utils";
import type { CatalogProblemItem, UserProblemStatus } from "../types";

interface ProblemRowProps {
  problem: CatalogProblemItem;
  isSelected?: boolean;
  onSelect?: (problem: CatalogProblemItem) => void;
  href?: string;
  onNavigate?: () => void;
  className?: string;
}

const difficultyStyle: Record<string, string> = {
  easy: "text-[rgba(255,255,255,0.60)]",
  medium: "text-[rgba(255,255,255,0.85)] font-medium",
  hard: "text-white font-semibold",
};

function StatusSymbol({ status }: { status: UserProblemStatus }) {
  switch (status) {
    case "solved":
      return (
        <span
          className="text-white font-mono text-sm leading-none font-bold"
          title="Solved"
          aria-label="Status: Solved"
        >
          ✓
        </span>
      );
    case "needs_revision":
      return (
        <span
          className="text-[var(--accent)] font-mono text-sm leading-none font-bold"
          title="Needs Revision"
          aria-label="Status: Needs Revision"
        >
          ↻
        </span>
      );
    case "mastered":
      return (
        <span
          className="text-white font-mono text-xs leading-none font-bold"
          title="Mastered"
          aria-label="Status: Mastered"
        >
          ◆
        </span>
      );
    case "attempted":
      return (
        <span
          className="text-[rgba(255,255,255,0.72)] font-mono text-sm leading-none"
          title="Attempted"
          aria-label="Status: Attempted"
        >
          ◐
        </span>
      );
    case "not_started":
    default:
      return (
        <span
          className="text-[rgba(255,255,255,0.28)] font-mono text-sm leading-none"
          title="Not Started"
          aria-label="Status: Not Started"
        >
          ○
        </span>
      );
  }
}

export function ProblemRow({
  problem,
  isSelected = false,
  onSelect,
  href,
  onNavigate,
  className,
}: ProblemRowProps) {
  // Collection display: if real collections exist, show primary collection name + remainder
  const collectionLabel = React.useMemo(() => {
    if (problem.collections && problem.collections.length > 0) {
      const first = problem.collections[0].name;
      const extra = problem.collections.length - 1;
      return extra > 0 ? `${first} +${extra}` : first;
    }
    if (problem.collectionCount > 0) {
      return `${problem.collectionCount} ${
        problem.collectionCount === 1 ? "set" : "sets"
      }`;
    }
    return null;
  }, [problem.collections, problem.collectionCount]);

  return (
    <div
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a,button")) return;
        if (onSelect) onSelect(problem);
        else
          event.currentTarget
            .querySelector<HTMLAnchorElement>("[data-problem-link]")
            ?.click();
      }}
      className={cn(
        "group relative flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--prime-canvas)] transition-all cursor-pointer select-none",
        "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-transparent before:transition-colors",
        "hover:bg-[rgba(255,255,255,0.02)] hover:before:bg-[var(--accent)]",
        isSelected && "bg-[var(--surface-base)] before:bg-[var(--accent)]",
        className
      )}
    >
      {/* 1. Status Column & Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Status Symbol (No repeating noisy pills) */}
        <div className="w-12 shrink-0 flex items-center justify-center">
          <StatusSymbol status={problem.masteryLevel === "mastered" && problem.status === "solved" ? "mastered" : problem.status} />
        </div>

        {/* Title & Topic Context */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {href ? (
              <Link
                data-problem-link
                href={href}
                prefetch={false}
                onNavigate={onNavigate}
                onClick={(event) => {
                  if (onSelect) {
                    event.preventDefault();
                    onSelect(problem);
                  }
                }}
                className="text-sm font-medium text-[rgba(255,255,255,0.92)] group-hover:text-white transition-colors truncate focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                {cleanProblemTitle(problem.title)}
              </Link>
            ) : (
              <span
                data-problem-link
                className="text-sm font-medium text-[rgba(255,255,255,0.92)] group-hover:text-white transition-colors truncate focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                {cleanProblemTitle(problem.title)}
              </span>
            )}

            {/* Revision Due Badge */}
            <RevisionBadge
              isDue={problem.isRevisionDue}
              isOverdue={problem.isRevisionOverdue}
              nextRevisionAt={problem.nextRevisionAt}
            />
          </div>

          <div className="flex items-center gap-2 mt-0.5 text-xs font-mono text-[var(--text-tertiary)]">
            {problem.primaryTopic && <span>{problem.primaryTopic.name}</span>}
            {collectionLabel && (
              <>
                <span>·</span>
                <span className="truncate max-w-[200px]">{collectionLabel}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Monochromatic Difficulty & Company Relevance */}
      <div className="hidden sm:flex items-center gap-6 shrink-0 text-xs font-mono">
        {/* Company Relevance if active */}
        {problem.companyRelevance && (
          <div className="text-[var(--text-secondary)]">
            <span>{problem.companyRelevance.companyName}</span>
            <span className="text-[var(--text-tertiary)] ml-1">
              (freq {problem.companyRelevance.frequency})
            </span>
          </div>
        )}

        {/* Difficulty */}
        <span
          className={cn(
            "uppercase tracking-wider min-w-[65px] text-right",
            difficultyStyle[problem.difficulty] || "text-[var(--text-secondary)]"
          )}
        >
          {problem.difficulty}
        </span>
      </div>

      {/* 3. External Action Button */}
      <div className="shrink-0 flex items-center justify-end w-16">
        {problem.externalUrl ? (
          <a
            href={problem.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Open ${problem.title} on external practice platform`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-sm)] text-xs font-mono text-[var(--text-secondary)] hover:text-white bg-[var(--surface-base)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors"
          >
            <span className="hidden md:inline">Open</span>
            <Icon
              icon={ArrowUpRight01Icon}
              size={12}
              className="opacity-70 group-hover:opacity-100"
            />
          </a>
        ) : (
          <span
            className="text-[10px] font-mono text-[var(--text-tertiary)]"
            aria-label="Practice link pending verification"
            title="The original practice link is being verified"
          >
            Pending
          </span>
        )}
      </div>
    </div>
  );
}
