"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search01Icon,
  FilterIcon,
  Analytics02Icon,
  CourseIcon,
  Tick02Icon,
  PlayIcon,
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

        {/* Analytics Action */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3.5 text-xs font-mono font-medium text-neutral-300 hover:text-white bg-[#0A0A0A] hover:bg-[#141414] border-white/[0.1] hover:border-white/[0.2] gap-2 transition-all active:scale-[0.98]"
            asChild
          >
            <Link href="/practice/dsa/playlists/analytics">
              <Icon icon={Analytics02Icon} size={14} className="text-[#FF0000]" />
              <span>Learning Analytics</span>
            </Link>
          </Button>
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
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Icon
            icon={Search01Icon}
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search playlist, topic, or instructor (e.g. Striver, Binary Search, DP)..."
            className="pl-9 h-9 text-xs bg-black/50 border-white/[0.08] focus-visible:border-white/30 text-white placeholder:text-neutral-500 font-mono"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Instructor Filter */}
          <Select value={instructor} onValueChange={setInstructor}>
            <SelectTrigger className="h-9 text-xs w-[140px] bg-black/50 border-white/[0.08] text-neutral-300 font-mono">
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

          {/* Topic Filter */}
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger className="h-9 text-xs w-[140px] bg-black/50 border-white/[0.08] text-neutral-300 font-mono">
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

          {/* Status Filter */}
          <Select value={status} onValueChange={(val) => setStatus(val as PlaylistStatusFilter)}>
            <SelectTrigger className="h-9 text-xs w-[130px] bg-black/50 border-white/[0.08] text-neutral-300 font-mono">
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
              className="h-9 px-2 text-xs font-mono text-neutral-400 hover:text-white"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* 4. Playlists Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between font-mono text-xs text-neutral-400">
          <span>Showing {filteredPlaylists.length} of {playlists.length} Curated Courses</span>
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

