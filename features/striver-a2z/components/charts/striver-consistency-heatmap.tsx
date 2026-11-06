"use client";

import * as React from "react";
import { PrimeChartContainer } from "./prime-chart-container";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { StriverHeatmapDay } from "../../types";

interface StriverConsistencyHeatmapProps {
  data: StriverHeatmapDay[];
}

export function StriverConsistencyHeatmap({ data }: StriverConsistencyHeatmapProps) {
  // Organize 84 days into 12 weeks (columns) of 7 days (rows)
  const weeks = React.useMemo(() => {
    const cols: StriverHeatmapDay[][] = [];
    let currentWeek: StriverHeatmapDay[] = [];

    data.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === data.length - 1) {
        cols.push(currentWeek);
        currentWeek = [];
      }
    });

    return cols;
  }, [data]);

  const totalActions = data.reduce((s, d) => s + d.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;

  const getIntensityColor = (level: number) => {
    switch (level) {
      case 4:
        return "bg-[#FF0000] border-[#FF4D4D]";
      case 3:
        return "bg-[#C00000] border-[#E00000]";
      case 2:
        return "bg-[#7A0000] border-[#990000]";
      case 1:
        return "bg-[#3D0A0A] border-[#551010]";
      default:
        return "bg-[#121212] border-white/[0.04]";
    }
  };

  return (
    <PrimeChartContainer
      title="Learning Activity & Momentum Heatmap"
      subtitle="12-week calendar tracking daily lecture watching and coding problem submissions."
      badge={`${activeDays} Active Days (${totalActions} Actions)`}
      minHeight={240}
    >
      <div className="pt-2 space-y-4">
        <TooltipProvider delayDuration={150}>
          <div className="overflow-x-auto pb-2 scrollbar-none">
            <div className="inline-flex gap-1.5 items-start select-none">
              {/* Day-of-week labels */}
              <div className="flex flex-col gap-1.5 text-[9px] font-mono text-neutral-500 pt-0.5 pr-2">
                <span className="h-3.5 leading-none">Mon</span>
                <span className="h-3.5 leading-none opacity-0">Tue</span>
                <span className="h-3.5 leading-none">Wed</span>
                <span className="h-3.5 leading-none opacity-0">Thu</span>
                <span className="h-3.5 leading-none">Fri</span>
                <span className="h-3.5 leading-none opacity-0">Sat</span>
                <span className="h-3.5 leading-none">Sun</span>
              </div>

              {/* 12 Weekly Columns */}
              {weeks.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-1.5">
                  {week.map((day) => (
                    <Tooltip key={day.date}>
                      <TooltipTrigger asChild>
                        <div
                          tabIndex={0}
                          className={cn(
                            "h-3.5 w-3.5 rounded-xs border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white",
                            getIntensityColor(day.level),
                            "hover:scale-110 hover:border-white/40"
                          )}
                          aria-label={`${day.date}: ${day.count} activities`}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs font-mono p-2.5 space-y-1">
                        <div className="font-bold text-white border-b border-white/10 pb-1">
                          {day.date}
                        </div>
                        <div className="text-[11px] text-neutral-300">
                          {day.count === 0 ? (
                            <span className="text-neutral-500">No study activity recorded</span>
                          ) : (
                            <span>
                              <strong className="text-white">{day.count}</strong> total actions:{" "}
                              <span className="text-[#FF4D4D]">{day.videos} lectures</span>,{" "}
                              <span className="text-emerald-400">{day.problems} problems</span>
                            </span>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </TooltipProvider>

        {/* Heatmap Legend */}
        <div className="flex items-center justify-between font-mono text-[10px] text-neutral-500 border-t border-white/[0.05] pt-3">
          <span>84-Day Window</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <span className="h-2.5 w-2.5 rounded-xs bg-[#121212] border border-white/[0.04]" />
            <span className="h-2.5 w-2.5 rounded-xs bg-[#3D0A0A] border border-[#551010]" />
            <span className="h-2.5 w-2.5 rounded-xs bg-[#7A0000] border border-[#990000]" />
            <span className="h-2.5 w-2.5 rounded-xs bg-[#C00000] border border-[#E00000]" />
            <span className="h-2.5 w-2.5 rounded-xs bg-[#FF0000] border-[#FF4D4D]" />
            <span>More</span>
          </div>
        </div>
      </div>
    </PrimeChartContainer>
  );
}

