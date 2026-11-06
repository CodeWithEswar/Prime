"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Folder01Icon,
  Award01Icon,
  VideoReplayIcon,
  CodeCircleIcon,
  Menu01Icon,
  ArrowRight01Icon,
  SidebarLeftIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StriverTopicNavigator } from "./striver-topic-navigator";
import { StriverVideoPlayer } from "./striver-video-player";
import { StriverProblemsTable } from "./striver-problems-table";
import { StriverProgressRail } from "./striver-progress-rail";
import { StriverAnalyticsModal } from "./striver-analytics-modal";
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

export function StriverWorkspace({
  initialDetail,
  analytics,
}: StriverWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active topic state
  const [activeTopicId, setActiveTopicId] = React.useState(initialDetail.activeTopicId);
  const [activeVideoId, setActiveVideoId] = React.useState<string | null>(
    initialDetail.activeVideoId ?? null
  );

  // Mobile drawer open state
  const [showMobileNav, setShowMobileNav] = React.useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = React.useState(false);

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
    setShowMobileNav(false);
    router.replace(`/practice/dsa/sheets/striver-a2z?topic=${topic.slug}`, { scroll: false });
  };

  const handleSelectVideo = (video: StriverVideoItem) => {
    setActiveVideoId(video.id);
  };

  const handleContinueNext = () => {
    // Find next incomplete topic
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

  return (
    <div className="space-y-6">
      {/* 1. Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/20 font-bold">
              Official Track
            </span>
            <span className="font-mono text-xs text-neutral-500">
              takeUforward
            </span>
          </div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-white">
            Striver&apos;s A2Z DSA Sheet
          </h1>
          <p className="text-xs text-neutral-400 font-mono">
            18 Steps • 299 Verified Lectures • 372 LeetCode Problems • Evidence-based Topic Mastery
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mobile Navigator Drawer Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="lg:hidden h-8 px-3 text-xs font-mono border-white/10 bg-white/[0.04] text-neutral-300 gap-1.5"
          >
            <Icon icon={Menu01Icon} size={14} />
            <span>Topics</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnalyticsModal(true)}
            className="h-8 px-3 text-xs font-mono border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:bg-white/[0.08]"
          >
            Learning Analytics
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

      {/* 2. Main 3-Panel Adaptive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Syllabus Navigator (Hidden on mobile unless toggled) */}
        <aside
          className={`lg:col-span-3 ${
            showMobileNav
              ? "block fixed inset-x-4 top-20 bottom-6 z-50 shadow-2xl"
              : "hidden lg:block lg:sticky lg:top-20"
          } h-[calc(100vh-140px)]`}
        >
          <StriverTopicNavigator
            modules={initialDetail.modules}
            activeTopicId={activeTopicId}
            onSelectTopic={handleSelectTopic}
          />
        </aside>

        {/* Center Column: Main Learning & Practice Workspace */}
        <main className="lg:col-span-6 space-y-6 min-w-0">
          {/* Current Topic Header Card */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.08] bg-[#0A0A0A]/90 backdrop-blur-md">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 uppercase">
                <span>{activeModule?.title || "Module"}</span>
                <span>•</span>
                <span>Substep {activeTopic.substepNumber}</span>
              </div>
              <h2 className="font-mono text-base font-bold text-white truncate">
                {activeTopic.title}
              </h2>
            </div>

            <Badge
              variant="outline"
              className={`font-mono text-[10px] uppercase px-2 py-0.5 border ${
                activeTopic.stats.masteryLevel === "proficient"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold"
                  : activeTopic.stats.masteryLevel === "developing"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : activeTopic.stats.masteryLevel === "practicing"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                  : activeTopic.stats.masteryLevel === "learning"
                  ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                  : "bg-neutral-800 text-neutral-400 border-neutral-700"
              }`}
            >
              {activeTopic.stats.masteryLevel.replace("_", " ")}
            </Badge>
          </div>

          {/* Video Lecture Player */}
          <StriverVideoPlayer
            videos={activeTopic.videos}
            activeVideoId={activeVideoId}
            onSelectVideo={handleSelectVideo}
            topicTitle={activeTopic.title}
          />

          {/* Target Coding Problems Table */}
          <StriverProblemsTable
            problems={activeTopic.problems}
            topicTitle={activeTopic.title}
          />
        </main>

        {/* Right Column: Progress & Telemetry Rail */}
        <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-20">
          <StriverProgressRail
            sheetDetail={initialDetail}
            onOpenAnalytics={() => setShowAnalyticsModal(true)}
            onContinueNext={handleContinueNext}
          />
        </aside>
      </div>

      {/* Analytics Modal */}
      <StriverAnalyticsModal
        open={showAnalyticsModal}
        onOpenChange={setShowAnalyticsModal}
        analytics={analytics}
      />
    </div>
  );
}

