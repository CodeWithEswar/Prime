"use client";

import * as React from "react";
import { useRichContent, useIsMobile } from "../rich-content-provider";
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
  caption?: string;
}

export function RichTable({ children, className, defaultMode, caption }: RichTableProps) {
  const { isNarrow, mode, isMobile: ctxIsMobile } = useRichContent();
  const hookIsMobile = useIsMobile();
  const isMobile = ctxIsMobile || hookIsMobile;
  const isMobileUI = isMobile || mode === "panel" || isNarrow;

  const parsed = React.useMemo(() => parseTableChildren(children), [children]);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerNarrow, setContainerNarrow] = React.useState(false);
  const userExplicitToggleRef = React.useRef<"records" | "table" | null>(defaultMode ?? null);

  // Determine initial view mode: auto-switch to records on mobile UI or narrow container
  const [viewMode, setViewMode] = React.useState<"records" | "table">(() => {
    if (defaultMode) return defaultMode;
    // In mobile UI or narrow/side panel, auto-switch to records for compact readable cards
    if (isMobileUI) return "records";
    return "table";
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [expandOpen, setExpandOpen] = React.useState(false);

  // ResizeObserver to detect narrow container dimensions dynamically
  React.useEffect(() => {
    if (typeof ResizeObserver === "undefined" || !containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          const narrow = width < 580;
          setContainerNarrow((prev) => {
            if (prev !== narrow) {
              if (narrow && userExplicitToggleRef.current === null) {
                setViewMode("records");
              }
              return narrow;
            }
            return prev;
          });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Track transition into mobile UI to auto-switch to records
  const prevMobileRef = React.useRef(isMobileUI);
  React.useEffect(() => {
    if (isMobileUI && !prevMobileRef.current) {
      // Whenever resizing or transitioning into mobile UI, auto-switch to records
      userExplicitToggleRef.current = null;
      setViewMode("records");
    } else if (isMobileUI && viewMode !== "records" && userExplicitToggleRef.current === null) {
      setViewMode("records");
    }
    prevMobileRef.current = isMobileUI;
  }, [isMobileUI, viewMode]);

  // Sync mode if panel or narrow container switches
  React.useEffect(() => {
    if ((mode === "panel" || containerNarrow) && viewMode !== "records" && userExplicitToggleRef.current === null) {
      setViewMode("records");
    }
  }, [mode, containerNarrow, viewMode]);

  const handleViewModeChange = (newMode: "records" | "table") => {
    userExplicitToggleRef.current = newMode;
    setViewMode(newMode);
  };

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
      ref={containerRef}
      className={cn(
        "prime-data-strip @container my-4 rounded-xl border border-white/[0.08] overflow-hidden bg-black shadow-md",
        className
      )}
    >
      {/* Table Toolbar */}
      <RichTableToolbar
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
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
        title={caption || (parsed.headers[0]?.label ? `${parsed.headers[0].label} Table Analysis` : "Data Table Analysis")}
      />
    </div>
  );
}
