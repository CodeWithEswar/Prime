"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import {
  NeuralNetworkIcon,
  Search01Icon,
  Cancel01Icon,
  PlayIcon,
  PauseIcon,
  Add01Icon,
  Remove01Icon,
  CenterFocusIcon,
} from "@hugeicons/core-free-icons";
import type { VisPathNode, VisPathTrackId, CameraState } from "../types";

interface VisPathHudProps {
  nodes: VisPathNode[];
  selectedTrack: VisPathTrackId;
  onSelectTrack: (track: VisPathTrackId) => void;
  onSelectNode: (node: VisPathNode) => void;
  camera: CameraState;
  onCameraChange: (camera: CameraState) => void;
  isFlowing: boolean;
  onToggleFlow: () => void;
  onResetView: () => void;
}

export function VisPathHud({
  nodes,
  selectedTrack,
  onSelectTrack,
  onSelectNode,
  camera,
  onCameraChange,
  isFlowing,
  onToggleFlow,
  onResetView,
}: VisPathHudProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return nodes
      .filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.subtitle.toLowerCase().includes(q) ||
          n.tools.some((t) => t.toLowerCase().includes(q)) ||
          n.subtopics.some((s) => s.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [nodes, searchQuery]);

  const handleZoom = (delta: number) => {
    const nextZoom = Math.min(2.5, Math.max(0.4, camera.zoom * delta));
    onCameraChange({
      ...camera,
      zoom: nextZoom,
    });
  };

  const TRACKS: { id: VisPathTrackId; label: string; color: string }[] = [
    { id: "all", label: "Unified Hive (18)", color: "#FFFFFF" },
    { id: "data-engineering", label: "Data Engineering (8)", color: "#EF4444" },
    { id: "cs-fundamentals", label: "CS Fundamentals (4)", color: "#06B6D4" },
    { id: "dsa", label: "DSA & Algorithms (4)", color: "#10B981" },
  ];

  return (
    <>
      {/* Top Floating Header & Filter Dock */}
      <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Brand badge & Track selector */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-2xl border border-[#222228] bg-[#0A0A0C]/90 p-1.5 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-2 px-3 py-1 mr-1 border-r border-[#1E1E24]">
            <span className="flex size-6 items-center justify-center rounded-lg bg-[var(--accent-muted)] border border-[var(--accent-border)] text-[var(--accent)]">
              <Icon icon={NeuralNetworkIcon} size={14} />
            </span>
            <span className="font-bold text-xs sm:text-sm tracking-tight text-white">
              VisPath
            </span>
            <Badge
              variant="outline"
              className="hidden sm:inline-flex border-white/20 bg-white/5 font-mono text-[9px] text-[#A1A1AA] px-1.5 py-0"
            >
              CANVAS HIVE
            </Badge>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none max-w-[calc(100vw-8rem)]">
            {TRACKS.map((track) => (
              <button
                key={track.id}
                type="button"
                onClick={() => onSelectTrack(track.id)}
                className={cn(
                  "rounded-xl px-2.5 sm:px-3 py-1 text-xs font-medium whitespace-nowrap transition-all border",
                  selectedTrack === track.id
                    ? "bg-white text-black border-white font-semibold shadow-sm"
                    : "bg-[#101014] text-[#A1A1AA] border-transparent hover:border-[#2A2A32] hover:text-white"
                )}
              >
                {track.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Search bar */}
        <div className="pointer-events-auto relative w-full md:w-72">
          <div className="relative">
            <Icon
              icon={Search01Icon}
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]"
            />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search hive nodes (Spark, ACID, DP)..."
              className="h-10 pl-9 pr-8 bg-[#0A0A0C]/90 border-[#24242C] text-xs text-white placeholder:text-[#52525B] backdrop-blur-xl rounded-2xl shadow-xl focus:border-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white"
              >
                <Icon icon={Cancel01Icon} size={14} />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && filteredSearchResults.length > 0 && (
            <div className="absolute top-12 left-0 right-0 rounded-xl border border-[#272730] bg-[#0A0A0E] p-1.5 shadow-2xl backdrop-blur-2xl space-y-1">
              {filteredSearchResults.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    onSelectNode(n);
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-[#15151C] transition-colors flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {n.title}
                    </p>
                    <p className="text-[10px] text-[#71717A] truncate">
                      {n.subtitle}
                    </p>
                  </div>
                  <span
                    className="font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold shrink-0"
                    style={{
                      color: n.color,
                      backgroundColor: `${n.color}20`,
                    }}
                  >
                    Stage {n.stage}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Left Controls Dock */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex flex-wrap items-center gap-2">
        <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-[#222228] bg-[#0A0A0C]/90 p-1.5 backdrop-blur-xl shadow-xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleZoom(1.2)}
            className="size-8 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#181820]"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <Icon icon={Add01Icon} size={15} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleZoom(0.8)}
            className="size-8 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#181820]"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <Icon icon={Remove01Icon} size={15} />
          </Button>

          <div className="h-4 w-[1px] bg-[#222228] mx-0.5" />

          <Button
            variant="ghost"
            size="icon"
            onClick={onResetView}
            className="size-8 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#181820]"
            title="Reset View"
            aria-label="Reset view"
          >
            <Icon icon={CenterFocusIcon} size={15} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFlow}
            className={cn(
              "size-8 rounded-lg transition-colors",
              isFlowing
                ? "text-[var(--accent)] hover:text-[var(--accent-hover)]"
                : "text-[#52525B] hover:text-white"
            )}
            title={isFlowing ? "Pause Energy Flow" : "Start Energy Flow"}
            aria-label="Toggle energy flow"
          >
            <Icon icon={isFlowing ? PauseIcon : PlayIcon} size={14} />
          </Button>
        </div>

        {/* Legend info pill */}
        <div className="hidden lg:flex items-center gap-3 rounded-2xl border border-[#222228] bg-[#0A0A0C]/90 px-3.5 py-2 backdrop-blur-xl text-[11px] text-[#A1A1AA] shadow-xl">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#EF4444]" />
            Data Engineering
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#06B6D4]" />
            CS Systems
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#10B981]" />
            DSA Foundations
          </span>
        </div>
      </div>
    </>
  );
}
