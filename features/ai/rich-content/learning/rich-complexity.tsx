"use client";

import * as React from "react";
import { Clock01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { getComplexityTier } from "../tables/rich-table-utils";

export interface RichComplexityProps {
  time?: string;
  space?: string;
  best?: string;
  worst?: string;
  average?: string;
  explanation?: string;
  className?: string;
}

export function RichComplexity({
  time,
  space,
  best,
  worst,
  average,
  explanation,
  className,
}: RichComplexityProps) {
  const renderBadge = (val?: string) => {
    if (!val) return null;
    const tier = getComplexityTier(val);
    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold border",
          tier === "constant" && "bg-[#10B981]/15 text-[#6EE7B7] border-[#10B981]/30",
          tier === "log" && "bg-[#3B82F6]/15 text-[#93C5FD] border-[#3B82F6]/30",
          tier === "linear" && "bg-[#F59E0B]/15 text-[#FCD34D] border-[#F59E0B]/30",
          tier === "linearithmic" && "bg-[#F59E0B]/20 text-[#FCD34D] border-[#F59E0B]/35",
          (tier === "quadratic" || tier === "exponential") && "bg-[#EF4444]/20 text-[#FCA5A5] border-[#EF4444]/35",
          !tier && "bg-white/[0.08] text-white border-white/20"
        )}
      >
        {val}
      </span>
    );
  };

  return (
    <div
      className={cn(
        "my-4 rounded-xl border border-white/[0.08] bg-[#0A0A0A] p-3.5 sm:p-4 space-y-3 font-mono shadow-md",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2 text-xs">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-[#FF0000]/10 border border-[#FF0000]/25 text-[#FF0000]">
          <Icon icon={Clock01Icon} size={12} />
        </div>
        <span className="font-bold text-white uppercase tracking-wider text-[11px]">
          Computational Complexity
        </span>
      </div>

      {/* Grid of Dimensions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {time && (
          <div className="flex flex-col gap-1 p-2 rounded-lg bg-black border border-white/[0.04]">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Time</span>
            <div>{renderBadge(time)}</div>
          </div>
        )}
        {space && (
          <div className="flex flex-col gap-1 p-2 rounded-lg bg-black border border-white/[0.04]">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Space</span>
            <div>{renderBadge(space)}</div>
          </div>
        )}
        {best && (
          <div className="flex flex-col gap-1 p-2 rounded-lg bg-black border border-white/[0.04]">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Best Case</span>
            <div>{renderBadge(best)}</div>
          </div>
        )}
        {worst && (
          <div className="flex flex-col gap-1 p-2 rounded-lg bg-black border border-white/[0.04]">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Worst Case</span>
            <div>{renderBadge(worst)}</div>
          </div>
        )}
      </div>

      {explanation && (
        <p className="text-xs text-neutral-400 font-sans leading-relaxed pt-1 border-t border-white/[0.04]">
          {explanation}
        </p>
      )}
    </div>
  );
}

