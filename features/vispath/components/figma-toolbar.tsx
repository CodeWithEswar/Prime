"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  Search01Icon,
  Cancel01Icon,
  PlayIcon,
  PauseIcon,
  Add01Icon,
  Remove01Icon,
  CenterFocusIcon,
  Layers01Icon,
  CursorPointer01Icon,
  Drag01Icon,
} from "@hugeicons/core-free-icons";
import type { VisPathNode, VisPathTrackId } from "../types";

interface FigmaToolbarProps {
  nodes: VisPathNode[];
  selectedTrack: VisPathTrackId;
  onSelectTrack: (track: VisPathTrackId) => void;
  onFocusNode: (node: VisPathNode) => void;
  isFlowing: boolean;
  onToggleFlow: () => void;
  showMinimap: boolean;
  onToggleMinimap: () => void;
  panMode: boolean;
  onTogglePanMode: () => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onResetView: () => void;
}

export function FigmaToolbar({
  nodes,
  selectedTrack,
  onSelectTrack,
  onFocusNode,
  isFlowing,
  onToggleFlow,
  showMinimap,
  onToggleMinimap,
  panMode,
  onTogglePanMode,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onFitView,
  onResetView,
}: FigmaToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const tracks: { id: VisPathTrackId; label: string; count: number; color: string }[] = [
    { id: "all", label: "Unified Hive", count: 16, color: "#FFFFFF" },
    { id: "data-engineering", label: "Data Engineering", count: 8, color: "#EF4444" },
    { id: "cs-fundamentals", label: "CS Fundamentals", count: 4, color: "#3B82F6" },
    { id: "dsa", label: "DSA & Patterns", count: 4, color: "#10B981" },
  ];

  const filteredNodes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return nodes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.subtitle.toLowerCase().includes(q) ||
        n.subtopics.some((s) => s.toLowerCase().includes(q)) ||
        n.tools.some((t) => t.toLowerCase().includes(q))
    );
  }, [nodes, searchQuery]);

  return (
    <div className="absolute top-4 left-4 right-4 z-30 pointer-events-none flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* 1. Left Dock: Figma Track Filter Chips */}
      <div className="pointer-events-auto flex items-center gap-1 p-1 bg-[#0A0A0E]/90 backdrop-blur-xl border border-[#27272A] rounded-xl shadow-2xl overflow-x-auto prime-scrollbar-thin">
        {tracks.map((t) => {
          const isActive = selectedTrack === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTrack(t.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0",
                isActive
                  ? "bg-[#1C1C24] text-white shadow-sm border border-[#32323E]"
                  : "text-[#A1A1AA] hover:text-white hover:bg-[#121216]"
              )}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: t.color }}
              />
              <span>{t.label}</span>
              <span
                className={cn(
                  "font-mono text-[10px] px-1.5 py-0.2 rounded-full",
                  isActive
                    ? "bg-[#252532] text-white font-semibold"
                    : "bg-[#18181F] text-[#71717A]"
                )}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Center/Right Dock: Search + Mode + Controls */}
      <div className="pointer-events-auto flex items-center gap-2 self-end md:self-auto">
        {/* Search Input Bar */}
        <div className="relative">
          <div className="relative flex items-center">
            <Icon
              icon={Search01Icon}
              size={14}
              className="absolute left-3 text-[#71717A] pointer-events-none"
            />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Jump to topic, tool or frame..."
              className="h-9 w-44 md:w-60 pl-8 pr-7 bg-[#0A0A0E]/90 backdrop-blur-xl border-[#27272A] text-xs text-white placeholder:text-[#71717A] focus-visible:border-[#0D99FF] focus-visible:ring-1 focus-visible:ring-[#0D99FF]/30 rounded-xl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                className="absolute right-2 text-[#71717A] hover:text-white p-0.5 rounded transition-colors"
              >
                <Icon icon={Cancel01Icon} size={12} />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && filteredNodes.length > 0 && (
            <div className="absolute right-0 top-11 w-72 md:w-80 max-h-64 overflow-y-auto rounded-xl border border-[#27272A] bg-[#0E0E14]/95 backdrop-blur-xl p-1.5 shadow-2xl z-50 prime-scrollbar-thin">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
                Found {filteredNodes.length} matching nodes
              </div>
              {filteredNodes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    onFocusNode(n);
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-[#1A1A22] transition-colors flex items-start gap-2.5 group"
                >
                  <span
                    className="size-2 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: n.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-white group-hover:text-[#0D99FF] truncate">
                        {n.title}
                      </span>
                      <span className="text-[10px] font-mono text-[#71717A] uppercase shrink-0">
                        {n.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA] line-clamp-1">{n.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Figma Canvas Tool Dock */}
        <div className="flex items-center gap-1 p-1 bg-[#0A0A0E]/90 backdrop-blur-xl border border-[#27272A] rounded-xl shadow-2xl">
          {/* Select Mode (V) */}
          <button
            type="button"
            title="Select Mode"
            onClick={panMode ? onTogglePanMode : undefined}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              !panMode
                ? "bg-[#1C1C24] text-[#0D99FF] shadow-sm border border-[#32323E]"
                : "text-[#A1A1AA] hover:text-white hover:bg-[#121216]"
            )}
          >
            <Icon icon={CursorPointer01Icon} size={15} />
          </button>

          {/* Pan / Hand Mode (H) */}
          <button
            type="button"
            title="Pan Mode"
            onClick={!panMode ? onTogglePanMode : undefined}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              panMode
                ? "bg-[#1C1C24] text-[#0D99FF] shadow-sm border border-[#32323E]"
                : "text-[#A1A1AA] hover:text-white hover:bg-[#121216]"
            )}
          >
            <Icon icon={Drag01Icon} size={15} />
          </button>

          <div className="h-4 w-px bg-[#222228] mx-0.5" />

          {/* Flowing Edge Particles Toggle */}
          <button
            type="button"
            title={isFlowing ? "Pause Animated Edges" : "Play Animated Edges"}
            onClick={onToggleFlow}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              isFlowing
                ? "text-red-400 bg-red-950/40 hover:bg-red-950/60"
                : "text-[#71717A] hover:text-white hover:bg-[#16161C]"
            )}
          >
            <Icon icon={isFlowing ? PauseIcon : PlayIcon} size={15} />
          </button>

          {/* Minimap Toggle */}
          <button
            type="button"
            title={showMinimap ? "Hide Minimap" : "Show Minimap"}
            onClick={onToggleMinimap}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              showMinimap
                ? "text-white bg-[#1C1C24]"
                : "text-[#71717A] hover:text-white hover:bg-[#16161C]"
            )}
          >
            <Icon icon={Layers01Icon} size={15} />
          </button>

          <div className="h-4 w-px bg-[#222228] mx-0.5" />

          {/* Zoom Out */}
          <button
            type="button"
            title="Zoom Out"
            onClick={onZoomOut}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#16161C] transition-colors"
          >
            <Icon icon={Remove01Icon} size={14} />
          </button>

          {/* Zoom % label */}
          <button
            type="button"
            title="Fit View"
            onClick={onFitView}
            className="px-2 py-1 font-mono text-[11px] text-[#D4D4D8] hover:text-white rounded hover:bg-[#16161C] transition-colors"
          >
            {Math.round(zoomLevel * 100)}%
          </button>

          {/* Zoom In */}
          <button
            type="button"
            title="Zoom In"
            onClick={onZoomIn}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#16161C] transition-colors"
          >
            <Icon icon={Add01Icon} size={14} />
          </button>

          {/* Reset / Fit View */}
          <button
            type="button"
            title="Re-Center Architecture Blueprint"
            onClick={onResetView}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#16161C] transition-colors"
          >
            <Icon icon={CenterFocusIcon} size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
