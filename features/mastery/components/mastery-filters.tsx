"use client";

import type { MasteryFilter, MasterySort } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface MasteryFiltersProps {
  filter: MasteryFilter;
  sort: MasterySort;
  onFilterChange: (filter: MasteryFilter) => void;
  onSortChange: (sort: MasterySort) => void;
  needsEvidenceCount?: number;
}

const FILTER_OPTIONS: Record<MasteryFilter, string> = {
  all: "All levels",
  mastered: "Mastered",
  proficient: "Proficient",
  practiced: "Practiced",
  learning: "Learning",
  needs_evidence: "Needs evidence",
};

const SORT_LABELS: Record<MasterySort, string> = {
  curriculum: "Curriculum order",
  lowest_evidence: "Lowest evidence",
  highest_evidence: "Highest evidence",
  recent: "Most recent evidence",
};

export function MasteryFilters({
  filter,
  sort,
  onFilterChange,
  onSortChange,
  needsEvidenceCount,
}: MasteryFiltersProps) {
  return (
    <>
      <Select
        value={filter}
        onValueChange={(value) => onFilterChange(value as MasteryFilter)}
      >
        <SelectTrigger aria-label="Evidence level" className="min-w-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          align="start"
          className="max-w-[var(--radix-select-content-available-width)]"
        >
          {Object.entries(FILTER_OPTIONS).map(([id, label]) => (
            <SelectItem key={id} value={id}>
              {id === "needs_evidence" && needsEvidenceCount
                ? label + " (" + needsEvidenceCount + ")"
                : label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={sort} onValueChange={(value) => onSortChange(value as MasterySort)}>
        <SelectTrigger aria-label="Sort skills" className="min-w-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          align="end"
          className="max-w-[var(--radix-select-content-available-width)]"
        >
          {Object.entries(SORT_LABELS).map(([id, label]) => (
            <SelectItem key={id} value={id}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
