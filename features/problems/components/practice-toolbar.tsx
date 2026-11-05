"use client";

import * as React from "react";
import { Search01Icon, FilterIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PracticeCatalogFilter, PracticeSort, CompanyWindow } from "../types";
import type { FilterOptionsData } from "../queries/get-filter-options";

interface PracticeToolbarProps {
  filterOptions: FilterOptionsData;
  filters: PracticeCatalogFilter;
  onFilterChange: (updates: Partial<PracticeCatalogFilter>) => void;
  onOpenMobileFilters?: () => void;
  className?: string;
}

const difficultyDisplayMap: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const statusDisplayMap: Record<string, string> = {
  not_started: "○ Not Started",
  attempted: "◐ Attempted",
  solved: "✓ Solved",
  needs_revision: "↻ Revision",
  mastered: "◆ Mastered",
};

const sortDisplayMap: Record<string, string> = {
  recommended: "Recommended",
  difficulty_asc: "Easy First",
  difficulty_desc: "Hard First",
  title_asc: "Title (A–Z)",
  frequency_desc: "Frequency",
};

export function PracticeToolbar({
  filterOptions,
  filters,
  onFilterChange,
  onOpenMobileFilters,
  className,
}: PracticeToolbarProps) {
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [localSearch, setLocalSearch] = React.useState(filters.q || "");

  // Synchronize external search param changes
  React.useEffect(() => {
    setLocalSearch(filters.q || "");
  }, [filters.q]);

  // Debounced search propagation
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if ((filters.q || "") !== localSearch) {
        onFilterChange({ q: localSearch, page: 1 });
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [localSearch, filters.q, onFilterChange]);

  // Keyboard shortcut: '/' focuses search input
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeFiltersCount = [
    filters.difficulty,
    filters.status,
    filters.topic,
    filters.collection,
    filters.company,
    filters.revision,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0 || !!filters.q;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Search Input with Shortcut and Clear Button */}
        <div className="relative flex-1 min-w-[200px] xl:max-w-md w-full">
          <Icon
            icon={Search01Icon}
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search problems by title, slug, or topic..."
            className="w-full h-[var(--control-height)] pl-9 pr-8 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-xs text-white placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          {localSearch ? (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onFilterChange({ q: "", page: 1 });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-white"
            >
              <Icon icon={Cancel01Icon} size={13} />
            </button>
          ) : (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-tertiary)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded">
              /
            </kbd>
          )}
        </div>

        {/* Toolbar Filter Controls in a Single Responsive Row */}
        <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 shrink-0">
          {/* Difficulty Dropdown */}
          <Select
            value={filters.difficulty || "all"}
            onValueChange={(val) =>
              onFilterChange({ difficulty: val === "all" ? "" : (val as any), page: 1 })
            }
          >
            <SelectTrigger className="w-[125px] sm:w-[130px] shrink-0 text-xs font-mono bg-[var(--surface-base)] border-[var(--border-subtle)] text-white hover:border-[var(--border-default)]">
              <span className="flex items-center gap-1 truncate">
                <span className="text-[var(--text-tertiary)]">Diff:</span>
                <span className="text-white font-medium">
                  {filters.difficulty ? difficultyDisplayMap[filters.difficulty] : "All"}
                </span>
              </span>
            </SelectTrigger>
            <SelectContent className="bg-[#050505] border-[var(--border-default)] text-xs font-mono">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Dropdown */}
          <Select
            value={filters.status || "all"}
            onValueChange={(val) =>
              onFilterChange({ status: val === "all" ? "" : (val as any), page: 1 })
            }
          >
            <SelectTrigger className="w-[135px] sm:w-[140px] shrink-0 text-xs font-mono bg-[var(--surface-base)] border-[var(--border-subtle)] text-white hover:border-[var(--border-default)]">
              <span className="flex items-center gap-1 truncate">
                <span className="text-[var(--text-tertiary)]">Status:</span>
                <span className="text-white font-medium">
                  {filters.status ? statusDisplayMap[filters.status] : "All"}
                </span>
              </span>
            </SelectTrigger>
            <SelectContent className="bg-[#050505] border-[var(--border-default)] text-xs font-mono">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="not_started">○ Not Started</SelectItem>
              <SelectItem value="attempted">◐ Attempted</SelectItem>
              <SelectItem value="solved">✓ Solved</SelectItem>
              <SelectItem value="needs_revision">↻ Needs Revision</SelectItem>
              <SelectItem value="mastered">◆ Mastered</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Dropdown */}
          <Select
            value={filters.sort || "recommended"}
            onValueChange={(val) =>
              onFilterChange({ sort: val as PracticeSort, page: 1 })
            }
          >
            <SelectTrigger className="w-[145px] sm:w-[155px] shrink-0 text-xs font-mono bg-[var(--surface-base)] border-[var(--border-subtle)] text-white hover:border-[var(--border-default)]">
              <span className="flex items-center gap-1 truncate">
                <span className="text-[var(--text-tertiary)]">Sort:</span>
                <span className="text-white font-medium">
                  {sortDisplayMap[filters.sort || "recommended"] || "Recommended"}
                </span>
              </span>
            </SelectTrigger>
            <SelectContent className="bg-[#050505] border-[var(--border-default)] text-xs font-mono">
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="difficulty_asc">Difficulty: Easy First</SelectItem>
              <SelectItem value="difficulty_desc">Difficulty: Hard First</SelectItem>
              <SelectItem value="title_asc">Title (A–Z)</SelectItem>
            </SelectContent>
          </Select>

          {/* Mobile Filter Drawer Button */}
          {onOpenMobileFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenMobileFilters}
              className="lg:hidden h-[var(--control-height)] px-3 gap-1.5 text-xs font-mono shrink-0"
            >
              <Icon icon={FilterIcon} size={13} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Progressive Context Controls: Company Time Window (Appears only when company selected) */}
      {filters.company && (
        <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-base)] border border-[var(--border-subtle)] text-xs font-mono animate-in fade-in duration-200">
          <span className="text-[var(--text-tertiary)] uppercase text-[10px] tracking-wider shrink-0">
            Window:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: "", label: "All Time" },
              { id: "thirty_days", label: "30 Days" },
              { id: "three_months", label: "3 Months" },
              { id: "six_months", label: "6 Months" },
              { id: "more_than_six_months", label: "6+ Months" },
            ].map((win) => {
              const isSelected = (filters.window || "") === win.id;
              return (
                <button
                  key={win.id || "all"}
                  type="button"
                  onClick={() =>
                    onFilterChange({ window: win.id as CompanyWindow, page: 1 })
                  }
                  className={cn(
                    "px-2.5 py-1 rounded text-xs transition-colors shrink-0",
                    isSelected
                      ? "bg-[var(--surface-raised)] text-white font-medium border border-[var(--border-default)]"
                      : "text-[var(--text-secondary)] hover:text-white"
                  )}
                >
                  {win.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
          <span className="text-[var(--text-tertiary)]">Active:</span>

          {filters.q && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-raised)] text-white border border-[var(--border-subtle)]">
              <span>q: &quot;{filters.q}&quot;</span>
              <button
                type="button"
                onClick={() => {
                  setLocalSearch("");
                  onFilterChange({ q: "", page: 1 });
                }}
                className="hover:text-[var(--accent)]"
              >
                <Icon icon={Cancel01Icon} size={11} />
              </button>
            </span>
          )}

          {filters.topic && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-raised)] text-white border border-[var(--border-subtle)]">
              <span>topic: {filters.topic}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ topic: "", page: 1 })}
                className="hover:text-[var(--accent)]"
              >
                <Icon icon={Cancel01Icon} size={11} />
              </button>
            </span>
          )}

          {filters.collection && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-raised)] text-white border border-[var(--border-subtle)]">
              <span>collection: {filters.collection}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ collection: "", page: 1 })}
                className="hover:text-[var(--accent)]"
              >
                <Icon icon={Cancel01Icon} size={11} />
              </button>
            </span>
          )}

          {filters.company && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-raised)] text-white border border-[var(--border-subtle)]">
              <span>company: {filters.company}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ company: "", window: "", page: 1 })}
                className="hover:text-[var(--accent)]"
              >
                <Icon icon={Cancel01Icon} size={11} />
              </button>
            </span>
          )}

          {filters.difficulty && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-raised)] text-white border border-[var(--border-subtle)]">
              <span className="uppercase">{filters.difficulty}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ difficulty: "", page: 1 })}
                className="hover:text-[var(--accent)]"
              >
                <Icon icon={Cancel01Icon} size={11} />
              </button>
            </span>
          )}

          {filters.status && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--surface-raised)] text-white border border-[var(--border-subtle)]">
              <span>status: {filters.status}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ status: "", page: 1 })}
                className="hover:text-[var(--accent)]"
              >
                <Icon icon={Cancel01Icon} size={11} />
              </button>
            </span>
          )}

          {filters.revision && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[rgba(255,0,0,0.1)] text-[var(--accent)] border border-[var(--accent-border)]">
              <span>revision: {filters.revision}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ revision: "", page: 1 })}
                className="hover:text-white"
              >
                <Icon icon={Cancel01Icon} size={11} />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              setLocalSearch("");
              onFilterChange({
                q: "",
                topic: "",
                difficulty: "",
                status: "",
                collection: "",
                company: "",
                window: "",
                revision: "",
                page: 1,
              });
            }}
            className="text-[var(--text-tertiary)] hover:text-white underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
