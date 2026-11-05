"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Icon } from "@/components/ui/icon";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import type { RetentionPoint } from "../types";

interface RetentionTrendChartProps {
  trend: RetentionPoint[];
}

export function RetentionTrendChart({ trend }: RetentionTrendChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const yLabels = ["Forgot", "Hard", "Okay", "Easy"];

  return (
    <div className="p-4 sm:p-5 rounded-md border border-[#1C1C1C] bg-[#0A0A0A]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-bold text-white tracking-wide">
            Retention Trend
          </h3>
          <span title="Tracks average recall performance across repeated review stages (R1 to R4)">
            <Icon
              icon={InformationCircleIcon}
              size={13}
              className="text-[#666666] cursor-help hover:text-[#999999]"
            />
          </span>
        </div>
      </div>

      <div className="h-44 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              accessibilityLayer={false}
              data={trend}
              margin={{ top: 12, right: 12, left: -14, bottom: 0 }}
            >
              <defs>
                <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF0000" stopOpacity={0.32} />
                  <stop offset="60%" stopColor="#FF0000" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#FF0000" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1A1A1A" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="milestone"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#666666", fontSize: 10, fontFamily: "monospace" }}
              />
              <YAxis
                domain={[0.8, 4.2]}
                ticks={[1, 2, 3, 4]}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => yLabels[val - 1] ?? ""}
                tick={{ fill: "#666666", fontSize: 9, fontFamily: "monospace" }}
              />
              <Tooltip
                cursor={{ stroke: "#333333", strokeWidth: 1 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as RetentionPoint;
                    return (
                      <div className="p-2.5 rounded-lg bg-[#080808]/95 backdrop-blur-md border border-[#242424] text-xs font-mono shadow-2xl">
                        <div className="flex items-center gap-1.5 text-[#888888] text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000] shadow-[0_0_6px_#FF0000]" />
                          Milestone: {data.milestone}
                        </div>
                        <div className="text-white font-semibold mt-1">
                          Retention: <span className="text-[#FF0000]">{data.label}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#FF0000"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#retentionGradient)"
                dot={{
                  r: 3.5,
                  fill: "#0A0A0A",
                  stroke: "#FF0000",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 5,
                  fill: "#FF0000",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-[#111111]/40 rounded animate-pulse" />
        )}
      </div>
    </div>
  );
}

