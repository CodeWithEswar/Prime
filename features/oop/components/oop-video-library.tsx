"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Search01Icon,
  Clock01Icon,
  LayoutListIcon,
  GridIcon,
  Bookmark01Icon,
  RotateRight01Icon,
  LinkSquare01Icon,
} from "@hugeicons/core-free-icons";
import type {
  OOPVideoItem,
  OOPPrerequisiteItem,
  OOPSupplementaryItem,
  UserOOPVideoProgress,
} from "@/domain/oop";

interface OOPVideoLibraryProps {
  primaryVideos: OOPVideoItem[];
  prerequisites: OOPPrerequisiteItem[];
  supplementaryVideos: OOPSupplementaryItem[];
  videoProgress: Record<string, UserOOPVideoProgress>;
  onToggleWatched: (video: OOPVideoItem) => void;
  onToggleBookmark?: (video: OOPVideoItem) => void;
  onToggleRevision?: (video: OOPVideoItem) => void;
  onOpenVideo: (video: OOPVideoItem) => void;
}

export function OOPVideoLibrary({
  primaryVideos,
  prerequisites,
  supplementaryVideos,
  videoProgress,
  onToggleWatched,
  onToggleBookmark,
  onToggleRevision,
  onOpenVideo,
}: OOPVideoLibraryProps) {
  const [activeCatalog, setActiveCatalog] = useState<
    "primary" | "prerequisites" | "supplementary"
  >("primary");
  const [layout, setLayout] = useState<"row" | "grid">("row");
  const [searchQuery, setSearchQuery] = useState("");
  const [dayFilter, setDayFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredPrimary = primaryVideos.filter((v) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = v.title.toLowerCase().includes(q);
      const matchTopic = v.topicIds.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchTopic) return false;
    }
    if (dayFilter !== "all") {
      const targetDay = parseInt(dayFilter, 10);
      if (!v.assignedDays.includes(targetDay)) return false;
    }
    if (difficultyFilter !== "all" && v.difficulty !== difficultyFilter) return false;
    if (
      priorityFilter !== "all" &&
      v.interviewImportance?.toLowerCase() !== priorityFilter.toLowerCase()
    ) {
      return false;
    }
    if (statusFilter !== "all") {
      const isWatched = Boolean(videoProgress[v.youtubeVideoId]?.watched);
      if (statusFilter === "watched" && !isWatched) return false;
      if (statusFilter === "unwatched" && isWatched) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 text-white">
      {/* Header & Sub-catalog Tabs */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1A1A1A] pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Curated Video Learning Library
          </h2>
          <p className="text-xs text-[#888888] mt-0.5">
            Master lectures, Java foundations prerequisites, and advanced SOLID/design pattern resources.
          </p>
        </div>

        <Tabs
          value={activeCatalog}
          onValueChange={(val) => setActiveCatalog(val as typeof activeCatalog)}
          className="shrink-0"
        >
          <TabsList className="h-8 bg-[#121212] border border-[#262626] p-0.5">
            <TabsTrigger
              value="primary"
              className="h-7 px-3 text-xs data-[state=active]:bg-[#222222] data-[state=active]:text-white text-[#888888]"
            >
              Primary ({primaryVideos.length})
            </TabsTrigger>
            <TabsTrigger
              value="prerequisites"
              className="h-7 px-3 text-xs data-[state=active]:bg-[#222222] data-[state=active]:text-white text-[#888888]"
            >
              Prerequisites ({prerequisites.length})
            </TabsTrigger>
            <TabsTrigger
              value="supplementary"
              className="h-7 px-3 text-xs data-[state=active]:bg-[#222222] data-[state=active]:text-white text-[#888888]"
            >
              Advanced ({supplementaryVideos.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filter and Search Bar for Primary Lectures */}
      {activeCatalog === "primary" && (
        <div className="space-y-2.5">
          <div className="relative w-full">
            <Icon
              icon={Search01Icon}
              size={15}
              className="absolute left-3 top-2.5 text-[#666666]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lectures or topics (e.g. constructors, polymorphism)..."
              className="w-full rounded-lg border border-[#262626] bg-[#121212] py-1.5 pl-9 pr-3 text-xs text-white placeholder-[#555555] focus:border-[#FF0000] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 w-full">
            <Select value={dayFilter} onValueChange={setDayFilter}>
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

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="h-8 w-full border-[#262626] bg-[#121212] px-2.5 py-1 text-xs text-[#CCCCCC]">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="h-8 w-full border-[#262626] bg-[#121212] px-2.5 py-1 text-xs text-[#CCCCCC]">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-full border-[#262626] bg-[#121212] px-2.5 py-1 text-xs text-[#CCCCCC]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="watched">Watched</SelectItem>
                <SelectItem value="unwatched">Unwatched</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Switcher Bar */}
          <div className="flex items-center justify-between gap-2 border-t border-[#1A1A1A] pt-2.5">
            <span className="font-mono text-[11px] text-[#777777]">
              Showing <span className="font-semibold text-white">{filteredPrimary.length}</span> of{" "}
              {primaryVideos.length} lesson{primaryVideos.length === 1 ? "" : "s"}
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
      )}

      {/* Primary Content Rendering */}
      {activeCatalog === "primary" && (
        filteredPrimary.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#666666] italic border border-[#1F1F1F] rounded-lg">
            No video lessons match your current filters.
          </div>
        ) : layout === "grid" ? (
          /* Grid Cards View */
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPrimary.map((video) => {
              const isWatched = Boolean(videoProgress[video.youtubeVideoId]?.watched);

              return (
                <div
                  key={video.youtubeVideoId}
                  className="flex flex-col justify-between rounded-xl border border-[#1F1F1F] bg-[#0E0E0E] p-4 transition-all hover:border-[#333333] hover:bg-[#121212]"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#777777]">
                        <span className="rounded bg-[#1A1A1A] px-1.5 py-0.5 text-white font-bold">
                          Lecture {video.order}
                        </span>
                        <span className="text-[#888888]">Days {video.assignedDays.join(", ")}</span>
                      </div>
                      <Checkbox
                        checked={isWatched}
                        onCheckedChange={() => onToggleWatched(video)}
                        aria-label={`Mark ${video.title} as ${isWatched ? "unwatched" : "watched"}`}
                      />
                    </div>

                    <div>
                      <h3
                        onClick={() => onOpenVideo(video)}
                        className={`cursor-pointer font-semibold text-xs leading-snug hover:text-[#FF4D4D] transition-colors line-clamp-2 ${
                          isWatched ? "line-through text-[#666666]" : "text-white"
                        }`}
                      >
                        {video.title}
                      </h3>
                      <div className="text-[11px] text-[#777777] mt-0.5">By {video.channelTitle}</div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {video.topicIds.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="rounded bg-[#141414] px-1.5 py-0.5 text-[10px] text-[#888888]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#181818] pt-2.5">
                    <span className="flex items-center gap-1 font-mono text-[11px] text-[#666666]">
                      <Icon icon={Clock01Icon} size={13} />
                      {Math.round(video.durationSeconds / 60)}m
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => onOpenVideo(video)}
                        className="h-7 px-2.5 bg-[#FF0000] text-white hover:bg-[#D90000] text-xs font-semibold"
                      >
                        <Icon icon={PlayIcon} size={12} className="mr-1.5 fill-white shrink-0" />
                        Watch
                      </Button>
                      {(video.canonicalWatchUrl || video.youtubeVideoId) && (
                        <a
                          href={video.canonicalWatchUrl || `https://www.youtube.com/watch?v=${video.youtubeVideoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#222222] bg-[#141414] text-[#777777] hover:border-[#383838] hover:text-white"
                          title="Open on YouTube"
                        >
                          <Icon icon={LinkSquare01Icon} size={12} />
                        </a>
                      )}
                      {onToggleBookmark && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleBookmark(video)}
                          className={`h-7 w-7 p-0 ${
                            videoProgress[video.youtubeVideoId]?.isBookmarked
                              ? "text-[#FF4D4D]"
                              : "text-[#666666] hover:text-white"
                          }`}
                          title="Bookmark"
                        >
                          <Icon icon={Bookmark01Icon} size={13} />
                        </Button>
                      )}
                      {onToggleRevision && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleRevision(video)}
                          className={`h-7 w-7 p-0 ${
                            videoProgress[video.youtubeVideoId]?.revisionDue
                              ? "text-[#FF4D4D]"
                              : "text-[#666666] hover:text-white"
                          }`}
                          title="Review"
                        >
                          <Icon icon={RotateRight01Icon} size={13} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Row View: Mobile Cards Stack (<md) & Desktop Table (md+) */
          <div className="space-y-3">
            {/* Mobile Cards (<md) */}
            <div className="space-y-2 md:hidden">
              {filteredPrimary.map((video) => {
                const isWatched = Boolean(videoProgress[video.youtubeVideoId]?.watched);

                return (
                  <div
                    key={video.youtubeVideoId}
                    className="rounded-lg border border-[#1F1F1F] bg-[#0E0E0E] p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <Checkbox
                          checked={isWatched}
                          onCheckedChange={() => onToggleWatched(video)}
                          aria-label={`Mark ${video.title} as ${isWatched ? "unwatched" : "watched"}`}
                          containerClassName="mt-0.5 shrink-0"
                        />
                        <div className="min-w-0">
                          <span
                            onClick={() => onOpenVideo(video)}
                            className={`font-semibold text-xs leading-snug block cursor-pointer hover:text-[#FF4D4D] transition-colors ${
                              isWatched ? "line-through text-[#666666]" : "text-white"
                            }`}
                          >
                            {video.title}
                          </span>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#777777] font-mono">
                            <span>Lecture {video.order}</span>
                            <span>·</span>
                            <span>Days {video.assignedDays.join(", ")}</span>
                            <span>·</span>
                            <span>{Math.round(video.durationSeconds / 60)}m</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => onOpenVideo(video)}
                          className="h-7 px-2.5 bg-[#FF0000] text-white hover:bg-[#D90000] text-xs font-semibold shrink-0"
                        >
                          <Icon icon={PlayIcon} size={12} className="mr-1 fill-white shrink-0" />
                          Watch
                        </Button>
                        {(video.canonicalWatchUrl || video.youtubeVideoId) && (
                          <a
                            href={video.canonicalWatchUrl || `https://www.youtube.com/watch?v=${video.youtubeVideoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#222222] bg-[#141414] text-[#777777] hover:border-[#383838] hover:text-white"
                            title="Open on YouTube"
                          >
                            <Icon icon={LinkSquare01Icon} size={12} />
                          </a>
                        )}
                        {onToggleBookmark && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleBookmark(video)}
                            className={`h-7 w-7 p-0 ${
                              videoProgress[video.youtubeVideoId]?.isBookmarked
                                ? "text-[#FF4D4D]"
                                : "text-[#666666] hover:text-white"
                            }`}
                            title="Bookmark"
                          >
                            <Icon icon={Bookmark01Icon} size={13} />
                          </Button>
                        )}
                        {onToggleRevision && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleRevision(video)}
                            className={`h-7 w-7 p-0 ${
                              videoProgress[video.youtubeVideoId]?.revisionDue
                                ? "text-[#FF4D4D]"
                                : "text-[#666666] hover:text-white"
                            }`}
                            title="Review"
                          >
                            <Icon icon={RotateRight01Icon} size={13} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (md+) */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-[#1F1F1F]">
              <table className="w-full min-w-full table-auto text-left text-xs text-[#CCCCCC]">
                <thead className="bg-[#121212] text-[#888888] uppercase text-[10px] border-b border-[#1F1F1F]">
                  <tr>
                    <th className="py-2.5 px-3 w-10">Done</th>
                    <th className="py-2.5 px-3 w-16 font-mono">Lecture</th>
                    <th className="py-2.5 px-3 min-w-[220px]">Title & Topics</th>
                    <th className="py-2.5 px-3 w-28">Study Days</th>
                    <th className="py-2.5 px-3 w-24">Channel</th>
                    <th className="py-2.5 px-3 w-24">Duration</th>
                    <th className="py-2.5 px-4 w-44 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A] bg-[#0A0A0A]">
                  {filteredPrimary.map((video) => {
                    const isWatched = Boolean(videoProgress[video.youtubeVideoId]?.watched);

                    return (
                      <tr
                        key={video.youtubeVideoId}
                        className={`hover:bg-[#121212] transition-colors ${
                          isWatched ? "bg-[#0A0A0A] text-[#666666]" : ""
                        }`}
                      >
                        <td className="py-2 px-3">
                          <Checkbox
                            checked={isWatched}
                            onCheckedChange={() => onToggleWatched(video)}
                            aria-label={`Mark ${video.title} as ${isWatched ? "unwatched" : "watched"}`}
                          />
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-[#FF4D4D] font-bold">
                          #{video.order}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex flex-col">
                            <span
                              onClick={() => onOpenVideo(video)}
                              className={`cursor-pointer font-semibold hover:text-[#FF4D4D] transition-colors ${
                                isWatched ? "line-through text-[#666666]" : "text-white"
                              }`}
                            >
                              {video.title}
                            </span>
                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                              {video.topicIds.slice(0, 3).map((t) => (
                                <span
                                  key={t}
                                  className="text-[10px] text-[#666666] font-mono"
                                >
                                  #{t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3 font-mono text-xs text-[#AAAAAA]">
                          Days {video.assignedDays.join(", ")}
                        </td>
                        <td className="py-2 px-3 text-[#888888]">{video.channelTitle}</td>
                        <td className="py-2 px-3 font-mono text-[#888888]">
                          {Math.round(video.durationSeconds / 60)}m
                        </td>
                        <td className="py-2 px-4 text-right pr-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => onOpenVideo(video)}
                              className="h-7 px-2.5 bg-[#FF0000] text-white hover:bg-[#D90000] text-xs font-semibold shrink-0"
                            >
                              <Icon icon={PlayIcon} size={12} className="mr-1.5 fill-white shrink-0" />
                              Watch
                            </Button>
                            {(video.canonicalWatchUrl || video.youtubeVideoId) && (
                              <a
                                href={video.canonicalWatchUrl || `https://www.youtube.com/watch?v=${video.youtubeVideoId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#222222] bg-[#141414] text-[#777777] hover:border-[#383838] hover:text-white"
                                title="Open on YouTube"
                              >
                                <Icon icon={LinkSquare01Icon} size={12} />
                              </a>
                            )}
                            {onToggleBookmark && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onToggleBookmark(video)}
                                className={`h-7 w-7 p-0 ${
                                  videoProgress[video.youtubeVideoId]?.isBookmarked
                                    ? "text-[#FF4D4D]"
                                    : "text-[#666666] hover:text-white"
                                }`}
                                title="Bookmark"
                              >
                                <Icon icon={Bookmark01Icon} size={13} />
                              </Button>
                            )}
                            {onToggleRevision && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onToggleRevision(video)}
                                className={`h-7 w-7 p-0 ${
                                  videoProgress[video.youtubeVideoId]?.revisionDue
                                    ? "text-[#FF4D4D]"
                                    : "text-[#666666] hover:text-white"
                                }`}
                                title="Review"
                              >
                                <Icon icon={RotateRight01Icon} size={13} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Prerequisites Catalog */}
      {activeCatalog === "prerequisites" && (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {prerequisites.map((pre) => (
            <div
              key={pre.prerequisiteId}
              className="flex flex-col justify-between rounded-xl border border-[#1F1F1F] bg-[#0E0E0E] p-4 transition-all hover:border-[#333333] hover:bg-[#121212]"
            >
              <div className="space-y-2">
                <span className="font-mono text-xs text-[#FF4D4D] font-bold">
                  Foundation Prerequisite
                </span>
                <h3 className="text-sm font-bold text-white">{pre.title}</h3>
                <p className="text-xs text-[#888888] line-clamp-2">{pre.recommendedUse}</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#181818] pt-3">
                <span className="font-mono text-[11px] text-[#666666]">
                  {Math.round(pre.durationSeconds / 60)}m
                </span>
                <Button
                  asChild
                  size="sm"
                  className="h-7 px-2.5 bg-[#FF0000] text-white hover:bg-[#D90000] text-xs font-semibold"
                >
                  <a
                    href={pre.canonicalWatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon icon={PlayIcon} size={12} className="mr-1.5 fill-white shrink-0" />
                    Watch ↗
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Supplementary Advanced Modules Catalog */}
      {activeCatalog === "supplementary" && (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {supplementaryVideos.map((supp) => (
            <div
              key={supp.id}
              className="flex flex-col justify-between rounded-xl border border-[#1F1F1F] bg-[#0E0E0E] p-4 transition-all hover:border-[#333333] hover:bg-[#121212]"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-green-400 font-bold">
                    Day {supp.assignedStudyDay} Focus
                  </span>
                  <Badge variant="outline" className="text-[10px] text-[#CCCCCC]">
                    {supp.channelTitle}
                  </Badge>
                </div>
                <h3 className="line-clamp-2 text-sm font-bold text-white">
                  {supp.title}
                </h3>
                <p className="text-xs text-[#888888] line-clamp-2">{supp.coverageRationale}</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#181818] pt-3">
                <span className="font-mono text-[11px] text-[#666666]">
                  {Math.round(supp.durationSeconds / 60)}m
                </span>
                <Button
                  asChild
                  size="sm"
                  className="h-7 px-2.5 bg-[#FF0000] text-white hover:bg-[#D90000] text-xs font-semibold"
                >
                  <a
                    href={supp.canonicalWatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon icon={PlayIcon} size={12} className="mr-1.5 fill-white shrink-0" />
                    Watch ↗
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
