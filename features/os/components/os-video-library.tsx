"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Tick02Icon,
  Search01Icon,
  FilterIcon,
  Clock01Icon,
  FileEditIcon,
  GridIcon,
  LayoutListIcon,
  Bookmark01Icon,
  RotateRight01Icon,
  LinkSquare01Icon,
} from "@hugeicons/core-free-icons";
import type {
  OSVideoItem,
  OSVideoDifficulty,
  OSVideoImportance,
  UserOSVideoProgress,
} from "@/domain/os";

interface OSVideoLibraryProps {
  videos: OSVideoItem[];
  videoProgress: Record<string, UserOSVideoProgress>;
  filters: {
    day: number | "all";
    setDay: (d: number | "all") => void;
    difficulty: OSVideoDifficulty | "all";
    setDifficulty: (d: OSVideoDifficulty | "all") => void;
    importance: OSVideoImportance | "all";
    setImportance: (i: OSVideoImportance | "all") => void;
    status: "all" | "watched" | "unwatched" | "revision_due";
    setStatus: (s: "all" | "watched" | "unwatched" | "revision_due") => void;
    search: string;
    setSearch: (q: string) => void;
  };
  onToggleWatched: (video: OSVideoItem) => void;
  onToggleBookmark?: (video: OSVideoItem) => void;
  onToggleRevision?: (video: OSVideoItem) => void;
  onOpenVideo: (video: OSVideoItem) => void;
}

export function OSVideoLibrary({
  videos,
  videoProgress,
  filters,
  onToggleWatched,
  onToggleBookmark,
  onToggleRevision,
  onOpenVideo,
}: OSVideoLibraryProps) {
  const [layout, setLayout] = useState<"row" | "grid">("row");
  return (
    <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 text-white">
      {/* Header & Search */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1A1A1A] pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Course Video Library (77 Lessons)
          </h2>
          <p className="text-xs text-[#888888] mt-0.5">
            Full sequential Neso Academy Operating Systems curriculum with verified watch
            URLs and playlist fallbacks.
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
            value={filters.search}
            onChange={(e) => filters.setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#262626] bg-[#121212] py-1.5 pl-9 pr-3 text-xs text-white placeholder-[#555555] focus:border-[#FF0000] focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Grid & View Switcher */}
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 w-full">
          <Select
            value={String(filters.day)}
            onValueChange={(val) => filters.setDay(val === "all" ? "all" : parseInt(val))}
          >
            <SelectTrigger className="h-8 w-full border-[#262626] bg-[#121212] px-2.5 py-1 text-xs text-[#CCCCCC]">
              <SelectValue placeholder="All Days (1–12)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days (1–12)</SelectItem>
              {Array.from({ length: 12 }).map((_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  Day {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.difficulty}
            onValueChange={(val) =>
              filters.setDifficulty(val as Parameters<typeof filters.setDifficulty>[0])
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
            value={filters.importance}
            onValueChange={(val) =>
              filters.setImportance(val as Parameters<typeof filters.setImportance>[0])
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
            value={filters.status}
            onValueChange={(val) =>
              filters.setStatus(val as Parameters<typeof filters.setStatus>[0])
            }
          >
            <SelectTrigger className="h-8 w-full border-[#262626] bg-[#121212] px-2.5 py-1 text-xs text-[#CCCCCC]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="watched">Watched</SelectItem>
              <SelectItem value="unwatched">Unwatched</SelectItem>
              <SelectItem value="revision_due">Needs Revision</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Switcher Bar */}
        <div className="flex items-center justify-between gap-2 border-t border-[#1A1A1A] pt-2.5">
          <span className="font-mono text-[11px] text-[#777777]">
            Showing <span className="font-semibold text-white">{videos.length}</span> lesson{videos.length === 1 ? "" : "s"}
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

      {/* Video Content: Row (Table / Mobile Stack) vs Grid Cards */}
      {videos.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#666666] italic border border-[#1F1F1F] rounded-lg">
          No video lessons match your current filters.
        </div>
      ) : layout === "grid" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const key =
              video.progressId ?? video.youtubeVideoId ?? `pos-${video.position}`;
            const prog = videoProgress[key] || videoProgress[String(video.position)];
            const isWatched = Boolean(prog?.watched);

            return (
              <div
                key={key}
                className="flex flex-col justify-between rounded-xl border border-[#1F1F1F] bg-[#0E0E0E] p-4 transition-all hover:border-[#333333] hover:bg-[#121212]"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#777777]">
                      <span className="rounded bg-[#1A1A1A] px-1.5 py-0.5 text-white font-bold">
                        {video.isSupplementary ? "Deep dive" : "#" + video.position}
                      </span>
                      <span className="text-[#888888]">Day {video.dayNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-medium ${
                          video.difficulty === "Hard"
                            ? "text-[#FF4D4D]"
                            : video.difficulty === "Medium"
                              ? "text-amber-400"
                              : "text-[#4ade80]"
                        }`}
                      >
                        {video.difficulty}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          video.importance === "Critical"
                            ? "bg-[#FF0000]/15 text-[#FF4D4D] border border-[#FF0000]/30"
                            : "bg-white/5 text-[#888888]"
                        }`}
                      >
                        {video.importance}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-white leading-snug line-clamp-2">
                      {video.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-[#666666] font-mono">
                      <span>{video.topicSlug}</span>
                      <span>·</span>
                      <span>~{video.estimatedMinutes}m</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#1A1A1A] pt-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#888888] hover:text-white">
                    <Checkbox
                      checked={isWatched}
                      onCheckedChange={() => onToggleWatched(video)}
                      aria-label={`Mark ${video.title} as ${isWatched ? "unwatched" : "watched"}`}
                    />
                    <span>{isWatched ? "Watched" : "Mark done"}</span>
                  </label>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => onOpenVideo(video)}
                      className="h-7 px-2.5 bg-[#FF0000] text-white hover:bg-[#D90000] text-xs font-semibold shrink-0"
                    >
                      <Icon icon={PlayIcon} size={12} className="mr-1.5 fill-white shrink-0" />
                      Watch
                    </Button>
                    {(video.canonicalUrl || video.youtubeVideoId) && (
                      <a
                        href={video.canonicalUrl || `https://www.youtube.com/watch?v=${video.youtubeVideoId}`}
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
                          prog?.isBookmarked ? "text-[#FF4D4D]" : "text-[#666666] hover:text-white"
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
                          prog?.revisionDue ? "text-[#FF4D4D]" : "text-[#666666] hover:text-white"
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
        /* Row View: Mobile Stack on small screens + Full Table on desktop */
        <div>
          {/* Mobile Stack (< md) */}
          <div className="block md:hidden space-y-2.5">
            {videos.map((video) => {
              const key =
                video.progressId ?? video.youtubeVideoId ?? `pos-${video.position}`;
              const prog = videoProgress[key] || videoProgress[String(video.position)];
              const isWatched = Boolean(prog?.watched);

              return (
                <div
                  key={key}
                  className="rounded-lg border border-[#1F1F1F] bg-[#0E0E0E] p-3.5 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Checkbox
                        checked={isWatched}
                        onCheckedChange={() => onToggleWatched(video)}
                        aria-label={`Mark ${video.title} as ${isWatched ? "unwatched" : "watched"}`}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-xs text-white leading-snug block">
                          {video.title}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#777777] font-mono">
                          <span>{video.isSupplementary ? "Deep dive" : "#" + video.position}</span>
                          <span>·</span>
                          <span>Day {video.dayNumber}</span>
                          <span>·</span>
                          <span>~{video.estimatedMinutes}m</span>
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
                      {(video.canonicalUrl || video.youtubeVideoId) && (
                        <a
                          href={video.canonicalUrl || `https://www.youtube.com/watch?v=${video.youtubeVideoId}`}
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
                            prog?.isBookmarked ? "text-[#FF4D4D]" : "text-[#666666] hover:text-white"
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
                            prog?.revisionDue ? "text-[#FF4D4D]" : "text-[#666666] hover:text-white"
                          }`}
                          title="Review"
                        >
                          <Icon icon={RotateRight01Icon} size={13} />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-[#181818] text-[10px]">
                    <span
                      className={
                        video.difficulty === "Hard"
                          ? "text-[#FF4D4D]"
                          : video.difficulty === "Medium"
                            ? "text-amber-400"
                            : "text-[#4ade80]"
                      }
                    >
                      {video.difficulty}
                    </span>
                    <span className="text-[#555555]">/</span>
                    <span
                      className={
                        video.importance === "Critical"
                          ? "text-[#FF4D4D] font-bold"
                          : "text-[#888888]"
                      }
                    >
                      {video.importance} Priority
                    </span>
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
                  <th className="py-2.5 px-3 w-12 font-mono">Pos</th>
                  <th className="py-2.5 px-3 min-w-[220px]">Title & Subject</th>
                  <th className="py-2.5 px-3 w-20">Day</th>
                  <th className="py-2.5 px-3 w-24">Difficulty</th>
                  <th className="py-2.5 px-3 w-24">Priority</th>
                  <th className="py-2.5 px-3 w-24">Duration</th>
                  <th className="py-2.5 px-4 w-44 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A] bg-[#0A0A0A]">
                {videos.map((video) => {
                  const key =
                    video.progressId ?? video.youtubeVideoId ?? `pos-${video.position}`;
                  const prog = videoProgress[key] || videoProgress[String(video.position)];
                  const isWatched = Boolean(prog?.watched);

                  return (
                    <tr key={key} className="hover:bg-[#121212] transition-colors">
                      <td className="py-2 px-3">
                        <Checkbox
                          checked={isWatched}
                          onCheckedChange={() => onToggleWatched(video)}
                          aria-label={`Mark ${video.title} as ${isWatched ? "unwatched" : "watched"}`}
                        />
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-[#777777]">
                        {video.isSupplementary ? "Deep dive" : "#" + video.position}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{video.title}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-[#666666] font-mono">
                              {video.topicSlug}
                            </span>
                            {video.isChapterIntro && (
                              <span className="text-[9px] text-amber-400 font-semibold uppercase">
                                [Intro Overview]
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono text-xs text-[#AAAAAA]">
                        Day {video.dayNumber}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={
                            video.difficulty === "Hard"
                              ? "text-[#FF4D4D]"
                              : video.difficulty === "Medium"
                                ? "text-amber-400"
                                : "text-[#4ade80]"
                          }
                        >
                          {video.difficulty}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={
                            video.importance === "Critical"
                              ? "text-[#FF4D4D] font-bold"
                              : "text-[#888888]"
                          }
                        >
                          {video.importance}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-[#888888]">
                        ~{video.estimatedMinutes}m
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
                          {(video.canonicalUrl || video.youtubeVideoId) && (
                            <a
                              href={video.canonicalUrl || `https://www.youtube.com/watch?v=${video.youtubeVideoId}`}
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
                                prog?.isBookmarked ? "text-[#FF4D4D]" : "text-[#666666] hover:text-white"
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
                                prog?.revisionDue ? "text-[#FF4D4D]" : "text-[#666666] hover:text-white"
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
      )}
    </div>
  );
}
