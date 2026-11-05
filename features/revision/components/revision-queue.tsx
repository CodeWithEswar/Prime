"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import {
  Clock01Icon,
  Calendar03Icon,
  Layers01Icon,
  ArrowRight01Icon,
  ArrowDown01Icon,
  ArrowUpRight01Icon,
} from "@hugeicons/core-free-icons";
import { RevisionRow } from "./revision-row";
import type { RevisionProblemItem, RevisionTab } from "../types";
import { format, isSameDay, startOfDay } from "date-fns";

interface RevisionQueueProps {
  items: RevisionProblemItem[];
  activeTab: RevisionTab;
  selectedTopic: string | null;
  onReview: (item: RevisionProblemItem) => void;
  onSnooze: (item: RevisionProblemItem) => void;
}

export function RevisionQueue({
  items,
  activeTab,
  selectedTopic,
  onReview,
  onSnooze,
}: RevisionQueueProps) {
  // Topic filtering
  const filtered = selectedTopic
    ? items.filter((item) => item.topics.some((t) => t.id === selectedTopic))
    : items;

  // Split into categories
  const overdueItems = filtered.filter((i) => i.category === "overdue");
  const dueTodayItems = filtered.filter((i) => i.category === "due_today");
  const upcomingItems = filtered.filter((i) => i.category === "upcoming");

  // Track expanded upcoming accordions
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({
    Tomorrow: true,
  });

  const toggleAccordion = (key: string) => {
    setExpandedDates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Group upcoming items by date
  const upcomingByDate = new Map<string, RevisionProblemItem[]>();
  for (const item of upcomingItems) {
    const d = startOfDay(new Date(item.snoozedUntil || item.nextReviewAt));
    const now = new Date();
    const tomorrow = startOfDay(new Date(now.getTime() + 24 * 60 * 60 * 1000));
    let groupKey: string;
    if (isSameDay(d, tomorrow)) {
      groupKey = "Tomorrow";
    } else {
      groupKey = format(d, "MMM dd");
    }

    const list = upcomingByDate.get(groupKey) ?? [];
    list.push(item);
    upcomingByDate.set(groupKey, list);
  }

  // Handle Tab Filtering
  let showOverdue = activeTab === "due_queue" || activeTab === "all";
  let showDueToday = activeTab === "due_queue" || activeTab === "all";
  let showUpcoming = activeTab === "upcoming" || activeTab === "all" || (activeTab === "due_queue" && overdueItems.length === 0 && dueTodayItems.length === 0);

  if (activeTab === "completed") {
    return (
      <div className="p-12 text-center rounded-md border border-[#1A1A1A] bg-[#0A0A0A]">
        <div className="w-12 h-12 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center mx-auto text-[#AAAAAA]">
          <Icon icon={Layers01Icon} size={22} />
        </div>
        <h3 className="text-base font-bold text-white mt-4">
          Completed Revision Reviews
        </h3>
        <p className="text-xs text-[#888888] max-w-md mx-auto mt-1 leading-relaxed">
          Completed reviews advance problems to longer retention intervals. You can inspect your milestone
          retention curve in the analytics rail.
        </p>
      </div>
    );
  }

  const isEmpty =
    (showOverdue ? overdueItems.length : 0) +
      (showDueToday ? dueTodayItems.length : 0) +
      (showUpcoming ? upcomingItems.length : 0) ===
    0;

  if (isEmpty) {
    return (
      <div className="p-12 text-center rounded-md border border-[#1A1A1A] bg-[#0A0A0A]">
        <div className="w-12 h-12 rounded-full bg-[#160808] border border-[#331111] flex items-center justify-center mx-auto text-[#FF0000]">
          <Icon icon={Calendar03Icon} size={22} />
        </div>
        <h3 className="text-base font-bold text-white mt-4">
          All Caught Up
        </h3>
        <p className="text-xs text-[#888888] max-w-md mx-auto mt-1 leading-relaxed">
          No problems currently due for review. Solve new problems in DSA Practice to add to your spaced repetition queue.
        </p>
        <div className="mt-6">
          <Link
            href="/practice/dsa"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#FF0000] hover:bg-[#CC0000] rounded transition-colors"
          >
            <span>Practice DSA Problems</span>
            <Icon icon={ArrowUpRight01Icon} size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Overdue Section */}
      {showOverdue && overdueItems.length > 0 && (
        <section aria-labelledby="overdue-heading" className="space-y-3">
          <div className="flex items-center gap-2">
            <Icon icon={Clock01Icon} size={16} className="text-[#FF0000]" />
            <h2 id="overdue-heading" className="text-sm font-bold text-[#FF0000] font-mono tracking-wide">
              Overdue · {overdueItems.length}
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-3.5">
            {overdueItems.map((item) => (
              <RevisionRow
                key={item.id}
                item={item}
                onReview={onReview}
                onSnooze={onSnooze}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. Due Today Section */}
      {showDueToday && dueTodayItems.length > 0 && (
        <section aria-labelledby="due-today-heading" className="space-y-3">
          <div className="flex items-center gap-2">
            <Icon icon={Calendar03Icon} size={16} className="text-[#EDEDED]" />
            <h2 id="due-today-heading" className="text-sm font-bold text-white font-mono tracking-wide">
              Due Today · <span className="text-[#FF0000]">{dueTodayItems.length}</span>
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-3.5">
            {dueTodayItems.map((item) => (
              <RevisionRow
                key={item.id}
                item={item}
                onReview={onReview}
                onSnooze={onSnooze}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. Upcoming Section (Date Accordions) */}
      {showUpcoming && upcomingByDate.size > 0 && (
        <section aria-labelledby="upcoming-heading" className="space-y-3">
          <div className="flex items-center gap-2">
            <Icon icon={Layers01Icon} size={16} className="text-[#888888]" />
            <h2 id="upcoming-heading" className="text-sm font-bold text-[#CCCCCC] font-mono tracking-wide">
              Upcoming
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-3.5">
            {Array.from(upcomingByDate.entries()).map(([dateLabel, groupItems]) => {
              const isExpanded = expandedDates[dateLabel] ?? false;
              return (
                <div
                  key={dateLabel}
                  className="rounded-lg border border-[#1C1C1C] bg-[#0A0A0A] overflow-hidden transition-all shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(dateLabel)}
                    className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-[#121212] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <Icon
                        icon={isExpanded ? ArrowDown01Icon : ArrowRight01Icon}
                        size={14}
                        className="text-[#666666]"
                      />
                      <span className="font-mono text-xs sm:text-[13px] font-semibold text-white">
                        {dateLabel} ·{" "}
                        <span className="text-[#888888]">{groupItems.length}</span>
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-[#666666] hover:text-[#999999] transition-colors">
                      {isExpanded ? "Collapse" : "Expand"}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="p-3.5 sm:p-4.5 lg:p-5 pt-3.5 sm:pt-4.5 space-y-3 sm:space-y-3.5 border-t border-[#161616] bg-[#050505]/60">
                      {groupItems.map((item) => (
                        <RevisionRow
                          key={item.id}
                          item={item}
                          onReview={onReview}
                          onSnooze={onSnooze}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

