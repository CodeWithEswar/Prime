"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft01Icon,
  Download01Icon,
  ChartLineData02Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StriverOverviewKpiStrip } from "./charts/striver-overview-kpi-strip";
import { StriverLearningTrendChart } from "./charts/striver-learning-trend-chart";
import { StriverProblemsColumnChart } from "./charts/striver-problems-column-chart";
import { StriverBalanceChart } from "./charts/striver-balance-chart";
import { StriverCoverageChart } from "./charts/striver-coverage-chart";
import { StriverConsistencyHeatmap } from "./charts/striver-consistency-heatmap";
import { StriverMasteryRadar } from "./charts/striver-mastery-radar";
import { StriverMilestonesTimeline } from "./charts/striver-milestones-timeline";
import type { StriverAnalyticsData } from "../types";

interface StriverAnalyticsViewProps {
  analytics: StriverAnalyticsData;
}

export function StriverAnalyticsView({ analytics }: StriverAnalyticsViewProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  // Real CSV Export Functionality
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const rows: string[] = [
        "PRIME Striver A2Z Learning & Practice Analytics Export",
        `Generated At: ${new Date().toISOString()}`,
        "",
        "--- OVERVIEW METRICS ---",
        "Metric,Value,Total,Percentage",
        `Lectures Completed,${analytics.overview.completedLectures},${analytics.overview.totalLectures},${analytics.overview.lecturePct}%`,
        `Problems Solved,${analytics.overview.solvedProblems},${analytics.overview.totalProblems},${analytics.overview.problemPct}%`,
        `Active Study Days,${analytics.overview.activeStudyDays},30 days,-`,
        `Overall Track Mastery,${analytics.overview.masteryPct}%,100%,${analytics.overview.masteryPct}%`,
        "",
        "--- DAILY COMPLETION TREND ---",
        "Date,Completed Lectures,Cumulative Lectures,Problems Solved,Cumulative Problems",
        ...analytics.videoCompletionTrend.map(
          (t) => `${t.date},${t.completed},${t.cumulative},${t.problemsSolved || 0},${t.cumulativeProblems || 0}`
        ),
        "",
        "--- TOPIC COVERAGE COMPARISON ---",
        "Topic,Video Watched %,Problems Solved %",
        ...analytics.topicCoverage.map((c) => `"${c.topic}",${c.videoPct}%,${c.practicePct}%`),
        "",
        "--- ALGORITHMIC MASTERY RADAR ---",
        "Domain,Solved Problems,Total Problems,Mastery Score,Proficiency Level",
        ...analytics.radarMastery.map(
          (m) => `"${m.domain}",${m.solved},${m.total},${m.score}%,${m.level}`
        ),
      ];

      const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(rows.join("\n"));
      const link = document.createElement("a");
      link.setAttribute("href", csvContent);
      link.setAttribute("download", `striver-a2z-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="space-y-1">
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-7 px-2 text-xs font-mono text-neutral-400 hover:text-white gap-1.5 p-0 hover:bg-transparent"
            >
              <Link href="/practice/dsa/sheets/striver-a2z">
                <Icon icon={ArrowLeft01Icon} size={14} />
                <span>Striver A2Z Track</span>
              </Link>
            </Button>
            <span className="text-neutral-600">/</span>
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000] font-bold">
              ANALYTICS & TELEMETRY
            </span>
          </div>

          <h1 className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Striver A2Z Learning Analytics
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-sans">
            Independent telemetry separating video consumption from algorithmic problem solving and topic mastery.
          </p>
        </div>

        {/* Global Header Actions */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={isExporting}
            className="h-8 px-3 text-xs font-mono border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/[0.08] gap-1.5"
          >
            <Icon icon={Download01Icon} size={13} />
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 px-3 text-xs font-mono border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/[0.08] gap-1.5"
          >
            <Link href="/practice/dsa/sheets/striver-a2z">
              <span>Back to Sheet</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Overview KPI Metrics Strip */}
      <StriverOverviewKpiStrip overview={analytics.overview} />

      {/* 3. Centerpiece Chart: Large Interactive Area Chart (Learning Completion Trend) */}
      <StriverLearningTrendChart data={analytics.videoCompletionTrend} />

      {/* 4. Two-Column Grid: Problems by Category & Learning vs Practice Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StriverProblemsColumnChart data={analytics.problemsByTopic} />
        <StriverBalanceChart data={analytics.weeklyConsistency} />
      </div>

      {/* 5. Two-Column Grid: Topic Coverage Comparison & 12-Week Consistency Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StriverCoverageChart data={analytics.topicCoverage} />
        <StriverConsistencyHeatmap data={analytics.activityHeatmap} />
      </div>

      {/* 6. Two-Column Grid: Algorithmic Mastery Radar & Chronological Milestones Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StriverMasteryRadar data={analytics.radarMastery} />
        <StriverMilestonesTimeline milestones={analytics.milestones} />
      </div>
    </div>
  );
}

