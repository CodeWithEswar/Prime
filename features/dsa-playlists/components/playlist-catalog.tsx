"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search01Icon,
  FilterIcon,
  CourseIcon,
  Tick02Icon,
  PlayIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DSAPlaylistSummary, PlaylistStatusFilter } from "../types";
import { PlaylistCard } from "./playlist-card";
import { ContinueLearningWidget } from "./continue-learning-widget";

interface PlaylistCatalogProps {
  playlists: DSAPlaylistSummary[];
  continueLearning: DSAPlaylistSummary | null;
}

export function PlaylistCatalog({ playlists, continueLearning }: PlaylistCatalogProps) {
  const [search, setSearch] = useState("");
  const [instructor, setInstructor] = useState("all");
  const [topic, setTopic] = useState("all");
  const [status, setStatus] = useState<PlaylistStatusFilter>("all");

  // Distinct instructors
  const instructors = useMemo(() => {
    const set = new Set(playlists.map((p) => p.instructor));
    return Array.from(set);
  }, [playlists]);

  // Distinct topics
  const topics = useMemo(() => {
    const set = new Set<string>();
    for (const p of playlists) {
      for (const t of p.topicTags) set.add(t);
    }
    return Array.from(set);
  }, [playlists]);

  // Filtered playlists
  const filteredPlaylists = useMemo(() => {
    return playlists.filter((pl) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitle = pl.title.toLowerCase().includes(q);
        const matchesInstructor = pl.instructor.toLowerCase().includes(q);
        const matchesFocus = pl.focus.toLowerCase().includes(q);
        const matchesTopic = pl.topicTags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesInstructor && !matchesFocus && !matchesTopic) return false;
      }

      // Instructor
      if (instructor !== "all" && pl.instructor !== instructor) return false;

      // Topic
      if (topic !== "all" && !pl.topicTags.includes(topic)) return false;

      // Status
      if (status === "enrolled" && !pl.isEnrolled) return false;
      if (status === "in_progress" && (!pl.isEnrolled || pl.progressPercentage === 0 || pl.progressPercentage === 100)) return false;
      if (status === "completed" && pl.progressPercentage !== 100) return false;
      if (status === "not_started" && pl.isEnrolled && pl.progressPercentage > 0) return false;

      return true;
    });
  }, [playlists, search, instructor, topic, status]);

  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#FF0000]" />
            <span className="font-mono text-xs uppercase tracking-wider text-neutral-400">
              PRIME CURATED TRACKS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            DSA Playlists & Learning Courses
          </h1>
          <p className="text-sm text-neutral-400 max-w-2xl">
            10 verified placement curriculum tracks by Striver, Kunal Kushwaha, Aditya Verma & Abdul Bari.
            Track lessons in order, record notes, and link directly to LeetCode practice questions.
          </p>
        </div>
      </div>

      {/* 2. Continue Learning Spotlight (if active enrollment exists) */}
      {continueLearning && continueLearning.isEnrolled && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Icon icon={PlayIcon} size={13} className="text-[#FF0000]" />
              <span>Continue Where You Left Off</span>
            </h2>
          </div>
          <ContinueLearningWidget playlist={continueLearning} />
        </section>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-3 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Icon
            icon={Search01Icon}
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search playlists, topics, instructors…"
            className="pl-9 pr-8 h-9 text-xs bg-black/60 border-white/[0.08] focus-visible:border-white/30 text-white placeholder:text-neutral-500 font-mono"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 rounded-xs transition-colors"
              aria-label="Clear search input"
            >
              <Icon icon={Cancel01Icon} size={12} />
            </button>
          )}
        </div>

        {/* Dropdown Filters: responsive grid on mobile, flex on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-center gap-2 w-full lg:w-auto">
          {/* Instructor Filter */}
          <div className="col-span-1 w-full lg:w-[155px]">
            <Select value={instructor} onValueChange={setInstructor}>
              <SelectTrigger className="h-9 text-xs w-full bg-black/60 border-white/[0.08] text-neutral-300 font-mono">
                <SelectValue placeholder="Instructor" />
              </SelectTrigger>
              <SelectContent className="bg-[#121212] border-white/10 text-neutral-200 font-mono text-xs">
                <SelectItem value="all">All Instructors</SelectItem>
                {instructors.map((ins) => (
                  <SelectItem key={ins} value={ins}>
                    {ins}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Topic Filter */}
          <div className="col-span-1 w-full lg:w-[145px]">
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger className="h-9 text-xs w-full bg-black/60 border-white/[0.08] text-neutral-300 font-mono">
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent className="bg-[#121212] border-white/10 text-neutral-200 font-mono text-xs">
                <SelectItem value="all">All Topics</SelectItem>
                {topics.map((t) => (
                  <SelectItem key={t} value={t}>
                    #{t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="col-span-2 sm:col-span-1 w-full lg:w-[135px]">
            <Select value={status} onValueChange={(val) => setStatus(val as PlaylistStatusFilter)}>
              <SelectTrigger className="h-9 text-xs w-full bg-black/60 border-white/[0.08] text-neutral-300 font-mono">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#121212] border-white/10 text-neutral-200 font-mono text-xs">
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="enrolled">Enrolled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset button if active filters */}
          {(search || instructor !== "all" || topic !== "all" || status !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setInstructor("all");
                setTopic("all");
                setStatus("all");
              }}
              className="col-span-2 sm:col-span-3 lg:col-span-auto h-9 px-3 text-xs font-mono text-neutral-400 hover:text-white border border-white/[0.08] lg:border-0 hover:bg-white/[0.06] transition-colors"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* 4. Playlists Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>Showing {filteredPlaylists.length} of {playlists.length} Curated Courses</span>
          </div>
          {(search || instructor !== "all" || topic !== "all" || status !== "all") && (
            <span className="text-[11px] font-mono text-[#FF0000]">Filters applied</span>
          )}
        </div>

        {filteredPlaylists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPlaylists.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-white/[0.08] bg-[#0A0A0A]">
            <Icon icon={CourseIcon} size={36} className="text-neutral-600 mb-3" />
            <h3 className="text-sm font-semibold text-white">No playlists match your filters</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Try clearing some filters or searching for another topic or instructor.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setInstructor("all");
                setTopic("all");
                setStatus("all");
              }}
              className="mt-4 text-xs font-mono border-white/10 text-neutral-300"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

