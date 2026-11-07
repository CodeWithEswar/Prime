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
} from "@hugeicons/core-free-icons";
import type { TableHeader, TableRow } from "./rich-table-utils";
import { copyTableToClipboard, exportTableToCSV } from "./rich-table-utils";
import { RichTableDesktop } from "./rich-table-desktop";

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
  const [searchQuery, setSearchQuery] = React.useState("");
  const [copied, setCopied] = React.useState(false);

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
      <DialogContent className="max-w-5xl w-[95vw] max-h-[85vh] p-0 bg-[#080808] border border-white/10 text-white flex flex-col overflow-hidden shadow-2xl">
        <DialogHeader className="p-4 border-b border-white/[0.08] bg-[#0A0A0A] flex flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <Icon icon={GridTableIcon} size={15} className="text-[#FF0000]" />
              <DialogTitle className="font-mono text-sm sm:text-base font-bold text-white tracking-tight truncate">
                {title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-neutral-400 font-sans">
              Interactive examination with sorting, real-time filtering, and data export.
            </DialogDescription>
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 pr-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2.5 text-xs font-mono border-white/10 bg-white/[0.04] text-neutral-200 hover:text-white hover:bg-white/[0.08] gap-1.5"
            >
              <Icon icon={copied ? Tick02Icon : Copy01Icon} size={13} className={copied ? "text-[#10B981]" : ""} />
              <span>{copied ? "Copied" : "Copy"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-8 px-2.5 text-xs font-mono border-white/10 bg-white/[0.04] text-neutral-200 hover:text-white hover:bg-white/[0.08] gap-1.5"
            >
              <Icon icon={Download01Icon} size={13} />
              <span>CSV</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Search Bar Strip */}
        <div className="px-4 py-2 border-b border-white/[0.06] bg-black flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 flex-1 max-w-sm bg-[#0F0F0F] border border-white/[0.1] rounded-md px-2.5 py-1">
            <Icon icon={Search01Icon} size={13} className="text-neutral-500 shrink-0" />
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
                className="text-neutral-500 hover:text-white"
                aria-label="Clear search"
              >
                <Icon icon={Cancel01Icon} size={12} />
              </button>
            )}
          </div>

          <span className="text-[11px] text-neutral-500">
            {rows.length} total {rows.length === 1 ? "row" : "rows"}
          </span>
        </div>

        {/* Full Interactive Table Content Area */}
        <div className="flex-1 overflow-auto p-4">
          <div className="rounded-lg border border-white/[0.08] overflow-hidden">
            <RichTableDesktop
              headers={headers}
              rows={rows}
              searchQuery={searchQuery}
              tableAriaLabel="Expanded comparison table"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

