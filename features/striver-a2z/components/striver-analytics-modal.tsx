"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { ChartLineData02Icon } from "@hugeicons/core-free-icons";
import type { StriverAnalyticsData } from "../types";

interface StriverAnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analytics: StriverAnalyticsData;
}

export function StriverAnalyticsModal({
  open,
  onOpenChange,
  analytics,
}: StriverAnalyticsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0A0A0A] border-white/[0.1] text-white p-6 space-y-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Icon icon={ChartLineData02Icon} size={20} className="text-[#FF0000]" />
            <DialogTitle className="font-mono text-base font-semibold text-white uppercase tracking-wider">
              Striver A2Z Learning & Practice Analytics
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-neutral-400 font-mono">
            Independent telemetry separating video consumption from algorithmic problem solving and topic mastery.
          </DialogDescription>
        </DialogHeader>

        {/* 2x2 Recharts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Chart A: Video Completion Trend */}
          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0E0E0E] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-white uppercase">
                Video Completion Trend
              </span>
              <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-neutral-400">
                7-Day Run
              </Badge>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.videoCompletionTrend}>
                  <defs>
                    <linearGradient id="vidGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF0000" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#FF0000" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} />
                  <YAxis stroke="#666" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#000", borderColor: "#333", fontSize: "11px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#FF0000"
                    fillOpacity={1}
                    fill="url(#vidGrad)"
                    name="Completed Videos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart B: Problems Solved by Topic */}
          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0E0E0E] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-white uppercase">
                Coding Problems Solved
              </span>
              <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-neutral-400">
                By Difficulty
              </Badge>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.problemsByTopic}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="topic" stroke="#666" fontSize={9} />
                  <YAxis stroke="#666" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#000", borderColor: "#333", fontSize: "11px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Bar dataKey="easy" stackId="a" fill="#10B981" name="Easy" />
                  <Bar dataKey="medium" stackId="a" fill="#F59E0B" name="Medium" />
                  <Bar dataKey="hard" stackId="a" fill="#EF4444" name="Hard" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart C: Topic Coverage Comparison (Video vs Practice) */}
          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0E0E0E] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-white uppercase">
                Topic Coverage Comparison
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                Video % vs Solve %
              </span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={analytics.topicCoverage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis type="number" domain={[0, 100]} stroke="#666" fontSize={10} />
                  <YAxis dataKey="topic" type="category" stroke="#666" fontSize={9} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#000", borderColor: "#333", fontSize: "11px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Bar dataKey="videoPct" fill="#FF0000" name="Video Watched %" />
                  <Bar dataKey="practicePct" fill="#10B981" name="Problems Solved %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart D: Weekly Learning Consistency */}
          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0E0E0E] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-white uppercase">
                Weekly Consistency
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                Daily Study Activity
              </span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.weeklyConsistency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="day" stroke="#666" fontSize={10} />
                  <YAxis stroke="#666" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#000", borderColor: "#333", fontSize: "11px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Bar dataKey="videosWatched" fill="#FF0000" name="Videos" />
                  <Bar dataKey="problemsSolved" fill="#10B981" name="Problems" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

