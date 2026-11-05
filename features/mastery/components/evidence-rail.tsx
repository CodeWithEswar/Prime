"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface EvidenceRailProps {
  score: number; // 0 - 100
  emphasized?: boolean;
  hasRegression?: boolean;
  className?: string;
  tooltipText?: string;
}

export function EvidenceRail({
  score,
  emphasized = false,
  hasRegression = false,
  className,
  tooltipText,
}: EvidenceRailProps) {
  const boundedScore = Math.max(0, Math.min(100, score));
  const defaultTooltip = `Evidence ${boundedScore} / 100\nBased on: Independent solving, Retention, Repetition, Timing, Calibration, and Freshness.`;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn("evidence-rail-container", className)}
            data-emphasized={emphasized && boundedScore > 0}
            role="progressbar"
            aria-valuenow={boundedScore}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Demonstrated evidence: ${boundedScore} out of 100`}
          >
            <span
              className={cn("evidence-rail-fill", hasRegression && "is-regression")}
              style={{ width: `${boundedScore}%` }}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[min(18rem,calc(100vw-1.5rem))] whitespace-pre-line text-xs"
        >
          {tooltipText || defaultTooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
