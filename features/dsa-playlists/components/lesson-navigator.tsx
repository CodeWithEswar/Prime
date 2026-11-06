"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search01Icon,
  Tick02Icon,
  PlayIcon,
  NoteIcon,
  Bookmark01Icon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import type { DSALessonItem } from "../types";

interface LessonNavigatorProps {
  lessons: DSALessonItem[];
  activeLessonId: string;
  onSelectLesson: (lesson: DSALessonItem) => void;
}

export function LessonNavigator({
  lessons,
  activeLessonId,
  onSelectLesson,
}: LessonNavigatorProps) {
  const [search, setSearch] = useState("");
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  const completedCount = useMemo(
    () => lessons.filter((l) => l.isCompleted).length,
    [lessons]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return lessons;
    const q = search.toLowerCase().trim();
    return lessons.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        String(l.position).includes(q) ||
        l.canonicalTopicSlug.toLowerCase().includes(q)
    );
  }, [lessons, search]);

  // Auto-scroll to active item on mount/switch
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeLessonId]);

  return (
    <div className="flex flex-col h-[520px] lg:h-[620px] rounded-xl border border-white/[0.08] bg-[#0A0A0A] overflow-hidden">
      {/* 1. Navigator Header */}
      <div className="p-3.5 border-b border-white/[0.08] bg-[#0E0E0E] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon={Layers01Icon} size={15} className="text-[#FF4D4D]" />
            <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
              Course Lessons
            </h3>
          </div>
          <span className="font-mono text-[11px] text-neutral-400">
            <span className="text-emerald-400 font-semibold">{completedCount}</span> /{" "}
            {lessons.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Icon
            icon={Search01Icon}
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter lessons by title or #..."
            className="h-7 pl-7 text-[11px] bg-black/60 border-white/[0.08] text-white font-mono placeholder:text-neutral-500"
          />
        </div>
      </div>

      {/* 2. Scrollable Lesson List */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-2 space-y-1">
        {filtered.map((l) => {
          const isActive = l.id === activeLessonId;
          return (
            <button
              key={l.id}
              ref={isActive ? activeItemRef : null}
              onClick={() => onSelectLesson(l)}
              className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-all flex items-start gap-2.5 group relative ${
                isActive
                  ? "bg-[#181818] border-l-2 border-l-[#FF0000] border-t border-r border-b border-white/[0.08] shadow-sm"
                  : "hover:bg-[#121212] border border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              {/* Status Indicator Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {l.isCompleted ? (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <Icon icon={Tick02Icon} size={10} />
                  </div>
                ) : isActive ? (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FF0000] text-white shadow-sm animate-pulse">
                    <Icon icon={PlayIcon} size={9} className="ml-0.5" />
                  </div>
                ) : (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full border border-neutral-700 text-[10px] text-neutral-500">
                    {l.position}
                  </div>
                )}
              </div>

              {/* Lesson Title & Details */}
              <div className="flex-1 min-w-0">
                <p
                  className={`line-clamp-2 leading-snug transition-colors ${
                    isActive
                      ? "text-white font-semibold"
                      : l.isCompleted
                      ? "text-neutral-400"
                      : "text-neutral-300 group-hover:text-white"
                  }`}
                >
                  {l.title}
                </p>

                <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-400">
                  <span>{l.durationFormatted}</span>
                  {l.hasNotes && (
                    <span className="flex items-center gap-0.5 text-amber-400/80">
                      <Icon icon={NoteIcon} size={10} />
                      <span>Note</span>
                    </span>
                  )}
                  {l.isBookmarked && (
                    <span className="text-amber-400">
                      <Icon icon={Bookmark01Icon} size={10} />
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-6 text-center text-xs text-neutral-500 font-mono">
            No lessons match "{search}"
          </div>
        )}
      </div>
    </div>
  );
}

