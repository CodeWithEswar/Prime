"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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
  MoreHorizontalIcon,
  ArrowDown01Icon,
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

  const tracks: { id: VisPathTrackId; label: string; shortLabel: string; count: number; color: string }[] = [
    { id: "all", label: "Unified Hive", shortLabel: "All", count: 16, color: "#FFFFFF" },
    { id: "data-engineering", label: "Data Engineering", shortLabel: "Data Eng", count: 8, color: "#EF4444" },
    { id: "cs-fundamentals", label: "CS Fundamentals", shortLabel: "CS Core", count: 4, color: "#3B82F6" },
    { id: "dsa", label: "DSA & Python", shortLabel: "DSA", count: 4, color: "#10B981" },
  ];

  const activeTrackObj = tracks.find((t) => t.id === selectedTrack) ?? tracks[0];

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
      {/* 1. Top Bar: Responsive Track Selector (Left) & Command Search (Right) */}
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-30 pointer-events-none flex items-center justify-between gap-2">
        {/* Desktop Track Rail (sm and above) */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-1 p-1 bg-black/90 md:bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-md shadow-xl overflow-x-auto prime-scrollbar-none">
          {tracks.map((t) => {
            const isActive = selectedTrack === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTrack(t.id)}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all shrink-0",
                  isActive
                    ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                )}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                <span>{t.label}</span>
                <span
                  className={cn(
                    "font-mono text-[10px] px-1.5 py-0.2 rounded-md",
                    isActive
                      ? "bg-zinc-700 text-zinc-100 font-semibold"
                      : "bg-zinc-900 text-zinc-500"
                  )}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Compact Track Selector Dropdown (below sm) */}
        <div className="pointer-events-auto sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 px-2.5 py-1.5 bg-black/90 backdrop-blur-xl border border-zinc-800 rounded-md text-xs font-medium text-zinc-200 shadow-lg hover:bg-zinc-900 transition-colors"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: activeTrackObj.color }}
                />
                <span className="max-w-[100px] truncate">{activeTrackObj.shortLabel}</span>
                <Icon icon={ArrowDown01Icon} size={12} className="text-zinc-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-52 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-md shadow-2xl p-1"
            >
              <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 py-1">
                Roadmap Tracks
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-800/80 my-1" />
              {tracks.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => onSelectTrack(t.id)}
                  className={cn(
                    "flex items-center justify-between px-2 py-1.5 rounded-md text-xs cursor-pointer",
                    selectedTrack === t.id
                      ? "bg-zinc-800 text-zinc-100 font-medium"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                    <span>{t.label}</span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded-md">
                    {t.count}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search Command Rail (Right) */}
        <div className="pointer-events-auto relative">
          <div className="relative flex items-center">
            <Icon
              icon={Search01Icon}
              size={13}
              className="absolute left-2.5 text-zinc-500 pointer-events-none"
            />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search... (/)"
              className="h-8 sm:h-9 w-36 sm:w-56 md:w-64 pl-7 sm:pl-8 pr-7 bg-black/90 md:bg-zinc-950/90 backdrop-blur-xl border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500/20 rounded-md shadow-lg"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                className="absolute right-2 text-zinc-500 hover:text-zinc-200 p-0.5 rounded transition-colors"
              >
                <Icon icon={Cancel01Icon} size={12} />
              </button>
            ) : (
              <span className="hidden sm:inline absolute right-2 font-mono text-[10px] text-zinc-500 bg-zinc-900 px-1 py-0.5 rounded-sm border border-zinc-800 pointer-events-none">
                /
              </span>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && filteredNodes.length > 0 && (
            <div className="absolute right-0 top-10 sm:top-11 w-72 sm:w-84 max-h-72 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl p-1.5 shadow-2xl z-50 prime-scrollbar-thin">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
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
                  className="w-full text-left p-2 rounded-md hover:bg-zinc-900 transition-colors flex items-start gap-2.5 group"
                >
                  <span
                    className="size-2 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: n.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                        {n.title}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase shrink-0">
                        {n.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{n.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Responsive Bottom Floating Tool Dock with Three-Dot Menu */}
      <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-black/90 md:bg-zinc-950/90 backdrop-blur-2xl border border-zinc-800 rounded-md shadow-[0_16px_40px_rgba(0,0,0,0.85)] max-w-[calc(100vw-2rem)]">
        {/* Pointer / Select Mode (V) */}
        <button
          type="button"
          title="Select Mode (V)"
          onClick={panMode ? onTogglePanMode : undefined}
          className={cn(
            "p-1.5 sm:p-2 rounded-md transition-all relative group",
            !panMode
              ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
          )}
        >
          <Icon icon={CursorPointer01Icon} size={15} />
        </button>

        {/* Pan / Hand Mode (H) */}
        <button
          type="button"
          title="Hand / Pan Canvas (H)"
          onClick={!panMode ? onTogglePanMode : undefined}
          className={cn(
            "p-1.5 sm:p-2 rounded-md transition-all relative group",
            panMode
              ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
          )}
        >
          <Icon icon={Drag01Icon} size={15} />
        </button>

        <div className="h-4 w-px bg-zinc-800 mx-0.5" />

        {/* Zoom Out Button (hidden on narrow screens, accessible via 3-dot) */}
        <button
          type="button"
          title="Zoom Out"
          onClick={onZoomOut}
          className="hidden sm:flex p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
        >
          <Icon icon={Remove01Icon} size={14} />
        </button>

        {/* Zoom % / Fit View Button */}
        <button
          type="button"
          title="Click to Fit View"
          onClick={onFitView}
          className="px-2 py-1 font-mono text-[11px] font-medium text-zinc-300 hover:text-zinc-100 rounded-md hover:bg-zinc-900 transition-colors"
        >
          {Math.round(zoomLevel * 100)}%
        </button>

        {/* Zoom In Button (hidden on narrow screens, accessible via 3-dot) */}
        <button
          type="button"
          title="Zoom In"
          onClick={onZoomIn}
          className="hidden sm:flex p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
        >
          <Icon icon={Add01Icon} size={14} />
        </button>

        <div className="hidden sm:block h-4 w-px bg-zinc-800 mx-0.5" />

        {/* Edge Photons / Flow Toggle (visible on tablet/desktop, in 3-dot on mobile) */}
        <button
          type="button"
          title={isFlowing ? "Pause Animated Edge Photons" : "Play Animated Edge Photons"}
          onClick={onToggleFlow}
          className={cn(
            "hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md transition-all text-xs font-medium",
            isFlowing
              ? "text-zinc-200 bg-zinc-800 border border-zinc-700 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              isFlowing ? "bg-zinc-300 animate-pulse" : "bg-zinc-600"
            )}
          />
          <Icon icon={isFlowing ? PauseIcon : PlayIcon} size={13} />
          <span className="hidden md:inline font-mono text-[11px]">Photons</span>
        </button>

        {/* Minimap Radar Toggle (desktop) */}
        <button
          type="button"
          title={showMinimap ? "Hide Minimap Radar" : "Show Minimap Radar"}
          onClick={onToggleMinimap}
          className={cn(
            "hidden md:flex p-1.5 sm:p-2 rounded-md transition-all",
            showMinimap
              ? "text-zinc-100 bg-zinc-800 border border-zinc-700 shadow-sm"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
          )}
        >
          <Icon icon={Layers01Icon} size={15} />
        </button>

        {/* Fit View Shortcut (desktop) */}
        <button
          type="button"
          title="Fit All Nodes (Shift + 1)"
          onClick={onFitView}
          className="hidden md:flex p-1.5 sm:p-2 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all"
        >
          <Icon icon={CenterFocusIcon} size={15} />
        </button>

        <div className="h-4 w-px bg-zinc-800 mx-0.5" />

        {/* Three-Dot Dropdown Menu (•••) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              title="More Actions & Controls"
              className="p-1.5 sm:p-2 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 data-[state=open]:bg-zinc-800 data-[state=open]:text-zinc-100 transition-colors"
            >
              <Icon icon={MoreHorizontalIcon} size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            side="top"
            sideOffset={8}
            className="w-56 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-md shadow-2xl p-1.5 space-y-0.5"
          >
            <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 py-1">
              Canvas Actions
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={onFitView}
              className="flex items-center justify-between px-2 py-1.5 text-xs rounded-md text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Icon icon={CenterFocusIcon} size={14} className="text-zinc-400" />
                <span>Fit All Nodes</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500 bg-zinc-900 px-1 rounded-sm border border-zinc-800">
                Shift+1
              </span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onResetView}
              className="flex items-center justify-between px-2 py-1.5 text-xs rounded-md text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Icon icon={RotateRight01Icon} size={14} className="text-zinc-400" />
                <span>Reset View</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500 bg-zinc-900 px-1 rounded-sm border border-zinc-800">
                0
              </span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onZoomIn}
              className="flex sm:hidden items-center justify-between px-2 py-1.5 text-xs rounded-md text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Icon icon={Add01Icon} size={14} className="text-zinc-400" />
                <span>Zoom In</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500 bg-zinc-900 px-1 rounded-sm border border-zinc-800">
                +
              </span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onZoomOut}
              className="flex sm:hidden items-center justify-between px-2 py-1.5 text-xs rounded-md text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Icon icon={Remove01Icon} size={14} className="text-zinc-400" />
                <span>Zoom Out</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500 bg-zinc-900 px-1 rounded-sm border border-zinc-800">
                -
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-zinc-800/80 my-1" />

            <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 py-1">
              Display & Effects
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={onToggleFlow}
              className="flex items-center justify-between px-2 py-1.5 text-xs rounded-md text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Icon icon={isFlowing ? PauseIcon : PlayIcon} size={14} className="text-zinc-400" />
                <span>Edge Photons</span>
              </div>
              <span
                className={cn(
                  "font-mono text-[10px] px-1.5 py-0.5 rounded-sm",
                  isFlowing
                    ? "bg-zinc-800 text-zinc-200 border border-zinc-700"
                    : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                )}
              >
                {isFlowing ? "ON" : "OFF"}
              </span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onToggleMinimap}
              className="flex items-center justify-between px-2 py-1.5 text-xs rounded-md text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Icon icon={Layers01Icon} size={14} className="text-zinc-400" />
                <span>Radar Minimap</span>
              </div>
              <span
                className={cn(
                  "font-mono text-[10px] px-1.5 py-0.5 rounded-sm",
                  showMinimap
                    ? "bg-zinc-800 text-zinc-200 border border-zinc-700"
                    : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                )}
              >
                {showMinimap ? "ON" : "OFF"}
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-zinc-800/80 my-1" />

            <div className="px-2 py-1 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
              <span>Shortcuts</span>
              <span>V: Pointer · H: Hand</span>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
