"use client";

import * as React from "react";
import {
  Folder01Icon,
  Search01Icon,
  CheckmarkCircle01Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  VideoReplayIcon,
  CodeCircleIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StriverModuleDetail, StriverTopicDetail } from "../types";

interface StriverTopicNavigatorProps {
  modules: StriverModuleDetail[];
  activeTopicId: string;
  onSelectTopic: (topic: StriverTopicDetail) => void;
  onCloseMobile?: () => void;
  className?: string;
}

export function StriverTopicNavigator({
  modules,
  activeTopicId,
  onSelectTopic,
  onCloseMobile,
  className,
}: StriverTopicNavigatorProps) {
  const [search, setSearch] = React.useState("");
  const [filterMode, setFilterMode] = React.useState<"all" | "incomplete" | "completed">("all");

  // Track open module accordions (default open active topic's module)
  const [expandedModuleIds, setExpandedModuleIds] = React.useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const m of modules) {
      if (m.topics.some((t) => t.id === activeTopicId)) {
        initial.add(m.id);
        break;
      }
    }
    if (initial.size === 0 && modules.length > 0) {
      initial.add(modules[0].id);
    }
    return initial;
  });

  // Ensure active topic's module is expanded whenever activeTopicId changes
  const [prevActiveTopicId, setPrevActiveTopicId] = React.useState(activeTopicId);
  if (prevActiveTopicId !== activeTopicId) {
    setPrevActiveTopicId(activeTopicId);
    for (const m of modules) {
      if (m.topics.some((t) => t.id === activeTopicId)) {
        setExpandedModuleIds((prev) => new Set([...prev, m.id]));
        break;
      }
    }
  }

  const toggleModule = (moduleId: string) => {
    setExpandedModuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  // Filter modules and topics by search query
  const filteredModules = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return modules
      .map((mod) => {
        const matchingTopics = mod.topics.filter((top) => {
          if (q) {
            const matchTitle = top.title.toLowerCase().includes(q);
            const matchSubstep = top.substepNumber.toLowerCase().includes(q);
            const matchStepTitle = mod.title.toLowerCase().includes(q);
            if (!matchTitle && !matchSubstep && !matchStepTitle) return false;
          }

          if (filterMode === "completed") {
            return (
              top.stats.solvedProblems === top.stats.totalProblems &&
              top.stats.totalProblems > 0
            );
          }
          if (filterMode === "incomplete") {
            return top.stats.solvedProblems < top.stats.totalProblems;
          }

          return true;
        });

        return {
          ...mod,
          topics: matchingTopics,
        };
      })
      .filter((mod) => mod.topics.length > 0 || (!q && filterMode === "all"));
  }, [modules, search, filterMode]);

  return (
    <nav
      aria-label="Syllabus Navigation"
      className={cn(
        "flex flex-col h-full rounded-xl border border-white/[0.08] bg-[#090909]/95 backdrop-blur-md overflow-hidden select-none",
        className
      )}
    >
      {/* 1. Header Toolbar */}
      <div className="p-3.5 border-b border-white/[0.08] space-y-3 bg-[#050505]/70 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon={Folder01Icon} size={15} className="text-[#FF0000]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              Syllabus
            </span>
            <Badge
              variant="outline"
              className="font-mono text-[10px] px-1.5 py-0 bg-white/[0.04] border-white/[0.1] text-neutral-400 font-semibold"
            >
              18 Steps
            </Badge>
          </div>

          {onCloseMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCloseMobile}
              className="h-7 w-7 p-0 text-neutral-400 hover:text-white lg:hidden"
              aria-label="Close syllabus drawer"
            >
              <Icon icon={Cancel01Icon} size={14} />
            </Button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Icon
            icon={Search01Icon}
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics or steps..."
            className="h-8 pl-8 pr-7 text-xs bg-black/50 border-white/[0.1] text-white placeholder:text-neutral-500 rounded-lg focus-visible:ring-1 focus-visible:ring-[#FF0000]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              aria-label="Clear search"
            >
              <Icon icon={Cancel01Icon} size={12} />
            </button>
          )}
        </div>

        {/* Segmented Filter Control */}
        <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-black/60 border border-white/[0.06] font-mono text-[11px]">
          {(
            [
              { id: "all", label: "All" },
              { id: "incomplete", label: "Incomplete" },
              { id: "completed", label: "Completed" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilterMode(item.id)}
              className={cn(
                "py-1 px-1.5 rounded text-center transition-all duration-150 font-medium truncate",
                filterMode === item.id
                  ? "bg-white/[0.12] text-white shadow-xs font-semibold"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Scrollable Hierarchical Step List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {filteredModules.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-1">
            <p className="text-xs text-neutral-400 font-sans">No topics found</p>
            <p className="text-[11px] text-neutral-600 font-mono">
              Try adjusting your search query or filter.
            </p>
          </div>
        ) : (
          filteredModules.map((mod) => {
            const isExpanded = expandedModuleIds.has(mod.id);
            const hasActiveChild = mod.topics.some((t) => t.id === activeTopicId);
            const totalModProblems =
              mod.stats?.totalProblems ??
              mod.topics.reduce((s, t) => s + (t.stats?.totalProblems || 0), 0);
            const solvedModProblems =
              mod.stats?.solvedProblems ??
              mod.topics.reduce((s, t) => s + (t.stats?.solvedProblems || 0), 0);
            const isModuleComplete =
              totalModProblems > 0 && solvedModProblems >= totalModProblems;

            return (
              <div
                key={mod.id}
                className={cn(
                  "rounded-lg border transition-colors overflow-hidden",
                  hasActiveChild
                    ? "border-white/[0.12] bg-[#101010]/90"
                    : "border-transparent hover:border-white/[0.06] bg-transparent"
                )}
              >
                {/* Step Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center justify-between p-2.5 text-left transition-colors group cursor-pointer"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-start gap-2.5 min-w-0 pr-2">
                    <Icon
                      icon={isExpanded ? ArrowDown01Icon : ArrowRight01Icon}
                      size={13}
                      className="text-neutral-500 group-hover:text-neutral-300 mt-0.5 shrink-0 transition-transform"
                    />
                    <div className="min-w-0 space-y-0.5">
                      <div className="font-mono text-xs font-semibold text-white group-hover:text-white leading-snug">
                        {mod.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-mono">
                        <span>{mod.topics.length} topics</span>
                        <span className="text-neutral-700">·</span>
                        <span
                          className={
                            isModuleComplete ? "text-emerald-400 font-medium" : ""
                          }
                        >
                          {solvedModProblems}/{totalModProblems} solved
                        </span>
                      </div>
                    </div>
                  </div>

                  {isModuleComplete && (
                    <Icon
                      icon={CheckmarkCircle01Icon}
                      size={14}
                      className="text-emerald-400 shrink-0"
                    />
                  )}
                </button>

                {/* Nested Subtopics */}
                {isExpanded && (
                  <div className="px-2 pb-2 pt-0.5 space-y-1 border-t border-white/[0.04]">
                    {mod.topics.map((top) => {
                      const isActive = top.id === activeTopicId;
                      const isAllSolved =
                        top.stats.solvedProblems === top.stats.totalProblems &&
                        top.stats.totalProblems > 0;

                      return (
                        <button
                          key={top.id}
                          type="button"
                          onClick={() => {
                            onSelectTopic(top);
                            onCloseMobile?.();
                          }}
                          className={cn(
                            "w-full relative flex items-start justify-between gap-2.5 p-2 rounded-md text-left transition-all group cursor-pointer",
                            isActive
                              ? "bg-white/[0.08] text-white shadow-xs"
                              : "hover:bg-white/[0.04] text-neutral-400 hover:text-neutral-200"
                          )}
                        >
                          {/* Active Red Leading Marker */}
                          {isActive && (
                            <div className="absolute left-0 top-1 bottom-1 w-1 bg-[#FF0000] rounded-r" />
                          )}

                          {/* Topic Number & Title (with natural wrap, no single-line truncation!) */}
                          <div className="flex items-start gap-2 min-w-0 pl-1.5">
                            <span className="font-mono text-[11px] font-semibold text-neutral-500 shrink-0 mt-0.5">
                              {top.substepNumber}
                            </span>
                            <span
                              className={cn(
                                "text-xs font-medium leading-snug line-clamp-2",
                                isActive ? "text-white font-semibold" : "text-neutral-300"
                              )}
                              title={top.title}
                            >
                              {top.title}
                            </span>
                          </div>

                          {/* Status Counters */}
                          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                            {top.stats.totalVideos > 0 && (
                              <span
                                className="inline-flex items-center gap-0.5 font-mono text-[10px] text-neutral-400 px-1 py-0.5 rounded bg-white/[0.04]"
                                title={`${top.stats.completedVideos} of ${top.stats.totalVideos} videos watched`}
                              >
                                <Icon icon={VideoReplayIcon} size={10} className="text-neutral-500" />
                                <span>
                                  {top.stats.completedVideos}/{top.stats.totalVideos}
                                </span>
                              </span>
                            )}

                            {top.stats.totalProblems > 0 && (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-0.5 font-mono text-[10px] px-1 py-0.5 rounded",
                                  isAllSolved
                                    ? "bg-emerald-500/10 text-emerald-400 font-semibold"
                                    : "bg-white/[0.04] text-neutral-400"
                                )}
                                title={`${top.stats.solvedProblems} of ${top.stats.totalProblems} problems solved`}
                              >
                                <Icon
                                  icon={CodeCircleIcon}
                                  size={10}
                                  className={isAllSolved ? "text-emerald-400" : "text-neutral-500"}
                                />
                                <span>
                                  {top.stats.solvedProblems}/{top.stats.totalProblems}
                                </span>
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </nav>
  );
}
