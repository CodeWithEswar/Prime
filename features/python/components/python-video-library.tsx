"use client";

import { useState, useMemo } from "react";
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-[#222228] bg-[#0A0A0E]">
        <div className="relative flex-1">
          <Icon
            icon={Search01Icon}
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 43 Python & DSA video lectures..."
            className="h-9 pl-9 pr-8 bg-[#121218] border-[#222228] text-xs text-white placeholder:text-[#71717A] rounded-lg"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white"
            >
              <Icon icon={Cancel01Icon} size={12} />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 prime-scrollbar-thin">
          <select
            value={selectedStage}
            onChange={(e) =>
              setSelectedStage(e.target.value === "all" ? "all" : Number(e.target.value))
            }
            className="h-9 bg-[#121218] border border-[#222228] rounded-lg text-xs text-[#E4E4E7] px-2.5 font-mono outline-none"
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
            className="h-9 bg-[#121218] border border-[#222228] rounded-lg text-xs text-[#E4E4E7] px-2.5 font-mono outline-none"
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
            className="h-9 bg-[#121218] border border-[#222228] rounded-lg text-xs text-[#E4E4E7] px-2.5 font-mono outline-none"
          >
            <option value="all">All Status</option>
            <option value="unwatched">Unwatched</option>
            <option value="watched">Watched</option>
          </select>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredVideos.map((vid) => {
          const isWatched = !!videoProgress[vid.youtubeVideoId]?.watched;

          return (
            <div
              key={vid.youtubeVideoId}
              className="rounded-xl border border-[#1E1E24] bg-[#0A0A0E] p-4 flex flex-col justify-between gap-3 hover:border-[#2C2C35] transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-[var(--accent)] font-semibold bg-[#181010] px-2 py-0.5 rounded border border-red-950/60">
                    STAGE {vid.stageNumber} · #{vid.position}
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
                    {vid.difficulty}
                  </Badge>
                </div>

                <h4
                  onClick={() => onWatchVideo(vid)}
                  className={cn(
                    "text-xs font-bold leading-snug cursor-pointer group-hover:text-[var(--accent)] transition-colors line-clamp-2",
                    isWatched ? "line-through text-[#71717A]" : "text-white"
                  )}
                >
                  {vid.title}
                </h4>

                <div className="flex items-center gap-2 text-[11px] font-mono text-[#71717A]">
                  <span className="text-[#A1A1AA]">{vid.channel}</span>
                  <span>•</span>
                  <span>{vid.estimatedMinutes} mins</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-[#18181F]">
                <button
                  type="button"
                  onClick={() => onToggleWatched(vid.youtubeVideoId)}
                  className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white"
                >
                  <span
                    className={cn(
                      "size-4 rounded flex items-center justify-center border",
                      isWatched
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "border-[#3F3F46]"
                    )}
                  >
                    {isWatched && <Icon icon={Tick02Icon} size={11} />}
                  </span>
                  <span className="text-[11px]">{isWatched ? "Watched" : "Mark as done"}</span>
                </button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onWatchVideo(vid)}
                  className="h-7 text-xs px-2.5 border-[#27272A]"
                >
                  <Icon icon={PlayIcon} size={11} className="mr-1 text-[var(--accent)]" />
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
