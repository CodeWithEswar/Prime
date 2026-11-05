"use client";

import * as React from "react";
import {
  Search01Icon,
  FilterIcon,
  Cancel01Icon,
  Sorting01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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

const statusIconMap: Record<string, string> = {
  not_started: "○",
  attempted: "◐",
  solved: "✓",
  needs_revision: "↻",
  mastered: "◆",
};

const statusShortNameMap: Record<string, string> = {
  not_started: "Todo",
  attempted: "Attempted",
  solved: "Solved",
  needs_revision: "Revision",
  mastered: "Mastered",
};

const sortDisplayMap: Record<string, string> = {
  recommended: "Recommended",
  difficulty_asc: "Easy First",
  difficulty_desc: "Hard First",
  title_asc: "Title (A–Z)",
  frequency_desc: "Frequency",
};

export function PracticeToolbar({
  filterOptions: _filterOptions,
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
      {/* Search Input & Filter Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
        {/* Terminal/IDE-style Search Input */}
        <div className="relative flex-1 min-w-0 xl:max-w-md w-full">
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
            className="w-full h-[var(--control-height)] pl-9 pr-8 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-xs font-mono text-white placeholder:text-[var(--text-tertiary)] placeholder:font-sans focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-colors"
          />
          {localSearch ? (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onFilterChange({ q: "", page: 1 });
              }}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-[var(--text-tertiary)] hover:text-white transition-colors"
            >
              <Icon icon={Cancel01Icon} size={13} />
            </button>
          ) : (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center justify-center h-4 px-1.5 text-[10px] font-mono text-[var(--text-tertiary)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded select-none pointer-events-none">
              /
            </kbd>
          )}
        </div>

        {/* Filter Controls: 2x2 grid on mobile (<640px), inline command row on desktop (>=640px) */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap xl:flex-nowrap items-center gap-2 w-full xl:w-auto">
          {/* Difficulty Dropdown */}
          <div className="col-span-1 w-full sm:w-auto min-w-0">
            <Select
              value={filters.difficulty || "all"}
              onValueChange={(val) =>
                onFilterChange({
                  difficulty: val === "all" ? "" : (val as any),
                  page: 1,
                })
              }
            >
              <SelectTrigger
                className={cn(
                  "w-full sm:w-auto sm:min-w-[130px] shrink-0 text-xs font-mono transition-colors",
                  filters.difficulty
                    ? "bg-[var(--surface-raised)] border-[var(--border-strong)] text-white"
                    : "bg-[var(--surface-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:text-white"
                )}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      filters.difficulty === "easy" &&
                        "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]",
                      filters.difficulty === "medium" &&
                        "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]",
                      filters.difficulty === "hard" &&
                        "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]",
                      !filters.difficulty && "bg-[var(--text-tertiary)]"
                    )}
                  />
                  <span
                    className={cn(
                      filters.difficulty
                        ? "text-white font-medium capitalize"
                        : "text-[var(--text-secondary)]"
                    )}
                  >
                    {filters.difficulty
                      ? difficultyDisplayMap[filters.difficulty]
                      : "Difficulty"}
                  </span>
                </span>
              </SelectTrigger>
              <SelectContent className="bg-[#050505] border-[var(--border-default)] text-xs font-mono">
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] shrink-0" />
                    <span>All Levels</span>
                  </div>
                </SelectItem>
                <SelectItem value="easy">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>Easy</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>Medium</span>
                  </div>
                </SelectItem>
                <SelectItem value="hard">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>Hard</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Dropdown */}
          <div className="col-span-1 w-full sm:w-auto min-w-0">
            <Select
              value={filters.status || "all"}
              onValueChange={(val) =>
                onFilterChange({
                  status: val === "all" ? "" : (val as any),
                  page: 1,
                })
              }
            >
              <SelectTrigger
                className={cn(
                  "w-full sm:w-auto sm:min-w-[130px] shrink-0 text-xs font-mono transition-colors",
                  filters.status
                    ? "bg-[var(--surface-raised)] border-[var(--border-strong)] text-white"
                    : "bg-[var(--surface-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:text-white"
                )}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span
                    className={cn(
                      "text-xs font-mono leading-none shrink-0",
                      filters.status === "solved" && "text-emerald-400 font-bold",
                      filters.status === "needs_revision" && "text-[var(--accent)] font-bold",
                      filters.status === "mastered" && "text-purple-400 font-bold",
                      filters.status === "attempted" && "text-amber-400",
                      !filters.status && "text-[var(--text-tertiary)]"
                    )}
                  >
                    {filters.status ? statusIconMap[filters.status] : "○"}
                  </span>
                  <span
                    className={cn(
                      filters.status
                        ? "text-white font-medium"
                        : "text-[var(--text-secondary)]"
                    )}
                  >
                    {filters.status
                      ? statusShortNameMap[filters.status] || "Status"
                      : "Status"}
                  </span>
                </span>
              </SelectTrigger>
              <SelectContent className="bg-[#050505] border-[var(--border-default)] text-xs font-mono">
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-tertiary)]">○</span>
                    <span>All Statuses</span>
                  </div>
                </SelectItem>
                <SelectItem value="not_started">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-tertiary)]">○</span>
                    <span>Not Started</span>
                  </div>
                </SelectItem>
                <SelectItem value="attempted">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400">◐</span>
                    <span>Attempted</span>
                  </div>
                </SelectItem>
                <SelectItem value="solved">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Solved</span>
                  </div>
                </SelectItem>
                <SelectItem value="needs_revision">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--accent)] font-bold">↻</span>
                    <span>Needs Revision</span>
                  </div>
                </SelectItem>
                <SelectItem value="mastered">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">◆</span>
                    <span>Mastered</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Dropdown */}
          <div className="col-span-1 w-full sm:w-auto min-w-0">
            <Select
              value={filters.sort || "recommended"}
              onValueChange={(val) =>
                onFilterChange({ sort: val as PracticeSort, page: 1 })
              }
            >
              <SelectTrigger
                className={cn(
                  "w-full sm:w-auto sm:min-w-[145px] shrink-0 text-xs font-mono transition-colors",
                  filters.sort && filters.sort !== "recommended"
                    ? "bg-[var(--surface-raised)] border-[var(--border-strong)] text-white"
                    : "bg-[var(--surface-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:text-white"
                )}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Icon
                    icon={Sorting01Icon}
                    size={13}
                    className="text-[var(--text-tertiary)] shrink-0"
                  />
                  <span className="text-white font-medium truncate">
                    {sortDisplayMap[filters.sort || "recommended"] || "Recommended"}
                  </span>
                </span>
              </SelectTrigger>
              <SelectContent className="bg-[#050505] border-[var(--border-default)] text-xs font-mono">
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="difficulty_asc">Easy First</SelectItem>
                <SelectItem value="difficulty_desc">Hard First</SelectItem>
                <SelectItem value="title_asc">Title (A–Z)</SelectItem>
                <SelectItem value="frequency_desc">Frequency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Filter Drawer Button (Visible on mobile/tablet, hidden on lg desktop) */}
          {onOpenMobileFilters && (
            <div className="col-span-1 w-full sm:w-auto min-w-0 lg:hidden">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenMobileFilters}
                className={cn(
                  "w-full sm:w-auto h-[var(--control-height)] px-3 text-xs font-mono shrink-0 transition-colors justify-between",
                  activeFiltersCount > 0
                    ? "bg-[rgba(255,0,0,0.08)] border-[var(--accent)]/50 text-white hover:bg-[rgba(255,0,0,0.15)]"
                    : "bg-[var(--surface-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)] hover:text-white"
                )}
              >
                <span className="flex items-center gap-1.5 min-w-0">
                  <Icon
                    icon={FilterIcon}
                    size={13}
                    className={
                      activeFiltersCount > 0
                        ? "text-[var(--accent)]"
                        : "text-[var(--text-tertiary)]"
                    }
                  />
                  <span className="font-medium">Filters</span>
                </span>
                {activeFiltersCount > 0 ? (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-[var(--accent)] text-white shrink-0 ml-1.5">
                    {activeFiltersCount}
                  </span>
                ) : (
                  <span className="text-[var(--text-tertiary)] text-[10px] font-mono ml-1.5">
                    ...
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Progressive Context Controls: Company Time Window (Appears only when company selected) */}
      {filters.company && (
        <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-base)] border border-[var(--border-subtle)] text-xs font-mono animate-in fade-in duration-200 overflow-x-auto">
          <span className="text-[var(--text-tertiary)] uppercase text-[10px] tracking-wider shrink-0">
            Window:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
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

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono pt-0.5">
          <span className="text-[var(--text-tertiary)] text-[10px] uppercase tracking-wider shrink-0">
            Active:
          </span>

          {filters.q && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-xs)] bg-[var(--surface-raised)] text-white border border-[var(--border-subtle)]">
              <span className="text-[var(--text-tertiary)]">q:</span>
              <span className="text-white font-medium">&quot;{filters.q}&quot;</span>
              <button
                type="button"
                onClick={() => {
                  setLocalSearch("");
                  onFilterChange({ q: "", page: 1 });
                }}
                aria-label="Remove search filter"
                className="hover:text-[var(--accent)] ml-0.5 transition-colors"
              >
                <Icon icon={Cancel01Icon} size={11} />
              </button>
            </span>
          )}

          {filters.difficulty && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-xs)] bg-[var(--surface-raised)] text-white border border-[var(--border-subtle)]">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  filters.difficulty === "easy" && "bg-emerald-400",
                  filters.difficulty === "medium" && "bg-amber-400",
                  filters.difficulty === "hard" && "bg-rose-500"
                )}
              />
              <span className="capitalize">{filters.difficulty}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ difficulty: "", page: 1 })}
                aria-label="Remove difficulty filter"
                className="hover:text-[var(--accent)] ml-0.5 transition-colors"
              >
                <Icon icon={Cancel01Icon} size={11} />
              </button>
            </span>
          )}

          {filters.status && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-xs)] bg-[var(--surface-raised)] text-white border border-[var(--border-subtle)]">
              <span>{statusIconMap[filters.status] || "○"}</span>
              <span>{statusShortNameMap[filters.status] || filters.status}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ status: "", page: 1 })}
                aria-label="Remove status filter"
                className="hover:text-[var(--accent)] ml-0.5 transition-colors"
              >
                <Icon icon={Cancel01Icon} size={11} />
              </button>
            </span>
          )}

          {filters.topic && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-xs)] bg-[var(--surface-raised)] text-white border border-[var(--border-subtle)]">
              <span className="text-[var(--text-tertiary)]">topic:</span>
              <span className="text-white font-medium">{filters.topic}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ topic: "", page: 1 })}
                aria-label="Remove topic filter"
                className="hover:text-[var(--accent)] ml-0.5 transition-colors"
              >
                <Icon icon={Cancel01Icon} size={11} />
              </button>
            </span>
          )}

          {filters.collection && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-xs)] bg-[var(--surface-raised)] text-white border border-[var(--border-subtle)]">
              <span className="text-[var(--text-tertiary)]">list:</span>
              <span className="text-white font-medium">{filters.collection}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ collection: "", page: 1 })}
                aria-label="Remove collection filter"
                className="hover:text-[var(--accent)] ml-0.5 transition-colors"
              >
                <Icon icon={Cancel01Icon} size={11} />
              </button>
            </span>
          )}

          {filters.company && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-xs)] bg-[var(--surface-raised)] text-white border border-[var(--border-subtle)]">
              <span className="text-[var(--text-tertiary)]">company:</span>
              <span className="text-white font-medium">{filters.company}</span>
              <button
                type="button"
                onClick={() =>
                  onFilterChange({ company: "", window: "", page: 1 })
                }
                aria-label="Remove company filter"
                className="hover:text-[var(--accent)] ml-0.5 transition-colors"
              >
                <Icon icon={Cancel01Icon} size={11} />
              </button>
            </span>
          )}

          {filters.revision && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-xs)] bg-[rgba(255,0,0,0.1)] text-[var(--accent)] border border-[var(--accent-border)]">
              <span>revision: {filters.revision}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ revision: "", page: 1 })}
                aria-label="Remove revision filter"
                className="hover:text-white ml-0.5 transition-colors"
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
            className="text-[11px] font-mono text-[var(--text-tertiary)] hover:text-white underline underline-offset-2 ml-auto sm:ml-1 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
