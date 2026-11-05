"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { RoadmapDashboardData, RoadmapFilter } from "../types";
import { RoadmapHeader } from "./roadmap-header";
import { ContinueHero } from "./continue-hero";
import { StageRail } from "./stage-rail";
import { StageSection } from "./stage-section";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Search01Icon } from "@hugeicons/core-free-icons";

interface RoadmapViewProps {
  data: RoadmapDashboardData;
}

export function RoadmapView({ data }: RoadmapViewProps) {
  const { curriculum, stages, progress, nextRecommendation, currentStageId } = data;

  const [activeFilter, setActiveFilter] = useState<RoadmapFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter stages & items according to active filter and search query
  const filteredStages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return stages
      .map((stage) => {
        const matchingItems = stage.items.filter((item) => {
          // 1. Text Search Filter
          if (q) {
            const matchesTitle = item.title?.toLowerCase().includes(q);
            const matchesReason = item.selectionReason?.toLowerCase().includes(q);
            const matchesDifficulty = item.difficulty?.toLowerCase().includes(q);
            if (!matchesTitle && !matchesReason && !matchesDifficulty) {
              return false;
            }
          }

          // 2. Status Tab Filter
          if (activeFilter === "completed") {
            return item.userStatus === "solved" || item.userStatus === "mastered";
          }
          if (activeFilter === "revision_due") {
            return item.isRevisionDue;
          }
          if (activeFilter === "current") {
            return (
              item.userStatus === "not_started" ||
              item.userStatus === "attempted" ||
              item.isRevisionDue
            );
          }

          return true;
        });

        return {
          ...stage,
          items: matchingItems,
        };
      })
      .filter((stage) => stage.items.length > 0);
  }, [stages, activeFilter, searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-36 sm:pb-24">
      {/* 1. Header with Global Preparation Telemetry */}
      <RoadmapHeader progress={progress} />

      {/* CS Fundamentals Roadmaps Strip */}
      {data.fundamentals && data.fundamentals.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#CCCCCC]">
                CS Fundamentals Roadmaps
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#777777]">
              12-day production curricula with interactive labs &amp; Planner integration
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.fundamentals.map((f) => (
              <Link
                key={f.course}
                href={f.href}
                className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#121212] to-[#080808] p-4 transition-all duration-200 hover:border-[#FF0000]/60 hover:shadow-[0_4px_24px_rgba(255,0,0,0.08)] hover:-translate-y-0.5"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF0000]/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="flex items-center justify-between">
                  <span className="rounded-md border border-white/10 bg-[#1A1A1A] px-2 py-0.5 font-mono text-[11px] font-bold text-white group-hover:border-[#FF0000]/40 group-hover:bg-[#FF0000]/15 group-hover:text-[#FF4D4D] transition-colors">
                    {f.label}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      f.enrolled
                        ? "border border-green-500/40 bg-green-500/10 text-green-400"
                        : "border border-white/10 bg-white/5 text-[#888888]"
                    }`}
                  >
                    {f.enrolled ? "Enrolled" : "Not Started"}
                  </span>
                </div>
                <div className="mt-3 font-semibold text-sm text-white group-hover:text-[#FF4D4D] transition-colors line-clamp-1">
                  {f.title}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-[#888888] font-mono">
                  <span>{f.totalDays} Study Days</span>
                  <span className="text-[#555555]">·</span>
                  <span>{f.totalVideos} Lectures</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 2. Dynamic "Continue Curriculum" Hero */}
      <ContinueHero
        recommendation={nextRecommendation}
        totalSolved={progress.completedRequired}
        totalCount={progress.totalRequired}
      />

      {/* 3. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 sm:pt-6">
        {/* Segmented Filter Control */}
        <div className="w-full sm:w-auto overflow-x-auto no-scrollbar -mx-1 px-1 py-0.5">
          <div className="inline-flex items-center p-1 rounded-xl bg-[#0E0E0E] border border-white/[0.08] gap-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                activeFilter === "all"
                  ? "bg-[#1E1E1E] text-white border border-white/10 shadow-[0_1px_4px_rgba(0,0,0,0.5)] font-semibold"
                  : "text-[#888888] hover:text-white hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <span>All Problems</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                  activeFilter === "all"
                    ? "bg-[#2A2A2A] text-white"
                    : "bg-[#141414] text-[#666666]"
                }`}
              >
                {progress.totalRequired}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("current")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                activeFilter === "current"
                  ? "bg-[#1E1E1E] text-white border border-white/10 shadow-[0_1px_4px_rgba(0,0,0,0.5)] font-semibold"
                  : "text-[#888888] hover:text-white hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <span>Incomplete</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                  activeFilter === "current"
                    ? "bg-[#2A2A2A] text-white"
                    : "bg-[#141414] text-[#666666]"
                }`}
              >
                {progress.remainingRequiredCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("completed")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                activeFilter === "completed"
                  ? "bg-[#1E1E1E] text-white border border-white/10 shadow-[0_1px_4px_rgba(0,0,0,0.5)] font-semibold"
                  : "text-[#888888] hover:text-white hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <span>Completed</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                  activeFilter === "completed"
                    ? "bg-[#2A2A2A] text-white"
                    : "bg-[#141414] text-[#666666]"
                }`}
              >
                {progress.completedRequired}
              </span>
            </button>

            {progress.revisionDueCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilter("revision_due")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                  activeFilter === "revision_due"
                    ? "bg-[#FF0000] text-white border border-[#FF0000] shadow-[0_1px_4px_rgba(255,0,0,0.4)] font-semibold"
                    : "bg-[#1A0505] text-[#FF4D4D] hover:bg-[#2A0808] border border-[#7F1D1D]/40"
                }`}
              >
                <span>Revision Due</span>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                    activeFilter === "revision_due"
                      ? "bg-[#CC0000] text-white"
                      : "bg-[#3D0A0A] text-[#FF4D4D]"
                  }`}
                >
                  {progress.revisionDueCount}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Icon
            icon={Search01Icon}
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems, patterns..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-[#0E0E0E] border border-white/[0.08] focus:border-[#FF0000]/60 focus:bg-[#121212] rounded-lg text-white placeholder-[#666666] outline-none transition-colors"
          />
        </div>
      </div>

      {/* 4. Main Learning Spine Layout (Sticky Rail + Stage Sections) */}
      <div className="flex items-start gap-8">
        {/* Sticky Stage Navigation Rail (Desktop) */}
        <StageRail stages={stages} currentStageId={currentStageId} />

        {/* Stage Sections (The Spine) */}
        <div className="flex-1 min-w-0 space-y-6">
          {filteredStages.length === 0 ? (
            <div className="p-12 text-center rounded-lg border border-[#1A1A1A] bg-[#0A0A0A] space-y-3">
              <div className="text-sm font-mono text-[#888888] uppercase tracking-wider">
                No matching curriculum problems
              </div>
              <p className="text-xs text-[#555555] max-w-sm mx-auto">
                No problems matched the selected filter or search term. Try resetting
                your search query or filter.
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveFilter("all");
                  setSearchQuery("");
                }}
                className="text-xs font-mono text-[#FF4D4D] hover:text-[#FF6666] hover:bg-[#1A0505]"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            filteredStages.map((stage) => (
              <StageSection
                key={stage.stageId}
                stage={stage}
                nextProblemId={nextRecommendation?.item.id}
                defaultExpanded={stage.isCurrent || !stage.isCompleted}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
