"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import {
  PlayIcon,
  Bookmark01Icon,
  RotateRight01Icon,
  Search01Icon,
  LinkSquare01Icon,
  LayoutListIcon,
  GridIcon,
} from "@hugeicons/core-free-icons";
import type {
  DBMSVideoItem,
  UserVideoProgress,
  DBMSVideoDifficulty,
  DBMSVideoImportance,
} from "@/domain/dbms";

interface VideoLibraryProps {
  videos: DBMSVideoItem[];
  filteredVideos: DBMSVideoItem[];
  videoProgress: Record<string, UserVideoProgress>;
  filterDay: number | "all";
  filterDifficulty: DBMSVideoDifficulty | "all";
  filterImportance: DBMSVideoImportance | "all";
  filterStatus: "all" | "watched" | "unwatched" | "bookmarked" | "revision_due";
  searchQuery: string;
  onFilterDayChange: (day: number | "all") => void;
  onFilterDifficultyChange: (diff: DBMSVideoDifficulty | "all") => void;
  onFilterImportanceChange: (imp: DBMSVideoImportance | "all") => void;
  onFilterStatusChange: (
    status: "all" | "watched" | "unwatched" | "bookmarked" | "revision_due"
  ) => void;
  onSearchQueryChange: (query: string) => void;
  onWatchVideo: (videoId: string) => void;
  onToggleWatched: (videoId: string) => void;
  onToggleBookmark: (videoId: string) => void;
  onToggleRevision: (videoId: string) => void;
}

export function VideoLibrary({
  videos,
  filteredVideos,
  videoProgress,
  filterDay,
  filterDifficulty,
  filterImportance,
  filterStatus,
  searchQuery,
  onFilterDayChange,
  onFilterDifficultyChange,
  onFilterImportanceChange,
  onFilterStatusChange,
  onSearchQueryChange,
  onWatchVideo,
  onToggleWatched,
  onToggleBookmark,
  onToggleRevision,
}: VideoLibraryProps) {
  const [layout, setLayout] = useState<"row" | "grid">("row");

  return (
    <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 text-white">
      {/* Header & Search */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1A1A1A] pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Complete 91-Video Curriculum Directory
          </h2>
          <p className="text-xs text-[#888888] mt-0.5">
            Search, filter, and track all 91 canonical Neso Academy lectures + 12 curated deep-dives.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Icon
            icon={Search01Icon}
            size={15}
            className="absolute left-3 top-2.5 text-[#666666]"
          />
          <input
            type="text"
            placeholder="Search by title, topic..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full rounded-lg border border-[#262626] bg-[#121212] py-1.5 pl-9 pr-3 text-xs text-white placeholder-[#555555] focus:border-[#FF0000] focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Grid & View Switcher */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 w-full">
          <Select
            value={String(filterDay)}
            onValueChange={(val) =>
              onFilterDayChange(val === "all" ? "all" : Number(val))
            }
          >
            <SelectTrigger className="h-8 w-full border-[#262626] bg-[#121212] px-2.5 py-1 text-xs text-[#CCCCCC]">
              <SelectValue placeholder="All Days (1–12)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days (1–12)</SelectItem>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((d) => (
                <SelectItem key={d} value={String(d)}>
                  Day {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterDifficulty}
            onValueChange={(val) =>
              onFilterDifficultyChange(
                val as Parameters<typeof onFilterDifficultyChange>[0]
              )
            }
          >
            <SelectTrigger className="h-8 w-full border-[#262626] bg-[#121212] px-2.5 py-1 text-xs text-[#CCCCCC]">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterImportance}
            onValueChange={(val) =>
              onFilterImportanceChange(
                val as Parameters<typeof onFilterImportanceChange>[0]
              )
            }
          >
            <SelectTrigger className="h-8 w-full border-[#262626] bg-[#121212] px-2.5 py-1 text-xs text-[#CCCCCC]">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterStatus}
            onValueChange={(val) =>
              onFilterStatusChange(
                val as Parameters<typeof onFilterStatusChange>[0]
              )
            }
          >
            <SelectTrigger className="h-8 w-full border-[#262626] bg-[#121212] px-2.5 py-1 text-xs text-[#CCCCCC]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="unwatched">Unwatched</SelectItem>
              <SelectItem value="watched">Watched</SelectItem>
              <SelectItem value="bookmarked">Bookmarked</SelectItem>
              <SelectItem value="revision_due">Needs Revision</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Switcher Bar */}
        <div className="flex items-center justify-between gap-2 border-t border-[#1A1A1A] pt-2.5">
          <span className="font-mono text-[11px] text-[#777777]">
            Showing <span className="font-semibold text-white">{filteredVideos.length}</span> of{" "}
            {videos.length} lesson{videos.length === 1 ? "" : "s"}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-[#666666] hidden xs:inline">Layout:</span>
            <div className="flex items-center rounded-lg border border-[#262626] bg-[#121212] p-0.5">
              <button
                type="button"
                onClick={() => setLayout("row")}
                aria-label="Table row view"
                title="Table row view"
                className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
                  layout === "row"
                    ? "bg-[#222222] text-white border border-[#333333]"
                    : "text-[#777777] hover:text-white"
                }`}
              >
                <Icon icon={LayoutListIcon} size={14} />
              </button>
              <button
                type="button"
                onClick={() => setLayout("grid")}
                aria-label="Grid card view"
                title="Grid card view"
                className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
                  layout === "grid"
                    ? "bg-[#222222] text-white border border-[#333333]"
                    : "text-[#777777] hover:text-white"
                }`}
              >
                <Icon icon={GridIcon} size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Videos List / Grid */}
      {filteredVideos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#222222] p-8 text-center text-xs text-[#777777]">
          No lessons match your current filters. Try resetting the search or filter options.
        </div>
      ) : layout === "grid" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => {
            const isWatched = !!videoProgress[video.youtubeVideoId]?.watched;
            const isBookmarked = !!videoProgress[video.youtubeVideoId]?.isBookmarked;
            const isRevisionDue = !!videoProgress[video.youtubeVideoId]?.revisionDue;

            return (
              <div
                key={video.youtubeVideoId}
                className="flex flex-col justify-between rounded-xl border border-[#1F1F1F] bg-[#0E0E0E] p-4 transition-all hover:border-[#333333] hover:bg-[#121212]"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#777777]">
                      <span className="rounded bg-[#1A1A1A] px-1.5 py-0.5 text-white font-bold">
                        {video.position == null ? "Deep dive" : "#" + video.position}
                      </span>
                      <span className="text-[#888888]">Day {video.dayNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono uppercase font-bold ${
                          video.importance === "Critical"
                            ? "text-[#FF4D4D]"
                            : video.importance === "High"
                              ? "text-amber-400"
                              : "text-[#777777]"
                        }`}
                      >
                        {video.importance}
                      </span>
                      <Checkbox
                        checked={isWatched}
                        onCheckedChange={() => onToggleWatched(video.youtubeVideoId)}
                        aria-label={`Mark ${video.position == null ? "" : `lesson #${video.position} `}${video.title} as ${isWatched ? "unwatched" : "watched"}`}
                      />
                    </div>
                  </div>

                  <div>
                    <h3
                      onClick={() => onWatchVideo(video.youtubeVideoId)}
                      className={`cursor-pointer font-semibold text-xs leading-snug hover:text-[#FF4D4D] transition-colors line-clamp-2 ${
                        isWatched ? "line-through text-[#666666]" : "text-white"
                      }`}
                    >
                      {video.title}
                    </h3>

                    {video.isSupplementary && (
                      <div className="mt-1">
                        <Badge
                          variant="outline"
                          className="border-[#FF0000]/30 text-[#FF6B6B] text-[9px] px-1 py-0 font-bold uppercase"
                        >
                          Deep Dive
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#181818] pt-2.5">
                  <div className="flex items-center gap-2 text-[11px] text-[#777777] font-mono">
                    <span className="capitalize">{video.difficulty}</span>
                    <span>·</span>
                    <span>~{video.estimatedMinutes}m</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      onClick={() => onWatchVideo(video.youtubeVideoId)}
                      className="h-7 px-2.5 bg-[#FF0000] text-white hover:bg-[#D90000] text-xs font-semibold"
                    >
                      <Icon icon={PlayIcon} size={12} className="mr-1.5 fill-white shrink-0" />
                      Watch
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleBookmark(video.youtubeVideoId)}
                      className={`h-7 w-7 p-0 ${
                        isBookmarked ? "text-[#FF4D4D]" : "text-[#666666] hover:text-white"
                      }`}
                    >
                      <Icon icon={Bookmark01Icon} size={13} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Row View */
        <div className="space-y-2">
          {filteredVideos.map((video) => {
            const isWatched = !!videoProgress[video.youtubeVideoId]?.watched;
            const isBookmarked = !!videoProgress[video.youtubeVideoId]?.isBookmarked;
            const isRevisionDue = !!videoProgress[video.youtubeVideoId]?.revisionDue;

            return (
              <div
                key={video.youtubeVideoId}
                className={`flex flex-col justify-between gap-3 rounded-lg border p-3 transition-colors sm:flex-row sm:items-center ${
                  isWatched
                    ? "border-[#1A1A1A] bg-[#0C0C0C]/50 text-[#777777]"
                    : "border-[#202020] bg-[#101010] hover:border-[#333333]"
                }`}
              >
                <div className="flex items-start gap-3 sm:items-center min-w-0">
                  <Checkbox
                    checked={isWatched}
                    onCheckedChange={() => onToggleWatched(video.youtubeVideoId)}
                    aria-label={`Mark ${video.position == null ? "" : `lesson #${video.position} `}${video.title} as ${isWatched ? "unwatched" : "watched"}`}
                    containerClassName="mt-0.5 sm:mt-0 shrink-0"
                  />

                  <span className="shrink-0 font-mono text-xs text-[#666666]">
                    {video.position == null ? "Deep dive" : `#${video.position}`}
                  </span>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onWatchVideo(video.youtubeVideoId)}
                        className={`text-left text-xs font-semibold sm:text-sm hover:underline line-clamp-1 ${
                          isWatched ? "text-[#777777] line-through" : "text-white"
                        }`}
                      >
                        {video.title}
                      </button>
                      {video.isSupplementary && (
                        <span className="rounded bg-[#FF0000]/15 px-1.5 py-0.2 text-[9px] font-bold text-[#FF6B6B] uppercase">
                          Deep Dive
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#666666]">
                      <span>Day {video.dayNumber}</span>
                      <span>•</span>
                      <span>{video.channel}</span>
                      <span>•</span>
                      <span>{video.estimatedMinutes} mins</span>
                      <span>•</span>
                      <span
                        className={
                          video.difficulty === "Hard"
                            ? "text-[#FF6B6B]"
                            : video.difficulty === "Medium"
                              ? "text-[#DDDDDD]"
                              : "text-[#888888]"
                        }
                      >
                        {video.difficulty}
                      </span>
                      <span>•</span>
                      <span
                        className={
                          video.importance === "Critical"
                            ? "font-semibold text-[#FF4D4D]"
                            : "text-[#888888]"
                        }
                      >
                        {video.importance}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 pl-9 sm:pl-0 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => onWatchVideo(video.youtubeVideoId)}
                    className="h-7 bg-[#FF0000] px-2.5 text-xs font-semibold text-white hover:bg-[#D90000]"
                  >
                    <Icon icon={PlayIcon} size={12} className="mr-1.5 fill-white shrink-0" />
                    Watch
                  </Button>

                  <a
                    href={video.canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#222222] bg-[#141414] text-[#777777] hover:border-[#383838] hover:text-white"
                    title="Open on YouTube"
                  >
                    <Icon icon={LinkSquare01Icon} size={12} />
                  </a>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleBookmark(video.youtubeVideoId)}
                    className={`h-7 w-7 p-0 ${
                      isBookmarked ? "text-[#FF4D4D]" : "text-[#666666] hover:text-white"
                    }`}
                  >
                    <Icon icon={Bookmark01Icon} size={13} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleRevision(video.youtubeVideoId)}
                    className={`h-7 w-7 p-0 ${
                      isRevisionDue ? "text-[#FF4D4D]" : "text-[#666666] hover:text-white"
                    }`}
                  >
                    <Icon icon={RotateRight01Icon} size={13} />
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
