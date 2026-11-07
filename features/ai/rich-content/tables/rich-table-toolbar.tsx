"use client";

import * as React from "react";
import {
  Copy01Icon,
  Tick02Icon,
  Download01Icon,
  Maximize01Icon,
  Search01Icon,
  Layout01Icon,
  GridTableIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface RichTableToolbarProps {
  viewMode: "records" | "table";
  onViewModeChange: (mode: "records" | "table") => void;
  rowCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCopy: () => void;
  copied: boolean;
  onExportCSV: () => void;
  onExpand: () => void;
  showSearchToggle?: boolean;
}

export function RichTableToolbar({
  viewMode,
  onViewModeChange,
  rowCount,
  searchQuery,
  onSearchChange,
  onCopy,
  copied,
  onExportCSV,
  onExpand,
  showSearchToggle = true,
}: RichTableToolbarProps) {
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-white/[0.08] bg-[#0A0A0A] font-mono text-xs">
      {/* Left: View Mode Pills + Row Count */}
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg border border-white/[0.08] bg-black/60">
          <button
            type="button"
            onClick={() => onViewModeChange("records")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all select-none",
              viewMode === "records"
                ? "bg-white/[0.12] text-white shadow-xs font-bold"
                : "text-neutral-400 hover:text-white"
            )}
            title="Display as readable stacked records (Mobile & Side-Chat optimized)"
            aria-pressed={viewMode === "records"}
          >
            <Icon icon={Layout01Icon} size={12} className={viewMode === "records" ? "text-[#FF0000]" : undefined} />
            <span>Records</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all select-none",
              viewMode === "table"
                ? "bg-white/[0.12] text-white shadow-xs font-bold"
                : "text-neutral-400 hover:text-white"
            )}
            title="Display as structured table"
            aria-pressed={viewMode === "table"}
          >
            <Icon icon={GridTableIcon} size={12} className={viewMode === "table" ? "text-[#FF0000]" : undefined} />
            <span>Table</span>
          </button>
        </div>

        <span className="text-[11px] text-neutral-500 hidden sm:inline">
          {rowCount} {rowCount === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* Right: Search + Action Buttons */}
      <div className="flex items-center gap-1.5 ml-auto">
        {showSearchToggle && (
          <div className="relative flex items-center">
            {searchOpen ? (
              <div className="flex items-center gap-1 bg-black border border-white/[0.15] rounded-md px-2 py-0.5 text-xs text-white">
                <Icon icon={Search01Icon} size={12} className="text-neutral-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Filter rows…"
                  className="bg-transparent border-0 outline-none text-xs text-white placeholder-neutral-500 w-24 sm:w-32 py-0.5"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange("");
                    setSearchOpen(false);
                  }}
                  className="text-neutral-400 hover:text-white p-0.5"
                  aria-label="Close search"
                >
                  <Icon icon={Cancel01Icon} size={11} />
                </button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchOpen(true)}
                className="h-7 px-2 text-neutral-400 hover:text-white hover:bg-white/[0.06] text-xs gap-1"
                title="Search table records"
                aria-label="Search table records"
              >
                <Icon icon={Search01Icon} size={13} />
                <span className="hidden sm:inline text-[11px]">Search</span>
              </Button>
            )}
          </div>
        )}

        {/* Copy Table Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          className="h-7 px-2 text-neutral-400 hover:text-white hover:bg-white/[0.06] text-xs gap-1"
          title="Copy table as Markdown"
          aria-label="Copy table data"
        >
          <Icon
            icon={copied ? Tick02Icon : Copy01Icon}
            size={13}
            className={copied ? "text-[#10B981]" : ""}
          />
          <span className="hidden sm:inline text-[11px]">{copied ? "Copied" : "Copy"}</span>
        </Button>

        {/* Export CSV Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onExportCSV}
          className="h-7 px-2 text-neutral-400 hover:text-white hover:bg-white/[0.06] text-xs gap-1"
          title="Export table as CSV"
          aria-label="Export table as CSV"
        >
          <Icon icon={Download01Icon} size={13} />
          <span className="hidden sm:inline text-[11px]">CSV</span>
        </Button>

        {/* Expand Modal Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onExpand}
          className="h-7 w-7 p-0 text-neutral-400 hover:text-white hover:bg-white/[0.06]"
          title="Expand table to full-screen modal"
          aria-label="Expand table to modal"
        >
          <Icon icon={Maximize01Icon} size={13} />
        </Button>
      </div>
    </div>
  );
}

