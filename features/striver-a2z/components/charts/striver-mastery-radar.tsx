"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import { MoreHorizontalIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { PrimeChartContainer } from "./prime-chart-container";
import { PrimeChartTooltip } from "./prime-chart-tooltip";
import { primeChartColors, primeChartFont } from "./prime-chart-theme";
import { useMounted } from "../../hooks/use-mounted";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StriverRadarDimension } from "../../types";

interface StriverMasteryRadarProps {
  data: StriverRadarDimension[];
}

export function StriverMasteryRadar({ data }: StriverMasteryRadarProps) {
  const mounted = useMounted();
  const [viewMode, setViewMode] = React.useState<"radar" | "table">("radar");

  return (
    <PrimeChartContainer
      title="Algorithmic Mastery Radar"
      subtitle="Evaluated proficiency across six primary data structure and algorithm domains."
      minHeight={280}
      controls={
        <div className="inline-flex items-center gap-0.5 border border-white/[0.08] rounded-lg p-0.5 bg-black/60 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => setViewMode("radar")}
            className={cn(
              "px-2.5 py-1 rounded-md transition-all select-none",
              viewMode === "radar"
                ? "bg-white/[0.15] text-white font-bold shadow-xs"
                : "text-neutral-400 hover:text-white"
            )}
          >
            Radar
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={cn(
              "px-2.5 py-1 rounded-md transition-all select-none",
              viewMode === "table"
                ? "bg-white/[0.15] text-white font-bold shadow-xs"
                : "text-neutral-400 hover:text-white"
            )}
          >
            Data Table
          </button>
        </div>
      }
      mobileControls={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/[0.08]"
              aria-label="Mastery view options"
            >
              <Icon icon={MoreHorizontalIcon} size={15} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-[#0C0C0C] border-white/10 text-neutral-200 font-mono text-xs shadow-xl">
            <DropdownMenuLabel className="text-[10px] uppercase text-neutral-500 tracking-wider px-2 py-1">
              View Format
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setViewMode("radar")}
              className={cn(
                "cursor-pointer justify-between text-xs px-2 py-1.5 focus:bg-white/[0.08]",
                viewMode === "radar" ? "text-white font-bold bg-white/[0.06]" : "text-neutral-400"
              )}
            >
              <span>Radar Chart</span>
              {viewMode === "radar" && <Icon icon={Tick02Icon} size={13} className="text-[#FF0000]" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setViewMode("table")}
              className={cn(
                "cursor-pointer justify-between text-xs px-2 py-1.5 focus:bg-white/[0.08]",
                viewMode === "table" ? "text-white font-bold bg-white/[0.06]" : "text-neutral-400"
              )}
            >
              <span>Data Table</span>
              {viewMode === "table" && <Icon icon={Tick02Icon} size={13} className="text-[#FF0000]" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <div className="h-64 sm:h-72 w-full pt-1">
        {viewMode === "radar" ? (
          mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                <PolarGrid stroke={primeChartColors.grid} />
                <PolarAngleAxis
                  dataKey="domain"
                  stroke={primeChartColors.tickText}
                  fontSize={primeChartFont.sizeXs}
                  fontFamily={primeChartFont.familyMono}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  stroke={primeChartColors.tickText}
                  fontSize={8}
                  tick={false}
                />
                <Tooltip
                  content={(props) => (
                    <PrimeChartTooltip
                      active={props.active}
                      payload={props.payload?.map((p) => ({
                        name: "Mastery Score",
                        value: p.value as number,
                        color: primeChartColors.primary,
                        unit: "%",
                      }))}
                      label={props.label}
                      titleFormatter={(l) => `${l}`}
                    />
                  )}
                />
                <Radar
                  name="Mastery Score"
                  dataKey="score"
                  stroke={primeChartColors.primary}
                  fill={primeChartColors.primary}
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full bg-white/[0.02] rounded-lg animate-pulse" />
          )
        ) : (
          /* Accessible Data Table Alternative */
          <div className="h-full overflow-y-auto overflow-x-auto divide-y divide-white/[0.04] text-xs font-mono">
            <div className="grid grid-cols-4 gap-2 font-bold text-neutral-400 uppercase text-[10px] pb-2 border-b border-white/[0.08]">
              <span>Domain</span>
              <span>Solved</span>
              <span>Mastery</span>
              <span className="text-right">Level</span>
            </div>
            {data.map((item) => (
              <div key={item.domain} className="grid grid-cols-4 gap-2 py-2 items-center">
                <span className="text-white font-medium truncate">{item.domain}</span>
                <span className="text-neutral-300">
                  {item.solved} / {item.total}
                </span>
                <span className="text-emerald-400 font-semibold">{item.score}%</span>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 border-white/10 text-neutral-300"
                  >
                    {item.level}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PrimeChartContainer>
  );
}

