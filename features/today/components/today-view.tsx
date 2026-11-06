"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { addDays } from "@/domain/planning/capacity";
import { useAI } from "@/features/ai/ai-provider";
import { Icon } from "@/components/ui/icon";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import type { TodaySnapshot, TodayTaskItem, TodayNextAction, ActiveStudySession } from "../types";
import { TodayHeader } from "./today-header";
import { DailyLoadStrip } from "./daily-load-strip";
import { NextActionCard } from "./next-action-card";
import { TaskGroupSection } from "./task-group-section";
import { DayContextRail } from "./day-context-rail";
import { DayCompleteView } from "./day-complete-view";
import { RestDayView } from "./rest-day-view";
import { EmptyPlanView } from "./empty-plan-view";
import { TomorrowPreviewSection } from "./tomorrow-preview";
import { FocusScreen } from "@/features/focus/components/focus-screen";
import { focusMutationCoordinator } from "@/features/focus/lib/mutation-coordinator";
import { WhyTodayDialog } from "./why-today-dialog";
import { RecordRevisionDialog } from "@/features/revision/components/record-revision-dialog";
import type { RevisionProblemItem } from "@/features/revision/types";
import { ContinueLearningWidget } from "@/features/dsa-playlists/components/continue-learning-widget";

import { completeTaskAction, skipTaskAction } from "../server/actions";
import {
  startStudySessionAction,
  pauseStudySessionAction,
  finishStudySessionAction,
} from "../server/session-actions";

interface TodayViewProps {
  initialSnapshot: TodaySnapshot;
}

export function TodayView({ initialSnapshot }: TodayViewProps) {
  const router = useRouter();
  const ai = useAI();

  // State for explainability dialog
  const [whyTask, setWhyTask] = useState<TodayTaskItem | TodayNextAction | null>(null);

  // State for recording revision review
  const [reviewItem, setReviewItem] = useState<RevisionProblemItem | null>(null);

  const snapshot = initialSnapshot;
  const isComplete = snapshot.plan.status === "complete";
  const isRestDay = snapshot.plan.status === "rest_day";
  const isEmpty = snapshot.plan.status === "empty";

  // Optimistic focus session state for instant (<50ms) visual launch
  const [activeSession, setActiveSession] = useState<ActiveStudySession | null>(
    snapshot.activeSession
  );

  useEffect(() => {
    setActiveSession(snapshot.activeSession);
  }, [snapshot.activeSession]);

  // Handle Ask PRIME
  const handleOpenAI = () => {
    if (ai?.enabled) {
      ai.setOpen(true, undefined, { type: "today", date: snapshot.date });
    }
  };

  // Task Action Handlers
  const handleCompleteTask = async (taskId: string) => {
    try {
      const res = await completeTaskAction(taskId);
      if (res.success) {
        toast.success("Task completed.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to complete task");
      }
    } catch {
      toast.error("Failed to complete task");
    }
  };

  const handleSkipTask = async (taskId: string) => {
    try {
      const res = await skipTaskAction(taskId);
      if (res.success) {
        toast.info("Task skipped.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to skip task");
      }
    } catch {
      toast.error("Failed to skip task");
    }
  };

  // Instant Optimistic Study Session Start (<50ms)
  const handleStartSession = (task: TodayTaskItem | TodayNextAction) => {
    const taskId = "id" in task ? task.id : task.taskId;

    if (typeof performance !== "undefined") {
      performance.mark("focus-start-click");
    }

    // 1. Immediately mount FocusScreen on current frame
    const optimistic: ActiveStudySession = {
      id: "optimistic-" + Date.now(),
      taskId,
      taskTitle: task.title,
      problemSlug: "problemSlug" in task ? task.problemSlug : undefined,
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      status: "running",
    };

    setActiveSession(optimistic);

    if (typeof performance !== "undefined") {
      performance.mark("focus-start-ui-updated");
      try {
        performance.measure("focus-start-response", "focus-start-click", "focus-start-ui-updated");
      } catch {}
    }

    // 2. Asynchronously persist session without blocking user
    focusMutationCoordinator.enqueue({
      type: "start",
      taskId,
      execute: () => startStudySessionAction(taskId),
      onSuccess: (res) => {
        if (res.success && res.sessionId) {
          setActiveSession((prev) => (prev ? { ...prev, id: res.sessionId! } : null));
        } else {
          toast.error(res.error || "Failed to sync session with server");
        }
      },
      onError: (err) => {
        toast.error("Network error starting session. Operating in local focus mode.");
        console.error("Start focus sync error:", err);
      },
    });
  };

  const handleExitFocus = () => {
    setActiveSession(null);
    router.refresh();
  };

  // Handle Review opening for a revision task
  const handleRecordReview = (task: TodayTaskItem) => {
    const item: RevisionProblemItem = {
      id: task.revisionItemId || task.id,
      problemId: task.problemId || task.id,
      title: task.title,
      slug: task.problemSlug || "",
      difficulty: task.problemDifficulty || "MEDIUM",
      platform: "leetcode",
      platformUrl: null,
      topics: task.topicName ? [{ id: "1", name: task.topicName, slug: "topic" }] : [],
      intervalDays: task.revisionIntervalDays || 1,
      stageLabel: `${task.revisionIntervalDays || 1}d`,
      category: task.isOverdue ? "overdue" : "due_today",
      timingLabel: task.isOverdue ? "Overdue" : "Due today",
      isOverdue: Boolean(task.isOverdue),
      snoozedUntil: null,
      status: "active",
      lastAttempt: task.lastAttempt ?? null,
      lastReview: task.lastReview ?? null,
      bookmarked: false,
      nextReviewAt: snapshot.date,
    };
    setReviewItem(item);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-36 sm:pb-24">
      {/* 1. Header */}
      <TodayHeader
        displayDate={snapshot.displayDate}
        dayOfWeek={snapshot.dayOfWeek}
        dayNumber={snapshot.dayNumber}
        totalDays={snapshot.totalDays}
        trajectory={snapshot.plan.trajectory}
        onOpenAI={ai?.enabled ? handleOpenAI : undefined}
      />

      {isEmpty ? (
        <EmptyPlanView />
      ) : isRestDay ? (
        <RestDayView tomorrowPreview={snapshot.tomorrowPreview} />
      ) : (
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          {/* Main Execution Runway */}
          <main className="w-full min-w-0 flex-1 space-y-6">
            {/* 2. Daily Load Strip & Thin Capacity Rail */}
            <DailyLoadStrip
              plannedMinutes={snapshot.capacity.plannedMinutes}
              completedMinutes={snapshot.capacity.completedMinutes}
              remainingMinutes={snapshot.capacity.remainingMinutes}
              availableMinutes={snapshot.capacity.availableMinutes}
              completedTaskCount={snapshot.progress.completedTaskCount}
              totalTaskCount={snapshot.progress.totalTaskCount}
              isExceeded={snapshot.capacity.isExceeded}
            />

            {/* DSA Continue Learning strip (if enrolled) */}
            {snapshot.dsaCoursePreview && (
              <ContinueLearningWidget playlist={snapshot.dsaCoursePreview} />
            )}

            {/* 3. Next Action Card (if incomplete tasks exist) */}
            {snapshot.nextAction && !isComplete && (
              <NextActionCard
                action={snapshot.nextAction}
                onWhyToday={(action) => setWhyTask(action)}
                onStartAction={(action) => handleStartSession(action)}
              />
            )}

            {/* 4. Complete State (if all tasks finished) */}
            {isComplete ? (
              <DayCompleteView
                date={snapshot.date}
                totalTasks={snapshot.progress.totalTaskCount}
                focusedMinutes={snapshot.capacity.focusedMinutes}
                plannedMinutes={snapshot.capacity.plannedMinutes}
                tomorrowPreview={snapshot.tomorrowPreview}
              />
            ) : (
              /* 5. Semantic Task Groups along the Execution Runway */
              <div className="space-y-6">
                {snapshot.groups.map((group) => (
                  <TaskGroupSection
                    key={group.id}
                    group={group}
                    onComplete={handleCompleteTask}
                    onSkip={handleSkipTask}
                    onMoveTomorrow={(id) => router.push("/plan?move=" + encodeURIComponent(id) + "&date=" + addDays(snapshot.date, 1))}
                    onReschedule={(task) => router.push("/plan?move=" + encodeURIComponent(task.id))}
                    onWhyToday={(t) => setWhyTask(t)}
                    onStartSession={(t) => handleStartSession(t)}
                    onRecordReview={handleRecordReview}
                  />
                ))}

                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 text-xs font-mono font-medium text-neutral-300 hover:text-white bg-[#0A0A0A] hover:bg-[#141414] border-white/[0.1] hover:border-white/[0.2] gap-2 transition-all shadow-sm active:scale-[0.98]"
                    asChild
                  >
                    <Link href={"/plan?work=new&date=" + snapshot.date}>
                      <Icon icon={Add01Icon} size={14} className="text-[#FF0000]" />
                      <span>Plan additional work</span>
                    </Link>
                  </Button>
                </div>

                {/* 6. Tomorrow Preview (bottom of runway) */}
                <TomorrowPreviewSection preview={snapshot.tomorrowPreview} />
              </div>
            )}
          </main>

          {/* Desktop Right Context Rail */}
          <DayContextRail snapshot={snapshot} />
        </div>
      )}

      {/* Immersive Full-Window Focus Mode */}
      {activeSession && (
        <FocusScreen
          session={activeSession}
          task={snapshot.tasks.find((t) => t.id === activeSession.taskId)}
          onExit={handleExitFocus}
        />
      )}

      {/* Modals & Dialogs */}
      <WhyTodayDialog
        task={whyTask}
        open={Boolean(whyTask)}
        onOpenChange={(open) => !open && setWhyTask(null)}
      />

      {/* Reusable Record Revision Dialog */}
      <RecordRevisionDialog
        item={reviewItem}
        open={Boolean(reviewItem)}
        onOpenChange={(open) => !open && setReviewItem(null)}
        onSuccess={() => {
          if (reviewItem) {
            const matchedTask = snapshot.tasks.find(
              (t) => t.revisionItemId === reviewItem.id || t.problemId === reviewItem.problemId
            );
            if (matchedTask) {
              handleCompleteTask(matchedTask.id);
            }
          }
          router.refresh();
        }}
      />
    </div>
  );
}


