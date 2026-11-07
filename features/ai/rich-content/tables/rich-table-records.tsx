"use client";

import * as React from "react";
import { CodeCircleIcon, Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { TableHeader, TableRow } from "./rich-table-utils";
import { getComplexityTier } from "./rich-table-utils";

export interface RichTableRecordsProps {
  headers: TableHeader[];
  rows: TableRow[];
  searchQuery?: string;
}

export function RichTableRecords({ headers, rows, searchQuery = "" }: RichTableRecordsProps) {
  const [copiedRowId, setCopiedRowId] = React.useState<string | null>(null);

  // Filter rows by search query
  const filteredRows = React.useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter((row) =>
      row.textCells.some((cell) => cell.toLowerCase().includes(q))
    );
  }, [rows, searchQuery]);

  const handleCopyRow = async (row: TableRow) => {
    const text = headers
      .map((h, i) => `${h.label}: ${row.textCells[i] ?? ""}`)
      .join("\n");
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      setCopiedRowId(row.id);
      setTimeout(() => setCopiedRowId(null), 1800);
    }
  };

  if (filteredRows.length === 0) {
    return (
      <div className="p-6 text-center font-mono text-xs text-neutral-500">
        No matching records found for &ldquo;{searchQuery}&rdquo;.
      </div>
    );
  }

  // Primary column is the first column (e.g. Algorithm / Name / Feature)
  const primaryHeader = headers[0];
  const attributeHeaders = headers.slice(1);

  return (
    <div className="divide-y divide-white/[0.06] bg-black">
      {filteredRows.map((row) => {
        const primaryVal = row.cells[0];
        const primaryText = row.textCells[0] || "Record";
        const isCopied = copiedRowId === row.id;

        return (
          <article
            key={row.id}
            className="p-3 sm:p-3.5 space-y-2.5 transition-colors hover:bg-white/[0.02] group relative"
          >
            {/* Record Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#FF0000]/10 border border-[#FF0000]/25 text-[#FF0000]">
                  <Icon icon={CodeCircleIcon} size={11} />
                </div>
                <h4 className="font-mono text-xs sm:text-sm font-bold text-white tracking-tight break-words">
                  {primaryVal}
                </h4>
              </div>

              {/* Quick Copy Row Button */}
              <button
                type="button"
                onClick={() => handleCopyRow(row)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-neutral-500 hover:text-white rounded hover:bg-white/[0.08]"
                title="Copy record text"
                aria-label={`Copy record ${primaryText}`}
              >
                <Icon icon={isCopied ? Tick02Icon : Copy01Icon} size={12} className={isCopied ? "text-[#10B981]" : ""} />
              </button>
            </div>

            {/* Key-Value Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs pt-1">
              {attributeHeaders.map((header, attrIdx) => {
                const cellVal = row.cells[attrIdx + 1];
                const cellText = row.textCells[attrIdx + 1] ?? "";
                const tier = getComplexityTier(cellText);

                return (
                  <div
                    key={header.id}
                    className="flex flex-col gap-0.5 p-2 rounded-md bg-[#080808] border border-white/[0.04]"
                  >
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">
                      {header.label}
                    </span>
                    <div className="text-neutral-200 text-xs break-words">
                      {tier ? (
                        <span
                          className={cn(
                            "inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold border",
                            tier === "constant" && "bg-[#10B981]/10 text-[#6EE7B7] border-[#10B981]/30",
                            tier === "log" && "bg-[#3B82F6]/10 text-[#93C5FD] border-[#3B82F6]/30",
                            tier === "linear" && "bg-[#F59E0B]/10 text-[#FCD34D] border-[#F59E0B]/30",
                            tier === "linearithmic" && "bg-[#F59E0B]/15 text-[#FCD34D] border-[#F59E0B]/35",
                            (tier === "quadratic" || tier === "exponential") && "bg-[#EF4444]/15 text-[#FCA5A5] border-[#EF4444]/35"
                          )}
                        >
                          {cellVal}
                        </span>
                      ) : (
                        cellVal
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        );
      })}
    </div>
  );
}

