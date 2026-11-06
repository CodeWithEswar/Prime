"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  VideoReplayIcon,
  CodeCircleIcon,
  Note01Icon,
  ChartLineData02Icon,
  BookOpen01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Menu01Icon,
  SidebarLeftIcon,
  LinkSquare02Icon,
  CheckmarkCircle01Icon,
  Bookmark01Icon,
  Calendar01Icon,
  Time02Icon,
  Search01Icon,
  Task01Icon,
  Tick02Icon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LessonNotesEditor } from "@/features/dsa-playlists/components/lesson-notes-editor";
import { AddToPlanDialog } from "@/features/dsa-playlists/components/add-to-plan-dialog";
import { CreateRevisionDialog } from "@/features/dsa-playlists/components/create-revision-dialog";
import { cn } from "@/lib/utils";
import type {
  KunalBootcampDetail,
  KunalModuleDetail,
  KunalVideoItem,
  KunalChapterItem,
  KunalAssignmentItem,
  KunalProblemItem,
  AssignmentStatus,
} from "../types";
import {
  enrollInKunalBootcampAction,
  markKunalLessonCompletedAction,
  markKunalLessonIncompleteAction,
  toggleKunalChapterCompletedAction,
  updateKunalAssignmentStatusAction,
  saveKunalLessonNotesAction,
  toggleKunalLessonBookmarkAction,
  toggleKunalProblemSolvedAction,
} from "../server/kunal-actions";

interface KunalWorkspaceProps {
  initialDetail: KunalBootcampDetail;
}

export function KunalWorkspace({ initialDetail }: KunalWorkspaceProps) {
  const router = useRouter();

  // Active module & video selection
  const [activeModuleSlug, setActiveModuleSlug] = React.useState(initialDetail.activeModule.slug);
  const [activeVideoId, setActiveVideoId] = React.useState(initialDetail.activeVideo.youtubeVideoId);
  const [currentSeekSeconds, setCurrentSeekSeconds] = React.useState<number | null>(null);

  // Optimistic tracking states
  const [completedVideoIds, setCompletedVideoIds] = React.useState<Set<string>>(() => {
    const set = new Set<string>();
    initialDetail.modules.forEach((m) =>
      m.videos.forEach((v) => {
        if (v.isCompleted) set.add(v.youtubeVideoId);
      })
    );
    return set;
  });

  const [bookmarkedVideoIds, setBookmarkedVideoIds] = React.useState<Set<string>>(() => {
    const set = new Set<string>();
    initialDetail.modules.forEach((m) =>
      m.videos.forEach((v) => {
        if (v.isBookmarked) set.add(v.youtubeVideoId);
      })
    );
    return set;
  });

  const [completedChapterIds, setCompletedChapterIds] = React.useState<Set<string>>(() => {
    const set = new Set<string>();
    initialDetail.modules.forEach((m) =>
      m.videos.forEach((v) =>
        v.chapters.forEach((c) => {
          if (c.isCompleted) set.add(c.id);
        })
      )
    );
    return set;
  });

  const [assignmentStatuses, setAssignmentStatuses] = React.useState<Map<string, AssignmentStatus>>(() => {
    const map = new Map<string, AssignmentStatus>();
    initialDetail.modules.forEach((m) =>
      m.assignments.forEach((a) => {
        map.set(a.slug, a.status);
      })
    );
    return map;
  });

  const [solvedProblemSlugs, setSolvedProblemSlugs] = React.useState<Set<string>>(() => {
    const set = new Set<string>();
    initialDetail.modules.forEach((m) =>
      m.problems.forEach((p) => {
        if (p.status === "solved") set.add(p.slug);
      })
    );
    return set;
  });

  // UI state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [scheduleModalOpen, setScheduleModalOpen] = React.useState(false);
  const [revisionModalOpen, setRevisionModalOpen] = React.useState(false);
  const [isEnrolled, setIsEnrolled] = React.useState(initialDetail.isEnrolled);
  const [isPending, startTransition] = React.useTransition();

  // Find active module & video
  const activeModule =
    initialDetail.modules.find((m) => m.slug === activeModuleSlug) || initialDetail.modules[0];
  const activeVideo =
    activeModule.videos.find((v) => v.youtubeVideoId === activeVideoId) ||
    activeModule.videos[0] ||
    initialDetail.activeVideo;

  // Next / Prev video navigation across modules
  const allVideos = React.useMemo(() => {
    return initialDetail.modules.flatMap((m) =>
      m.videos.map((v) => ({ ...v, moduleSlug: m.slug }))
    );
  }, [initialDetail.modules]);

  const currentGlobalIndex = allVideos.findIndex((v) => v.youtubeVideoId === activeVideo.youtubeVideoId);
  const hasPrevious = currentGlobalIndex > 0;
  const hasNext = currentGlobalIndex < allVideos.length - 1;

  const handleSelectVideo = (youtubeVideoId: string, moduleSlug: string, seekSeconds?: number) => {
    setActiveVideoId(youtubeVideoId);
    setActiveModuleSlug(moduleSlug);
    if (seekSeconds !== undefined) {
      setCurrentSeekSeconds(seekSeconds);
    } else {
      setCurrentSeekSeconds(null);
    }

    window.history.replaceState(
      null,
      "",
      `/practice/dsa/playlists/kunal-kushwaha?topic=${moduleSlug}&v=${youtubeVideoId}${
        seekSeconds ? `&t=${seekSeconds}` : ""
      }`
    );
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      const prev = allVideos[currentGlobalIndex - 1];
      handleSelectVideo(prev.youtubeVideoId, prev.moduleSlug);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const next = allVideos[currentGlobalIndex + 1];
      handleSelectVideo(next.youtubeVideoId, next.moduleSlug);
    }
  };

  // Video watch toggle
  const isCurrentVideoCompleted = completedVideoIds.has(activeVideo.youtubeVideoId);
  const handleToggleWatched = async () => {
    const nextState = !isCurrentVideoCompleted;
    setCompletedVideoIds((prev) => {
      const copy = new Set(prev);
      if (nextState) copy.add(activeVideo.youtubeVideoId);
      else copy.delete(activeVideo.youtubeVideoId);
      return copy;
    });

    startTransition(async () => {
      if (nextState) {
        await markKunalLessonCompletedAction(activeVideo.youtubeVideoId);
        toast.success(`Marked "${activeVideo.title}" as completed`);
      } else {
        await markKunalLessonIncompleteAction(activeVideo.youtubeVideoId);
        toast.info(`Marked "${activeVideo.title}" as incomplete`);
      }
    });
  };

  // Bookmark toggle
  const isCurrentVideoBookmarked = bookmarkedVideoIds.has(activeVideo.youtubeVideoId);
  const handleToggleBookmark = async () => {
    const nextState = !isCurrentVideoBookmarked;
    setBookmarkedVideoIds((prev) => {
      const copy = new Set(prev);
      if (nextState) copy.add(activeVideo.youtubeVideoId);
      else copy.delete(activeVideo.youtubeVideoId);
      return copy;
    });

    startTransition(async () => {
      await toggleKunalLessonBookmarkAction(activeVideo.youtubeVideoId);
      toast.success(nextState ? "Added to bookmarks" : "Removed from bookmarks");
    });
  };

  // Chapter completion toggle
  const handleToggleChapter = async (chapterId: string, currentCompleted: boolean) => {
    const next = !currentCompleted;
    setCompletedChapterIds((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(chapterId);
      else copy.delete(chapterId);
      return copy;
    });

    startTransition(async () => {
      await toggleKunalChapterCompletedAction(chapterId, next);
    });
  };

  // Assignment status update
  const handleUpdateAssignmentStatus = async (slug: string, status: AssignmentStatus) => {
    setAssignmentStatuses((prev) => {
      const copy = new Map(prev);
      copy.set(slug, status);
      return copy;
    });

    startTransition(async () => {
      await updateKunalAssignmentStatusAction(slug, status);
      toast.success(`Updated assignment status to ${status.replace("_", " ")}`);
    });
  };

  // Problem solve toggle
  const handleToggleProblem = async (slug: string, currentSolved: boolean) => {
    const next = !currentSolved;
    setSolvedProblemSlugs((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(slug);
      else copy.delete(slug);
      return copy;
    });

    startTransition(async () => {
      await toggleKunalProblemSolvedAction(slug, next);
      toast.success(next ? "Problem marked as solved!" : "Problem marked as attempted");
    });
  };

  // Enrollment
  const handleEnroll = async () => {
    startTransition(async () => {
      const res = await enrollInKunalBootcampAction();
      if (res.success) {
        setIsEnrolled(true);
        toast.success("Enrolled in Java + DSA Bootcamp!");
      } else {
        toast.error("Failed to enroll in course.");
      }
    });
  };

  // Filtered modules
  const filteredModules = React.useMemo(() => {
    if (!searchQuery.trim()) return initialDetail.modules;
    const q = searchQuery.toLowerCase().trim();
    return initialDetail.modules.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.videos.some((v) => v.title.toLowerCase().includes(q)) ||
        m.problems.some((p) => p.title.toLowerCase().includes(q))
    );
  }, [initialDetail.modules, searchQuery]);

  // Overall counts
  const totalVids = initialDetail.course.videosCount;
  const completedVidsCount = completedVideoIds.size;
  const progressPct = totalVids > 0 ? Math.round((completedVidsCount / totalVids) * 100) : 0;

  // Render Sidebar
  const renderSidebar = () => (
    <div className="flex flex-col h-full bg-[#080808] border-r border-white/[0.08] select-none">
      {/* Search Bar */}
      <div className="p-3 border-b border-white/[0.08] space-y-2">
        <div className="relative">
          <Icon
            icon={Search01Icon}
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter modules, lectures, problems..."
            className="h-8 pl-8 text-xs font-mono bg-white/[0.03] border-white/10 text-white placeholder:text-neutral-500 rounded-lg focus-visible:ring-1 focus-visible:ring-[#FF0000]"
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 px-1">
          <span>{filteredModules.length} Modules</span>
          <span className="text-[#FF0000]">{completedVidsCount} / {totalVids} Done</span>
        </div>
      </div>

      {/* Modules & Lessons Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.05] scrollbar-thin scrollbar-thumb-white/10">
        {filteredModules.map((m) => {
          const isModuleActive = m.slug === activeModule.slug;
          const completedInMod = m.videos.filter((v) => completedVideoIds.has(v.youtubeVideoId)).length;
          const isModFinished = m.videos.length > 0 && completedInMod === m.videos.length;

          return (
            <div key={m.slug} className="group/mod">
              {/* Module Header */}
              <button
                type="button"
                onClick={() => {
                  setActiveModuleSlug(m.slug);
                  if (m.videos[0]) {
                    handleSelectVideo(m.videos[0].youtubeVideoId, m.slug);
                  }
                  setIsMobileSheetOpen(false);
                }}
                className={cn(
                  "w-full text-left p-3 transition-colors flex items-start justify-between gap-2",
                  isModuleActive
                    ? "bg-white/[0.06] text-white"
                    : "hover:bg-white/[0.02] text-neutral-300"
                )}
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
                    <span>Step {m.stepNumber}</span>
                    <span>•</span>
                    <span>{m.videos.length} vids</span>
                    {m.assignmentsCount > 0 && <span>• {m.assignmentsCount} assignments</span>}
                  </div>
                  <div className="font-semibold text-xs leading-snug truncate text-white">
                    {m.title}
                  </div>
                </div>

                <div className="shrink-0 flex items-center pt-0.5">
                  {isModFinished ? (
                    <Icon icon={CheckmarkCircle01Icon} size={15} className="text-emerald-500" />
                  ) : (
                    <span className="font-mono text-[10px] text-neutral-500">
                      {completedInMod}/{m.videos.length}
                    </span>
                  )}
                </div>
              </button>

              {/* Video List inside active or selected module */}
              {(isModuleActive || searchQuery.trim().length > 0) && (
                <div className="pl-4 pr-2 py-1 bg-black/40 border-t border-white/[0.04] space-y-0.5 font-mono text-xs">
                  {m.videos.map((v) => {
                    const isVidActive = v.youtubeVideoId === activeVideo.youtubeVideoId;
                    const isVidCompleted = completedVideoIds.has(v.youtubeVideoId);

                    return (
                      <button
                        key={v.youtubeVideoId}
                        type="button"
                        onClick={() => {
                          handleSelectVideo(v.youtubeVideoId, m.slug);
                          setIsMobileSheetOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between gap-2 text-[11px] transition-all",
                          isVidActive
                            ? "bg-[#FF0000]/15 text-white font-semibold border border-[#FF0000]/30"
                            : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={cn("shrink-0", isVidCompleted ? "text-emerald-500" : "text-neutral-600")}>
                            {isVidCompleted ? "✓" : `${v.position}.`}
                          </span>
                          <span className="truncate">{v.title}</span>
                        </div>
                        <span className="shrink-0 text-[10px] text-neutral-500">
                          {v.durationFormatted}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 1. Course Header Banner */}
      <div className="p-4 sm:p-6 rounded-xl bg-[#080808] border border-white/[0.08] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono">
              <Link
                href="/practice/dsa/playlists"
                className="text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <Icon icon={ArrowLeft01Icon} size={14} className="text-[#FF0000]" />
                <span>DSA Curated Tracks</span>
              </Link>
              <span className="text-neutral-600">/</span>
              <span className="text-[#FF0000] font-bold">KUNAL KUSHWAHA</span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {initialDetail.course.title}
              </h1>
              <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-neutral-400">
                {initialDetail.course.programmingLanguage}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono border-[#FF0000]/30 text-[#FF0000] bg-[#FF0000]/10">
                Official Syllabus
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-neutral-400 max-w-3xl leading-relaxed">
              {initialDetail.course.description}
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {!isEnrolled ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleEnroll}
                disabled={isPending}
                className="h-8 px-4 text-xs font-mono bg-[#FF0000] hover:bg-[#CC0000] text-white shadow-lg shadow-red-950/40"
              >
                Enroll in Track
              </Button>
            ) : (
              <Badge variant="outline" className="h-8 px-3 font-mono text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10 gap-1.5">
                <Icon icon={Tick02Icon} size={13} />
                <span>Enrolled</span>
              </Badge>
            )}

            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 px-3 text-xs font-mono border-white/10 bg-white/[0.04] text-neutral-200 hover:text-white hover:bg-white/[0.08] gap-1.5"
            >
              <Link href="/practice/dsa/playlists/kunal-kushwaha/analytics">
                <Icon icon={ChartLineData02Icon} size={14} className="text-[#FF0000]" />
                <span>View Dedicated Analytics</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Progress Rail (Videos, Problems, Assignments) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/[0.06] font-mono text-xs">
          <div className="space-y-1.5">
            <div className="flex justify-between text-neutral-400 text-[11px]">
              <span>Lectures Progress</span>
              <span className="text-white font-bold">{completedVidsCount} / {totalVids} ({progressPct}%)</span>
            </div>
            <Progress value={progressPct} className="h-1 bg-white/[0.06] [&>div]:bg-[#FF0000]" />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-neutral-400 text-[11px]">
              <span>Problems Solved</span>
              <span className="text-white font-bold">
                {solvedProblemSlugs.size} / {initialDetail.course.totalProblemsCount}
              </span>
            </div>
            <Progress
              value={Math.round((solvedProblemSlugs.size / initialDetail.course.totalProblemsCount) * 100)}
              className="h-1 bg-white/[0.06] [&>div]:bg-[#FF0000]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-neutral-400 text-[11px]">
              <span>Assignments</span>
              <span className="text-white font-bold">
                {Array.from(assignmentStatuses.values()).filter((s) => s === "completed").length} /{" "}
                {initialDetail.course.assignmentsCount}
              </span>
            </div>
            <Progress
              value={Math.round(
                (Array.from(assignmentStatuses.values()).filter((s) => s === "completed").length /
                  initialDetail.course.assignmentsCount) *
                  100
              )}
              className="h-1 bg-white/[0.06] [&>div]:bg-[#FF0000]"
            />
          </div>
        </div>
      </div>

      {/* 2. Main Workspace Layout (Sidebar + Video & Tabs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Sidebar Toggle & Container */}
        {!isSidebarCollapsed && (
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 rounded-xl border border-white/[0.08] overflow-hidden h-[820px] sticky top-6">
            {renderSidebar()}
          </div>
        )}

        {/* Main Content Pane */}
        <div className={cn("space-y-4", isSidebarCollapsed ? "lg:col-span-12" : "lg:col-span-8 xl:col-span-9")}>
          {/* Controls Bar above video */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#080808] border border-white/[0.08]">
            {/* Mobile Sheet Trigger + Desktop collapse */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileSheetOpen(true)}
                className="lg:hidden h-7 px-2 text-xs font-mono border-white/10 bg-white/[0.04] text-neutral-300 gap-1.5"
              >
                <Icon icon={Menu01Icon} size={14} />
                <span>Syllabus</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:flex h-7 px-2 text-xs font-mono text-neutral-400 hover:text-white gap-1.5"
                title={isSidebarCollapsed ? "Expand syllabus" : "Collapse syllabus"}
              >
                <Icon icon={SidebarLeftIcon} size={14} />
                <span>{isSidebarCollapsed ? "Show Syllabus" : "Hide"}</span>
              </Button>
            </div>

            {/* Video Prev / Next / Complete Actions */}
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={!hasPrevious}
                className="h-7 px-2.5 text-xs border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white disabled:opacity-30"
              >
                <Icon icon={ArrowLeft01Icon} size={13} />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleWatched}
                className={cn(
                  "h-7 px-3 text-xs border transition-all gap-1.5 font-semibold",
                  isCurrentVideoCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                    : "bg-[#FF0000] border-[#FF0000] text-white hover:bg-[#CC0000]"
                )}
              >
                <Icon icon={isCurrentVideoCompleted ? CheckmarkCircle01Icon : PlayIcon} size={13} />
                <span>{isCurrentVideoCompleted ? "Completed" : "Mark Watched"}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={!hasNext}
                className="h-7 px-2.5 text-xs border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white disabled:opacity-30"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <Icon icon={ArrowRight01Icon} size={13} />
              </Button>
            </div>
          </div>

          {/* YouTube Video Player */}
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/[0.08] shadow-2xl relative">
            <iframe
              key={`${activeVideo.youtubeVideoId}-${currentSeekSeconds ?? 0}`}
              src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeVideoId}?autoplay=0&rel=0&modestbranding=1${
                currentSeekSeconds ? `&start=${currentSeekSeconds}` : ""
              }`}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>

          {/* Video Metadata & Tooling Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-[#080808] border border-white/[0.08]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-500">
                <span>Lecture {activeVideo.position} of {totalVids}</span>
                <span>•</span>
                <span>{activeVideo.durationFormatted}</span>
                <span>•</span>
                <span className="text-[#FF0000] uppercase font-semibold">{activeModule.title}</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-snug">
                {activeVideo.title}
              </h2>
            </div>

            {/* Quick Actions (Bookmark, Add to Plan, Revision) */}
            <div className="flex items-center gap-1.5 font-mono text-xs shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleBookmark}
                className={cn(
                  "h-7 px-2 text-xs border-white/10 bg-white/[0.04]",
                  isCurrentVideoBookmarked ? "text-[#FF0000] border-[#FF0000]/30" : "text-neutral-400 hover:text-white"
                )}
                title="Bookmark lecture"
              >
                <Icon icon={Bookmark01Icon} size={13} />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setScheduleModalOpen(true)}
                className="h-7 px-2.5 text-xs border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white gap-1"
              >
                <Icon icon={Calendar01Icon} size={13} className="text-[#FF0000]" />
                <span>Add to Plan</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setRevisionModalOpen(true)}
                className="h-7 px-2.5 text-xs border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white gap-1"
              >
                <Icon icon={Time02Icon} size={13} className="text-[#FF0000]" />
                <span>Revision</span>
              </Button>
            </div>
          </div>

          {/* 3. Workspace Interactive Tabs: Chapters, Assignments, Problems, Notes */}
          <Tabs defaultValue="chapters" className="w-full space-y-4">
            <TabsList className="bg-[#080808] border border-white/[0.08] p-1 font-mono text-xs w-full justify-start overflow-x-auto">
              <TabsTrigger value="chapters" className="data-[state=active]:bg-white/[0.12] data-[state=active]:text-white text-neutral-400 gap-1.5 text-xs">
                <Icon icon={PlayIcon} size={13} />
                <span>Chapters ({activeVideo.chapters.length})</span>
              </TabsTrigger>
              <TabsTrigger value="assignments" className="data-[state=active]:bg-white/[0.12] data-[state=active]:text-white text-neutral-400 gap-1.5 text-xs">
                <Icon icon={Task01Icon} size={13} />
                <span>Assignments ({activeModule.assignments.length})</span>
              </TabsTrigger>
              <TabsTrigger value="problems" className="data-[state=active]:bg-white/[0.12] data-[state=active]:text-white text-neutral-400 gap-1.5 text-xs">
                <Icon icon={CodeCircleIcon} size={13} />
                <span>Problems ({activeModule.problems.length})</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-white/[0.12] data-[state=active]:text-white text-neutral-400 gap-1.5 text-xs">
                <Icon icon={Note01Icon} size={13} />
                <span>Lesson Notes</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Timestamp-Level Chapters */}
            <TabsContent value="chapters" className="space-y-2">
              <div className="p-4 rounded-xl bg-[#080808] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400 border-b border-white/[0.06] pb-2">
                  <span>Timestamp-Level Lesson Chapters</span>
                  <span className="text-[#FF0000]">{activeVideo.chapters.length} Verified Segments</span>
                </div>

                {activeVideo.chapters.length === 0 ? (
                  <p className="text-xs font-mono text-neutral-500 py-4 text-center">
                    This master lecture covers a continuous concept progression. Use the video timeline to navigate.
                  </p>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {activeVideo.chapters.map((ch, idx) => {
                      const isChDone = completedChapterIds.has(ch.id);
                      return (
                        <div
                          key={ch.id}
                          className="py-2.5 flex items-center justify-between gap-3 text-xs font-mono group hover:bg-white/[0.02] px-2 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => handleToggleChapter(ch.id, isChDone)}
                              className={cn(
                                "h-4 w-4 rounded-xs border flex items-center justify-center text-[10px] transition-colors shrink-0",
                                isChDone
                                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                  : "border-white/20 text-transparent hover:border-white/50"
                              )}
                              title={isChDone ? "Mark incomplete" : "Mark chapter done"}
                            >
                              ✓
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setCurrentSeekSeconds(ch.startSeconds);
                                window.history.replaceState(
                                  null,
                                  "",
                                  `/practice/dsa/playlists/kunal-kushwaha?topic=${activeModule.slug}&v=${activeVideo.youtubeVideoId}&t=${ch.startSeconds}`
                                );
                              }}
                              className="text-left font-medium text-neutral-200 hover:text-white truncate"
                            >
                              {ch.title}
                            </button>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-neutral-400 border border-white/[0.08]">
                              {ch.timestampFormatted}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 2: Official Course Assignments */}
            <TabsContent value="assignments" className="space-y-3">
              {activeModule.assignments.length === 0 ? (
                <div className="p-8 rounded-xl bg-[#080808] border border-white/[0.08] text-center space-y-2">
                  <p className="text-xs font-mono text-neutral-400">
                    No dedicated assignment file for this module. Focus on the practice problems and video walkthroughs!
                  </p>
                </div>
              ) : (
                activeModule.assignments.map((assign) => {
                  const currentStatus = assignmentStatuses.get(assign.slug) || assign.status;
                  return (
                    <div
                      key={assign.slug}
                      className="p-4 sm:p-5 rounded-xl bg-[#080808] border border-white/[0.08] space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-[10px] border-[#FF0000]/30 text-[#FF0000] bg-[#FF0000]/10">
                              Official Assignment #{assign.number}
                            </Badge>
                            <a
                              href={assign.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-mono text-neutral-400 hover:text-white flex items-center gap-1"
                            >
                              <span>GitHub Raw</span>
                              <Icon icon={LinkSquare02Icon} size={11} />
                            </a>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-white">
                            {assign.title}
                          </h3>
                        </div>

                        {/* Status Selector */}
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          {(["not_started", "in_progress", "completed", "revisit"] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleUpdateAssignmentStatus(assign.slug, st)}
                              className={cn(
                                "px-2 py-1 rounded text-[10px] uppercase font-bold transition-all border",
                                currentStatus === st
                                  ? st === "completed"
                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                    : st === "in_progress"
                                    ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                                    : st === "revisit"
                                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                                    : "bg-white/10 text-white border-white/20"
                                  : "bg-transparent text-neutral-500 border-white/[0.06] hover:text-neutral-300"
                              )}
                            >
                              {st.replace("_", " ")}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tasks list if available */}
                      {assign.tasks.length > 0 && (
                        <div className="space-y-1.5 font-mono text-xs">
                          <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                            Core Tasks & Implementations:
                          </span>
                          <div className="space-y-1 pl-1">
                            {assign.tasks.map((t) => (
                              <div key={t.number} className="flex items-start gap-2 text-neutral-300 text-[11px]">
                                <span className="text-[#FF0000]">{t.number}.</span>
                                <span>{t.task}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Problems in this assignment */}
                      {assign.problems.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 font-semibold">
                            Associated LeetCode Problems ({assign.problems.length}):
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
                            {assign.problems.map((prob) => {
                              const isSolved = solvedProblemSlugs.has(prob.slug);
                              return (
                                <div
                                  key={prob.slug}
                                  className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-2 hover:bg-white/[0.04] transition-colors"
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleProblem(prob.slug, isSolved)}
                                      className={cn(
                                        "h-4 w-4 rounded-xs border flex items-center justify-center text-[10px] transition-colors shrink-0",
                                        isSolved
                                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                          : "border-white/20 text-transparent hover:border-white/50"
                                      )}
                                      title={isSolved ? "Mark as unsolved" : "Mark as solved"}
                                    >
                                      ✓
                                    </button>
                                    <a
                                      href={prob.leetcodeUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="truncate hover:text-[#FF0000] text-neutral-200"
                                    >
                                      {prob.title}
                                    </a>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span
                                      className={cn(
                                        "text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border",
                                        prob.difficulty === "easy"
                                          ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                                          : prob.difficulty === "medium"
                                          ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                                          : "text-rose-400 border-rose-500/30 bg-rose-500/10"
                                      )}
                                    >
                                      {prob.difficulty}
                                    </span>
                                    <a
                                      href={prob.leetcodeUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-neutral-500 hover:text-white"
                                    >
                                      <Icon icon={LinkSquare02Icon} size={12} />
                                    </a>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </TabsContent>

            {/* TAB 3: Shared Canonical Problems */}
            <TabsContent value="problems" className="space-y-3">
              <div className="p-4 rounded-xl bg-[#080808] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400 border-b border-white/[0.06] pb-2">
                  <span>Canonical Practice Problems for {activeModule.title}</span>
                  <span className="text-[#FF0000]">
                    {activeModule.problems.filter((p) => solvedProblemSlugs.has(p.slug)).length} /{" "}
                    {activeModule.problems.length} Solved
                  </span>
                </div>

                {activeModule.problems.length === 0 ? (
                  <p className="text-xs font-mono text-neutral-500 py-6 text-center">
                    No coding problems explicitly assigned to this module. Check the Assignments tab!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 font-mono text-xs">
                    {activeModule.problems.map((prob) => {
                      const isSolved = solvedProblemSlugs.has(prob.slug);
                      return (
                        <div
                          key={prob.slug}
                          className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-3 hover:bg-white/[0.04] transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => handleToggleProblem(prob.slug, isSolved)}
                              className={cn(
                                "h-4 w-4 rounded-xs border flex items-center justify-center text-[10px] transition-colors shrink-0",
                                isSolved
                                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                  : "border-white/20 text-transparent hover:border-white/50"
                              )}
                              title={isSolved ? "Mark unsolved" : "Mark solved"}
                            >
                              ✓
                            </button>
                            <a
                              href={prob.leetcodeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="truncate hover:text-[#FF0000] text-neutral-200 font-medium"
                            >
                              {prob.title}
                            </a>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={cn(
                                "text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border",
                                prob.difficulty === "easy"
                                  ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                                  : prob.difficulty === "medium"
                                  ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                                  : "text-rose-400 border-rose-500/30 bg-rose-500/10"
                              )}
                            >
                              {prob.difficulty}
                            </span>
                            <a
                              href={prob.leetcodeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-neutral-500 hover:text-white"
                            >
                              <Icon icon={LinkSquare02Icon} size={12} />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 4: Lesson Notes */}
            <TabsContent value="notes">
              <LessonNotesEditor
                videoId={activeVideo.youtubeVideoId}
                initialNotes={activeVideo.notesContent || ""}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Mobile Syllabus Sheet */}
      <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
        <SheetContent side="left" className="p-0 w-80 bg-[#080808] border-r border-white/10 text-white">
          <SheetHeader className="p-4 border-b border-white/10">
            <SheetTitle className="text-sm font-mono text-white flex items-center justify-between">
              <span>Syllabus & Curriculum</span>
              <span className="text-xs text-[#FF0000]">{completedVidsCount}/{totalVids}</span>
            </SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100vh-65px)]">
            {renderSidebar()}
          </div>
        </SheetContent>
      </Sheet>

      {/* Add To Plan Dialog */}
      <AddToPlanDialog
        videoId={activeVideo.youtubeVideoId}
        title={activeVideo.title}
        durationSeconds={activeVideo.durationSeconds}
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
      />

      {/* Create Revision Dialog */}
      <CreateRevisionDialog
        videoId={activeVideo.youtubeVideoId}
        title={activeVideo.title}
        topicSlug={activeModule.slug}
        open={revisionModalOpen}
        onOpenChange={setRevisionModalOpen}
      />
    </div>
  );
}

