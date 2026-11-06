"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Folder01Icon,
  VideoReplayIcon,
  CodeCircleIcon,
  Note01Icon,
  ChartLineData02Icon,
  BookOpen01Icon,
  ArrowRight01Icon,
  Menu01Icon,
  SidebarLeftIcon,
  LinkSquare02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { StriverTopicNavigator } from "./striver-topic-navigator";
import { StriverVideoPlayer } from "./striver-video-player";
import { StriverProblemsTable } from "./striver-problems-table";
import { StriverProgressRail } from "./striver-progress-rail";
import { LessonNotesEditor } from "@/features/dsa-playlists/components/lesson-notes-editor";
import { cn } from "@/lib/utils";
import type {
  StriverSheetDetail,
  StriverTopicDetail,
  StriverVideoItem,
  StriverAnalyticsData,
} from "../types";

interface StriverWorkspaceProps {
  initialDetail: StriverSheetDetail;
  analytics: StriverAnalyticsData;
}

function getMasteryBadge(level: string) {
  switch (level) {
    case "proficient":
      return {
        label: "Mastery: Proficient",
        color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold",
        description: "All core problems solved independently and retained through review.",
      };
    case "developing":
      return {
        label: "Mastery: Developing",
        color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        description: "Problems solved independently. Continue reinforcing through spaced practice.",
      };
    case "practicing":
      return {
        label: "Mastery: Practicing",
        color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        description: "Problems attempted with editorial hints. Practice independently to level up.",
      };
    case "learning":
      return {
        label: "Mastery: Learning",
        color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
        description: "Lessons viewed. Begin solving practice problems to build mastery.",
      };
    default:
      return {
        label: "Not Assessed",
        color: "bg-neutral-800/80 text-neutral-400 border-neutral-700/80",
        description: "No practice problems attempted for this topic yet.",
      };
  }
}

export function StriverWorkspace({
  initialDetail,
  analytics,
}: StriverWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active topic & video selection
  const [activeTopicId, setActiveTopicId] = React.useState(initialDetail.activeTopicId);
  const [activeVideoId, setActiveVideoId] = React.useState<string | null>(
    initialDetail.activeVideoId ?? null
  );

  // Desktop sidebar collapse toggle + Mobile Sheet state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);

  // Active contextual tab below video
  const [activeTab, setActiveTab] = React.useState<"problems" | "notes" | "progress" | "resources">("problems");

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

  // Find active topic object
  const activeTopic = React.useMemo(() => {
    for (const mod of initialDetail.modules) {
      const top = mod.topics.find((t) => t.id === activeTopicId);
      if (top) return top;
    }
    return initialDetail.modules[0]?.topics[0] || null;
  }, [initialDetail.modules, activeTopicId]);

  // Find parent module of active topic
  const activeModule = React.useMemo(() => {
    if (!activeTopic) return null;
    return initialDetail.modules.find((m) => m.id === activeTopic.moduleId) || null;
  }, [initialDetail.modules, activeTopic]);

  const handleSelectTopic = (topic: StriverTopicDetail) => {
    setActiveTopicId(topic.id);
    setActiveVideoId(topic.videos[0]?.id ?? null);
    setIsMobileSheetOpen(false);
    router.replace(`/practice/dsa/sheets/striver-a2z?topic=${topic.slug}`, { scroll: false });
  };

  const handleSelectVideo = (video: StriverVideoItem) => {
    setActiveVideoId(video.id);
  };

  const handleContinueNext = () => {
    for (const mod of initialDetail.modules) {
      for (const top of mod.topics) {
        if (top.stats.solvedProblems < top.stats.totalProblems) {
          handleSelectTopic(top);
          return;
        }
      }
    }
  };

  if (!activeTopic) return null;

  const mastery = getMasteryBadge(activeTopic.stats.masteryLevel);
  const activeVideo = activeTopic.videos.find((v) => v.id === activeVideoId) || activeTopic.videos[0];

  return (
    <div className="space-y-6">
      {/* 1. Global Sheet Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/20 font-bold">
              Official Track
            </span>
            <span className="font-mono text-xs text-neutral-500">
              takeUforward
            </span>
          </div>
          <h1 className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-white">
            Striver&apos;s A2Z DSA Sheet
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            18 Steps • 299 Verified Lectures • 372 LeetCode Problems • Evidence-based Topic Mastery
          </p>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Mobile Syllabus Sheet Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileSheetOpen(true)}
            className="lg:hidden h-8 px-3 text-xs font-mono border-white/10 bg-white/[0.04] text-neutral-200 hover:text-white gap-1.5"
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
            className="h-8 px-3 text-xs font-mono border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/[0.08] gap-1.5"
          >
            <Link href="/practice/dsa/sheets/striver-a2z/analytics">
              <Icon icon={ChartLineData02Icon} size={13} />
              <span className="hidden sm:inline">Analytics</span>
            </Link>
          </Button>

          <Button
            size="sm"
            onClick={handleContinueNext}
            className="h-8 px-3.5 text-xs font-mono font-medium bg-[#FF0000] hover:bg-[#CC0000] text-white gap-1.5 shadow-sm"
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
          <StriverTopicNavigator
            modules={initialDetail.modules}
            activeTopicId={activeTopicId}
            onSelectTopic={handleSelectTopic}
          />
        </aside>

        {/* Mobile Slide-Over Sheet: Syllabus Navigator */}
        <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
          <SheetContent side="left" className="w-[320px] sm:w-[380px] p-0 bg-[#090909] border-white/10 text-white">
            <SheetHeader className="sr-only">
              <SheetTitle>Striver A2Z Syllabus Navigation</SheetTitle>
            </SheetHeader>
            <div className="h-full pt-12 pb-4 px-3">
              <StriverTopicNavigator
                modules={initialDetail.modules}
                activeTopicId={activeTopicId}
                onSelectTopic={handleSelectTopic}
                onCloseMobile={() => setIsMobileSheetOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Column: Full-Width Workspace (expands to 100% when sidebar collapsed) */}
        <main className="flex-1 min-w-0 w-full space-y-6">
          {/* Structured Current Topic Header */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0A]/90 p-4 sm:p-5 backdrop-blur-md space-y-3">
            {/* Breadcrumb Hierarchy */}
            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 uppercase tracking-wider flex-wrap">
              <span className="text-white font-medium">
                Step {activeModule?.stepNumber.toString().padStart(2, "0") || "01"}: {activeModule?.title || "Module"}
              </span>
              <span>/</span>
              <span className="text-neutral-300">
                Substep {activeTopic.substepNumber}
              </span>
            </div>

            {/* Topic Title (Un-truncated, natural wrap up to 2 lines!) + Mastery Badge */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <h2 className="font-sans text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug break-words">
                {activeTopic.title}
              </h2>

              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-mono text-[10px] uppercase px-2.5 py-1 border shrink-0 cursor-default select-none transition-colors",
                        mastery.color
                      )}
                    >
                      {mastery.label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs text-xs font-sans">
                    {mastery.description}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Metadata Summary Pill */}
            <div className="flex items-center gap-4 text-xs font-mono text-neutral-400 pt-1 border-t border-white/[0.05]">
              <div className="flex items-center gap-1.5">
                <Icon icon={VideoReplayIcon} size={13} className="text-[#FF0000]" />
                <span>
                  <strong className="text-white">{activeTopic.videos.length}</strong> {activeTopic.videos.length === 1 ? "Lesson" : "Lessons"}
                </span>
              </div>
              <span className="text-neutral-700">•</span>
              <div className="flex items-center gap-1.5">
                <Icon icon={CodeCircleIcon} size={13} className="text-[#FF0000]" />
                <span>
                  <strong className="text-white">{activeTopic.stats.solvedProblems}</strong> / {activeTopic.problems.length} Solved
                </span>
              </div>
            </div>
          </div>

          {/* Video Lecture Player */}
          <StriverVideoPlayer
            videos={activeTopic.videos}
            activeVideoId={activeVideoId}
            onSelectVideo={handleSelectVideo}
            topicTitle={activeTopic.title}
          />

          {/* Contextual Workspace Tabs Below Video */}
          <div className="space-y-4">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as typeof activeTab)}
              className="w-full"
            >
              <TabsList
                variant="line"
                className="w-full justify-start border-b border-white/[0.08] pb-px overflow-x-auto scrollbar-none flex-nowrap"
              >
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
                    {activeTopic.problems.length}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="notes"
                  className="gap-2 text-xs font-mono py-2.5 shrink-0"
                >
                  <Icon icon={Note01Icon} size={15} className="text-[#FF0000]" />
                  <span>Lesson Notes</span>
                </TabsTrigger>

                <TabsTrigger
                  value="progress"
                  className="gap-2 text-xs font-mono py-2.5 shrink-0"
                >
                  <Icon icon={ChartLineData02Icon} size={15} className="text-[#FF0000]" />
                  <span>Curriculum Progress</span>
                </TabsTrigger>

                <TabsTrigger
                  value="resources"
                  className="gap-2 text-xs font-mono py-2.5 shrink-0"
                >
                  <Icon icon={BookOpen01Icon} size={15} className="text-[#FF0000]" />
                  <span>Resources & Overview</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Practice Problems Table (Full Width) */}
              <TabsContent value="problems" className="pt-4 focus-visible:outline-none">
                <StriverProblemsTable
                  problems={activeTopic.problems}
                  topicTitle={activeTopic.title}
                />
              </TabsContent>

              {/* Tab 2: Integrated Notes Editor (Watch & write simultaneously without remounting player) */}
              <TabsContent value="notes" className="pt-4 focus-visible:outline-none">
                <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0A] p-4 sm:p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div>
                      <h3 className="font-mono text-sm font-semibold text-white">
                        Topic & Lesson Notes
                      </h3>
                      <p className="text-xs text-neutral-400 font-sans">
                        Auto-saved notes for <span className="text-white font-medium">{activeVideo?.title || activeTopic.title}</span>.
                      </p>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      Auto-Save Active
                    </Badge>
                  </div>

                  {activeVideo ? (
                    <LessonNotesEditor
                      videoId={activeVideo.id}
                      initialNotes={activeVideo.notesContent || ""}
                    />
                  ) : (
                    <div className="text-xs text-neutral-500 font-mono py-4">
                      Select a video lesson to open its scratchpad.
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tab 3: Curriculum Progress & Runway Rail (Expanded to Full Width) */}
              <TabsContent value="progress" className="pt-4 focus-visible:outline-none">
                <div className="w-full">
                  <StriverProgressRail
                    sheetDetail={initialDetail}
                    onContinueNext={handleContinueNext}
                  />
                </div>
              </TabsContent>

              {/* Tab 4: Resources, Official Reference & Methodology */}
              <TabsContent value="resources" className="pt-4 focus-visible:outline-none">
                <div className="rounded-xl border border-white/[0.08] bg-[#0A0A0A] p-4 sm:p-6 space-y-5">
                  <div className="space-y-1">
                    <h3 className="font-mono text-base font-bold text-white">
                      Curriculum Reference & Methodology
                    </h3>
                    <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                      This learning track faithfully mirrors the official takeUforward Striver A2Z DSA Sheet syllabus, structuring 18 modules from foundational concepts to advanced dynamic programming and graph theory.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Official takeUforward link card */}
                    <a
                      href="https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-4 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15] transition-all space-y-2 block"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-white group-hover:text-[#FF0000] transition-colors flex items-center gap-1.5">
                          Official takeUforward Sheet
                          <Icon icon={LinkSquare02Icon} size={12} />
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-neutral-400">
                          External
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                        Access original problem write-ups, code templates in C++, Java, and Python, and community discussion.
                      </p>
                    </a>

                    {/* PRIME Mastery Framework Card */}
                    <div className="p-4 rounded-lg border border-white/[0.08] bg-white/[0.02] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-white flex items-center gap-1.5">
                          <Icon icon={InformationCircleIcon} size={14} className="text-[#FF0000]" />
                          Three-Tier Progress Separation
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-emerald-400 bg-emerald-500/10">
                          Verified
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                        Watching a lecture records video comprehension. Solving a problem records algorithmic practice. Both must be combined to advance topic mastery.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
