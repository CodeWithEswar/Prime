"use client";

import { useEffect, useState } from "react";
import type { RoadmapStageData } from "../types";
import { Icon } from "@/components/ui/icon";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

interface StageRailProps {
  stages: RoadmapStageData[];
  currentStageId: string | null;
}

export function StageRail({ stages, currentStageId }: StageRailProps) {
  const [activeStageId, setActiveStageId] = useState<string>(
    currentStageId || stages[0]?.stageId || ""
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) {
          const id = visible[0].target.getAttribute("data-stage-id");
          if (id) setActiveStageId(id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    stages.forEach((stage) => {
      const el = document.getElementById(`stage-${stage.stageSlug}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [stages]);

  const scrollToStage = (stageSlug: string, stageId: string) => {
    setActiveStageId(stageId);
    const element = document.getElementById(`stage-${stageSlug}`);
    if (element) {
      const yOffset = -70; // Header offset
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <nav
      className="hidden xl:block w-64 shrink-0 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar space-y-1 pr-3 border-r border-[#161616]"
      aria-label="Roadmap Stages Navigation"
    >
      <div className="text-[10px] font-mono uppercase tracking-widest text-[#555555] px-3 pb-2 font-bold">
        Curriculum Stages
      </div>

      <div className="space-y-0.5">
        {stages.map((stage) => {
          const isSelected = stage.stageId === activeStageId;
          const isCurrent = stage.isCurrent;
          const isCompleted = stage.isCompleted;
          const seqFormatted = stage.sequence.toString().padStart(2, "0");

          return (
            <button
              key={stage.stageId}
              type="button"
              onClick={() => scrollToStage(stage.stageSlug, stage.stageId)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-left text-xs transition-all group ${
                isSelected
                  ? "bg-[#141414] text-white border-l-2 border-[#FF0000]"
                  : "text-[#777777] hover:text-[#CCCCCC] hover:bg-[#0A0A0A]"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                {/* State Beacon */}
                {isCompleted ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                ) : isCurrent ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000] shadow-[0_0_6px_#FF0000] shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2A2A2A] shrink-0 group-hover:bg-[#444444]" />
                )}

                <span className="font-mono text-[11px] text-[#555555] shrink-0">
                  {seqFormatted}
                </span>

                <span className="truncate font-medium">{stage.stageName}</span>
              </div>

              {/* Progress Count */}
              <span className="font-mono text-[10px] text-[#555555] shrink-0">
                {stage.completedRequired}/{stage.totalRequired}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

