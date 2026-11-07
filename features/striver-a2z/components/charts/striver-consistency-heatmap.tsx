"use client";

import * as React from "react";
import { PrimeChartContainer } from "./prime-chart-container";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontalIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { StriverHeatmapDay } from "../../types";

interface StriverConsistencyHeatmapProps {
  data: StriverHeatmapDay[];
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function StriverConsistencyHeatmap({ data }: StriverConsistencyHeatmapProps) {
  // Range selection (12W, 26W, or all available data)
  const availableWeeks = Math.ceil(data.length / 7);
  const [selectedRange, setSelectedRange] = React.useState<"12w" | "26w" | "all">(() => {
    if (availableWeeks >= 26) return "26w";
    return "all";
  });

  // Filter data based on selected range
  const activeData = React.useMemo(() => {
    if (selectedRange === "12w") {
      return data.slice(-84); // Past 12 weeks (84 days)
    }
    if (selectedRange === "26w") {
      return data.slice(-182); // Past 26 weeks (182 days)
    }
    return data;
  }, [data, selectedRange]);

  // Organize days into columns of 7 days (weeks)
  const weeks = React.useMemo(() => {
    const cols: StriverHeatmapDay[][] = [];
    let currentWeek: StriverHeatmapDay[] = [];

    activeData.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === activeData.length - 1) {
        cols.push(currentWeek);
        currentWeek = [];
      }
    });

    return cols;
  }, [activeData]);

  // Determine which columns display a month label
  const monthLabels = React.useMemo(() => {
    let lastMonth = -1;
    return weeks.map((week) => {
      if (!week[0]) return "";
      const d = new Date(week[0].date);
      const m = d.getMonth();
      if (m !== lastMonth) {
        lastMonth = m;
        return MONTH_NAMES[m];
      }
      return "";
    });
  }, [weeks]);

  const getIntensityColor = (level: number) => {
    switch (level) {
      case 4:
        return "bg-[#FF0000] border-[#FF6666] shadow-[0_0_12px_rgba(255,0,0,0.5)]";
      case 3:
        return "bg-[#C00000] border-[#E00000] shadow-[0_0_8px_rgba(255,0,0,0.3)]";
      case 2:
        return "bg-[#7A0000] border-[#990000] shadow-[0_0_6px_rgba(255,0,0,0.18)]";
      case 1:
        return "bg-[#3D0A0A] border-[#661111]";
      default:
        return "bg-white/[0.03] border-white/[0.05] hover:border-white/20";
    }
  };

  return (
    <PrimeChartContainer
      title="Learning Activity & Momentum Heatmap"
      subtitle="Engineering contribution calendar tracking daily video lectures, problem solving, and practice velocity."
      minHeight={200}
      controls={
        data.length > 84 ? (
          <div className="inline-flex items-center gap-0.5 border border-white/[0.08] rounded-lg p-0.5 bg-black/60 font-mono text-[10px]">
            <button
              type="button"
              onClick={() => setSelectedRange("12w")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all select-none",
                selectedRange === "12w"
                  ? "bg-white/[0.15] text-white font-bold shadow-xs"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              12 Weeks
            </button>
            <button
              type="button"
              onClick={() => setSelectedRange("26w")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all select-none",
                selectedRange === "26w"
                  ? "bg-white/[0.15] text-white font-bold shadow-xs"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              26 Weeks
            </button>
            <button
              type="button"
              onClick={() => setSelectedRange("all")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all select-none",
                selectedRange === "all"
                  ? "bg-white/[0.15] text-white font-bold shadow-xs"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              All
            </button>
          </div>
        ) : undefined
      }
      mobileControls={
        data.length > 84 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0 border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/[0.08]"
                aria-label="Heatmap window options"
              >
                <Icon icon={MoreHorizontalIcon} size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#0C0C0C] border-white/10 text-neutral-200 font-mono text-xs shadow-xl">
              <DropdownMenuLabel className="text-[10px] uppercase text-neutral-500 tracking-wider px-2 py-1">
                Time Window
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setSelectedRange("12w")}
                className={cn(
                  "cursor-pointer justify-between text-xs px-2 py-1.5 focus:bg-white/[0.08]",
                  selectedRange === "12w" ? "text-white font-bold bg-white/[0.06]" : "text-neutral-400"
                )}
              >
                <span>12 Weeks (~3 Mo)</span>
                {selectedRange === "12w" && <Icon icon={Tick02Icon} size={13} className="text-[#FF0000]" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedRange("26w")}
                className={cn(
                  "cursor-pointer justify-between text-xs px-2 py-1.5 focus:bg-white/[0.08]",
                  selectedRange === "26w" ? "text-white font-bold bg-white/[0.06]" : "text-neutral-400"
                )}
              >
                <span>26 Weeks (~6 Mo)</span>
                {selectedRange === "26w" && <Icon icon={Tick02Icon} size={13} className="text-[#FF0000]" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedRange("all")}
                className={cn(
                  "cursor-pointer justify-between text-xs px-2 py-1.5 focus:bg-white/[0.08]",
                  selectedRange === "all" ? "text-white font-bold bg-white/[0.06]" : "text-neutral-400"
                )}
              >
                <span>All Time</span>
                {selectedRange === "all" && <Icon icon={Tick02Icon} size={13} className="text-[#FF0000]" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : undefined
      }
    >
      <div className="space-y-4 pt-1">
        {/* Expanded Heatmap Calendar Grid with Month Headers */}
        <TooltipProvider delayDuration={100}>
          <div className="overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="inline-flex flex-col gap-1.5 select-none min-w-max">
              {/* Month Labels Row */}
              <div className="flex items-center text-[10px] font-mono text-neutral-400 h-4 mb-0.5">
                {/* Spacer matching day-of-week label width */}
                <div className="w-7 sm:w-8 shrink-0" />

                {/* Month labels aligned with week columns */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {weeks.map((week, idx) => (
                    <div
                      key={idx}
                      className="w-3.5 sm:w-4 shrink-0 text-left font-semibold relative"
                    >
                      {monthLabels[idx] && (
                        <span className="absolute left-0 top-0 text-neutral-300 text-[10px] whitespace-nowrap">
                          {monthLabels[idx]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Day-of-week labels + Weekly Grid Columns */}
              <div className="flex items-start">
                {/* Day-of-week vertical labels synchronized with 7 rows */}
                <div className="w-7 sm:w-8 shrink-0 flex flex-col gap-1 sm:gap-1.5 text-[10px] font-mono text-neutral-500 pr-1 select-none">
                  <span className="h-3.5 sm:h-4 leading-none flex items-center">Mon</span>
                  <span className="h-3.5 sm:h-4 leading-none flex items-center opacity-0" aria-hidden="true">Tue</span>
                  <span className="h-3.5 sm:h-4 leading-none flex items-center">Wed</span>
                  <span className="h-3.5 sm:h-4 leading-none flex items-center opacity-0" aria-hidden="true">Thu</span>
                  <span className="h-3.5 sm:h-4 leading-none flex items-center">Fri</span>
                  <span className="h-3.5 sm:h-4 leading-none flex items-center opacity-0" aria-hidden="true">Sat</span>
                  <span className="h-3.5 sm:h-4 leading-none flex items-center opacity-0" aria-hidden="true">Sun</span>
                </div>

                {/* Weekly Columns */}
                <div className="flex items-start gap-1 sm:gap-1.5">
                  {weeks.map((week, wIndex) => (
                    <div key={wIndex} className="flex flex-col gap-1 sm:gap-1.5 shrink-0">
                      {week.map((day) => (
                        <Tooltip key={day.date}>
                          <TooltipTrigger asChild>
                            <div
                              tabIndex={0}
                              className={cn(
                                "w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-xs border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white",
                                getIntensityColor(day.level),
                                "hover:scale-125 hover:z-10 hover:border-white/60"
                              )}
                              aria-label={`${day.date}: ${day.count} activities`}
                            />
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="text-xs font-mono p-3 space-y-1.5 bg-[#0D0D0D] border-white/10 shadow-xl"
                          >
                            <div className="font-bold text-white border-b border-white/10 pb-1 flex items-center justify-between gap-4">
                              <span>{day.date}</span>
                              {day.count > 0 && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FF0000]/15 text-[#FF0000] border border-[#FF0000]/30 font-semibold">
                                  {day.count} {day.count === 1 ? "action" : "actions"}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-300">
                              {day.count === 0 ? (
                                <span className="text-neutral-500">No practice or lecture activity</span>
                              ) : (
                                <div className="space-y-0.5">
                                  <div className="flex items-center justify-between gap-3 text-neutral-300">
                                    <span>Verified Lectures:</span>
                                    <strong className="text-[#FF4D4D]">{day.videos}</strong>
                                  </div>
                                  <div className="flex items-center justify-between gap-3 text-neutral-300">
                                    <span>Coding Problems:</span>
                                    <strong className="text-white">{day.problems}</strong>
                                  </div>
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TooltipProvider>

        {/* 3. Heatmap Footer & Intensity Scale */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px] text-neutral-400 border-t border-white/[0.06] pt-3.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">
              {activeData.length}-Day Window
            </span>
            <span className="text-neutral-600">•</span>
            <span className="text-neutral-500">
              {weeks.length} Weeks of Tracked Activity
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-neutral-500 text-[10px]">Less</span>
            <span className="h-3 w-3 rounded-xs bg-white/[0.03] border border-white/[0.05]" title="0 actions" />
            <span className="h-3 w-3 rounded-xs bg-[#3D0A0A] border border-[#661111]" title="1 action" />
            <span className="h-3 w-3 rounded-xs bg-[#7A0000] border border-[#990000]" title="2-3 actions" />
            <span className="h-3 w-3 rounded-xs bg-[#C00000] border border-[#E00000]" title="4-6 actions" />
            <span className="h-3 w-3 rounded-xs bg-[#FF0000] border border-[#FF6666] shadow-[0_0_8px_rgba(255,0,0,0.5)]" title="7+ actions" />
            <span className="text-neutral-500 text-[10px]">More</span>
          </div>
        </div>
      </div>
    </PrimeChartContainer>
  );
}
