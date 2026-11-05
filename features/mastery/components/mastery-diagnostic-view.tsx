"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { Icon } from "@/components/ui/icon";
import { AiChat01Icon } from "@hugeicons/core-free-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAI } from "@/features/ai/ai-provider";
import type { MasteryOverviewData, MasteryFilter, MasterySort } from "../types";
import { MasteryOverviewHeader } from "./mastery-overview-header";
import { MasteryStrip } from "./mastery-strip";
import { MasteryFilters } from "./mastery-filters";
import { MasterySpine } from "./mastery-spine";
import { EvidenceLens } from "./evidence-lens";
import { EvidenceDrawer } from "./evidence-drawer";
import "./mastery.css";

export interface MasteryDiagnosticViewProps {
  initialData: MasteryOverviewData;
  initialTopicSlug?: string;
  className?: string;
}

export function MasteryDiagnosticView({
  initialData,
  initialTopicSlug,
  className,
}: MasteryDiagnosticViewProps) {
  const [filter, setFilter] = React.useState<MasteryFilter>("all");
  const [sort, setSort] = React.useState<MasterySort>("curriculum");
  const [search, setSearch] = React.useState("");
  const [stage, setStage] = React.useState("all");
  const trigger = React.useRef<HTMLButtonElement>(null);
  const inlineLens = React.useRef<HTMLDivElement>(null);
  const handingOff = React.useRef(false);
  const ai = useAI();
  const stageNames = React.useMemo(
    () =>
      new Map(
        initialData.stages.flatMap((stage) =>
          stage.topics.map((topic) => [topic.topicId, stage.stageName] as const)
        )
      ),
    [initialData.stages]
  );

  // Determine initial selected topic
  const initialTopic = React.useMemo(() => {
    if (initialTopicSlug) {
      const match = initialData.topics.find(
        (t) => t.topicId === initialTopicSlug || t.topicSlug === initialTopicSlug
      );
      if (match) return match.topicId;
    }
    return initialData.topics[0]?.topicId ?? null;
  }, [initialData.topics, initialTopicSlug]);

  const [selectedTopicId, setSelectedTopicId] = React.useState<string | null>(
    initialTopic
  );
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState(false);

  // Compute needs evidence count across all topics
  const needsEvidenceCount = React.useMemo(() => {
    return initialData.topics.filter(
      (t) =>
        t.blockers.length > 0 ||
        t.level === "learning" ||
        t.evidenceCoverage.percentage < 50
    ).length;
  }, [initialData.topics]);

  // Filter topics
  const filteredTopics = React.useMemo(() => {
    const candidates =
      stage === "all"
        ? initialData.topics
        : (initialData.stages.find((item) => item.stageId === stage)?.topics ?? []);
    const query = search.toLowerCase().trim();
    return candidates.filter((topic) => {
      if (
        query &&
        !topic.topicName.toLowerCase().includes(query) &&
        !topic.problemMasteries.some((problem) =>
          initialData.coreProblemMetadata[problem.problemId]?.title
            .toLowerCase()
            .includes(query)
        )
      )
        return false;
      if (filter === "all") return true;
      if (filter === "needs_evidence") {
        return (
          topic.blockers.length > 0 ||
          topic.level === "learning" ||
          topic.evidenceCoverage.percentage < 50
        );
      }
      return topic.level === filter;
    });
  }, [initialData, filter, search, stage]);

  // Sort filtered topics
  const sortedTopics = React.useMemo(() => {
    const list = [...filteredTopics];
    switch (sort) {
      case "lowest_evidence":
        return list.sort((a, b) => a.score - b.score);
      case "highest_evidence":
        return list.sort((a, b) => b.score - a.score);
      case "recent":
        return list
          .map((topic) => ({
            topic,
            timestamp: Math.max(
              0,
              ...topic.problemMasteries.map((problem) =>
                problem.lastEvidenceAt ? new Date(problem.lastEvidenceAt).getTime() : 0
              )
            ),
          }))
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((item) => item.topic);
      case "curriculum":
      default:
        return list; // Preserves natural curriculum stage order
    }
  }, [filteredTopics, sort]);

  // Active selected topic result
  const activeTopic =
    sortedTopics.find((topic) => topic.topicId === selectedTopicId) ??
    sortedTopics[0] ??
    null;

  const handleSelectTopic = (topicId: string, element: HTMLButtonElement) => {
    setSelectedTopicId(topicId);
    if (!inlineLens.current?.getClientRects().length) {
      trigger.current = element;
      setIsMobileDrawerOpen(true);
    }
  };

  const ask =
    ai?.enabled &&
    ![
      "connecting",
      "streaming",
      "tool_running",
      "tool_requested",
      "resuming",
      "confirmation_required",
    ].includes(ai.state)
      ? (element: HTMLElement, slug?: string) => {
          const reference = { type: "mastery" as const, ...(slug ? { ref: slug } : {}) };
          if (ai.reference.type !== reference.type || ai.reference.ref !== slug)
            ai.newConversation(reference);
          ai.setOpen(true, element, reference);
        }
      : undefined;

  return (
    <div
      className={cn(
        "mastery-shell mx-auto grid w-full max-w-7xl min-w-0 gap-4 px-3 py-4 sm:gap-5 sm:px-6 sm:py-6 lg:px-8",
        className
      )}
    >
      {/* 1. Page Header */}
      <MasteryOverviewHeader
        lastCalculatedAt={initialData.lastCalculatedAt}
        totalCoreProblems={initialData.totalCoreProblems}
        action={
          ask && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(event) => ask(event.currentTarget)}
            >
              <Icon icon={AiChat01Icon} size={14} aria-hidden="true" />
              Explain my mastery
            </Button>
          )
        }
      />

      {/* 2. Compact Mastery Strip */}
      <MasteryStrip
        counts={initialData.counts}
        total={initialData.totalCoreProblems}
        selectedFilter={filter}
        onSelectFilter={setFilter}
      />

      <Card elevation="base" className="min-w-0">
        <CardContent className="grid min-w-0 grid-cols-2 gap-2 p-2 sm:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] sm:p-3">
          <SearchInput
            aria-label="Search evidence map"
            placeholder="Search skills"
            shortcut=""
            className="min-w-0"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onClear={() => setSearch("")}
          />
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger aria-label="Curriculum stage" className="min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              align="start"
              className="max-w-[var(--radix-select-content-available-width)]"
            >
              <SelectItem value="all">All stages</SelectItem>
              {initialData.stages.map((item) => (
                <SelectItem key={item.stageId} value={item.stageId}>
                  {item.stageName} · {item.level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <MasteryFilters
            filter={filter}
            sort={sort}
            onFilterChange={setFilter}
            onSortChange={setSort}
            needsEvidenceCount={needsEvidenceCount}
          />
        </CardContent>
      </Card>

      {/* 4. Main Diagnostic Workspace */}
      <div className="mastery-columns">
        {/* Left Column: Mastery Spine / Skill Map (7 cols on desktop) */}
        <div className="min-w-0 space-y-2.5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 px-1">
            <h2 className="text-sm font-semibold sm:text-base">Skill evidence map</h2>
            <span className="text-xs text-[var(--text-secondary)]">
              {sortedTopics.length} {sortedTopics.length === 1 ? "skill" : "skills"}
            </span>
          </div>

          {sortedTopics.length === 0 ? (
            <Card elevation="base">
              <CardContent className="space-y-3 p-5 text-center">
                <p className="text-sm text-[var(--text-secondary)]">
                  No skills match this view.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setFilter("all");
                    setSearch("");
                    setStage("all");
                  }}
                >
                  Reset filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <MasterySpine
              topics={sortedTopics}
              stageNames={stageNames}
              selectedTopicId={activeTopic?.topicId ?? null}
              onSelectTopic={handleSelectTopic}
            />
          )}
        </div>

        {/* Right Column: Evidence Lens (5 cols on desktop, hidden on mobile/tablet) */}
        <div ref={inlineLens} className="mastery-inline-lens">
          <EvidenceLens
            topic={activeTopic}
            coreMetadata={initialData.coreProblemMetadata}
            onAsk={
              ask && activeTopic
                ? (element) => ask(element, activeTopic.topicSlug)
                : undefined
            }
          />
        </div>
      </div>

      {/* Mobile Drawer for Evidence Lens */}
      <EvidenceDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        topic={activeTopic}
        coreMetadata={initialData.coreProblemMetadata}
        onRestoreFocus={() => {
          if (!handingOff.current) trigger.current?.focus();
          handingOff.current = false;
        }}
        onAsk={
          ask && activeTopic
            ? (element) => {
                handingOff.current = true;
                setIsMobileDrawerOpen(false);
                ask(trigger.current ?? element, activeTopic.topicSlug);
              }
            : undefined
        }
      />
    </div>
  );
}
