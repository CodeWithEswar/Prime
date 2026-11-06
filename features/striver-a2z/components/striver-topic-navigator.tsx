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
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StriverModuleDetail, StriverTopicDetail } from "../types";

interface StriverTopicNavigatorProps {
  modules: StriverModuleDetail[];
  activeTopicId: string;
  onSelectTopic: (topic: StriverTopicDetail) => void;
  className?: string;
}

export function StriverTopicNavigator({
  modules,
  activeTopicId,
  onSelectTopic,
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
    return modules
      .map((mod) => {
        const matchingTopics = mod.topics.filter((top) => {
          if (search) {
            const q = search.toLowerCase();
            const matchTitle = top.title.toLowerCase().includes(q);
            const matchSubstep = top.substepNumber.toLowerCase().includes(q);
            if (!matchTitle && !matchSubstep) return false;
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
      .filter((mod) => mod.topics.length > 0 || !search);
  }, [modules, search, filterMode]);

  return (
    <div
      className={cn(
        "flex flex-col h-full rounded-xl border border-white/[0.08] bg-[#0A0A0A]/90 backdrop-blur-md overflow-hidden",
        className
      )}
    >
      {/* Top Header & Search */}
      <div className="p-3.5 border-b border-white/[0.08] space-y-2.5 bg-black/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon={Folder01Icon} size={16} className="text-[#FF0000]" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
              Syllabus Hierarchy
            </span>
          </div>
          <span className="font-mono text-[11px] text-neutral-500">
            18 Steps
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Icon
            icon={Search01Icon}
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topic or step..."
            className="h-8 pl-8 text-xs bg-black/60 border-white/[0.1] text-white placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-[#FF0000]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 pt-0.5">
          {(["all", "incomplete", "completed"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-mono transition-colors",
                filterMode === mode
                  ? "bg-[#FF0000] text-white font-semibold shadow-sm"
                  : "bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08]"
              )}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] p-1.5 scrollbar-thin scrollbar-thumb-white/10">
        {filteredModules.map((mod) => {
          const isExpanded = expandedModuleIds.has(mod.id);
          const hasActiveChild = mod.topics.some((t) => t.id === activeTopicId);

          return (
            <div key={mod.id} className="py-1">
              {/* Module Header Accordion Trigger */}
              <button
                type="button"
                onClick={() => toggleModule(mod.id)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors",
                  hasActiveChild
                    ? "bg-white/[0.05] text-white"
                    : "hover:bg-white/[0.03] text-neutral-300"
                )}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <Icon
                    icon={isExpanded ? ArrowDown01Icon : ArrowRight01Icon}
                    size={13}
                    className="text-neutral-500 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-mono text-xs font-medium truncate text-white">
                      {mod.title}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                      <span>{mod.topics.length} topics</span>
                      <span>•</span>
                      <span>{mod.stats.solvedProblems}/{mod.stats.totalProblems} solved</span>
                    </div>
                  </div>
                </div>

                {mod.stats.solvedProblems === mod.stats.totalProblems && mod.stats.totalProblems > 0 && (
                  <Icon
                    icon={CheckmarkCircle01Icon}
                    size={14}
                    className="text-emerald-500 flex-shrink-0"
                  />
                )}
              </button>

              {/* Subtopics List */}
              {isExpanded && (
                <div className="ml-4 pl-2 border-l border-white/[0.08] mt-1 space-y-0.5">
                  {mod.topics.map((top) => {
                    const isActive = top.id === activeTopicId;
                    const isAllSolved =
                      top.stats.solvedProblems === top.stats.totalProblems &&
                      top.stats.totalProblems > 0;

                    return (
                      <button
                        key={top.id}
                        type="button"
                        onClick={() => onSelectTopic(top)}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-all text-xs font-mono group relative",
                          isActive
                            ? "bg-[#FF0000]/15 text-white font-medium border border-[#FF0000]/30 shadow-sm"
                            : "hover:bg-white/[0.04] text-neutral-400 hover:text-white"
                        )}
                      >
                        {/* Active vertical glow indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#FF0000] rounded-full" />
                        )}

                        <div className="flex items-center gap-2 min-w-0 pl-1">
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {top.substepNumber}
                          </span>
                          <span className="truncate">{top.title}</span>
                        </div>

                        {/* Counts badges */}
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                          {top.stats.totalVideos > 0 && (
                            <div className="flex items-center gap-0.5 text-[10px] text-neutral-500">
                              <Icon icon={VideoReplayIcon} size={10} />
                              <span>{top.stats.completedVideos}/{top.stats.totalVideos}</span>
                            </div>
                          )}

                          {top.stats.totalProblems > 0 && (
                            <div
                              className={cn(
                                "flex items-center gap-0.5 text-[10px]",
                                isAllSolved
                                  ? "text-emerald-400 font-semibold"
                                  : "text-neutral-500"
                              )}
                            >
                              <Icon icon={CodeCircleIcon} size={10} />
                              <span>{top.stats.solvedProblems}/{top.stats.totalProblems}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

