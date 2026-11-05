"use client";

import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Flowchart01Icon,
  Task01Icon,
} from "@hugeicons/core-free-icons";
import type { CompetencyReadiness } from "@/domain/readiness";
import { ReadinessStatusBadge } from "./readiness-status";

interface CompetencyInspectorProps {
  competency: CompetencyReadiness | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestoreFocus?: () => void;
}

export function CompetencyInspector({
  competency,
  open,
  onOpenChange,
  onRestoreFocus,
}: CompetencyInspectorProps) {
  if (!competency) return null;

  const {
    name,
    domain,
    importance,
    status,
    coverage,
    confidence,
    supportingEvidence,
    missingEvidence,
    blockers,
    recommendation,
    algorithmLabSlug,
  } = competency;

  // Plan Work URL
  const planWorkUrl = recommendation
    ? `/plan?work=new&source=${recommendation.planWorkParams?.source || "custom"}&title=${encodeURIComponent(
        recommendation.title
      )}`
    : `/plan?work=new&title=${encodeURIComponent(`Practice: ${name}`)}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-dvh w-full flex-col gap-0 overflow-hidden bg-[var(--surface-raised)] p-0 sm:max-w-md"
        onCloseAutoFocus={(event) => {
          if (onRestoreFocus) {
            event.preventDefault();
            onRestoreFocus();
          }
        }}
      >
        <SheetHeader className="shrink-0 border-b border-[var(--border-subtle)] px-4 py-3 pr-12 sm:px-5 sm:pr-12">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="text-[10px] font-mono uppercase bg-white/5 border-white/15"
            >
              {domain}
            </Badge>
            <Badge
              variant="outline"
              className={`text-[10px] font-mono uppercase ${
                importance === "core"
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/60"
              }`}
            >
              {importance} Requirement
            </Badge>
          </div>
          <SheetTitle className="text-xl font-bold tracking-tight text-white">
            {name}
          </SheetTitle>
          <SheetDescription className="text-xs text-[var(--text-secondary)]">
            {competency.summary}
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          {/* Status & Confidence Grid */}
          <div className="grid grid-cols-2 gap-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-interactive)] p-3 text-xs">
            <div>
              <span className="text-[10px] text-[var(--text-tertiary)] uppercase block mb-0.5">
                Status
              </span>
              <ReadinessStatusBadge status={status} />
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-tertiary)] uppercase block mb-0.5">
                Coverage
              </span>
              <span className="text-white/90 capitalize">{coverage}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-tertiary)] uppercase block mb-0.5">
                Confidence
              </span>
              <span className="text-white/90 capitalize">{confidence}</span>
            </div>
          </div>

          {/* Supporting Evidence */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5">
              <Icon
                icon={CheckmarkCircle02Icon}
                size={14}
                className="text-[var(--text-secondary)]"
              />
              What Supports This?
            </h4>
            {supportingEvidence.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-white/80">
                {supportingEvidence.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span aria-hidden="true" className="text-[var(--text-secondary)]">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)] italic">
                No verified attempts or assessments recorded yet.
              </p>
            )}
          </div>

          {/* Blockers & Missing Evidence */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1.5">
              <Icon icon={AlertCircleIcon} size={14} className="text-[var(--accent)]" />
              What Needs Attention?
            </h4>
            {blockers.length > 0 || missingEvidence.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-white/80">
                {blockers.map((item, idx) => (
                  <li key={`blocker-${idx}`} className="flex items-start gap-2">
                    <span aria-hidden="true" className="text-[var(--accent)]">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
                {missingEvidence.map((item, idx) => (
                  <li
                    key={`missing-${idx}`}
                    className="flex items-start gap-2 text-white/70"
                  >
                    <span className="font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[var(--text-tertiary)] italic">
                No active blockers detected.
              </p>
            )}
          </div>

          {/* Algorithm Lab Recommendation Link */}
          {algorithmLabSlug && (
            <div className="space-y-1.5 rounded-md border border-[var(--border-default)] bg-[var(--surface-interactive)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <Icon icon={Flowchart01Icon} size={14} /> Interactive Simulation
                </span>
                <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                  Algorithm Lab
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Step through loop invariants and pointer movements with visual interactive
                controls.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-1">
                <Link href={`/lab/${algorithmLabSlug}`}>Open in Algorithm Lab</Link>
              </Button>
            </div>
          )}

          {/* Next Best Action Card */}
          {recommendation && (
            <div className="space-y-2 rounded-md border border-[var(--border-default)] bg-[var(--surface-interactive)] p-3.5">
              <span className="block text-xs font-semibold">Recommended Action</span>
              <div className="space-y-1">
                <h5 className="text-xs font-semibold text-white">
                  {recommendation.title}
                </h5>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {recommendation.description}
                </p>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-tertiary)] pt-1 border-t border-white/5">
                <span>Est. effort: ~{recommendation.estimatedMinutes}m</span>
                <span className="text-white/80">Priority {recommendation.priority}</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] gap-2 border-t border-[var(--border-default)] bg-[var(--surface-raised)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
          <Button asChild variant="primary" className="min-w-0">
            <Link href={planWorkUrl} onClick={() => onOpenChange(false)}>
              <Icon icon={Task01Icon} size={14} /> Plan Improvement
            </Link>
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Dismiss
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
