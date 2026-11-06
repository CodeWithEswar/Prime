"use client";

import * as React from "react";
import {
  VideoReplayIcon,
  CodeCircleIcon,
  Award01Icon,
  RepeatIcon,
  Flag01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { PrimeChartContainer } from "./prime-chart-container";
import type { StriverMilestoneItem } from "../../types";

interface StriverMilestonesTimelineProps {
  milestones: StriverMilestoneItem[];
}

export function StriverMilestonesTimeline({ milestones }: StriverMilestonesTimelineProps) {
  const getIcon = (cat: string) => {
    switch (cat) {
      case "video":
        return <Icon icon={VideoReplayIcon} size={13} className="text-[#FF0000]" />;
      case "problem":
        return <Icon icon={CodeCircleIcon} size={13} className="text-emerald-400" />;
      case "topic":
        return <Icon icon={Award01Icon} size={13} className="text-amber-400" />;
      case "revision":
        return <Icon icon={RepeatIcon} size={13} className="text-blue-400" />;
      default:
        return <Icon icon={Flag01Icon} size={13} className="text-purple-400" />;
    }
  };

  return (
    <PrimeChartContainer
      title="Chronological Learning Milestones"
      subtitle="Verified timeline tracking course enrollment, first lecture, and problem completion milestones."
      badge={`${milestones.length} Events Logged`}
      minHeight={280}
    >
      <div className="h-64 sm:h-72 overflow-y-auto pr-1 space-y-4 pt-1 scrollbar-thin scrollbar-thumb-white/10">
        <div className="relative border-l border-white/[0.08] ml-3.5 space-y-5 py-1">
          {milestones.map((item) => (
            <div key={item.id} className="relative pl-6 space-y-1">
              {/* Event Circle Marker */}
              <div className="absolute -left-3 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#121212] border border-white/[0.12] shadow-sm">
                {getIcon(item.category)}
              </div>

              {/* Event Content */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-mono">
                <span className="text-xs font-semibold text-white tracking-tight">
                  {item.title}
                </span>
                <span className="text-[10px] text-neutral-500 shrink-0">
                  {item.timestamp ? item.timestamp.slice(0, 10) : "Recent"}
                </span>
              </div>

              <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PrimeChartContainer>
  );
}

