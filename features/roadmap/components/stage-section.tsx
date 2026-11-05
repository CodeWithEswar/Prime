"use client";

import { useState } from "react";
import Link from "next/link";
import type { RoadmapStageData } from "../types";
import { CurriculumProblemRow } from "./curriculum-problem-row";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { LabLinks } from "@/features/algorithm-lab/components/lab-links";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";

interface StageSectionProps {
  stage: RoadmapStageData;
  nextProblemId?: string;
  defaultExpanded?: boolean;
}

export function StageSection({
  stage,
  nextProblemId,
  defaultExpanded = true,
}: StageSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const seqFormatted = stage.sequence.toString().padStart(2, "0");

  return (
    <section
      id={`stage-${stage.stageSlug}`}
      data-stage-id={stage.stageId}
      className={`scroll-mt-24 rounded-lg border transition-all ${
        stage.isCurrent
          ? "border-[#2A2A2A] bg-[#0A0A0A]/80 shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
          : "border-[#161616] bg-[#070707]/60"
      }`}
    >
      {/* Stage Header */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Sequence + Title */}
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-[11px] font-bold tracking-widest uppercase ${
                  stage.isCurrent
                    ? "text-[#FF0000]"
                    : stage.isCompleted
                      ? "text-white"
                      : "text-[#666666]"
                }`}
              >
                STAGE {seqFormatted}
              </span>
              {stage.isCompleted && (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#22C55E]">
                  <Icon icon={CheckmarkCircle02Icon} size={11} />
                  Complete
                </span>
              )}
              {stage.isCurrent && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#FF0000]/15 text-[#FF4D4D] border border-[#FF0000]/30 uppercase tracking-wider">
                  Active Stage
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {stage.stageName}
            </h2>

            <LabLinks topics={[stage.stageSlug]} label="Learn visually"/>
            {!stage.isCompleted && <Button asChild variant="secondary" size="sm">
              <Link href={"/plan?stage=" + encodeURIComponent(stage.stageSlug)}>Plan stage work</Link>
            </Button>}
            {stage.description && (
              <p className="text-xs text-[#888888] line-clamp-2 max-w-2xl leading-relaxed">
                {stage.description}
              </p>
            )}
          </div>

          {/* Right: Stage Stats & Collapse Button */}
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto pt-2.5 sm:pt-0 border-t border-[#161616]/70 sm:border-t-0">
            {/* Completion Counter & Mini Bar */}
            <div className="flex items-center sm:block gap-3 sm:gap-0 text-left sm:text-right">
              <div className="font-mono text-xs font-bold text-white shrink-0">
                {stage.completedRequired}{" "}
                <span className="text-[#666666] font-normal">
                  / {stage.totalRequired}
                </span>{" "}
                <span className="text-[11px] text-[#888888] font-normal">
                  ({stage.completionPercentage}%)
                </span>
              </div>
              <div className="w-24 sm:w-32 h-1 bg-[#1A1A1A] rounded-full overflow-hidden mt-0 sm:mt-1.5 shrink-0">
                <div
                  className={`h-full transition-all duration-500 ${
                    stage.isCompleted
                      ? "bg-white"
                      : stage.isCurrent
                        ? "bg-[#FF0000]"
                        : "bg-[#555555]"
                  }`}
                  style={{ width: `${stage.completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Toggle Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Collapse stage" : "Expand stage"}
              className="shrink-0"
            >
              <Icon
                icon={isExpanded ? ArrowUp01Icon : ArrowDown01Icon}
                size={16}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Stage Problem List with Learning Spine */}
      {isExpanded && (
        <div className="border-t border-[#141414] p-3 sm:p-4 space-y-2">
          {stage.items.map((item) => (
            <CurriculumProblemRow
              key={item.id}
              item={item}
              isNextUp={item.id === nextProblemId}
            />
          ))}
        </div>
      )}
    </section>
  );
}
