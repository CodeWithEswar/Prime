"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import {
  PlayIcon,
  Tick02Icon,
  Bookmark01Icon,
  RotateRight01Icon,
  Search01Icon,
  FilterIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import type {
  DataEngineeringVideoItem,
  DataEngineeringDifficulty,
  DataEngineeringImportance,
  UserVideoProgress,
} from "@/domain/data-engineering";

interface VideoLibraryProps {
  videos: DataEngineeringVideoItem[];
  videoProgress: Record<string, UserVideoProgress>;
  filterStage: number | "all";
  filterDifficulty: DataEngineeringDifficulty | "all";
  filterImportance: DataEngineeringImportance | "all";
  filterStatus: "all" | "watched" | "unwatched" | "bookmarked" | "revision_due";
  searchQuery: string;
  onFilterStageChange: (stage: number | "all") => void;
  onFilterDifficultyChange: (diff: DataEngineeringDifficulty | "all") => void;
  onFilterImportanceChange: (imp: DataEngineeringImportance | "all") => void;
  onFilterStatusChange: (
    status: "all" | "watched" | "unwatched" | "bookmarked" | "revision_due"
  ) => void;
  onSearchQueryChange: (query: string) => void;
  onWatchVideo: (videoId: string) => void;
  onToggleWatched: (videoId: string) => void;
  onToggleBookmark: (videoId: string) => void;
  onToggleRevision: (videoId: string) => void;
}

export function DataEngineeringVideoLibrary({
  videos,
  videoProgress,
  filterStage,
  filterDifficulty,
  filterImportance,
  filterStatus,
  searchQuery,
  onFilterStageChange,
  onFilterDifficultyChange,
  onFilterImportanceChange,
  onFilterStatusChange,
  onSearchQueryChange,
  onWatchVideo,
  onToggleWatched,
  onToggleBookmark,
  onToggleRevision,
}: VideoLibraryProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const hasActiveFilters =
    filterStage !== "all" ||
    filterDifficulty !== "all" ||
    filterImportance !== "all" ||
    filterStatus !== "all" ||
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    onFilterStageChange("all");
    onFilterDifficultyChange("all");
    onFilterImportanceChange("all");
    onFilterStatusChange("all");
    onSearchQueryChange("");
  };

  const STAGE_QUICK_TABS: { id: number | "all"; label: string }[] = [
    { id: "all", label: "All (54)" },
    { id: 1, label: "S1: Python/SQL" },
    { id: 2, label: "S2: Modeling" },
    { id: 3, label: "S3: Iceberg" },
    { id: 4, label: "S4: Spark" },
    { id: 5, label: "S5: Airflow" },
    { id: 6, label: "S6: Kafka/Flink" },
    { id: 7, label: "S7: dbt" },
    { id: 8, label: "S8: DataOps" },
  ];

  return (
    <div className="space-y-5">
      {/* Search and Filters Header */}
      <div className="rounded-xl border border-[var(--border-default)] bg-[#0C0C0F] p-4 sm:p-5 space-y-4 shadow-elevation-1">
        {/* Search Bar Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Icon
              icon={Search01Icon}
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]"
            />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search 54 canonical lectures by topic, tool, or channel (e.g. Spark, Iceberg, dbt)..."
              className="pl-10 h-10 bg-[#070709] border-[#222226] text-xs sm:text-sm text-white placeholder:text-[#52525B] focus:border-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchQueryChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white p-1"
                aria-label="Clear search"
              >
                <Icon icon={Cancel01Icon} size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileFilters((prev) => !prev)}
              className="sm:hidden h-10 px-3 text-xs border-[#26262B] bg-[#121216] text-[#D4D4D8]"
            >
              <Icon icon={FilterIcon} size={14} className="mr-1.5" />
              {showMobileFilters ? "Hide Filters" : "Filters"}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-10 text-xs text-[#A1A1AA] border-[#26262B] hover:text-white shrink-0"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stage Slider Strip (Mobile & Tablet) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {STAGE_QUICK_TABS.map((tab) => (
            <button
              key={String(tab.id)}
              type="button"
              onClick={() => onFilterStageChange(tab.id)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium whitespace-nowrap transition-all border shrink-0",
                filterStage === tab.id
                  ? "bg-white text-black border-white shadow-sm font-semibold"
                  : "bg-[#131317] text-[#A1A1AA] border-[#222226] hover:border-[#38383E] hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dropdown Filters Strip (Visible on Desktop, toggleable on Mobile) */}
        <div
          className={cn(
            "pt-3 border-t border-[#1C1C20] flex-wrap items-center gap-2",
            showMobileFilters ? "flex" : "hidden sm:flex"
          )}
        >
          <span className="text-xs text-[#71717A] flex items-center gap-1 mr-1 hidden lg:flex">
            <Icon icon={FilterIcon} size={13} />
            Refine:
          </span>

          {/* Difficulty Filter */}
          <select
            value={filterDifficulty}
            onChange={(e) =>
              onFilterDifficultyChange(
                e.target.value as DataEngineeringDifficulty | "all"
              )
            }
            className="h-8 rounded-lg border border-[#24242A] bg-[#08080A] px-2.5 text-xs text-white outline-none focus:border-white transition-colors"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Importance Filter */}
          <select
            value={filterImportance}
            onChange={(e) =>
              onFilterImportanceChange(
                e.target.value as DataEngineeringImportance | "all"
              )
            }
            className="h-8 rounded-lg border border-[#24242A] bg-[#08080A] px-2.5 text-xs text-white outline-none focus:border-white transition-colors"
          >
            <option value="all">All Importance</option>
            <option value="Critical">Critical Priority</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) =>
              onFilterStatusChange(
                e.target.value as
                  | "all"
                  | "watched"
                  | "unwatched"
                  | "bookmarked"
                  | "revision_due"
              )
            }
            className="h-8 rounded-lg border border-[#24242A] bg-[#08080A] px-2.5 text-xs text-white outline-none focus:border-white transition-colors"
          >
            <option value="all">All Progress Statuses</option>
            <option value="unwatched">Unwatched Only</option>
            <option value="watched">Watched Completed</option>
            <option value="bookmarked">Bookmarked</option>
            <option value="revision_due">Needs Revision</option>
          </select>

          <span className="ml-auto text-xs font-mono text-[#71717A]">
            Showing {videos.length} of 54 lectures
          </span>
        </div>
      </div>

      {/* Video Cards Responsive Grid */}
      {videos.length === 0 ? (
        <div className="rounded-xl border border-[#222226] bg-[#0A0A0C] p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-white">
            No video lessons match your filter criteria.
          </p>
          <p className="text-xs text-[#71717A]">
            Try adjusting your search query or clearing active filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="mt-2 text-xs"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {videos.map((video) => {
            const prog = videoProgress[video.youtubeVideoId];
            const isWatched = !!prog?.watched;
            const isBookmarked = !!prog?.isBookmarked;
            const isRevision = !!prog?.revisionDue;

            return (
              <div
                key={video.youtubeVideoId}
                className={cn(
                  "flex flex-col justify-between rounded-xl border border-[#1E1E22] bg-[#09090C] overflow-hidden transition-all duration-200 hover:border-[#2F2F36] shadow-sm",
                  isWatched && "opacity-85 hover:opacity-100"
                )}
              >
                <div>
                  {/* Thumbnail */}
                  <div
                    onClick={() => onWatchVideo(video.youtubeVideoId)}
                    className="relative aspect-video w-full cursor-pointer overflow-hidden bg-[#121216] group select-none"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${video.youtubeVideoId}/mqdefault.jpg`}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/20">
                      <span className="flex size-9 items-center justify-center rounded-full bg-white text-black shadow-lg">
                        <Icon icon={PlayIcon} size={15} />
                      </span>
                    </div>

                    <span className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
                      {video.estimatedMinutes} min
                    </span>

                    <span className="absolute top-2 left-2 rounded bg-black/85 px-2 py-0.5 font-mono text-[10px] text-[#D4D4D8]">
                      Stage {video.stageNumber} • #{video.position}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] px-1.5 py-0 font-medium",
                          video.difficulty === "Easy"
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50"
                            : video.difficulty === "Medium"
                              ? "bg-amber-950/40 text-amber-400 border border-amber-900/50"
                              : "bg-rose-950/40 text-rose-400 border border-rose-900/50"
                        )}
                      >
                        {video.difficulty}
                      </Badge>

                      {video.importance === "Critical" && (
                        <Badge
                          variant="outline"
                          className="border-rose-900/60 bg-rose-950/30 text-[10px] text-rose-300 px-1.5 py-0 font-semibold"
                        >
                          Critical Core
                        </Badge>
                      )}

                      <span className="text-[11px] text-[#71717A] ml-auto truncate max-w-[120px]">
                        {video.channel}
                      </span>
                    </div>

                    <h4
                      onClick={() => onWatchVideo(video.youtubeVideoId)}
                      className={cn(
                        "text-xs sm:text-sm font-semibold cursor-pointer transition-colors hover:text-white line-clamp-2 leading-snug",
                        isWatched ? "text-[#A1A1AA]" : "text-white"
                      )}
                    >
                      {video.title}
                    </h4>

                    {video.keyTakeaways && video.keyTakeaways.length > 0 && (
                      <ul className="space-y-1 pt-1.5 border-t border-[#18181D]">
                        {video.keyTakeaways.slice(0, 2).map((takeaway, kIdx) => (
                          <li
                            key={kIdx}
                            className="text-[11px] text-[#888888] line-clamp-1 flex items-center gap-1.5"
                          >
                            <span className="size-1 rounded-full bg-[#52525B] shrink-0" />
                            <span>{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between p-3 border-t border-[#18181D] bg-[#0E0E12]">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleBookmark(video.youtubeVideoId)}
                      className={cn(
                        "size-7 rounded border border-transparent hover:border-[#28282E]",
                        isBookmarked
                          ? "text-amber-400 hover:text-amber-300"
                          : "text-[#71717A] hover:text-white"
                      )}
                      title={isBookmarked ? "Bookmarked" : "Bookmark"}
                    >
                      <Icon icon={Bookmark01Icon} size={14} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleRevision(video.youtubeVideoId)}
                      className={cn(
                        "size-7 rounded border border-transparent hover:border-[#28282E]",
                        isRevision
                          ? "text-sky-400 hover:text-sky-300"
                          : "text-[#71717A] hover:text-white"
                      )}
                      title={isRevision ? "Needs Revision" : "Flag for Revision"}
                    >
                      <Icon icon={RotateRight01Icon} size={14} />
                    </Button>
                  </div>

                  <Button
                    variant={isWatched ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => onToggleWatched(video.youtubeVideoId)}
                    className={cn(
                      "h-7 text-xs font-medium px-2.5",
                      isWatched
                        ? "bg-white text-black hover:bg-neutral-200"
                        : "border-[#27272A] bg-[#121214] text-white hover:bg-[#1C1C20]"
                    )}
                  >
                    <Icon
                      icon={Tick02Icon}
                      size={13}
                      className={cn(
                        "mr-1",
                        isWatched ? "text-black" : "text-[#71717A]"
                      )}
                    />
                    {isWatched ? "Watched" : "Complete"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
