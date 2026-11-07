"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
import { PrimeChartContainer } from "@/features/striver-a2z/components/charts/prime-chart-container";
import { PrimeChartTooltip } from "@/features/striver-a2z/components/charts/prime-chart-tooltip";
import { PrimeSlimBarCursor } from "@/features/striver-a2z/components/charts/prime-chart-cursor";
import { primeChartColors, primeChartFont } from "@/features/striver-a2z/components/charts/prime-chart-theme";
import { cn } from "@/lib/utils";
import type { KunalAssignmentProgressItem, AssignmentStatus } from "../../types";

interface KunalAssignmentsChartProps {
  data: KunalAssignmentProgressItem[];
}

export function KunalAssignmentsChart({ data }: KunalAssignmentsChartProps) {
  const [filter, setFilter] = React.useState<"all" | AssignmentStatus>("all");

  const filteredData = React.useMemo(() => {
    if (filter === "all") return data;
    return data.filter((a) => a.status === filter);
  }, [data, filter]);

  const chartData = React.useMemo(() => {
    return filteredData.map((a) => ({
      name: `A${a.number}`,
      fullName: a.title,
      solved: a.solvedProblems,
      total: a.totalProblems,
      progressPct: a.progressPct,
      status: a.status,
    }));
  }, [filteredData]);

  return (
    <PrimeChartContainer
      title="Official Course Assignments & Practice Progress"
      subtitle="Track problem solving across all 18 verified assignments from Kunal Kushwaha's official GitHub repository."
      minHeight={320}
      controls={
        <div className="inline-flex items-center gap-0.5 border border-white/[0.08] rounded-lg p-0.5 bg-black/60 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "px-2.5 py-1 rounded-md transition-all select-none",
              filter === "all"
                ? "bg-white/[0.15] text-white font-bold shadow-xs"
                : "text-neutral-400 hover:text-white"
            )}
          >
            All (18)
          </button>
          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={cn(
              "px-2.5 py-1 rounded-md transition-all select-none",
              filter === "completed"
                ? "bg-white/[0.15] text-white font-bold shadow-xs"
                : "text-neutral-400 hover:text-white"
            )}
          >
            Completed
          </button>
          <button
            type="button"
            onClick={() => setFilter("in_progress")}
            className={cn(
              "px-2.5 py-1 rounded-md transition-all select-none",
              filter === "in_progress"
                ? "bg-white/[0.15] text-white font-bold shadow-xs"
                : "text-neutral-400 hover:text-white"
            )}
          >
            In Progress
          </button>
          <button
            type="button"
            onClick={() => setFilter("not_started")}
            className={cn(
              "px-2.5 py-1 rounded-md transition-all select-none",
              filter === "not_started"
                ? "bg-white/[0.15] text-white font-bold shadow-xs"
                : "text-neutral-400 hover:text-white"
            )}
          >
            Not Started
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
              aria-label="Assignment filter options"
            >
              <Icon icon={MoreHorizontalIcon} size={15} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-[#0C0C0C] border-white/10 text-neutral-200 font-mono text-xs shadow-xl">
            <DropdownMenuLabel className="text-[10px] uppercase text-neutral-500 tracking-wider px-2 py-1">
              Assignment Filter
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setFilter("all")}
              className={cn(
                "cursor-pointer justify-between text-xs px-2 py-1.5 focus:bg-white/[0.08]",
                filter === "all" ? "text-white font-bold bg-white/[0.06]" : "text-neutral-400"
              )}
            >
              <span>All ({data.length})</span>
              {filter === "all" && <Icon icon={Tick02Icon} size={13} className="text-[#FF0000]" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilter("completed")}
              className={cn(
                "cursor-pointer justify-between text-xs px-2 py-1.5 focus:bg-white/[0.08]",
                filter === "completed" ? "text-white font-bold bg-white/[0.06]" : "text-neutral-400"
              )}
            >
              <span>Completed</span>
              {filter === "completed" && <Icon icon={Tick02Icon} size={13} className="text-[#FF0000]" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilter("in_progress")}
              className={cn(
                "cursor-pointer justify-between text-xs px-2 py-1.5 focus:bg-white/[0.08]",
                filter === "in_progress" ? "text-white font-bold bg-white/[0.06]" : "text-neutral-400"
              )}
            >
              <span>In Progress</span>
              {filter === "in_progress" && <Icon icon={Tick02Icon} size={13} className="text-[#FF0000]" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilter("not_started")}
              className={cn(
                "cursor-pointer justify-between text-xs px-2 py-1.5 focus:bg-white/[0.08]",
                filter === "not_started" ? "text-white font-bold bg-white/[0.06]" : "text-neutral-400"
              )}
            >
              <span>Not Started</span>
              {filter === "not_started" && <Icon icon={Tick02Icon} size={13} className="text-[#FF0000]" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pb-1 -mx-1 px-1">
        <div className="h-[280px] min-w-[500px] sm:min-w-full w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
            barSize={16}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={primeChartColors.grid}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke={primeChartColors.grid}
              tick={{ fill: primeChartColors.tickText, fontSize: 10, fontFamily: primeChartFont.familyMono }}
              tickLine={false}
              axisLine={{ stroke: primeChartColors.grid }}
              interval={0}
            />
            <YAxis
              stroke={primeChartColors.grid}
              tick={{ fill: primeChartColors.tickText, fontSize: 10, fontFamily: primeChartFont.familyMono }}
              tickLine={false}
              axisLine={false}
              unit="%"
              domain={[0, 100]}
            />
            <Tooltip
              cursor={<PrimeSlimBarCursor maxWidth={28} />}
              content={(props) => (
                <PrimeChartTooltip
                  active={props.active}
                  payload={props.payload?.map((p) => ({
                    name: p.name as string,
                    value: p.value as number,
                    color: "#FF0000",
                  }))}
                  label={props.label}
                  valueFormatter={(val) => `${val}%`}
                />
              )}
            />
            <Bar
              dataKey="progressPct"
              name="Assignment Completion"
              fill="#FF0000"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    </PrimeChartContainer>
  );
}

