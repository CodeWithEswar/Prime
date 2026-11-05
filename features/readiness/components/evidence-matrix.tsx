"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CompetencyReadiness } from "@/domain/readiness";
import { ReadinessStatusBadge } from "./readiness-status";

interface EvidenceMatrixProps {
  competencies: CompetencyReadiness[];
  onSelectCompetency: (competency: CompetencyReadiness) => void;
}

const domains: Record<CompetencyReadiness["domain"], string> = {
  dsa: "DSA",
  fundamentals: "Fundamentals",
  aptitude: "Aptitude",
  mock: "Mocks",
};

export function EvidenceMatrix({
  competencies,
  onSelectCompetency,
}: EvidenceMatrixProps) {
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const query = search.trim().toLowerCase();
  const filtered = competencies.filter(
    (item) =>
      (item.name.toLowerCase().includes(query) ||
        item.domain.toLowerCase().includes(query)) &&
      (domainFilter === "all" || item.domain === domainFilter)
  );

  return (
    <div className="space-y-3">
      <div className="grid gap-2 @min-[28rem]:grid-cols-[minmax(0,1fr)_11rem]">
        <SearchInput
          aria-label="Search competencies"
          placeholder="Search competencies…"
          shortcut=""
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onClear={() => setSearch("")}
          className="h-9"
        />
        <Select value={domainFilter} onValueChange={setDomainFilter}>
          <SelectTrigger aria-label="Filter by domain" className="h-9 min-w-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {Object.entries(domains).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card elevation="raised">
        {filtered.length ? (
          <ul
            aria-label="Competency evidence"
            className="divide-y divide-[var(--border-subtle)]"
          >
            {filtered.map((item) => (
              <li
                key={item.competencyId}
                className="grid min-w-0 gap-2.5 p-3 @min-[40rem]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] @min-[40rem]:items-center sm:px-4"
              >
                <div className="min-w-0 space-y-0.5">
                  <h2 className="text-sm font-semibold [overflow-wrap:anywhere]">
                    {item.name}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {domains[item.domain]} ·{" "}
                    <span className="capitalize">{item.importance}</span>
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">{item.summary}</p>
                </div>
                <dl className="grid grid-cols-2 gap-x-2 text-xs @min-[40rem]:gap-x-3">
                  <div>
                    <dt className="text-[var(--text-secondary)]">Coverage</dt>
                    <dd className="capitalize">{item.coverage}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-secondary)]">Confidence</dt>
                    <dd className="capitalize">{item.confidence}</dd>
                  </div>
                </dl>
                <div className="flex flex-wrap items-center justify-between gap-2 @min-[40rem]:justify-end">
                  <ReadinessStatusBadge status={item.status} />
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Inspect ${item.name}`}
                    aria-haspopup="dialog"
                    onClick={() => onSelectCompetency(item)}
                  >
                    Inspect
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4 text-sm text-[var(--text-secondary)]">
            No competencies match the current filter.
          </p>
        )}
      </Card>
    </div>
  );
}
