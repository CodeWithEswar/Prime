"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import {
  PlayIcon,
  Tick02Icon,
  Search01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import type {
  PythonVideoItem,
  PythonDifficulty,
  UserVideoProgress,
} from "@/domain/python";

interface PythonVideoLibraryProps {
  videos: PythonVideoItem[];
  videoProgress: Record<string, UserVideoProgress>;
  onWatchVideo: (video: PythonVideoItem) => void;
  onToggleWatched: (videoId: string) => void;
}

export function PythonVideoLibrary({
  videos,
  videoProgress,
  onWatchVideo,
  onToggleWatched,
}: PythonVideoLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<number | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<PythonDifficulty | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "watched" | "unwatched">("all");

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      if (selectedStage !== "all" && v.stageNumber !== selectedStage) return false;
      if (selectedDifficulty !== "all" && v.difficulty !== selectedDifficulty) return false;

      const isWatched = !!videoProgress[v.youtubeVideoId]?.watched;
      if (selectedStatus === "watched" && !isWatched) return false;
      if (selectedStatus === "unwatched" && isWatched) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = v.title.toLowerCase().includes(q);
        const matchesTopic = v.topicSlug.toLowerCase().includes(q);
        const matchesChannel = v.channel.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTopic && !matchesChannel) return false;
      }

      return true;
    });
  }, [videos, videoProgress, selectedStage, selectedDifficulty, selectedStatus, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-md border border-zinc-800 bg-zinc-950/80 shadow-md">
        <div className="relative flex-1">
          <Icon
            icon={Search01Icon}
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 43 Python & DSA video lectures..."
            className="h-9 pl-9 pr-8 bg-zinc-900 border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 rounded-md focus-visible:border-zinc-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
            >
              <Icon icon={Cancel01Icon} size={12} />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 prime-scrollbar-none">
          <select
            value={selectedStage}
            onChange={(e) =>
              setSelectedStage(e.target.value === "all" ? "all" : Number(e.target.value))
            }
            className="h-9 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-200 px-2.5 font-mono outline-none cursor-pointer hover:border-zinc-700 transition-colors"
          >
            <option value="all">All 8 Stages</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Stage {s}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) =>
              setSelectedDifficulty(e.target.value as PythonDifficulty | "all")
            }
            className="h-9 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-200 px-2.5 font-mono outline-none cursor-pointer hover:border-zinc-700 transition-colors"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value as "all" | "watched" | "unwatched")
            }
            className="h-9 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-200 px-2.5 font-mono outline-none cursor-pointer hover:border-zinc-700 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="unwatched">Unwatched</option>
            <option value="watched">Watched</option>
          </select>
        </div>
      </div>

      {/* Video Grid with Rich Thumbnails */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVideos.map((vid) => {
          const isWatched = !!videoProgress[vid.youtubeVideoId]?.watched;

          return (
            <div
              key={`${vid.stageNumber}-${vid.position}-${vid.youtubeVideoId}`}
              className="rounded-md border border-zinc-800 bg-zinc-950/80 overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all group shadow-md"
            >
              <div>
                {/* 16:9 Thumbnail Header */}
                <div
                  onClick={() => onWatchVideo(vid)}
                  className="relative aspect-video w-full overflow-hidden bg-black border-b border-zinc-800/80 cursor-pointer"
                >
                  <Image
                    src={`https://i.ytimg.com/vi/${vid.youtubeVideoId}/hqdefault.jpg`}
                    alt={vid.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                  {/* Subtle dark vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity">
                    <span className="flex size-10 items-center justify-center rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white shadow-lg group-hover:scale-110 transition-transform">
                      <Icon icon={PlayIcon} size={18} className="text-white fill-white ml-0.5" />
                    </span>
                  </div>

                  {/* Stage Tag Top Left */}
                  <span className="absolute top-2 left-2 font-mono text-[10px] text-zinc-300 font-semibold bg-black/85 backdrop-blur-sm px-2 py-0.5 rounded-sm border border-zinc-800">
                    STAGE {vid.stageNumber} · #{vid.position}
                  </span>

                  {/* Duration Badge Bottom Right */}
                  <span className="absolute bottom-2 right-2 font-mono text-[10px] font-semibold text-zinc-200 bg-black/85 backdrop-blur-sm px-1.5 py-0.5 rounded-sm border border-zinc-800">
                    {vid.estimatedMinutes}m
                  </span>

                  {/* Watched Status Top Right */}
                  {isWatched && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 font-mono text-[9px] font-bold text-emerald-400 bg-black/85 backdrop-blur-sm px-1.5 py-0.5 rounded-sm border border-emerald-800/60 shadow">
                      <Icon icon={Tick02Icon} size={10} />
                      DONE
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-zinc-400 truncate">
                      {vid.channel}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] font-mono px-1.5 py-0 rounded-sm border",
                        vid.difficulty === "Easy" && "text-emerald-400 bg-emerald-950/40 border-emerald-800/40",
                        vid.difficulty === "Medium" && "text-amber-400 bg-amber-950/40 border-amber-800/40",
                        vid.difficulty === "Hard" && "text-red-400 bg-red-950/40 border-red-800/40"
                      )}
                    >
                      {vid.difficulty}
                    </Badge>
                  </div>

                  <h4
                    onClick={() => onWatchVideo(vid)}
                    className={cn(
                      "text-xs sm:text-sm font-bold leading-snug cursor-pointer hover:text-white transition-colors line-clamp-2",
                      isWatched ? "line-through text-zinc-500" : "text-zinc-100"
                    )}
                  >
                    {vid.title}
                  </h4>

                  {vid.keyTakeaways && vid.keyTakeaways.length > 0 && (
                    <p className="text-[11px] text-zinc-400 line-clamp-1 flex items-center gap-1.5">
                      <span className="size-1 rounded-full bg-zinc-600 shrink-0" />
                      <span>{vid.keyTakeaways[0]}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3.5 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between bg-zinc-950/50">
                <button
                  type="button"
                  onClick={() => onToggleWatched(vid.youtubeVideoId)}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  <span
                    className={cn(
                      "size-4 rounded-sm flex items-center justify-center border transition-colors",
                      isWatched
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
                    )}
                  >
                    {isWatched && <Icon icon={Tick02Icon} size={11} />}
                  </span>
                  <span className="text-[11px] font-mono">{isWatched ? "Watched" : "Mark as done"}</span>
                </button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onWatchVideo(vid)}
                  className="h-7 text-xs px-2.5 rounded-md border-zinc-800 bg-zinc-900 text-zinc-200 hover:text-white hover:bg-zinc-850"
                >
                  <Icon icon={PlayIcon} size={11} className="mr-1 text-zinc-300" />
                  Watch
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
