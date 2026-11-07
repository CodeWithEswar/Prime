"use client";

import * as React from "react";
import { useRichContent } from "../rich-content-provider";
import { parseTableChildren, copyTableToClipboard, exportTableToCSV } from "./rich-table-utils";
import { RichTableToolbar } from "./rich-table-toolbar";
import { RichTableRecords } from "./rich-table-records";
import { RichTableDesktop } from "./rich-table-desktop";
import { RichTableExpandDialog } from "./rich-table-expand-dialog";
import { cn } from "@/lib/utils";

export interface RichTableProps {
  children?: React.ReactNode;
  className?: string;
  defaultMode?: "records" | "table";
}

export function RichTable({ children, className, defaultMode }: RichTableProps) {
  const { isNarrow, mode } = useRichContent();
  const parsed = React.useMemo(() => parseTableChildren(children), [children]);

  // Determine initial view mode based on container or explicitly supplied prop
  const [viewMode, setViewMode] = React.useState<"records" | "table">(() => {
    if (defaultMode) return defaultMode;
    // In narrow/side panel, default to records for compact readable cards
    if (isNarrow || mode === "panel") return "records";
    return "table";
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [expandOpen, setExpandOpen] = React.useState(false);

  // Sync mode if container switches to narrow/side panel and user hasn't explicitly toggled
  React.useEffect(() => {
    if (mode === "panel" && viewMode !== "records") {
      setViewMode("records");
    }
  }, [mode]);

  const handleCopy = async () => {
    const ok = await copyTableToClipboard(parsed.headers, parsed.rows);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportCSV = () => {
    exportTableToCSV(parsed.headers, parsed.rows, "prime-table-data.csv");
  };

  // If table has no headers or rows, fall back to standard table rendering
  if (parsed.headers.length === 0 && parsed.rows.length === 0) {
    return (
      <div className="prime-data-strip my-4 rounded-lg border border-white/[0.08] overflow-hidden bg-black">
        <div
          className="prime-table-viewport overflow-auto"
          tabIndex={0}
          role="region"
          aria-label="Scrollable comparison table"
        >
          <table aria-label="Comparison table" className="w-full text-xs">
            {children}
          </table>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "prime-data-strip my-4 rounded-xl border border-white/[0.08] overflow-hidden bg-black shadow-md",
        className
      )}
    >
      {/* Table Toolbar */}
      <RichTableToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        rowCount={parsed.rows.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCopy={handleCopy}
        copied={copied}
        onExportCSV={handleExportCSV}
        onExpand={() => setExpandOpen(true)}
        showSearchToggle={parsed.rows.length >= 3}
      />

      {/* Main Presentation View */}
      {viewMode === "records" ? (
        <div
          tabIndex={0}
          role="region"
          aria-label="Scrollable comparison table"
          className="relative"
        >
          {/* Accessible Table for Assistive Tech in Records Mode */}
          <table aria-label="Comparison table" className="sr-only">
            <thead>
              <tr>
                {parsed.headers.map((h) => (
                  <th key={h.id} scope="col">
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsed.rows.map((r) => (
                <tr key={r.id}>
                  {r.cells.map((c, i) => (
                    <td key={i}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Visual Interactive Stacked Records */}
          <RichTableRecords
            headers={parsed.headers}
            rows={parsed.rows}
            searchQuery={searchQuery}
          />
        </div>
      ) : (
        <RichTableDesktop
          headers={parsed.headers}
          rows={parsed.rows}
          searchQuery={searchQuery}
          tableAriaLabel="Comparison table"
        />
      )}

      {/* Full-Screen Expansion Dialog */}
      <RichTableExpandDialog
        open={expandOpen}
        onOpenChange={setExpandOpen}
        headers={parsed.headers}
        rows={parsed.rows}
        title={parsed.headers[0]?.label ? `${parsed.headers[0].label} Table Analysis` : "Data Table"}
      />
    </div>
  );
}
