"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft01Icon,
  Download01Icon,
  PlayIcon,
  CodeCircleIcon,
  Task01Icon,
  Award01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StriverLearningTrendChart } from "@/features/striver-a2z/components/charts/striver-learning-trend-chart";
import { StriverProblemsColumnChart } from "@/features/striver-a2z/components/charts/striver-problems-column-chart";
import { StriverBalanceChart } from "@/features/striver-a2z/components/charts/striver-balance-chart";
import { StriverCoverageChart } from "@/features/striver-a2z/components/charts/striver-coverage-chart";
import { StriverConsistencyHeatmap } from "@/features/striver-a2z/components/charts/striver-consistency-heatmap";
import { StriverMasteryRadar } from "@/features/striver-a2z/components/charts/striver-mastery-radar";
import { StriverMilestonesTimeline } from "@/features/striver-a2z/components/charts/striver-milestones-timeline";
import { KunalAssignmentsChart } from "./charts/kunal-assignments-chart";
import type { KunalAnalyticsData } from "../types";

interface KunalAnalyticsViewProps {
  analytics: KunalAnalyticsData;
}

export function KunalAnalyticsView({ analytics }: KunalAnalyticsViewProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  // Real CSV Export Functionality
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const rows: string[] = [
        "PRIME Kunal Kushwaha Java + DSA Bootcamp Telemetry Export",
        `Generated At: ${new Date().toISOString()}`,
        "",
        "--- OVERVIEW METRICS ---",
        "Metric,Value,Total,Percentage",
        `Lectures Completed,${analytics.overview.completedVideos},${analytics.overview.totalVideos},${analytics.overview.videoPct}%`,
        `Problems Solved,${analytics.overview.solvedProblems},${analytics.overview.totalProblems},${analytics.overview.problemPct}%`,
        `Assignments Completed,${analytics.overview.completedAssignments},${analytics.overview.totalAssignments},${analytics.overview.assignmentPct}%`,
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
        "Topic,Video Watched %,Problems Solved %,Assignment Completed %",
        ...analytics.topicCoverage.map((c) => `"${c.topic}",${c.videoPct}%,${c.practicePct}%,${c.assignmentPct}%`),
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
      link.setAttribute("download", `kunal-bootcamp-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  const overview = analytics.overview;

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
              <Link href="/practice/dsa/playlists/kunal-kushwaha">
                <Icon icon={ArrowLeft01Icon} size={14} className="text-[#FF0000]" />
                <span>Kunal Kushwaha Track</span>
              </Link>
            </Button>
            <span className="text-neutral-600">/</span>
            <span className="font-mono text-[11px] sm:text-xs uppercase tracking-wider text-[#FF0000] font-bold">
              ANALYTICS & TELEMETRY
            </span>
          </div>

          <h1 className="font-mono text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
            Java + DSA Bootcamp Analytics
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
            Independent telemetry separating Java video consumption, algorithm practice, and assignment mastery.
          </p>
        </div>

        {/* Global Header Actions */}
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
            <Link href="/practice/dsa/playlists/kunal-kushwaha">
              <span>Back to Course</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Overview KPI Metrics Strip (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
        {/* Card 1: Lectures Completed */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#080808] border border-white/[0.08] relative overflow-hidden flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Lectures Watched
            </span>
            <Icon icon={PlayIcon} size={14} className="text-[#FF0000]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {overview.completedVideos}
            </span>
            <span className="text-xs text-neutral-500 font-normal">
              / {overview.totalVideos} ({overview.videoPct}%)
            </span>
          </div>
          <Progress value={overview.videoPct} className="h-1 bg-white/[0.06] [&>div]:bg-[#FF0000]" />
        </div>

        {/* Card 2: Problems Solved */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#080808] border border-white/[0.08] relative overflow-hidden flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Problems Solved
            </span>
            <Icon icon={CodeCircleIcon} size={14} className="text-[#FF0000]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {overview.solvedProblems}
            </span>
            <span className="text-xs text-neutral-500 font-normal">
              / {overview.totalProblems} ({overview.problemPct}%)
            </span>
          </div>
          <Progress value={overview.problemPct} className="h-1 bg-white/[0.06] [&>div]:bg-[#FF0000]" />
        </div>

        {/* Card 3: Assignments Completed */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#080808] border border-white/[0.08] relative overflow-hidden flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Assignments Done
            </span>
            <Icon icon={Task01Icon} size={14} className="text-[#FF0000]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {overview.completedAssignments}
            </span>
            <span className="text-xs text-neutral-500 font-normal">
              / {overview.totalAssignments} ({overview.assignmentPct}%)
            </span>
          </div>
          <Progress value={overview.assignmentPct} className="h-1 bg-white/[0.06] [&>div]:bg-[#FF0000]" />
        </div>

        {/* Card 4: Overall Track Mastery */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#080808] border border-white/[0.08] relative overflow-hidden flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-neutral-400 font-medium">
              Track Mastery
            </span>
            <Icon icon={Award01Icon} size={14} className="text-[#FF0000]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {overview.masteryPct}%
            </span>
            <span className="text-xs text-neutral-500 font-normal">
              {overview.masteryPct >= 70 ? "Proficient" : overview.masteryPct >= 40 ? "Developing" : "Learning"}
            </span>
          </div>
          <Progress value={overview.masteryPct} className="h-1 bg-white/[0.06] [&>div]:bg-[#FF0000]" />
        </div>
      </div>

      {/* 3. Centerpiece Chart: Large Interactive Area Chart (Learning Completion Trend) */}
      <StriverLearningTrendChart data={analytics.videoCompletionTrend} />

      {/* 4. Coding Problems Solved by Category (One Chart Per Row) */}
      <StriverProblemsColumnChart data={analytics.problemsByTopic} />

      {/* 5. Course Assignments Progress Visualization */}
      <KunalAssignmentsChart data={analytics.assignmentProgress} />

      {/* 6. Learning vs Practice Ratio (One Chart Per Row) */}
      <StriverBalanceChart data={analytics.weeklyConsistency} />

      {/* 7. Topic Coverage Comparison (One Chart Per Row) */}
      <StriverCoverageChart data={analytics.topicCoverage} />

      {/* 8. 26-Week Consistency Heatmap (Full Width) */}
      <StriverConsistencyHeatmap data={analytics.activityHeatmap} />

      {/* 9. Algorithmic Mastery Radar & Dimensions (One Chart Per Row) */}
      <StriverMasteryRadar data={analytics.radarMastery} />

      {/* 10. Chronological Learning Milestones Timeline (One Chart Per Row) */}
      <StriverMilestonesTimeline milestones={analytics.milestones} />
    </div>
  );
}

