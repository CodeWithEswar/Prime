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
import { KunalTopicNavigator } from "./kunal-topic-navigator";
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
  const [activeTab, setActiveTab] = React.useState<"chapters" | "assignments" | "problems" | "notes">("chapters");
  const [scheduleModalOpen, setScheduleModalOpen] = React.useState(false);
  const [revisionModalOpen, setRevisionModalOpen] = React.useState(false);
  const [isEnrolled, setIsEnrolled] = React.useState(initialDetail.isEnrolled);
  const [isPending, startTransition] = React.useTransition();

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle syllabus sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const handleResumeNext = () => {
    for (const v of allVideos) {
      if (!completedVideoIds.has(v.youtubeVideoId)) {
        handleSelectVideo(v.youtubeVideoId, v.moduleSlug);
        return;
      }
    }
    if (allVideos[0]) {
      handleSelectVideo(allVideos[0].youtubeVideoId, allVideos[0].moduleSlug);
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

  return (
    <div className="space-y-6">
      {/* 1. Global Sheet Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/20 font-bold">
              Official Track
            </span>
            <span className="font-mono text-xs text-neutral-500">
              Kunal Kushwaha
            </span>
          </div>
          <h1 className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-white">
            Java + DSA Bootcamp
          </h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-400 font-mono">
            <span>19 Modules</span>
            <span className="text-neutral-600">•</span>
            <span>69 Verified Lectures</span>
            <span className="text-neutral-600">•</span>
            <span>18 Assignments</span>
            <span className="text-neutral-600">•</span>
            <span>429 Problems</span>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          {/* Mobile Syllabus Sheet Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileSheetOpen(true)}
            className="lg:hidden h-8 px-2.5 sm:px-3 text-xs font-mono border-white/10 bg-white/[0.04] text-neutral-200 hover:text-white gap-1.5 justify-center"
            aria-label="Open syllabus navigation"
          >
            <Icon icon={Menu01Icon} size={14} />
            <span>Syllabus</span>
          </Button>

          {/* Desktop Sidebar Toggle Button */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                  className="hidden lg:inline-flex h-8 w-8 p-0 border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/[0.08]"
                  aria-label="Toggle Syllabus Sidebar (Ctrl+B)"
                >
                  <Icon icon={SidebarLeftIcon} size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-mono">
                {isSidebarCollapsed ? "Show Syllabus (Ctrl+B)" : "Hide Syllabus (Ctrl+B)"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 px-2.5 sm:px-3 text-xs font-mono border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/[0.08] gap-1.5 justify-center"
          >
            <Link href="/practice/dsa/playlists/kunal-kushwaha/analytics">
              <Icon icon={ChartLineData02Icon} size={13} className="text-[#FF0000]" />
              <span>Analytics</span>
            </Link>
          </Button>

          <Button
            size="sm"
            onClick={handleResumeNext}
            className="h-8 px-3 sm:px-3.5 text-xs font-mono font-medium bg-[#FF0000] hover:bg-[#CC0000] text-white gap-1.5 shadow-sm justify-center"
          >
            <span>Resume</span>
            <Icon icon={ArrowRight01Icon} size={13} />
          </Button>
        </div>
      </div>

      {/* 2. Adaptive Two-Column Workspace Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Desktop Collapsible Left Column: Syllabus Navigator */}
        <aside
          className={cn(
            "hidden lg:block shrink-0 transition-[width,opacity] duration-200 sticky top-20 h-[calc(100vh-140px)]",
            isSidebarCollapsed ? "w-0 opacity-0 overflow-hidden pointer-events-none" : "w-[310px] xl:w-[340px] opacity-100"
          )}
        >
          <KunalTopicNavigator
            modules={initialDetail.modules}
            activeModuleSlug={activeModule.slug}
            activeVideoId={activeVideo.youtubeVideoId}
            completedVideoIds={completedVideoIds}
            onSelectVideo={handleSelectVideo}
          />
        </aside>

        {/* Mobile Slide-Over Sheet: Syllabus Navigator */}
        <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
          <SheetContent side="left" className="w-[88vw] max-w-[360px] p-0 bg-[#090909] border-white/10 text-white">
            <SheetHeader className="sr-only">
              <SheetTitle>Kunal Kushwaha Syllabus Navigation</SheetTitle>
            </SheetHeader>
            <div className="h-full pt-12 pb-4 px-3">
              <KunalTopicNavigator
                modules={initialDetail.modules}
                activeModuleSlug={activeModule.slug}
                activeVideoId={activeVideo.youtubeVideoId}
                completedVideoIds={completedVideoIds}
                onSelectVideo={handleSelectVideo}
                onCloseMobile={() => setIsMobileSheetOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Column: Full-Width Workspace (expands to 100% when sidebar collapsed) */}
        <main className="flex-1 min-w-0 w-full space-y-4 sm:space-y-6">
          {/* Structured Current Lecture Header */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0A]/90 p-3.5 sm:p-5 backdrop-blur-md space-y-2.5 sm:space-y-3">
            {/* Breadcrumb Hierarchy */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono text-neutral-400 uppercase tracking-wider flex-wrap">
              <span className="text-white font-medium">
                Module {activeModule.stepNumber.toString().padStart(2, "0")}: {activeModule.title}
              </span>
              <span className="text-neutral-600">/</span>
              <span className="text-neutral-300">
                Lecture {activeVideo.position.toString().padStart(2, "0")}
              </span>
            </div>

            {/* Topic Title + Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start items-start justify-between gap-2.5 sm:gap-3">
              <h2 className="font-sans text-lg sm:text-xl lg:text-2xl font-bold text-white tracking-tight leading-snug break-words">
                {activeVideo.title}
              </h2>

              <div className="flex items-center gap-1.5 font-mono text-xs shrink-0 self-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleBookmark}
                  className={cn(
                    "h-8 px-2.5 text-xs border-white/10 bg-white/[0.04]",
                    isCurrentVideoBookmarked ? "text-[#FF0000] border-[#FF0000]/30" : "text-neutral-400 hover:text-white"
                  )}
                  title="Bookmark lecture"
                >
                  <Icon icon={Bookmark01Icon} size={14} />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScheduleModalOpen(true)}
                  className="h-8 px-2.5 text-xs border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white gap-1"
                >
                  <Icon icon={Calendar01Icon} size={13} className="text-[#FF0000]" />
                  <span>Add to Plan</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRevisionModalOpen(true)}
                  className="h-8 px-2.5 text-xs border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white gap-1"
                >
                  <Icon icon={Time02Icon} size={13} className="text-[#FF0000]" />
                  <span>Revision</span>
                </Button>
              </div>
            </div>

            {/* Metadata Summary Pill */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono text-neutral-400 pt-1 border-t border-white/[0.05]">
              <div className="flex items-center gap-1.5">
                <Icon icon={VideoReplayIcon} size={13} className="text-[#FF0000]" />
                <span>
                  <strong className="text-white">{activeVideo.durationFormatted}</strong> Duration
                </span>
              </div>
              <span className="text-neutral-700">•</span>
              <div className="flex items-center gap-1.5">
                <Icon icon={CodeCircleIcon} size={13} className="text-[#FF0000]" />
                <span>
                  <strong className="text-white">{activeModule.stats.solvedProblems}</strong> / {activeModule.problems.length} Solved
                </span>
              </div>
              <span className="text-neutral-700">•</span>
              <div className="flex items-center gap-1.5">
                <Icon icon={Task01Icon} size={13} className="text-[#FF0000]" />
                <span>
                  <strong className="text-white">{activeModule.assignments.length}</strong> {activeModule.assignments.length === 1 ? "Assignment" : "Assignments"}
                </span>
              </div>
            </div>
          </div>

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

          {/* 3. Workspace Interactive Tabs: Chapters, Assignments, Problems, Notes */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="w-full space-y-4"
          >
            <TabsList
              variant="line"
              className="w-full justify-start border-b border-white/[0.08] pb-px overflow-x-auto scrollbar-none flex-nowrap gap-4 sm:gap-6"
            >
              <TabsTrigger
                value="chapters"
                className="gap-2 text-xs font-mono py-2.5 shrink-0"
              >
                <Icon icon={PlayIcon} size={15} className="text-[#FF0000]" />
                <span>Chapters</span>
                <Badge
                  variant="outline"
                  className="ml-0.5 text-[10px] px-1.5 py-0 bg-white/[0.04] border-white/[0.08] text-neutral-400 font-mono"
                >
                  {activeVideo.chapters.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="assignments"
                className="gap-2 text-xs font-mono py-2.5 shrink-0"
              >
                <Icon icon={Task01Icon} size={15} className="text-[#FF0000]" />
                <span>Assignments</span>
                <Badge
                  variant="outline"
                  className="ml-0.5 text-[10px] px-1.5 py-0 bg-white/[0.04] border-white/[0.08] text-neutral-400 font-mono"
                >
                  {activeModule.assignments.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="problems"
                className="gap-2 text-xs font-mono py-2.5 shrink-0"
              >
                <Icon icon={CodeCircleIcon} size={15} className="text-[#FF0000]" />
                <span>Practice Problems</span>
                <Badge
                  variant="outline"
                  className="ml-0.5 text-[10px] px-1.5 py-0 bg-white/[0.04] border-white/[0.08] text-neutral-400 font-mono"
                >
                  {activeModule.problems.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger
                value="notes"
                className="gap-2 text-xs font-mono py-2.5 shrink-0"
              >
                <Icon icon={Note01Icon} size={15} className="text-[#FF0000]" />
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
        </main>
      </div>

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

