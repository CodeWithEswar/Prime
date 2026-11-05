"use client";

import * as React from "react";
import { Search01Icon, BookOpen01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ProblemTopicSummary } from "../types";

interface TopicExplorerDialogProps {
  topics: ProblemTopicSummary[];
  activeTopic?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTopic: (topicSlug: string) => void;
}

interface TopicGroup {
  name: string;
  description: string;
  slugs: string[];
}

const TOPIC_GROUPS: TopicGroup[] = [
  {
    name: "Foundation",
    description: "Core algorithmic building blocks",
    slugs: ["fundamentals", "arrays", "strings", "hashing", "sorting", "math", "matrix"],
  },
  {
    name: "Patterns",
    description: "High-yield interview problem techniques",
    slugs: ["two-pointers", "sliding-window", "prefix-sum", "binary-search", "intervals"],
  },
  {
    name: "Structures",
    description: "Standard linear and hierarchical data structures",
    slugs: [
      "linked-lists",
      "stacks",
      "queues",
      "recursion",
      "trees",
      "bst",
      "heap",
      "tries",
    ],
  },
  {
    name: "Advanced",
    description: "Complex algorithmic modeling and optimization",
    slugs: [
      "graphs",
      "dynamic-programming",
      "greedy",
      "backtracking",
      "bit-manipulation",
    ],
  },
];

export function TopicExplorerDialog({
  topics,
  activeTopic,
  open,
  onOpenChange,
  onSelectTopic,
}: TopicExplorerDialogProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const topicMap = React.useMemo(() => {
    const map = new Map<string, ProblemTopicSummary>();
    for (const t of topics) {
      map.set(t.slug, t);
    }
    return map;
  }, [topics]);

  // Filter topics by search query
  const filteredTopics = React.useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    return topics.filter(
      (t) => t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)
    );
  }, [topics, searchQuery]);

  function handleSelect(slug: string) {
    onSelectTopic(slug);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-[#030303] border-[rgba(255,255,255,0.12)] gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-[var(--border-subtle)] bg-[#030303] shrink-0 pr-12 space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <DialogTitle className="text-base font-semibold text-white tracking-tight">
              DSA Topic Explorer
            </DialogTitle>
            <span className="text-xs font-mono text-[var(--text-tertiary)]">
              ({topics.length} topics)
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Explore canonical topics organized by algorithmic tier and problem density.
          </p>
        </DialogHeader>

        {/* Quick Search and Clear */}
        <div className="px-6 py-3 border-b border-[var(--border-subtle)]/50 bg-[#030303] shrink-0 flex items-center gap-2">
          <div className="relative flex-1">
            <Icon
              icon={Search01Icon}
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter topics..."
              className="w-full h-8 pl-8 pr-7 bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-xs text-white placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-white"
              >
                <Icon icon={Cancel01Icon} size={12} />
              </button>
            )}
          </div>
          {activeTopic && (
            <button
              type="button"
              onClick={() => handleSelect("")}
              className="px-2.5 py-1 text-xs font-mono rounded-[var(--radius-sm)] bg-[var(--surface-base)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Main Content: Grouped or Filtered List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {filteredTopics ? (
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                Search Results ({filteredTopics.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                {filteredTopics.map((topic) => {
                  const isActive = activeTopic === topic.slug;
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleSelect(isActive ? "" : topic.slug)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm)] transition-colors text-left border",
                        isActive
                          ? "bg-[var(--surface-raised)] border-[var(--accent)] text-white font-medium"
                          : "bg-[var(--surface-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--border-default)]"
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />}
                        <span className="truncate">{topic.name}</span>
                      </span>
                      {topic.problemCount !== undefined && (
                        <span className="text-[11px] font-mono text-[var(--text-tertiary)] shrink-0 ml-2">
                          {topic.problemCount.toLocaleString()}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            TOPIC_GROUPS.map((group) => {
              const groupTopics = group.slugs
                .map((slug) => topicMap.get(slug))
                .filter(Boolean) as ProblemTopicSummary[];

              if (groupTopics.length === 0) return null;

              return (
                <div key={group.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white">
                      {group.name}
                    </span>
                    <span className="text-[11px] text-[var(--text-tertiary)]">
                      {group.description}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {groupTopics.map((topic) => {
                      const isActive = activeTopic === topic.slug;
                      return (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() => handleSelect(isActive ? "" : topic.slug)}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm)] transition-colors text-left border",
                            isActive
                              ? "bg-[var(--surface-raised)] border-[var(--accent)] text-white font-medium"
                              : "bg-[var(--surface-base)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white hover:border-[var(--border-default)]"
                          )}
                        >
                          <span className="flex items-center gap-2 truncate">
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                            )}
                            <span className="truncate">{topic.name}</span>
                          </span>
                          {topic.problemCount !== undefined && (
                            <span className="text-[11px] font-mono text-[var(--text-tertiary)] shrink-0 ml-2">
                              {topic.problemCount.toLocaleString()}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

