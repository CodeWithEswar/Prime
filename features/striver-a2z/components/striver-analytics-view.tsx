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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/[0.08] pb-4">
        <div className="space-y-1">
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-7 px-1.5 sm:px-2 text-xs font-mono text-neutral-400 hover:text-white gap-1.5 p-0 hover:bg-transparent"
            >
              <Link href="/practice/dsa/sheets/striver-a2z">
                <Icon icon={ArrowLeft01Icon} size={14} className="text-[#FF0000]" />
                <span>Striver A2Z Track</span>
              </Link>
            </Button>
            <span className="text-neutral-600">/</span>
            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-wider text-[#FF0000] font-bold">
              ANALYTICS & TELEMETRY
            </span>
          </div>

          <h1 className="font-mono text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
            Striver A2Z Learning Analytics
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
            Independent telemetry separating video consumption from algorithmic problem solving and topic mastery.
          </p>
        </div>

        {/* Global Header Actions - Responsive 2-column grid on mobile, compact flex on desktop */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={isExporting}
            className="h-8 px-3 text-xs font-mono border-white/10 bg-white/[0.04] text-neutral-200 hover:text-white hover:bg-white/[0.08] gap-1.5 justify-center w-full sm:w-auto"
          >
            <Icon icon={Download01Icon} size={13} className="text-[#FF0000]" />
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 px-3 text-xs font-mono border-white/10 bg-white/[0.04] text-neutral-200 hover:text-white hover:bg-white/[0.08] gap-1.5 justify-center w-full sm:w-auto"
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

      {/* 4. Coding Problems Solved by Category (One Chart Per Row) */}
      <StriverProblemsColumnChart data={analytics.problemsByTopic} />

      {/* 5. Learning vs Practice Ratio (One Chart Per Row) */}
      <StriverBalanceChart data={analytics.weeklyConsistency} />

      {/* 6. Topic Coverage Comparison (One Chart Per Row) */}
      <StriverCoverageChart data={analytics.topicCoverage} />

      {/* 7. 12-Week Consistency Heatmap (One Chart Per Row) */}
      <StriverConsistencyHeatmap data={analytics.activityHeatmap} />

      {/* 8. Algorithmic Mastery Radar & Data Table (One Chart Per Row) */}
      <StriverMasteryRadar data={analytics.radarMastery} />

      {/* 9. Chronological Learning Milestones Timeline (One Chart Per Row) */}
      <StriverMilestonesTimeline milestones={analytics.milestones} />
    </div>
  );
}

