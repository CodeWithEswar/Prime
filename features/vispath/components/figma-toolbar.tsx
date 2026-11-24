"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
  RotateRight01Icon,
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  const tracks: { id: VisPathTrackId; label: string; count: number; color: string }[] = [
    { id: "all", label: "Unified Hive", count: 16, color: "#FFFFFF" },
    { id: "data-engineering", label: "Data Engineering", count: 8, color: "#EF4444" },
    { id: "cs-fundamentals", label: "CS Fundamentals", count: 4, color: "#3B82F6" },
    { id: "dsa", label: "DSA & Python", count: 4, color: "#10B981" },
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

  // Global hotkeys for professional Figma feel: V for select, H for pan, / for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === "Escape") {
          setIsSearchOpen(false);
          searchInputRef.current?.blur();
        }
        return;
      }

      if (e.key === "v" || e.key === "V") {
        if (panMode) onTogglePanMode();
      } else if (e.key === "h" || e.key === "H") {
        if (!panMode) onTogglePanMode();
      } else if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === "0") {
        onResetView();
      } else if (e.key === "1" && e.shiftKey) {
        onFitView();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [panMode, onTogglePanMode, onResetView, onFitView]);

  return (
    <>
      {/* 1. Top Bar: Context Track Rail (Left) & Command Search (Right) */}
      <div className="absolute top-4 left-4 right-4 z-30 pointer-events-none flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Top-Left Track Filter Rail */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 bg-[#09090D]/90 backdrop-blur-2xl border border-white/[0.08] rounded-xl shadow-2xl overflow-x-auto prime-scrollbar-thin">
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
                    ? "bg-[#1C1C24] text-white shadow-sm border border-white/10"
                    : "text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]"
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

        {/* Top-Right Search Command Rail */}
        <div className="pointer-events-auto relative self-end md:self-auto">
          <div className="relative flex items-center">
            <Icon
              icon={Search01Icon}
              size={14}
              className="absolute left-3 text-[#71717A] pointer-events-none"
            />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search architecture... (/)"
              className="h-9 w-48 md:w-64 pl-8 pr-8 bg-[#09090D]/90 backdrop-blur-2xl border-white/[0.08] text-xs text-white placeholder:text-[#71717A] focus-visible:border-[#0D99FF] focus-visible:ring-1 focus-visible:ring-[#0D99FF]/30 rounded-xl"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 text-[#71717A] hover:text-white p-0.5 rounded transition-colors"
              >
                <Icon icon={Cancel01Icon} size={12} />
              </button>
            ) : (
              <span className="absolute right-2.5 font-mono text-[10px] text-[#52525B] bg-[#14141A] px-1 py-0.5 rounded border border-[#27272A] pointer-events-none">
                /
              </span>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && filteredNodes.length > 0 && (
            <div className="absolute right-0 top-11 w-72 md:w-84 max-h-72 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0E0E14]/95 backdrop-blur-2xl p-1.5 shadow-2xl z-50 prime-scrollbar-thin">
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
      </div>

      {/* 2. Primary Figma Center Floating Tool Dock */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-1.5 p-1.5 bg-[#09090D]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.8)]">
        {/* Pointer / Select Mode (V) */}
        <button
          type="button"
          title="Select Mode (V)"
          onClick={panMode ? onTogglePanMode : undefined}
          className={cn(
            "p-2 rounded-xl transition-all relative group",
            !panMode
              ? "bg-[#1C1C26] text-[#0D99FF] shadow-sm border border-[#0D99FF]/30"
              : "text-[#A1A1AA] hover:text-white hover:bg-white/[0.05]"
          )}
        >
          <Icon icon={CursorPointer01Icon} size={16} />
        </button>

        {/* Pan / Hand Mode (H) */}
        <button
          type="button"
          title="Hand / Pan Canvas (H)"
          onClick={!panMode ? onTogglePanMode : undefined}
          className={cn(
            "p-2 rounded-xl transition-all relative group",
            panMode
              ? "bg-[#1C1C26] text-[#0D99FF] shadow-sm border border-[#0D99FF]/30"
              : "text-[#A1A1AA] hover:text-white hover:bg-white/[0.05]"
          )}
        >
          <Icon icon={Drag01Icon} size={16} />
        </button>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* Edge Photons / Flow Toggle */}
        <button
          type="button"
          title={isFlowing ? "Pause Animated Edge Photons" : "Play Animated Edge Photons"}
          onClick={onToggleFlow}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all text-xs font-medium",
            isFlowing
              ? "text-red-400 bg-red-950/40 border border-red-800/40"
              : "text-[#71717A] hover:text-white hover:bg-white/[0.05]"
          )}
        >
          <span
            className={cn(
              "size-2 rounded-full",
              isFlowing ? "bg-red-500 animate-ping" : "bg-[#52525B]"
            )}
          />
          <Icon icon={isFlowing ? PauseIcon : PlayIcon} size={14} />
          <span className="hidden sm:inline font-mono text-[11px]">Photons</span>
        </button>

        {/* Minimap Radar Toggle */}
        <button
          type="button"
          title={showMinimap ? "Hide Minimap Radar" : "Show Minimap Radar"}
          onClick={onToggleMinimap}
          className={cn(
            "p-2 rounded-xl transition-all",
            showMinimap
              ? "text-white bg-[#1C1C26] border border-white/10"
              : "text-[#71717A] hover:text-white hover:bg-white/[0.05]"
          )}
        >
          <Icon icon={Layers01Icon} size={16} />
        </button>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* Fit View (Shift + 1) */}
        <button
          type="button"
          title="Fit All Nodes (Shift + 1)"
          onClick={onFitView}
          className="p-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.05] transition-all"
        >
          <Icon icon={CenterFocusIcon} size={16} />
        </button>

        {/* Reset View */}
        <button
          type="button"
          title="Reset View (0)"
          onClick={onResetView}
          className="p-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.05] transition-all"
        >
          <Icon icon={RotateRight01Icon} size={15} />
        </button>
      </div>

      {/* 3. Bottom-Left Camera Zoom Rail */}
      <div className="absolute bottom-5 left-5 z-30 pointer-events-auto flex items-center gap-1 p-1 bg-[#09090D]/90 backdrop-blur-2xl border border-white/[0.08] rounded-xl shadow-2xl">
        <button
          type="button"
          title="Zoom Out"
          onClick={onZoomOut}
          className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <Icon icon={Remove01Icon} size={14} />
        </button>

        <button
          type="button"
          title="Click to Fit View"
          onClick={onFitView}
          className="px-2 py-1 font-mono text-[11px] font-medium text-[#E4E4E7] hover:text-white rounded hover:bg-white/[0.05] transition-colors"
        >
          {Math.round(zoomLevel * 100)}%
        </button>

        <button
          type="button"
          title="Zoom In"
          onClick={onZoomIn}
          className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <Icon icon={Add01Icon} size={14} />
        </button>
      </div>
    </>
  );
}
