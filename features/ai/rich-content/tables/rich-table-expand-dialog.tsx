"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Copy01Icon,
  Tick02Icon,
  Download01Icon,
  Search01Icon,
  Cancel01Icon,
  GridTableIcon,
  Layout01Icon,
} from "@hugeicons/core-free-icons";
import type { TableHeader, TableRow } from "./rich-table-utils";
import { copyTableToClipboard, exportTableToCSV } from "./rich-table-utils";
import { RichTableDesktop } from "./rich-table-desktop";
import { RichTableRecords } from "./rich-table-records";
import { useIsMobile } from "../rich-content-provider";
import { cn } from "@/lib/utils";

export interface RichTableExpandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headers: TableHeader[];
  rows: TableRow[];
  title?: string;
}

export function RichTableExpandDialog({
  open,
  onOpenChange,
  headers,
  rows,
  title = "Full Data Table Inspection",
}: RichTableExpandDialogProps) {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = React.useState<"table" | "records">(() =>
    isMobile ? "records" : "table"
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (isMobile) {
      setViewMode("records");
    }
  }, [isMobile]);

  const handleCopy = async () => {
    const ok = await copyTableToClipboard(headers, rows);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportCSV = () => {
    exportTableToCSV(headers, rows, "prime-table-data.csv");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[96vw] sm:w-[92vw] max-h-[90vh] sm:max-h-[85vh] p-0 bg-[#080808] border border-white/10 text-white flex flex-col overflow-hidden shadow-2xl rounded-xl sm:rounded-2xl">
        {/* Responsive Header: flex-col on mobile, flex-row on desktop, with generous right padding to never collide with the close button */}
        <DialogHeader className="p-3.5 sm:p-4 border-b border-white/[0.08] bg-[#0A0A0A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pr-12 sm:pr-16 text-left">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#FF0000]/10 border border-[#FF0000]/25 text-[#FF0000]">
                <Icon icon={GridTableIcon} size={13} />
              </div>
              <DialogTitle className="font-mono text-xs sm:text-sm md:text-base font-bold text-white tracking-tight break-words">
                {title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-[11px] sm:text-xs text-neutral-400 font-sans leading-relaxed">
              Interactive examination with sorting, real-time filtering, and data export.
            </DialogDescription>
          </div>

          {/* Action Buttons: sits cleanly below title on mobile, on right on desktop */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-7 sm:h-8 px-2 sm:px-2.5 text-xs font-mono border-white/10 bg-white/[0.04] text-neutral-200 hover:text-white hover:bg-white/[0.08] gap-1.5"
            >
              <Icon icon={copied ? Tick02Icon : Copy01Icon} size={12} className={copied ? "text-[#10B981]" : ""} />
              <span>{copied ? "Copied" : "Copy"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-7 sm:h-8 px-2 sm:px-2.5 text-xs font-mono border-white/10 bg-white/[0.04] text-neutral-200 hover:text-white hover:bg-white/[0.08] gap-1.5"
            >
              <Icon icon={Download01Icon} size={12} />
              <span>CSV</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Search Bar & View Mode Toggle Strip */}
        <div className="px-3 sm:px-4 py-2 border-b border-white/[0.06] bg-black flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-2 flex-1 min-w-[180px] max-w-full sm:max-w-sm bg-[#0F0F0F] border border-white/[0.1] rounded-md px-2.5 py-1">
            <Icon icon={Search01Icon} size={12} className="text-neutral-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter across all columns…"
              className="bg-transparent border-0 outline-none text-xs text-white placeholder-neutral-500 w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-neutral-500 hover:text-white p-0.5"
                aria-label="Clear search"
              >
                <Icon icon={Cancel01Icon} size={11} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Switcher in Modal */}
            <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg border border-white/[0.08] bg-[#0A0A0A]">
              <button
                type="button"
                onClick={() => setViewMode("records")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all select-none",
                  viewMode === "records"
                    ? "bg-white/[0.12] text-white shadow-xs font-bold"
                    : "text-neutral-400 hover:text-white"
                )}
                aria-pressed={viewMode === "records"}
                title="View as stacked records"
              >
                <Icon icon={Layout01Icon} size={11} className={viewMode === "records" ? "text-[#FF0000]" : undefined} />
                <span>Records</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all select-none",
                  viewMode === "table"
                    ? "bg-white/[0.12] text-white shadow-xs font-bold"
                    : "text-neutral-400 hover:text-white"
                )}
                aria-pressed={viewMode === "table"}
                title="View as structured table"
              >
                <Icon icon={GridTableIcon} size={11} className={viewMode === "table" ? "text-[#FF0000]" : undefined} />
                <span>Table</span>
              </button>
            </div>

            <span className="text-[11px] text-neutral-500 hidden sm:inline">
              {rows.length} {rows.length === 1 ? "row" : "rows"}
            </span>
          </div>
        </div>

        {/* Content Area: Supports both Table and Records presentations */}
        <div className="flex-1 overflow-auto p-3 sm:p-4">
          <div className="rounded-lg border border-white/[0.08] overflow-hidden bg-black">
            {viewMode === "records" ? (
              <RichTableRecords
                headers={headers}
                rows={rows}
                searchQuery={searchQuery}
              />
            ) : (
              <RichTableDesktop
                headers={headers}
                rows={rows}
                searchQuery={searchQuery}
                tableAriaLabel="Expanded comparison table"
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
