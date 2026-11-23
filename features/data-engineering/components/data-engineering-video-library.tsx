"use client";

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

  return (
    <div className="space-y-5">
      {/* Search and Filters Header */}
      <div className="rounded-xl border border-[#222222] bg-[#0E0E0E] p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Icon
              icon={Search01Icon}
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]"
            />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search 54 canonical lectures by topic, tool, or channel (e.g. Spark, Iceberg, dbt)..."
              className="pl-9 h-10 bg-[#0A0A0A] border-[#222222] text-xs sm:text-sm text-white placeholder:text-[#555555]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchQueryChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white"
              >
                <Icon icon={Cancel01Icon} size={14} />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="h-10 text-xs text-[#888888] border-[#262626] hover:text-white shrink-0"
            >
              Reset Filters
            </Button>
          )}
        </div>

        {/* Filter Controls Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#1A1A1A]">
          <span className="text-xs text-[#71717A] flex items-center gap-1 mr-1">
            <Icon icon={FilterIcon} size={13} />
            Filters:
          </span>

          {/* Stage Filter */}
          <select
            value={filterStage}
            onChange={(e) =>
              onFilterStageChange(
                e.target.value === "all" ? "all" : Number(e.target.value)
              )
            }
            className="h-8 rounded-md border border-[#242424] bg-[#0A0A0A] px-2.5 text-xs text-white outline-none focus:border-white"
          >
            <option value="all">All Stages (1-8)</option>
            <option value="1">Stage 1: Python & Linux</option>
            <option value="2">Stage 2: Modeling & Warehouses</option>
            <option value="3">Stage 3: Lakes & Iceberg</option>
            <option value="4">Stage 4: Distributed Spark</option>
            <option value="5">Stage 5: Airflow & Dagster</option>
            <option value="6">Stage 6: Kafka & Flink</option>
            <option value="7">Stage 7: dbt & Data Quality</option>
            <option value="8">Stage 8: Cloud & DataOps</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={filterDifficulty}
            onChange={(e) =>
              onFilterDifficultyChange(
                e.target.value as DataEngineeringDifficulty | "all"
              )
            }
            className="h-8 rounded-md border border-[#242424] bg-[#0A0A0A] px-2.5 text-xs text-white outline-none focus:border-white"
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
            className="h-8 rounded-md border border-[#242424] bg-[#0A0A0A] px-2.5 text-xs text-white outline-none focus:border-white"
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
            className="h-8 rounded-md border border-[#242424] bg-[#0A0A0A] px-2.5 text-xs text-white outline-none focus:border-white"
          >
            <option value="all">All Progress Statuses</option>
            <option value="unwatched">Unwatched Only</option>
            <option value="watched">Watched Completed</option>
            <option value="bookmarked">Bookmarked</option>
            <option value="revision_due">Needs Revision</option>
          </select>

          <span className="ml-auto text-xs font-mono text-[#71717A]">
            Showing {videos.length} videos
          </span>
        </div>
      </div>

      {/* Video Cards Grid */}
      {videos.length === 0 ? (
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-12 text-center space-y-3">
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {videos.map((video) => {
            const prog = videoProgress[video.youtubeVideoId];
            const isWatched = !!prog?.watched;
            const isBookmarked = !!prog?.isBookmarked;
            const isRevision = !!prog?.revisionDue;

            return (
              <div
                key={video.youtubeVideoId}
                className={cn(
                  "flex flex-col justify-between rounded-xl border border-[#1C1C1C] bg-[#0A0A0A] overflow-hidden transition-all hover:border-[#2C2C2C]",
                  isWatched && "opacity-85 hover:opacity-100"
                )}
              >
                <div>
                  {/* Thumbnail */}
                  <div
                    onClick={() => onWatchVideo(video.youtubeVideoId)}
                    className="relative aspect-video w-full cursor-pointer overflow-hidden bg-[#121212] group"
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

                    <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[10px] text-white">
                      {video.estimatedMinutes} min
                    </span>

                    <span className="absolute top-2 left-2 rounded bg-black/80 px-2 py-0.5 font-mono text-[10px] text-[#A1A1AA]">
                      Stage {video.stageNumber} • #{video.position}
                    </span>
                  </div>

                  {/* Body */}
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
                          className="border-rose-900/60 bg-rose-950/30 text-[10px] text-rose-300 px-1.5 py-0"
                        >
                          Critical Core
                        </Badge>
                      )}

                      <span className="text-[11px] text-[#71717A] ml-auto">
                        {video.channel}
                      </span>
                    </div>

                    <h4
                      onClick={() => onWatchVideo(video.youtubeVideoId)}
                      className={cn(
                        "text-xs sm:text-sm font-semibold cursor-pointer transition-colors hover:text-white line-clamp-2",
                        isWatched ? "text-[#999999]" : "text-white"
                      )}
                    >
                      {video.title}
                    </h4>

                    {video.keyTakeaways && video.keyTakeaways.length > 0 && (
                      <ul className="space-y-1 pt-1 border-t border-[#161616]">
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
                <div className="flex items-center justify-between p-3 border-t border-[#161616] bg-[#0E0E0E]">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleBookmark(video.youtubeVideoId)}
                      className={cn(
                        "size-7 rounded border border-transparent hover:border-[#262626]",
                        isBookmarked
                          ? "text-amber-400 hover:text-amber-300"
                          : "text-[#71717A] hover:text-white"
                      )}
                      title={isBookmarked ? "Bookmarked" : "Bookmark"}
                    >
                      <Icon icon={Bookmark01Icon} size={13} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleRevision(video.youtubeVideoId)}
                      className={cn(
                        "size-7 rounded border border-transparent hover:border-[#262626]",
                        isRevision
                          ? "text-sky-400 hover:text-sky-300"
                          : "text-[#71717A] hover:text-white"
                      )}
                      title={isRevision ? "Needs Revision" : "Flag for Revision"}
                    >
                      <Icon icon={RotateRight01Icon} size={13} />
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
                        : "border-[#262626] bg-[#141414] text-white hover:bg-[#1E1E1E]"
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
                    {isWatched ? "Watched" : "Mark Watched"}
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
