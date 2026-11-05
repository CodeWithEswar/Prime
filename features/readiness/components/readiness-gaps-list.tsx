"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ReadinessGap, ReadinessGapType } from "@/domain/readiness";

interface ReadinessGapsListProps {
  gaps: ReadinessGap[];
}

export function ReadinessGapsList({ gaps }: ReadinessGapsListProps) {
  if (gaps.length === 0) {
    return (
      <Card elevation="raised" className="p-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">No priority gaps for this profile</h3>
        </div>
      </Card>
    );
  }

  const getGapBadge = (type: ReadinessGapType) => {
    switch (type) {
      case "performance_gap":
        return (
          <Badge
            variant="outline"
            className="border-[var(--accent-border)] bg-[var(--accent-muted)] text-white"
          >
            Performance Gap
          </Badge>
        );
      case "unassessed":
        return (
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-white/20 bg-white/5 text-white/80"
          >
            Unassessed Requirement
          </Badge>
        );
      case "retention_gap":
        return <Badge variant="outline">Retention Decay</Badge>;
      case "coverage_gap":
        return <Badge variant="outline">Coverage Gap</Badge>;
      case "limited_evidence":
      default:
        return (
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-white/10 bg-transparent text-white/60"
          >
            Limited Evidence
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 pb-2 border-b border-[var(--border-subtle)]">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
          Priority Preparation Gaps ({gaps.length})
        </h3>
        <span className="text-[10px] font-mono text-[var(--text-secondary)]">
          Ranked by target role urgency
        </span>
      </div>

      <div className="grid gap-3 @min-[40rem]:grid-cols-2">
        {gaps.map((gap, index) => {
          const planWorkUrl = `/plan?work=new&title=${encodeURIComponent(
            `${gap.recommendedAction}: ${gap.competencyName}`
          )}`;

          return (
            <Card
              key={gap.id}
              elevation="raised"
              className="flex min-w-0 flex-col justify-between gap-3 p-3 sm:p-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-white/40">
                      #{String(index + 1).padStart(2, "0")}
                    </span>
                    {getGapBadge(gap.gapType)}
                  </div>
                  <span className="text-[10px] font-mono uppercase text-[var(--text-tertiary)]">
                    {gap.domain}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white tracking-tight">
                    {gap.competencyName}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {gap.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-2.5">
                <span className="min-w-0 text-xs text-[var(--text-secondary)] [overflow-wrap:anywhere]">
                  {gap.recommendedAction}
                </span>
                <Button asChild variant="outline" size="sm">
                  <Link href={planWorkUrl}>Plan Work</Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
