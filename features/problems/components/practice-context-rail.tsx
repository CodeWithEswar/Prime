"use client";

import * as React from "react";
import {
  Folder01Icon,
  Briefcase01Icon,
  BookOpen01Icon,
  RotateRight01Icon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { TopicExplorerDialog } from "./topic-explorer-dialog";
import { cn } from "@/lib/utils";
import type { ProblemTopicSummary, ProblemCollectionSummary } from "../types";
import type { CompanyFilterOption } from "../queries/get-filter-options";

interface PracticeContextRailProps {
  topics: ProblemTopicSummary[];
  collections: ProblemCollectionSummary[];
  companies: CompanyFilterOption[];
  activeTopic?: string;
  activeCollection?: string;
  activeCompany?: string;
  activeRevision?: string;
  activeStatus?: string;
  onSelectTopic: (topicSlug: string) => void;
  onSelectCollection: (collectionSlug: string) => void;
  onSelectCompany: (companySlug: string) => void;
  onSelectRevision: (revision: string) => void;
  onSelectStatus: (status: string) => void;
  onClearContext: () => void;
  className?: string;
}

export function PracticeContextRail({
  topics,
  collections,
  companies,
  activeTopic,
  activeCollection,
  activeCompany,
  activeRevision,
  activeStatus,
  onSelectTopic,
  onSelectCollection,
  onSelectCompany,
  onSelectRevision,
  onSelectStatus,
  onClearContext,
  className,
}: PracticeContextRailProps) {
  const [topicExplorerOpen, setTopicExplorerOpen] = React.useState(false);
  const [showAllCompanies, setShowAllCompanies] = React.useState(false);

  const isAllActive =
    !activeTopic && !activeCollection && !activeCompany && !activeRevision && !activeStatus;

  // Prioritize top topics by problem count or core order
  const priorityTopicSlugs = [
    "arrays",
    "strings",
    "trees",
    "dynamic-programming",
    "graphs",
    "linked-lists",
  ];

  const topTopics = React.useMemo(() => {
    const map = new Map(topics.map((t) => [t.slug, t]));
    const list: ProblemTopicSummary[] = [];
    for (const slug of priorityTopicSlugs) {
      const found = map.get(slug);
      if (found) list.push(found);
    }
    // Add active topic if not in the top 6 list
    if (activeTopic && !priorityTopicSlugs.includes(activeTopic)) {
      const activeObj = map.get(activeTopic);
      if (activeObj) list.push(activeObj);
    }
    return list.length > 0 ? list : topics.slice(0, 6);
  }, [topics, activeTopic]);

  return (
    <>
      <aside
        className={cn(
          "w-56 shrink-0 flex flex-col gap-5 text-xs font-mono select-none pr-3 border-r border-[var(--border-subtle)]",
          className
        )}
      >
        {/* 1. Primary Practice Scopes */}
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={onClearContext}
            className={cn(
              "flex items-center justify-between px-2.5 py-1.5 rounded-[var(--radius-sm)] transition-colors text-left",
              isAllActive
                ? "bg-[var(--surface-raised)] text-white font-medium shadow-[inset_2px_0_0_0_var(--accent)]"
                : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-base)]"
            )}
          >
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  isAllActive ? "bg-[var(--accent)]" : "bg-[rgba(255,255,255,0.2)]"
                )}
              />
              <span>All Problems</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectRevision(activeRevision === "due" ? "" : "due")}
            className={cn(
              "flex items-center justify-between px-2.5 py-1.5 rounded-[var(--radius-sm)] transition-colors text-left",
              activeRevision === "due"
                ? "bg-[var(--surface-raised)] text-[var(--accent)] font-medium shadow-[inset_2px_0_0_0_var(--accent)]"
                : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-base)]"
            )}
          >
            <span className="flex items-center gap-2">
              <Icon
                icon={RotateRight01Icon}
                size={13}
                className={
                  activeRevision === "due"
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-tertiary)]"
                }
              />
              <span>Revision Due</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectStatus(activeStatus === "mastered" ? "" : "mastered")}
            className={cn(
              "flex items-center justify-between px-2.5 py-1.5 rounded-[var(--radius-sm)] transition-colors text-left",
              activeStatus === "mastered"
                ? "bg-[var(--surface-raised)] text-white font-medium shadow-[inset_2px_0_0_0_var(--accent)]"
                : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-base)]"
            )}
          >
            <span className="flex items-center gap-2">
              <Icon
                icon={CheckmarkCircle01Icon}
                size={13}
                className={
                  activeStatus === "mastered" ? "text-white" : "text-[var(--text-tertiary)]"
                }
              />
              <span>Mastered</span>
            </span>
          </button>
        </div>

        {/* 2. Curated Collections Section */}
        {collections.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]">
              <Icon icon={Folder01Icon} size={12} />
              <span>Collections</span>
            </div>
            <div className="flex flex-col gap-0.5">
              {collections.map((coll) => {
                const isActive = activeCollection === coll.slug;
                return (
                  <button
                    key={coll.id}
                    type="button"
                    onClick={() => onSelectCollection(isActive ? "" : coll.slug)}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-1.5 rounded-[var(--radius-sm)] transition-colors text-left group",
                      isActive
                        ? "bg-[var(--surface-raised)] text-white font-medium shadow-[inset_2px_0_0_0_var(--accent)]"
                        : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-base)]"
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                      )}
                      <span className="truncate">{coll.name}</span>
                    </span>
                    {coll.problemCount !== undefined && (
                      <span
                        className={cn(
                          "text-[10px] font-mono shrink-0 ml-1.5",
                          isActive
                            ? "text-[var(--text-secondary)]"
                            : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]"
                        )}
                      >
                        {coll.problemCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Roadmap Topics Section */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-2.5 py-1 text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]">
            <div className="flex items-center gap-1.5">
              <Icon icon={BookOpen01Icon} size={12} />
              <span>Roadmap Topics</span>
            </div>
            <span className="text-[10px] text-[var(--text-tertiary)]">{topics.length}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            {topTopics.map((topic) => {
              const isActive = activeTopic === topic.slug;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => onSelectTopic(isActive ? "" : topic.slug)}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-1.5 rounded-[var(--radius-sm)] transition-colors text-left group",
                    isActive
                      ? "bg-[var(--surface-raised)] text-white font-medium shadow-[inset_2px_0_0_0_var(--accent)]"
                      : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-base)]"
                  )}
                >
                  <span className="flex items-center gap-2 truncate">
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                    )}
                    <span className="truncate">{topic.name}</span>
                  </span>
                  {topic.problemCount !== undefined && (
                    <span
                      className={cn(
                        "text-[10px] font-mono shrink-0 ml-1.5",
                        isActive
                          ? "text-[var(--text-secondary)]"
                          : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]"
                      )}
                    >
                      {topic.problemCount.toLocaleString()}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Topic Explorer Trigger */}
            <button
              type="button"
              onClick={() => setTopicExplorerOpen(true)}
              className="flex items-center justify-between px-2.5 py-1.5 mt-1 text-[11px] font-mono text-[var(--text-secondary)] hover:text-white rounded-[var(--radius-sm)] hover:bg-[var(--surface-base)] transition-colors border border-dashed border-[var(--border-subtle)] hover:border-[var(--border-default)]"
            >
              <span>All Topics ({topics.length})</span>
              <Icon icon={ArrowRight01Icon} size={12} />
            </button>
          </div>
        </div>

        {/* 4. Top Companies Section */}
        {companies.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]">
              <div className="flex items-center gap-1.5">
                <Icon icon={Briefcase01Icon} size={12} />
                <span>Companies</span>
              </div>
              <span className="text-[10px] text-[var(--text-tertiary)]">Top</span>
            </div>

            <div className="flex flex-col gap-0.5">
              {(showAllCompanies ? companies.slice(0, 15) : companies.slice(0, 6)).map(
                (comp) => {
                  const isActive = activeCompany === comp.slug;
                  return (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => onSelectCompany(isActive ? "" : comp.slug)}
                      className={cn(
                        "flex items-center justify-between px-2.5 py-1.5 rounded-[var(--radius-sm)] transition-colors text-left",
                        isActive
                          ? "bg-[var(--surface-raised)] text-white font-medium shadow-[inset_2px_0_0_0_var(--accent)]"
                          : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-base)]"
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                        )}
                        <span className="truncate">{comp.name}</span>
                      </span>
                    </button>
                  );
                }
              )}

              {companies.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllCompanies(!showAllCompanies)}
                  className="px-2.5 py-1 text-[10px] text-[var(--text-tertiary)] hover:text-white text-left transition-colors"
                >
                  {showAllCompanies ? "Show fewer" : `+${companies.length - 6} more`}
                </button>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Full Topic Taxonomy Explorer Modal */}
      <TopicExplorerDialog
        topics={topics}
        activeTopic={activeTopic}
        open={topicExplorerOpen}
        onOpenChange={setTopicExplorerOpen}
        onSelectTopic={onSelectTopic}
      />
    </>
  );
}
