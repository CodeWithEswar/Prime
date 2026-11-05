"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Search01Icon, HelpCircleIcon } from "@hugeicons/core-free-icons";

export interface CourseInterviewQuestionItem {
  id: string;
  question: string;
  answer: string;
  importance: string;
  category: string;
}

export interface CourseInterviewDayItem {
  dayNumber: number;
  title: string;
  interviewQuestions: CourseInterviewQuestionItem[];
}

interface CourseInterviewBankProps {
  title: string;
  description: string;
  days: CourseInterviewDayItem[];
}

export function CourseInterviewBank({
  title,
  description,
  days,
}: CourseInterviewBankProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterImportance, setFilterImportance] = useState<string>("all");

  const totalQuestions = useMemo(() => {
    return days.reduce((sum, d) => sum + (d.interviewQuestions?.length || 0), 0);
  }, [days]);

  const filteredDays = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return days
      .map((d) => {
        const matchingQuestions = (d.interviewQuestions || []).filter((item) => {
          if (
            filterImportance !== "all" &&
            item.importance?.toLowerCase() !== filterImportance.toLowerCase()
          ) {
            return false;
          }
          if (!q) return true;
          return (
            item.question.toLowerCase().includes(q) ||
            item.answer.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
          );
        });
        return {
          ...d,
          matchingQuestions,
        };
      })
      .filter((d) => d.matchingQuestions.length > 0);
  }, [days, searchQuery, filterImportance]);

  return (
    <div className="space-y-6 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-4 sm:p-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1A1A1A] pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF0000]/10 text-[#FF4D4D] border border-[#FF0000]/20">
              <Icon icon={HelpCircleIcon} size={16} />
            </span>
            <h2 className="text-xl font-bold text-white sm:text-2xl">{title}</h2>
          </div>
          <p className="mt-1 text-xs text-[#888888] sm:text-sm">{description}</p>
        </div>
        <div className="rounded-lg border border-[#222222] bg-[#111111] px-3 py-1.5 font-mono text-xs text-[#AAAAAA] shrink-0">
          <span className="font-bold text-[#FF4D4D]">{totalQuestions}</span> interview questions
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon
            icon={Search01Icon}
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]"
          />
          <input
            type="text"
            placeholder="Search interview questions, answers, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#262626] bg-[#121212] py-2 pl-9 pr-3 text-xs text-white placeholder:text-[#555555] focus:border-[#FF0000] focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["all", "Critical", "High", "Medium"].map((imp) => (
            <button
              key={imp}
              type="button"
              onClick={() => setFilterImportance(imp)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors shrink-0 ${
                filterImportance === imp
                  ? "bg-[#FF0000] text-white"
                  : "border border-[#262626] bg-[#141414] text-[#888888] hover:text-white"
              }`}
            >
              {imp === "all" ? "All Priorities" : imp}
            </button>
          ))}
        </div>
      </div>

      {/* Days & Questions List */}
      <div className="space-y-8">
        {filteredDays.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#666666] italic border border-[#1F1F1F] rounded-lg">
            No interview questions match your current query or priority filter.
          </div>
        ) : (
          filteredDays.map((day) => (
            <div key={day.dayNumber} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-[#1A1A1A] pb-2">
                <span className="font-mono text-xs font-bold text-[#FF4D4D]">
                  Day {day.dayNumber}
                </span>
                <span className="text-sm font-semibold text-white">{day.title}</span>
                <span className="text-xs text-[#666666] font-mono">
                  ({day.matchingQuestions.length})
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {day.matchingQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-lg border border-[#222222] bg-[#111111] p-4 space-y-2 hover:border-[#333333] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                          q.importance === "Critical"
                            ? "bg-[#FF0000]/20 text-[#FF4D4D] border border-[#FF0000]/40"
                            : q.importance === "High"
                              ? "bg-[#FF0000]/15 text-[#FF6B6B]"
                              : "bg-white/5 text-[#AAAAAA]"
                        }`}
                      >
                        {q.importance}
                      </span>
                      <span className="text-[11px] text-[#666666] font-mono">
                        {q.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">
                      {q.question}
                    </h4>
                    <p className="text-xs leading-relaxed text-[#CCCCCC] whitespace-pre-line">
                      {q.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

