"use client";

import { useState } from "react";
import { PlayIcon, Bookmark01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import {
  aptitudeVideoProgressKey,
  getAptitudeTopicVideos,
} from "@/domain/aptitude/videos";
import type {
  AptitudeTopic,
  AptitudeVideoItem,
  AptitudeTrackSlug,
  AptitudeDifficulty,
  AptitudePriority,
  UserAptitudeTopicProgress,
  UserAptitudeVideoProgress,
} from "../types";

type Status = "all" | "completed" | "in_progress" | "not_started" | "bookmarked";
interface AptitudeDirectoryProps {
  topics: AptitudeTopic[];
  filteredTopics: AptitudeTopic[];
  topicProgress: Record<string, UserAptitudeTopicProgress>;
  videoProgress: Record<string, UserAptitudeVideoProgress>;
  filterTrack: AptitudeTrackSlug | "all";
  filterDay: number | "all";
  filterDifficulty: AptitudeDifficulty | "all";
  filterPriority: AptitudePriority | "all";
  filterStatus: Status;
  searchQuery: string;
  onFilterTrackChange: (v: AptitudeTrackSlug | "all") => void;
  onFilterDayChange: (v: number | "all") => void;
  onFilterDifficultyChange: (v: AptitudeDifficulty | "all") => void;
  onFilterPriorityChange: (v: AptitudePriority | "all") => void;
  onFilterStatusChange: (v: Status) => void;
  onSearchQueryChange: (v: string) => void;
  onWatchVideo: (t: AptitudeTopic, v: AptitudeVideoItem) => void;
  onToggleTopicStatus: (
    id: string,
    v: "not_started" | "in_progress" | "completed"
  ) => void;
  onToggleBookmark: (id: string) => void;
}
function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([id, text]) => (
          <SelectItem value={id} key={id}>
            {text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export function AptitudeDirectory(p: AptitudeDirectoryProps) {
  const [videoFilter, setVideoFilter] = useState("all");
  const topics = p.filteredTopics.filter(
    (t) =>
      videoFilter === "all" ||
      (videoFilter === "available"
        ? getAptitudeTopicVideos(t).length > 0
        : getAptitudeTopicVideos(t).length === 0)
  );
  return (
    <section aria-labelledby="concept-directory-heading" className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="concept-directory-heading" className="text-lg font-semibold">
            All concepts
          </h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {topics.length} of {p.topics.length} concepts · Find a lesson or continue a
            topic.
          </p>
        </div>
        <SearchInput
          aria-label="Search concepts"
          placeholder="Search concepts or formulas…"
          shortcut=""
          value={p.searchQuery}
          onChange={(e) => p.onSearchQueryChange(e.target.value)}
          onClear={() => p.onSearchQueryChange("")}
          className="max-w-full sm:w-72"
        />
      </div>
      <Card
        elevation="base"
        className="grid min-w-0 grid-cols-2 gap-2 p-3 @min-[48rem]:grid-cols-3"
      >
        <Filter
          label="Filter subject"
          value={p.filterTrack}
          onChange={(v) => p.onFilterTrackChange(v as AptitudeTrackSlug | "all")}
          options={[
            ["all", "All subjects"],
            ["quantitative-aptitude", "Quantitative aptitude"],
            ["logical-reasoning", "Logical reasoning"],
            ["verbal-ability", "Verbal ability"],
            ["data-interpretation", "Data interpretation"],
            ["assessments", "Final review"],
          ]}
        />
        <Filter
          label="Filter day"
          value={String(p.filterDay)}
          onChange={(v) => p.onFilterDayChange(v === "all" ? "all" : Number(v))}
          options={[
            ["all", "All days"],
            ...Array.from({ length: 40 }, (_, i): [string, string] => [
              String(i + 1),
              "Day " + (i + 1),
            ]),
          ]}
        />
        <Filter
          label="Filter progress"
          value={p.filterStatus}
          onChange={(v) => p.onFilterStatusChange(v as Status)}
          options={[
            ["all", "All progress"],
            ["not_started", "Not started"],
            ["in_progress", "In progress"],
            ["completed", "Completed"],
            ["bookmarked", "Bookmarked"],
          ]}
        />
        <Filter
          label="Filter difficulty"
          value={p.filterDifficulty}
          onChange={(v) => p.onFilterDifficultyChange(v as AptitudeDifficulty | "all")}
          options={[
            ["all", "All difficulties"],
            ["Easy", "Easy"],
            ["Medium", "Medium"],
            ["Hard", "Hard"],
          ]}
        />
        <Filter
          label="Filter priority"
          value={p.filterPriority}
          onChange={(v) => p.onFilterPriorityChange(v as AptitudePriority | "all")}
          options={[
            ["all", "All priorities"],
            ["Essential", "Essential"],
            ["High", "High"],
            ["Medium", "Medium"],
            ["Low", "Low"],
          ]}
        />
        <Filter
          label="Filter lessons"
          value={videoFilter}
          onChange={setVideoFilter}
          options={[
            ["all", "All lesson availability"],
            ["available", "With video lessons"],
            ["missing", "Needs a video lesson"],
          ]}
        />
      </Card>
      <div className="grid min-w-0 gap-3 @min-[48rem]:grid-cols-2">
        {topics.map((topic) => {
          const progress = p.topicProgress[topic.id];
          const videos = getAptitudeTopicVideos(topic);
          return (
            <Card
              key={topic.id}
              elevation="base"
              className="flex min-w-0 flex-col p-4"
              data-testid="aptitude-directory-concept"
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  aria-label={`Complete ${topic.title}`}
                  checked={progress?.status === "completed"}
                  containerClassName="mt-1"
                  onCheckedChange={(v) =>
                    p.onToggleTopicStatus(topic.id, v ? "completed" : "not_started")
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    Day {topic.dayNumber} · {topic.difficulty}
                    {progress?.status === "completed" ? " · Completed" : ""}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold leading-6">{topic.title}</h3>
                </div>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Bookmark ${topic.title}`}
                  aria-pressed={!!progress?.isBookmarked}
                  title="Bookmark concept"
                  className={progress?.isBookmarked ? "text-[var(--accent)]" : ""}
                  onClick={() => p.onToggleBookmark(topic.id)}
                >
                  <Icon icon={Bookmark01Icon} size={15} />
                </Button>
              </div>
              <div className="mt-4 flex-1 space-y-3 border-t border-[var(--border-subtle)] pt-3">
                {videos.length ? (
                  videos.map((video, index) => (
                    <div key={video.videoId} className="flex min-w-0 items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs leading-5">{video.title}</p>
                        <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                          {video.channelTitle}
                          {" · English"}
                          {video.durationFormatted ? " · " + video.durationFormatted : ""}
                          {p.videoProgress[
                            aptitudeVideoProgressKey(topic.id, video.videoId)
                          ]?.watched
                            ? " · Watched"
                            : ""}
                        </p>
                      </div>
                      <Button
                        variant={index === 0 ? "primary" : "outline"}
                        size="icon-sm"
                        title={index === 0 ? "Watch main lesson" : "Watch alternative"}
                        aria-label={`Watch ${video.title}`}
                        onClick={() => p.onWatchVideo(topic, video)}
                      >
                        <Icon icon={PlayIcon} size={14} />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[var(--text-secondary)]">
                    English lesson awaiting confirmation. Study notes are available in the
                    learning plan.
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      {!topics.length && (
        <Card
          elevation="base"
          className="p-8 text-center text-sm text-[var(--text-secondary)]"
        >
          No concepts match these filters.
        </Card>
      )}
    </section>
  );
}
