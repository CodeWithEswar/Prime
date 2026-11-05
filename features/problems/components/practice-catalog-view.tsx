"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PracticeHeader } from "./practice-header";
import { PracticeToolbar } from "./practice-toolbar";
import { PracticeContextRail } from "./practice-context-rail";
import { PracticeFilterSheet } from "./practice-filter-sheet";
import { ProblemTable } from "./problem-table";
import type {
  PracticeCatalogFilter,
  PracticeCatalogResult,
  UserPracticeSummary,
} from "../types";
import type { FilterOptionsData } from "../queries/get-filter-options";

interface PracticeCatalogViewProps {
  summary: UserPracticeSummary;
  filterOptions: FilterOptionsData;
  catalogResult: PracticeCatalogResult;
  currentFilters: PracticeCatalogFilter;
}

export function PracticeCatalogView({
  summary,
  filterOptions,
  catalogResult,
  currentFilters,
}: PracticeCatalogViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  // Helper to build URL query string and navigate
  const updateFilters = React.useCallback(
    (updates: Partial<PracticeCatalogFilter>) => {
      const current = new URLSearchParams(searchParams?.toString() || "");

      // Apply updates
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "" || value === 0) {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      // If any filter other than page changes, reset to page 1
      if (!("page" in updates)) {
        current.delete("page");
      }

      startTransition(() => {
        router.push(`${pathname}?${current.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  const clearAllFilters = React.useCallback(() => {
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname]);

  return (
    <div className="space-y-6">
      {/* Editorial Practice Summary Header */}
      <PracticeHeader summary={summary} />

      {/* Main Practice Workspace Shell */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Context Rail (Desktop) */}
        <aside className="hidden lg:block w-56 shrink-0 sticky top-6">
          <PracticeContextRail
            topics={filterOptions.topics}
            collections={filterOptions.collections}
            companies={filterOptions.companies}
            activeTopic={currentFilters.topic}
            activeCollection={currentFilters.collection}
            activeCompany={currentFilters.company}
            activeRevision={currentFilters.revision}
            activeStatus={currentFilters.status}
            onSelectTopic={(topic) =>
              updateFilters({ topic: currentFilters.topic === topic ? "" : topic })
            }
            onSelectCollection={(collection) =>
              updateFilters({
                collection: currentFilters.collection === collection ? "" : collection,
              })
            }
            onSelectCompany={(company) =>
              updateFilters({
                company: currentFilters.company === company ? "" : company,
              })
            }
            onSelectRevision={(revision) =>
              updateFilters({
                revision: (currentFilters.revision === revision ? "" : revision) as any,
              })
            }
            onSelectStatus={(status) =>
              updateFilters({
                status: (currentFilters.status === status ? "" : status) as any,
              })
            }
            onClearContext={() =>
              updateFilters({
                topic: "",
                collection: "",
                company: "",
                revision: "",
                status: "",
              })
            }
          />
        </aside>

        {/* Right / Main Content Column */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          <PracticeToolbar
            filterOptions={filterOptions}
            filters={currentFilters}
            onFilterChange={updateFilters}
            onOpenMobileFilters={() => setMobileFiltersOpen(true)}
          />

          <ProblemTable
            data={catalogResult}
            isLoading={isPending}
            onPageChange={(page) => updateFilters({ page })}
            onClearFilters={clearAllFilters}
          />
        </div>
      </div>

      {/* Mobile Context / Filter Drawer */}
      <PracticeFilterSheet
        open={mobileFiltersOpen}
        onOpenChange={setMobileFiltersOpen}
        filterOptions={filterOptions}
        filters={currentFilters}
        onFilterChange={updateFilters}
      />
    </div>
  );
}

