"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft01Icon,
  CheckmarkCircle01Icon,
  TeacherIcon,
  Layers01Icon,
  Time02Icon,
  CodeCircleIcon,
  NoteIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DSAPlaylistDetail, DSALessonItem } from "../types";
import { DSAVideoPlayer } from "./dsa-video-player";
import { LessonNavigator } from "./lesson-navigator";
import { LessonNotesEditor } from "./lesson-notes-editor";
import { LessonPracticeLinks } from "./lesson-practice-links";
import { AddToPlanDialog } from "./add-to-plan-dialog";
import { CreateRevisionDialog } from "./create-revision-dialog";
import {
  enrollInPlaylistAction,
  markLessonCompletedAction,
  markLessonIncompleteAction,
  toggleLessonBookmarkAction,
} from "../server/playlist-actions";

interface PlaylistDetailViewProps {
  initialDetail: DSAPlaylistDetail;
}

export function PlaylistDetailView({ initialDetail }: PlaylistDetailViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [detail, setDetail] = useState(initialDetail);
  const [activeLesson, setActiveLesson] = useState<DSALessonItem>(initialDetail.activeLesson);
  const [isEnrolled, setIsEnrolled] = useState(initialDetail.enrolled);

  // Modals state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);

  const playlist = detail.playlist;
  const lessons = detail.lessons;

  const currentIndex = lessons.findIndex((l) => l.id === activeLesson.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < lessons.length - 1;

  // 1. Enrollment handler
  const handleEnroll = async () => {
    startTransition(async () => {
      const res = await enrollInPlaylistAction(playlist.slug);
      if (res.success) {
        setIsEnrolled(true);
        toast.success(`Enrolled in ${playlist.title}!`);
      } else {
        toast.error(res.error || "Failed to enroll");
      }
    });
  };

  // 2. Select lesson
  const handleSelectLesson = (lesson: DSALessonItem) => {
    setActiveLesson(lesson);
    // Update URL query without full page reload
    window.history.replaceState(
      null,
      "",
      `/practice/dsa/playlists/${playlist.slug}?v=${lesson.youtubeVideoId}`
    );
  };

  // 3. Previous / Next
  const handlePrevious = () => {
    if (hasPrevious) {
      handleSelectLesson(lessons[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      handleSelectLesson(lessons[currentIndex + 1]);
    }
  };

  // 4. Toggle Complete
  const handleToggleComplete = async () => {
    const nextState = !activeLesson.isCompleted;

    // Optimistic UI update
    setActiveLesson((prev) => ({ ...prev, isCompleted: nextState }));
    setDetail((prev) => {
      const nextLessons = prev.lessons.map((l) =>
        l.id === activeLesson.id ? { ...l, isCompleted: nextState } : l
      );
      const completedCount = nextLessons.filter((l) => l.isCompleted).length;
      const progressPercentage = Math.round((completedCount / nextLessons.length) * 100);
      return {
        ...prev,
        lessons: nextLessons,
        stats: {
          ...prev.stats,
          completedLessons: completedCount,
          progressPercentage,
        },
      };
    });

    try {
      if (nextState) {
        await markLessonCompletedAction(activeLesson.videoDbId, playlist.slug);
        toast.success(`Lesson #${activeLesson.position} completed!`);
      } else {
        await markLessonIncompleteAction(activeLesson.videoDbId, playlist.slug);
      }
    } catch {
      toast.error("Failed to update progress");
      // Rollback
      setActiveLesson((prev) => ({ ...prev, isCompleted: !nextState }));
    }
  };

  // 5. Toggle Bookmark
  const handleToggleBookmark = async () => {
    const nextState = !activeLesson.isBookmarked;
    setActiveLesson((prev) => ({ ...prev, isBookmarked: nextState }));
    setDetail((prev) => ({
      ...prev,
      lessons: prev.lessons.map((l) =>
        l.id === activeLesson.id ? { ...l, isBookmarked: nextState } : l
      ),
    }));

    try {
      const res = await toggleLessonBookmarkAction(activeLesson.videoDbId, playlist.id);
      if (res.success) {
        toast.success(res.bookmarked ? "Lesson saved to bookmarks" : "Bookmark removed");
      }
    } catch {
      toast.error("Failed to toggle bookmark");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Navigation Back */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
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
                <span>All DSA Courses</span>
              </Link>
            </Button>
            <span className="text-neutral-600">/</span>
            <span className="font-mono text-xs text-[#FF4D4D] font-medium">
              {playlist.instructor}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {playlist.title}
          </h1>
        </div>

        {/* Enrollment & Global Course Progress */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {isEnrolled ? (
            <div className="flex items-center gap-3 bg-[#0A0A0A] border border-white/[0.08] px-3.5 py-1.5 rounded-lg font-mono text-xs">
              <span className="text-neutral-400">Track Progress:</span>
              <span className="text-emerald-400 font-bold">
                {detail.stats.progressPercentage}%
              </span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-300">
                {detail.stats.completedLessons} / {detail.stats.totalLessons}
              </span>
            </div>
          ) : (
            <Button
              onClick={handleEnroll}
              disabled={isPending}
              className="bg-[#FF0000] hover:bg-[#D90000] text-white font-medium h-9 px-4 text-xs shadow-[0_2px_12px_rgba(255,0,0,0.3)]"
            >
              {isPending ? "Enrolling..." : "Enroll in Track"}
            </Button>
          )}
        </div>
      </div>

      {/* 2. Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Video Player & Context Tabs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <DSAVideoPlayer
            lesson={activeLesson}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onToggleComplete={handleToggleComplete}
            onToggleBookmark={handleToggleBookmark}
            onOpenScheduleDialog={() => setScheduleModalOpen(true)}
            onOpenRevisionDialog={() => setRevisionModalOpen(true)}
            isCompleted={activeLesson.isCompleted}
            isBookmarked={activeLesson.isBookmarked}
          />

          {/* Context Tabs: Practice Questions, Notes, Course Info */}
          <Tabs defaultValue="practice" className="w-full">
            <TabsList className="bg-[#0A0A0A] border border-white/[0.08] p-1 h-9 rounded-lg">
              <TabsTrigger
                value="practice"
                className="text-xs font-mono data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white gap-1.5"
              >
                <Icon icon={CodeCircleIcon} size={13} className="text-[#FF4D4D]" />
                <span>Practice ({activeLesson.linkedProblems.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="text-xs font-mono data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white gap-1.5"
              >
                <Icon icon={NoteIcon} size={13} className="text-amber-400" />
                <span>Notes {activeLesson.hasNotes && "•"}</span>
              </TabsTrigger>
              <TabsTrigger
                value="info"
                className="text-xs font-mono data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white gap-1.5"
              >
                <Icon icon={InformationCircleIcon} size={13} />
                <span>Course Info</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Content: Practice Questions */}
            <TabsContent value="practice" className="mt-3">
              <LessonPracticeLinks
                linkedProblems={activeLesson.linkedProblems}
                topicSlug={activeLesson.canonicalTopicSlug}
              />
            </TabsContent>

            {/* Tab Content: Private Lesson Notes */}
            <TabsContent value="notes" className="mt-3">
              <LessonNotesEditor
                key={activeLesson.id}
                videoId={activeLesson.videoDbId}
                initialNotes={activeLesson.notesContent}
              />
            </TabsContent>

            {/* Tab Content: Course Overview */}
            <TabsContent value="info" className="mt-3">
              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#0A0A0A] space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Icon icon={TeacherIcon} size={16} className="text-[#FF4D4D]" />
                  <span>
                    {playlist.title} · {playlist.instructor}
                  </span>
                </div>
                <p className="text-neutral-400 leading-relaxed">{playlist.focus}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/[0.06] text-[11px]">
                  <div>
                    <span className="text-neutral-500">Language:</span>
                    <p className="text-neutral-200">{playlist.programmingLanguage}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Level:</span>
                    <p className="text-neutral-200">{playlist.level}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Total Lessons:</span>
                    <p className="text-neutral-200">{detail.stats.totalLessons}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500">Topics Covered:</span>
                    <p className="text-neutral-200">{playlist.topicTags.join(", ")}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel: Lesson Navigator (4 cols) */}
        <div className="lg:col-span-4 sticky top-6">
          <LessonNavigator
            lessons={lessons}
            activeLessonId={activeLesson.id}
            onSelectLesson={handleSelectLesson}
          />
        </div>
      </div>

      {/* Dialogs */}
      <AddToPlanDialog
        lesson={activeLesson}
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
      />

      <CreateRevisionDialog
        lesson={activeLesson}
        open={revisionModalOpen}
        onOpenChange={setRevisionModalOpen}
      />
    </div>
  );
}

