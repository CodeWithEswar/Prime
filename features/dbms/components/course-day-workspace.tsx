"use client";

import { useState } from "react";
import { CourseDayHeader } from "@/components/shared/course-study-day";
import { CourseTabs } from "@/components/shared/course-roadmap";
import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import {
  PlayIcon,
  Tick02Icon,
  Bookmark01Icon,
  RotateRight01Icon,
  LinkSquare01Icon,
  CheckmarkBadge01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import type {
  DBMSDaySchedule,
  DBMSVideoItem,
  DBMSSQLExercise,
  UserVideoProgress,
  UserDayProgress,
  UserExerciseAttempt,
} from "@/domain/dbms";

interface CourseDayWorkspaceProps {
  day: DBMSDaySchedule;
  videos: DBMSVideoItem[];
  exercises: DBMSSQLExercise[];
  videoProgress: Record<string, UserVideoProgress>;
  dayProgress: Record<number, UserDayProgress>;
  exerciseAttempts: Record<string, UserExerciseAttempt>;
  onWatchVideo: (videoId: string) => void;
  onToggleWatched: (videoId: string) => void;
  onToggleBookmark: (videoId: string) => void;
  onToggleRevision: (videoId: string) => void;
  onToggleAssignment: (dayNumber: number) => void;
  onSolveExercise: (exerciseId: string) => void;
}

export function CourseDayWorkspace({
  day,
  videos,
  exercises,
  videoProgress,
  dayProgress,
  exerciseAttempts,
  onWatchVideo,
  onToggleWatched,
  onToggleBookmark,
  onToggleRevision,
  onToggleAssignment,
  onSolveExercise,
}: CourseDayWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<
    "lessons" | "assignment" | "interview" | "sql"
  >("lessons");
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Filter videos for this day
  const dayVideos = videos.filter((v) => v.dayNumber === day.dayNumber);
  const dayExercises = exercises.filter((e) => e.dayNumber === day.dayNumber);

  const watchedCount = dayVideos.filter(
    (v) => videoProgress[v.youtubeVideoId]?.watched
  ).length;
  const isAssignmentDone = !!dayProgress[day.dayNumber]?.assignmentCompleted;
  const isDayComplete =
    dayVideos.length > 0 && watchedCount === dayVideos.length && isAssignmentDone;

  return (
    <Card
      id="course-day-workspace"
      tabIndex={-1}
      elevation="raised"
      className="min-w-0 scroll-mt-20 space-y-4 p-3 sm:p-5"
    >
      <CourseDayHeader
        day={day}
        complete={isDayComplete}
        watched={watchedCount}
        total={dayVideos.length}
      />

      <CourseTabs
        value={activeTab === "sql" && !dayExercises.length ? "lessons" : activeTab}
        onValueChange={setActiveTab}
        label="DBMS day views"
        layoutId="dbms-day-views"
        options={[
          ["lessons", "Lessons (" + dayVideos.length + ")"],
          ["assignment", "Assignment & outcomes"],
          ["interview", "Interview (" + day.interviewQuestions.length + ")"],
          ...(dayExercises.length
            ? [["sql", "SQL Practice (" + dayExercises.length + ")"] as const]
            : []),
        ]}
      >
        {/* TAB 1: Lessons Checklist */}
        <TabsContent value="lessons" className="mt-0 min-w-0">
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2.5">
              {dayVideos.map((video) => {
                const isWatched = !!videoProgress[video.youtubeVideoId]?.watched;
                const isBookmarked = !!videoProgress[video.youtubeVideoId]?.isBookmarked;
                const isRevisionDue = !!videoProgress[video.youtubeVideoId]?.revisionDue;
                const lessonLabel =
                  video.position == null ? video.title : `lesson ${video.position}`;

                return (
                  <Card
                    key={video.youtubeVideoId}
                    elevation="base"
                    className="flex min-w-0 flex-col justify-between gap-3 p-3 transition-colors hover:border-[var(--border-default)] sm:flex-row sm:items-center sm:p-3.5"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3">
                      <Checkbox
                        checked={isWatched}
                        onCheckedChange={() => onToggleWatched(video.youtubeVideoId)}
                        aria-label={`Mark ${video.position == null ? "" : `lesson #${video.position} `}${video.title} as ${isWatched ? "unwatched" : "watched"}`}
                        containerClassName="mt-0.5 shrink-0"
                      />

                      <div className="min-w-0 flex-1 space-y-1">
                        <p
                          onClick={() => onWatchVideo(video.youtubeVideoId)}
                          className={`cursor-pointer text-sm font-medium leading-snug [overflow-wrap:anywhere] transition-colors hover:text-[var(--accent)] ${
                            isWatched
                              ? "text-[var(--text-secondary)] line-through"
                              : "text-[var(--foreground)]"
                          }`}
                        >
                          {video.title}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-[var(--text-secondary)]">
                          <span className="font-mono text-[var(--text-secondary)]">
                            {video.position == null ? "Deep dive" : `#${video.position}`}
                          </span>
                          <span>
                            {video.channel} · {video.estimatedMinutes} min
                          </span>

                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-medium ${
                              video.difficulty === "Hard"
                                ? "bg-[#FF0000]/15 text-[#FF6B6B]"
                                : video.difficulty === "Medium"
                                  ? "bg-[#333333] text-[#DDDDDD]"
                                  : "bg-[#1F1F1F] text-[#888888]"
                            }`}
                          >
                            {video.difficulty}
                          </span>

                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                              video.importance === "Critical"
                                ? "bg-[#FF0000] text-white"
                                : "bg-[#222222] text-[#AAAAAA]"
                            }`}
                          >
                            {video.importance}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-center pl-7 sm:pl-0">
                      <Button
                        size="sm"
                        onClick={() => onWatchVideo(video.youtubeVideoId)}
                        className="h-7.5 px-3 text-xs font-semibold bg-[#FF0000] text-white hover:bg-[#D90000]"
                      >
                        <Icon icon={PlayIcon} size={12} className="mr-1.5 fill-white shrink-0" />
                        Watch
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={`Bookmark ${lessonLabel}`}
                        aria-pressed={isBookmarked}
                        onClick={() => onToggleBookmark(video.youtubeVideoId)}
                        className="aria-pressed:border-[var(--accent-border)] aria-pressed:bg-[var(--accent-muted)]"
                      >
                        <Icon icon={Bookmark01Icon} size={14} />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={`Review ${lessonLabel}`}
                        aria-pressed={isRevisionDue}
                        onClick={() => onToggleRevision(video.youtubeVideoId)}
                        className="aria-pressed:border-[var(--accent-border)] aria-pressed:bg-[var(--accent-muted)]"
                      >
                        <Icon icon={RotateRight01Icon} size={14} />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: Practical Assignment & Learning Outcomes */}
        <TabsContent value="assignment" className="mt-0 min-w-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Learning Outcomes */}
            <div className="space-y-4 rounded-lg border border-[#222222] bg-[#111111] p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                <Icon icon={CheckmarkBadge01Icon} size={16} className="text-[#FF4D4D]" />
                Core Pedagogical Outcomes
              </h3>
              <ul className="space-y-2.5">
                {day.learningOutcomes.map((outcome, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs leading-relaxed text-[#BBBBBB]"
                  >
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1E1E1E] text-[10px] font-mono text-[#888888]">
                      {idx + 1}
                    </span>
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Practical Assignment Card */}
            <div className="space-y-4 rounded-lg border border-[#262626] bg-[#121212] p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Hands-On Assignment Checkpoint
                </h3>
                <Badge
                  variant={isAssignmentDone ? "default" : "outline"}
                  className={
                    isAssignmentDone
                      ? "bg-white text-black"
                      : "border-[#333333] text-[#888888]"
                  }
                >
                  {isAssignmentDone ? "Completed" : "Pending"}
                </Badge>
              </div>

              <h4 className="text-base font-semibold text-white">
                {day.practicalAssignment.title}
              </h4>

              <p className="text-xs leading-relaxed text-[#AAAAAA]">
                {day.practicalAssignment.description}
              </p>

              <div className="pt-2">
                <Button
                  onClick={() => onToggleAssignment(day.dayNumber)}
                  className={`w-full text-xs font-semibold ${
                    isAssignmentDone
                      ? "border border-[#333333] bg-[#1A1A1A] text-white hover:bg-[#252525]"
                      : "bg-[#FF0000] text-white hover:bg-[#D90000]"
                  }`}
                >
                  <Icon icon={Tick02Icon} size={14} className="mr-2" />
                  {isAssignmentDone ? "Mark as Incomplete" : "Mark Assignment Completed"}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: Interview Questions */}
        <TabsContent value="interview" className="mt-0 min-w-0">
          <div className="space-y-3">
            {day.interviewQuestions.map((q) => {
              const isExpanded = expandedQuestionId === q.id;

              return (
                <div
                  key={q.id}
                  className="rounded-lg border border-[#222222] bg-[#111111] p-4 transition-colors hover:border-[#303030]"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="flex w-full items-start justify-between text-left"
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-[#FF0000]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#FF6B6B]">
                          {q.importance}
                        </span>
                        <span className="text-[11px] text-[#666666]">{q.category}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white">{q.question}</h4>
                    </div>
                    <Icon
                      icon={isExpanded ? ArrowUp01Icon : ArrowDown01Icon}
                      size={16}
                      className="shrink-0 text-[#777777]"
                    />
                  </button>

                  {isExpanded && (
                    <div className="mt-3 border-t border-[#1F1F1F] pt-3 text-xs leading-relaxed text-[#CCCCCC]">
                      <p>{q.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 4: SQL Practice */}
        <TabsContent value="sql" className="mt-0 min-w-0">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {dayExercises.map((exercise) => {
              const attempt = exerciseAttempts[exercise.id];
              const isSolved = attempt?.status === "solved";

              return (
                <div
                  key={exercise.id}
                  className="flex flex-col justify-between rounded-lg border border-[#222222] bg-[#111111] p-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-[#1A1A1A] px-2 py-0.5 text-[11px] font-medium text-[#888888]">
                        {exercise.sourcePlatform}
                      </span>
                      <span
                        className={`text-[11px] font-semibold ${
                          exercise.difficulty === "Hard"
                            ? "text-[#FF4D4D]"
                            : exercise.difficulty === "Medium"
                              ? "text-[#E5A83B]"
                              : "text-[#4ADE80]"
                        }`}
                      >
                        {exercise.difficulty}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-white">{exercise.title}</h4>
                    <p className="text-xs text-[#888888]">{exercise.description}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#1C1C1C] pt-3">
                    <a
                      href={exercise.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#CCCCCC] hover:text-white"
                    >
                      Open Problem
                      <Icon icon={LinkSquare01Icon} size={12} />
                    </a>

                    <Button
                      size="sm"
                      onClick={() => onSolveExercise(exercise.id)}
                      className={
                        isSolved
                          ? "h-7 bg-white px-3 text-xs text-black"
                          : "h-7 bg-[#1A1A1A] px-3 text-xs text-[#888888] hover:bg-[#FF0000] hover:text-white"
                      }
                    >
                      <Icon icon={Tick02Icon} size={12} className="mr-1" />
                      {isSolved ? "Solved" : "Mark Solved"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </CourseTabs>
    </Card>
  );
}
