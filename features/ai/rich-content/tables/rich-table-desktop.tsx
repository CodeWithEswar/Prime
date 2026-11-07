"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TableHeader, TableRow } from "./rich-table-utils";
import { getComplexityTier } from "./rich-table-utils";

export interface RichTableDesktopProps {
  headers: TableHeader[];
  rows: TableRow[];
  searchQuery?: string;
  tableAriaLabel?: string;
}

type SortState = {
  colIdx: number;
  dir: "asc" | "desc";
} | null;

export function RichTableDesktop({
  headers,
  rows,
  searchQuery = "",
  tableAriaLabel = "Comparison table",
}: RichTableDesktopProps) {
  const [sortState, setSortState] = React.useState<SortState>(null);

  const handleSort = (colIdx: number) => {
    setSortState((prev) => {
      if (!prev || prev.colIdx !== colIdx) {
        return { colIdx, dir: "asc" };
      }
      if (prev.dir === "asc") {
        return { colIdx, dir: "desc" };
      }
      return null;
    });
  };

  // Filter and sort rows
  const processedRows = React.useMemo(() => {
    let result = [...rows];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((row) =>
        row.textCells.some((cell) => cell.toLowerCase().includes(q))
      );
    }

    // Sort if active
    if (sortState !== null) {
      const { colIdx, dir } = sortState;
      result.sort((a, b) => {
        const valA = a.textCells[colIdx] ?? "";
        const valB = b.textCells[colIdx] ?? "";
        const comp = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: "base" });
        return dir === "asc" ? comp : -comp;
      });
    }

    return result;
  }, [rows, searchQuery, sortState]);

  if (processedRows.length === 0) {
    return (
      <div className="p-8 text-center font-mono text-xs text-neutral-500">
        No matching rows found for &ldquo;{searchQuery}&rdquo;.
      </div>
    );
  }

  return (
    <div
      className="prime-table-viewport overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      tabIndex={0}
      role="region"
      aria-label="Scrollable comparison table"
    >
      <table aria-label={tableAriaLabel} className="w-full text-left font-mono text-xs border-collapse">
        <thead>
          <tr className="border-b border-white/[0.12] bg-[#0A0A0A]">
            {headers.map((header, idx) => {
              const isSorted = sortState?.colIdx === idx;
              const dir = sortState?.dir;

              return (
                <th
                  key={header.id}
                  scope="col"
                  onClick={() => handleSort(idx)}
                  className={cn(
                    "px-3.5 py-2.5 font-mono text-[10px] uppercase tracking-wider text-neutral-400 select-none cursor-pointer transition-colors hover:text-white hover:bg-white/[0.04]",
                    header.align === "center" && "text-center",
                    header.align === "right" && "text-right"
                  )}
                  style={{ textAlign: header.align }}
                  title="Click to sort column"
                >
                  <div
                    className={cn(
                      "inline-flex items-center gap-1.5",
                      header.align === "center" && "justify-center",
                      header.align === "right" && "justify-end"
                    )}
                  >
                    <span>{header.label}</span>
                    <span className="text-[9px] text-[#FF0000]">
                      {isSorted ? (dir === "asc" ? "▲" : "▼") : ""}
                    </span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04] bg-black">
          {processedRows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-white/[0.03] group">
              {row.cells.map((cell, colIdx) => {
                const text = row.textCells[colIdx] ?? "";
                const tier = getComplexityTier(text);
                const align = headers[colIdx]?.align;

                return (
                  <td
                    key={colIdx}
                    className={cn(
                      "px-3.5 py-2.5 text-neutral-200 text-xs align-top font-sans",
                      align === "center" && "text-center",
                      align === "right" && "text-right font-mono"
                    )}
                    style={{ textAlign: align }}
                  >
                    {tier ? (
                      <span
                        className={cn(
                          "inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold border",
                          tier === "constant" && "bg-[#10B981]/10 text-[#6EE7B7] border-[#10B981]/30",
                          tier === "log" && "bg-[#3B82F6]/10 text-[#93C5FD] border-[#3B82F6]/30",
                          tier === "linear" && "bg-[#F59E0B]/10 text-[#FCD34D] border-[#F59E0B]/30",
                          tier === "linearithmic" && "bg-[#F59E0B]/15 text-[#FCD34D] border-[#F59E0B]/35",
                          (tier === "quadratic" || tier === "exponential") && "bg-[#EF4444]/15 text-[#FCA5A5] border-[#EF4444]/35"
                        )}
                      >
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

