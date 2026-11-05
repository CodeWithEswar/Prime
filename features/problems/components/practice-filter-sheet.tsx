"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { StatusIcon } from "./status-icon";
import { cn } from "@/lib/utils";
import type { PracticeCatalogFilter } from "../types";
import type { FilterOptionsData } from "../queries/get-filter-options";

interface PracticeFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterOptions: FilterOptionsData;
  filters: PracticeCatalogFilter;
  onFilterChange: (updates: Partial<PracticeCatalogFilter>) => void;
}

export function PracticeFilterSheet({
  open,
  onOpenChange,
  filterOptions,
  filters,
  onFilterChange,
}: PracticeFilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[320px] sm:w-[380px] bg-[var(--prime-canvas)] border-l border-[var(--border-subtle)] p-0 flex flex-col overflow-hidden"
      >
        <SheetHeader className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--prime-canvas)] shrink-0 pr-12 text-left">
          <SheetTitle className="text-sm font-mono uppercase tracking-wider text-white">
            Filter Practice Catalog
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-xs font-mono">
          {/* Difficulty */}
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] block mb-2">
              Difficulty
            </span>
            <div className="grid grid-cols-3 gap-2">
              {["easy", "medium", "hard"].map((diff) => {
                const isSelected = filters.difficulty === diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        difficulty: isSelected ? "" : (diff as any),
                        page: 1,
                      })
                    }
                    className={cn(
                      "py-2 rounded border text-center uppercase tracking-wider transition-colors",
                      isSelected
                        ? "bg-[var(--surface-raised)] text-white border-[var(--border-strong)] font-semibold"
                        : "bg-[var(--surface-base)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-white"
                    )}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Personal Status */}
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] block mb-2">
              Personal Status
            </span>
            <div className="flex flex-col gap-1.5">
              {[
                { id: "not_started", label: "Not Started" },
                { id: "attempted", label: "Attempted" },
                { id: "solved", label: "Solved" },
                { id: "needs_revision", label: "Needs Revision" },
                { id: "mastered", label: "Mastered" },
              ].map((st) => {
                const isSelected = filters.status === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        status: isSelected ? "" : (st.id as any),
                        page: 1,
                      })
                    }
                    className={cn(
                      "px-3 py-2 rounded border text-left transition-colors flex items-center justify-between",
                      isSelected
                        ? "bg-[var(--surface-raised)] text-white border-[var(--border-strong)] font-medium"
                        : "bg-[var(--surface-base)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <StatusIcon status={st.id} size={14} />
                      <span>{st.label}</span>
                    </div>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collections */}
          {filterOptions.collections.length > 0 && (
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] block mb-2">
                Collections
              </span>
              <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto">
                {filterOptions.collections.map((coll) => {
                  const isSelected = filters.collection === coll.slug;
                  return (
                    <button
                      key={coll.id}
                      type="button"
                      onClick={() =>
                        onFilterChange({
                          collection: isSelected ? "" : coll.slug,
                          page: 1,
                        })
                      }
                      className={cn(
                        "px-3 py-2 rounded border text-left transition-colors flex items-center justify-between",
                        isSelected
                          ? "bg-[var(--surface-raised)] text-white border-[var(--border-strong)] font-medium"
                          : "bg-[var(--surface-base)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-white"
                      )}
                    >
                      <span className="truncate">{coll.name}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Topics */}
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] block mb-2">
              Topics
            </span>
            <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto">
              {filterOptions.topics.map((t) => {
                const isSelected = filters.topic === t.slug;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        topic: isSelected ? "" : t.slug,
                        page: 1,
                      })
                    }
                    className={cn(
                      "px-3 py-1.5 rounded border text-left transition-colors flex items-center justify-between",
                      isSelected
                        ? "bg-[var(--surface-raised)] text-white border-[var(--border-strong)] font-medium"
                        : "bg-[var(--surface-base)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-white"
                    )}
                  >
                    <span className="truncate">{t.name}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pinned Sticky Footer */}
        <div className="px-6 py-3 border-t border-[var(--border-subtle)] bg-[var(--prime-canvas)] shrink-0 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onFilterChange({
                difficulty: "",
                status: "",
                collection: "",
                company: "",
                topic: "",
                revision: "",
                page: 1,
              });
              onOpenChange(false);
            }}
            className="flex-1 h-9 font-mono text-xs"
          >
            Reset
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-9 font-mono text-xs"
          >
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
