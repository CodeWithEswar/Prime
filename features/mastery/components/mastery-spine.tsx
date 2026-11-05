"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TopicMasteryResult } from "@/domain/mastery";
import { EvidenceRail } from "./evidence-rail";
import { Alert02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { badgeVariants } from "@/components/ui/badge";

export interface MasterySpineProps {
  topics: TopicMasteryResult[];
  stageNames: ReadonlyMap<string, string>;
  selectedTopicId: string | null;
  onSelectTopic: (topicId: string, trigger: HTMLButtonElement) => void;
  className?: string;
}

export function MasterySpine({
  topics,
  stageNames,
  selectedTopicId,
  onSelectTopic,
  className,
}: MasterySpineProps) {
  return (
    <div
      className={cn("grid min-w-0 gap-2.5", className)}
      role="group"
      aria-label="Skill Evidence Map"
      onKeyDown={(event) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        const buttons = Array.from(event.currentTarget.querySelectorAll("button"));
        const index = buttons.findIndex((button) => button === event.target);
        if (index < 0) return;
        event.preventDefault();
        buttons[index + (event.key === "ArrowDown" ? 1 : -1)]?.focus();
      }}
    >
      {topics.map((topic, index) => {
        const isSelected = selectedTopicId === topic.topicId;
        const stage = stageNames.get(topic.topicId);
        const hasRegression = topic.blockers.some(
          (b) =>
            b.toLowerCase().includes("forgot") || b.toLowerCase().includes("regression")
        );

        return (
          <Button
            key={topic.topicId}
            type="button"
            variant="outline"
            onClick={(event) => onSelectTopic(topic.topicId, event.currentTarget)}
            className={cn(
              "mastery-skill-card relative grid h-auto w-full min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-2.5 whitespace-normal rounded-[var(--radius-md)] bg-[var(--prime-surface)] px-3 py-3 text-left hover:translate-y-0 sm:px-4",
              isSelected
                ? "border-[var(--border-strong)] bg-[var(--prime-surface-raised)]"
                : "border-[var(--border-subtle)]"
            )}
            aria-pressed={isSelected}
            aria-label={`${topic.topicName}, ${topic.level}, Evidence ${topic.score} out of 100${stage ? ", " + stage : ""}`}
          >
            <span
              aria-hidden="true"
              className={cn(
                "grid size-7 place-items-center rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--prime-canvas)] text-xs tabular-nums text-[var(--text-secondary)]",
                isSelected && "border-[var(--accent-border)] text-white"
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="grid min-w-0 gap-1">
              <span className="flex min-w-0 flex-wrap items-start justify-between gap-x-2 gap-y-1">
                <span className="min-w-0 flex-1 basis-24 [overflow-wrap:anywhere] text-sm font-semibold sm:text-[15px]">
                  {topic.topicName}
                </span>
                <span
                  className={cn(
                    badgeVariants({ variant: "outline" }),
                    "shrink-0 capitalize",
                    "badge-level-" + topic.level
                  )}
                >
                  {topic.level}
                </span>
              </span>
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-normal text-[var(--text-secondary)]">
                <span>
                  {topic.evidenceCoverage.practicedCount}/{topic.requiredProblems} Core
                  practiced
                </span>
                {stage && (
                  <span className="min-w-0 [overflow-wrap:anywhere]">
                    <span aria-hidden="true" className="mr-2">
                      ·
                    </span>
                    {stage}
                  </span>
                )}
                {hasRegression && (
                  <span className="inline-flex items-center gap-1 text-red-400">
                    <Icon icon={Alert02Icon} size={12} aria-hidden="true" />
                    Recall slipped
                  </span>
                )}
              </span>
            </span>

            <span className="col-span-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <EvidenceRail
                score={topic.score}
                emphasized={isSelected}
                hasRegression={hasRegression}
                tooltipText={`${topic.topicName}\nEvidence ${topic.score}/100\nCore Coverage: ${topic.evidenceCoverage.practicedCount}/${topic.requiredProblems} problems`}
              />
              <span className="min-w-14 text-right text-xs tabular-nums">
                {topic.score}{" "}
                <span className="font-normal text-[var(--text-secondary)]">/ 100</span>
              </span>
            </span>
          </Button>
        );
      })}
    </div>
  );
}
