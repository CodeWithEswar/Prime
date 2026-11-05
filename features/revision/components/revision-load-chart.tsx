"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Tooltip,
} from "recharts";
import type { WorkloadDay } from "../types";

interface RevisionLoadChartProps {
  workload: WorkloadDay[];
}

export function RevisionLoadChart({ workload }: RevisionLoadChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const maxCount = Math.max(...workload.map((d) => d.count), 12);
  const yDomain = [0, Math.ceil(maxCount / 3) * 3];

  return (
    <div className="p-4 sm:p-5 rounded-md border border-[#1C1C1C] bg-[#0A0A0A]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-white tracking-wide">
          Revision Load (Next 7 Days)
        </h3>
      </div>

      <div className="h-44 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              accessibilityLayer={false}
              data={workload}
              margin={{ top: 8, right: 6, left: -22, bottom: 0 }}
            >
              <CartesianGrid stroke="#1A1A1A" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="fullLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#666666", fontSize: 9, fontFamily: "monospace" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#666666", fontSize: 9, fontFamily: "monospace" }}
                domain={yDomain}
                ticks={[0, 3, 6, 9, 12]}
              />
              <Tooltip
                cursor={{ fill: "rgba(255, 0, 0, 0.04)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as WorkloadDay;
                    return (
                      <div className="p-2.5 rounded-lg bg-[#080808]/95 backdrop-blur-md border border-[#242424] text-xs font-mono shadow-2xl">
                        <div className="flex items-center gap-1.5 text-[#888888] text-[10px]">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              data.isToday
                                ? "bg-[#FF0000] shadow-[0_0_6px_#FF0000]"
                                : "bg-[#666666]"
                            }`}
                          />
                          {data.fullLabel}
                        </div>
                        <div className="text-white font-semibold mt-1">
                          {data.count} problem{data.count !== 1 ? "s" : ""} due
                          {data.isToday && (
                            <span className="text-[#FF0000] ml-1.5 font-bold">(Today)</span>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={28}>
                {workload.map((entry, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={entry.isToday ? "#FF0000" : "#E5E5E5"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-[#111111]/40 rounded animate-pulse" />
        )}
      </div>
    </div>
  );
}

