"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ArrowLeft01Icon,
  Analytics02Icon,
  CourseIcon,
  CheckmarkCircle01Icon,
  Time02Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { DSAAnalyticsData } from "../types";

interface PlaylistAnalyticsViewProps {
  analytics: DSAAnalyticsData;
}

export function PlaylistAnalyticsView({ analytics }: PlaylistAnalyticsViewProps) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-mono text-neutral-400 hover:text-white gap-1 p-0 hover:bg-transparent"
              asChild
            >
              <Link href="/practice/dsa/playlists">
                <Icon icon={ArrowLeft01Icon} size={14} />
                <span>DSA Playlists</span>
              </Link>
            </Button>
            <span className="text-neutral-600">/</span>
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF4D4D]">
              TELEMETRY & RETENTION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            DSA Playlist Learning Analytics
          </h1>
          <p className="text-sm text-neutral-400">
            Real-time execution telemetry across enrolled courses, lesson completion pacing, and topic retention.
          </p>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0A0A0A] space-y-1 font-mono">
          <span className="text-xs text-neutral-500 flex items-center gap-1.5">
            <Icon icon={CourseIcon} size={14} className="text-[#FF4D4D]" />
            Enrolled Tracks
          </span>
          <div className="text-2xl font-bold text-white">
            {analytics.enrolledPlaylistsCount}
          </div>
          <p className="text-[10px] text-neutral-500">Active placement curricula</p>
        </div>

        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0A0A0A] space-y-1 font-mono">
          <span className="text-xs text-neutral-500 flex items-center gap-1.5">
            <Icon icon={CheckmarkCircle01Icon} size={14} className="text-emerald-400" />
            Completed Lessons
          </span>
          <div className="text-2xl font-bold text-white">
            {analytics.completedLessonsCount}
          </div>
          <p className="text-[10px] text-neutral-500">Across all playlists</p>
        </div>

        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0A0A0A] space-y-1 font-mono">
          <span className="text-xs text-neutral-500 flex items-center gap-1.5">
            <Icon icon={SparklesIcon} size={14} className="text-amber-400" />
            Completed This Week
          </span>
          <div className="text-2xl font-bold text-white">
            {analytics.lessonsCompletedThisWeek}
          </div>
          <p className="text-[10px] text-neutral-500">Last 7 days momentum</p>
        </div>

        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0A0A0A] space-y-1 font-mono">
          <span className="text-xs text-neutral-500 flex items-center gap-1.5">
            <Icon icon={Time02Icon} size={14} className="text-blue-400" />
            Estimated Watch Time
          </span>
          <div className="text-2xl font-bold text-white">
            {Math.floor(analytics.totalWatchTimeEstimatedMinutes / 60)}h{" "}
            {analytics.totalWatchTimeEstimatedMinutes % 60}m
          </div>
          <p className="text-[10px] text-neutral-500">Verified video duration</p>
        </div>
      </div>

      {/* 3. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 7-Day Completion Activity */}
        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0A0A0A] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Icon icon={Analytics02Icon} size={14} className="text-[#FF4D4D]" />
              <span>Lessons Completed Per Day (Last 7 Days)</span>
            </h3>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.activityByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="dayLabel"
                  stroke="#555"
                  fontSize={11}
                  tickLine={false}
                  fontFamily="monospace"
                />
                <YAxis
                  stroke="#555"
                  fontSize={11}
                  tickLine={false}
                  fontFamily="monospace"
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded border border-white/10 bg-[#141414] p-2 text-xs font-mono text-white shadow-md">
                          <p className="text-neutral-400">{data.date}</p>
                          <p className="font-bold text-[#FF4D4D]">
                            {data.lessonsCompleted} lessons completed
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="lessonsCompleted" fill="#FF0000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Learning vs Practice Comparison */}
        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0A0A0A] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Icon icon={Analytics02Icon} size={14} className="text-emerald-400" />
              <span>Theory (Videos) vs Practice (Problems Solved)</span>
            </h3>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.learningVsPractice} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="topic"
                  stroke="#555"
                  fontSize={10}
                  tickLine={false}
                  fontFamily="monospace"
                />
                <YAxis
                  stroke="#555"
                  fontSize={11}
                  tickLine={false}
                  fontFamily="monospace"
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded border border-white/10 bg-[#141414] p-2 text-xs font-mono text-white shadow-md space-y-1">
                          <p className="font-bold text-white">{data.topic}</p>
                          <p className="text-[#FF4D4D]">
                            Videos: {data.lessonsWatched} watched
                          </p>
                          <p className="text-emerald-400">
                            Practice: {data.problemsSolved} solved
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="lessonsWatched" name="Videos" fill="#FF0000" radius={[4, 4, 0, 0]} />
                <Bar dataKey="problemsSolved" name="Problems" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Enrolled Playlist Progress Bars */}
      <div className="p-5 rounded-xl border border-white/[0.08] bg-[#0A0A0A] space-y-4">
        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
          Enrolled Tracks Progress
        </h3>

        {analytics.playlistProgress.length > 0 ? (
          <div className="space-y-4">
            {analytics.playlistProgress.map((pl) => (
              <div key={pl.slug} className="space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Link
                      href={`/practice/dsa/playlists/${pl.slug}`}
                      className="font-semibold text-white hover:text-[#FF4D4D] transition-colors truncate"
                    >
                      {pl.title}
                    </Link>
                    <span className="text-neutral-500 text-[10px]">· {pl.instructor}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-neutral-400 text-[11px]">
                      {pl.completed} / {pl.total}
                    </span>
                    <span className="text-[#FF4D4D] font-bold text-xs">
                      {pl.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-900">
                  <div
                    className={`h-full transition-all duration-500 ${
                      pl.percentage === 100 ? "bg-emerald-500" : "bg-[#FF0000]"
                    }`}
                    style={{ width: `${pl.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs font-mono text-neutral-500">
            No enrolled playlists yet. Explore the catalog and start a course!
          </div>
        )}
      </div>
    </div>
  );
}

