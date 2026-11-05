"use client";

import { useState } from "react";
import {
  PlayIcon,
  Bookmark01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  BookOpen01Icon,
  File01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import {
  getAptitudeTopicVideos,
  aptitudeVideoProgressKey,
} from "@/domain/aptitude/videos";
import { cn } from "@/lib/utils";
import type {
  AptitudeDay,
  AptitudeTopic,
  AptitudeVideoItem,
  UserAptitudeTopicProgress,
  UserAptitudeVideoProgress,
} from "../types";

interface AptitudeDayWorkspaceProps {
  day: AptitudeDay;
  totalDays: number;
  onSelectDay: (day: number) => void;
  topicProgress: Record<string, UserAptitudeTopicProgress>;
  videoProgress: Record<string, UserAptitudeVideoProgress>;
  onToggleTopicStatus: (
    id: string,
    status: "not_started" | "in_progress" | "completed"
  ) => void;
  onToggleBookmark: (id: string) => void;
  onSaveNotes: (id: string, notes: string) => void;
  onWatchVideo: (topic: AptitudeTopic, video: AptitudeVideoItem) => void;
}

export function AptitudeDayWorkspace({
  day,
  totalDays,
  onSelectDay,
  topicProgress,
  videoProgress,
  onToggleTopicStatus,
  onToggleBookmark,
  onSaveNotes,
  onWatchVideo,
}: AptitudeDayWorkspaceProps) {
  const [notesTopic, setNotesTopic] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const complete = day.topics.filter(
    (t) => topicProgress[t.id]?.status === "completed"
  ).length;
  return (
    <section
      id="course-day-workspace"
      aria-labelledby="aptitude-day-heading"
      className="min-w-0 scroll-mt-5 space-y-4"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4">
        <div className="min-w-0 flex-1 basis-52">
          <p className="mb-2 text-xs text-[var(--text-secondary)]">
            Day {String(day.dayNumber).padStart(2, "0")} / {totalDays}
            {day.isAssessmentDay ? " · Review & practice" : ""}
          </p>
          <h2 id="aptitude-day-heading" className="text-lg font-semibold tracking-tight">
            {day.title.replace(/^Day \d+: /, "")}
          </h2>
          <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
            {complete} of {day.topics.length} concepts completed · About{" "}
            {day.estimatedMinutes} min
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={day.dayNumber <= 1}
            onClick={() => onSelectDay(day.dayNumber - 1)}
            aria-label="Previous day"
            title="Previous day"
          >
            <Icon icon={ArrowLeft01Icon} size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={day.dayNumber >= totalDays}
            onClick={() => onSelectDay(day.dayNumber + 1)}
            aria-label="Next day"
            title="Next day"
          >
            <Icon icon={ArrowRight01Icon} size={16} />
          </Button>
        </div>
      </header>
      {day.topics.map((topic, index) => {
        const progress = topicProgress[topic.id];
        const completed = progress?.status === "completed";
        const videos = getAptitudeTopicVideos(topic);
        const notesOpen = notesTopic === topic.id;
        return (
          <Card
            key={topic.id}
            elevation="base"
            className="min-w-0 overflow-hidden"
            data-testid="aptitude-concept"
          >
            <div className="flex items-start gap-3 p-4">
              <Checkbox
                checked={completed}
                aria-label={`Complete ${topic.title}`}
                containerClassName="min-h-6 w-5"
                onCheckedChange={(checked) =>
                  onToggleTopicStatus(topic.id, checked ? "completed" : "not_started")
                }
              />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[11px] text-[var(--text-tertiary)]">
                  Concept {String(index + 1).padStart(2, "0")} · {topic.difficulty}
                </p>
                <h3 className="break-words text-sm font-semibold leading-6">
                  {topic.title}
                </h3>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={`${progress?.isBookmarked ? "Unbookmark" : "Bookmark"} ${topic.title}`}
                  title="Bookmark concept"
                  aria-pressed={!!progress?.isBookmarked}
                  onClick={() => onToggleBookmark(topic.id)}
                  className={
                    progress?.isBookmarked
                      ? "text-[var(--accent)] border-[var(--accent-border)]"
                      : ""
                  }
                >
                  <Icon icon={Bookmark01Icon} size={15} />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Notes for ${topic.title}`}
                  title="Personal notes"
                  aria-expanded={notesOpen}
                  onClick={() => setNotesTopic(notesOpen ? null : topic.id)}
                >
                  <Icon icon={File01Icon} size={15} />
                </Button>
              </div>
            </div>
            <div className="border-t border-[var(--border-subtle)] px-4 py-3">
              {videos.length ? (
                <div className="divide-y divide-[var(--border-subtle)]">
                  {videos.map((video, i) => {
                    const watched =
                      videoProgress[aptitudeVideoProgressKey(topic.id, video.videoId)]
                        ?.watched;
                    return (
                      <div
                        key={video.videoId}
                        className="flex min-w-0 flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
                        data-testid="aptitude-lesson"
                      >
                        <div
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-md border border-[var(--border-subtle)]",
                            watched
                              ? "text-[var(--accent)]"
                              : "text-[var(--text-secondary)]"
                          )}
                        >
                          <Icon icon={watched ? Tick02Icon : PlayIcon} size={15} />
                        </div>
                        <div className="min-w-0 flex-1 basis-40">
                          <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                            {i === 0 ? "Main lesson" : "Alternative lesson"}
                            {watched ? " · Watched" : ""}
                          </p>
                          <p className="break-words text-xs font-medium leading-5 [overflow-wrap:anywhere]">
                            {video.title}
                          </p>
                          <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                            {video.channelTitle}
                            {" · English"}
                            {video.durationFormatted
                              ? " · " + video.durationFormatted
                              : ""}
                          </p>
                          {video.coverageNotes && (
                            <p className="mt-1 text-[11px] leading-5 text-[var(--text-tertiary)]">
                              {video.coverageNotes}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={i === 0 ? "primary" : "outline"}
                          className="ml-auto"
                          aria-label={`Watch ${video.title}`}
                          onClick={() => onWatchVideo(topic, video)}
                        >
                          <Icon icon={PlayIcon} size={13} />
                          Watch
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-start gap-3 text-xs leading-5 text-[var(--text-secondary)]">
                  <Icon icon={BookOpen01Icon} size={17} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-white">
                      English lesson awaiting confirmation.
                    </p>
                    <p>
                      {topic.videoStatusReason ||
                        "Use the study notes below while a suitable English video is sourced."}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <details className="border-t border-[var(--border-subtle)] px-4 py-3">
              <summary className="cursor-pointer text-xs font-medium text-[var(--text-secondary)] focus-visible:outline-none focus-visible:underline">
                Study notes &amp; concepts
              </summary>
              <div className="mt-3 space-y-3 text-xs leading-6 text-[var(--text-secondary)]">
                <p>{topic.formulaNotes}</p>
                <ul className="list-disc space-y-1 pl-4">
                  {topic.conceptChecklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </details>
            {notesOpen && (
              <div className="space-y-2 border-t border-[var(--border-subtle)] p-4">
                <Label htmlFor={`notes-${topic.id}`}>Personal notes</Label>
                <Textarea
                  id={`notes-${topic.id}`}
                  rows={3}
                  value={notes[topic.id] ?? progress?.userNotes ?? ""}
                  onChange={(event) =>
                    setNotes((current) => ({
                      ...current,
                      [topic.id]: event.target.value,
                    }))
                  }
                  placeholder="Save your approach, examples, or revision reminders…"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setNotesTopic(null)}>
                    Close notes
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      onSaveNotes(topic.id, notes[topic.id] ?? progress?.userNotes ?? "");
                    }}
                  >
                    Save notes
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </section>
  );
}
