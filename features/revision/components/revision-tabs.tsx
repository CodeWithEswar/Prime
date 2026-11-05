"use client";

import { Icon } from "@/components/ui/icon";
import { FilterIcon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RevisionTab } from "../types";

interface RevisionTabsProps {
  activeTab: RevisionTab;
  onSelectTab: (tab: RevisionTab) => void;
  selectedTopic: string | null;
  onSelectTopic: (topicId: string | null) => void;
  topics: Array<{ id: string; name: string; count: number }>;
}

export function RevisionTabs({
  activeTab,
  onSelectTab,
  selectedTopic,
  onSelectTopic,
  topics,
}: RevisionTabsProps) {
  const tabs: Array<{ id: RevisionTab; label: string }> = [
    { id: "due_queue", label: "Due Queue" },
    { id: "upcoming", label: "Upcoming" },
    { id: "completed", label: "Completed" },
    { id: "all", label: "All" },
  ];

  const currentTopicName = selectedTopic
    ? topics.find((t) => t.id === selectedTopic)?.name || "Filtered Topic"
    : "All Topics";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1F1F1F]">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                isActive ? "text-white" : "text-[#777777] hover:text-[#CCCCCC]"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF0000] shadow-[0_0_8px_#FF0000]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Topic Filter Dropdown */}
      <div className="self-end sm:self-center pb-2 sm:pb-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#C2C2C2] hover:text-white bg-[#0A0A0A] border border-[#262626] hover:border-[#383838] rounded transition-colors"
            >
              <Icon icon={FilterIcon} size={14} className="text-[#888888]" />
              <span>{currentTopicName}</span>
              <Icon icon={ArrowDown01Icon} size={12} className="text-[#666666]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-[#0A0A0A] border-[#222222] text-[#E0E0E0]"
          >
            <DropdownMenuItem
              onClick={() => onSelectTopic(null)}
              className="flex items-center justify-between text-xs py-2 cursor-pointer focus:bg-[#1A1A1A] focus:text-white"
            >
              <span>All Topics</span>
              {!selectedTopic && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000]" />
              )}
            </DropdownMenuItem>
            {topics.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => onSelectTopic(t.id)}
                className="flex items-center justify-between text-xs py-2 cursor-pointer focus:bg-[#1A1A1A] focus:text-white"
              >
                <span className="truncate">{t.name}</span>
                <span className="font-mono text-[10px] text-[#777777] ml-2">
                  {t.count}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

