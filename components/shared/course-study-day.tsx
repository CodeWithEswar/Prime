"use client";

import { useId, useState, type ReactNode } from "react";
import { Bookmark01Icon, CpuIcon, PlayIcon, RotateRight01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { CourseTabs } from "@/components/shared/course-roadmap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type CourseDay = {
  dayNumber: number;
  title: string;
  subtitle: string;
  summary: string;
  focus: string;
  estimatedMinutes: number;
  learningOutcomes: string[];
  deliverable: string;
  practicalAssignment: { title: string; description: string };
  interviewQuestions: {
    id: string;
    question: string;
    answer: string;
    importance: string;
  }[];
  labSlug?: string;
};

export type Lesson = {
  key: string;
  title: string;
  position?: number;
  channel: string;
  minutes?: number;
  difficulty?: string | null;
  kind?: string;
  watched: boolean;
  isBookmarked?: boolean;
  revisionDue?: boolean;
  onToggle: () => void;
  onWatch: () => void;
  onToggleBookmark?: () => void;
  onToggleRevision?: () => void;
};

export function CourseDayHeader({
  day,
  complete,
  watched,
  total,
}: {
  day: Pick<
    CourseDay,
    "dayNumber" | "title" | "subtitle" | "summary" | "focus" | "estimatedMinutes"
  >;
  complete: boolean;
  watched: number;
  total: number;
}) {
  const hours = Math.floor(day.estimatedMinutes / 60);
  const minutes = day.estimatedMinutes % 60;
  const runtime =
    [hours && hours + "h", minutes && minutes + "m"].filter(Boolean).join(" ") || "0m";

  return (
    <header className="flex flex-col justify-between gap-3 border-b border-[var(--border-subtle)] pb-4 @min-[46rem]:flex-row @min-[46rem]:items-start">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold text-[var(--accent)]">
            Day {String(day.dayNumber).padStart(2, "0")} of 12
          </span>
          <Badge variant="secondary">{day.focus}</Badge>
          {complete && <Badge variant="outline">Day complete</Badge>}
        </div>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{day.title}</h2>
        <p className="text-sm font-medium text-[var(--text-secondary)]">{day.subtitle}</p>
        <p className="max-w-3xl text-sm leading-relaxed text-[var(--text-secondary)]">
          {day.summary}
        </p>
      </div>
      <dl className="grid shrink-0 grid-cols-2 divide-x divide-[var(--border-subtle)] rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-interactive)] py-2 text-center">
        <div className="flex flex-col-reverse px-3">
          <dt className="text-xs text-[var(--text-secondary)]">Videos watched</dt>
          <dd className="font-mono text-base font-semibold">
            {watched}/{total}
          </dd>
        </div>
        <div className="flex flex-col-reverse px-3">
          <dt className="text-xs text-[var(--text-secondary)]">Est. runtime</dt>
          <dd className="font-mono text-base font-semibold">{runtime}</dd>
        </div>
      </dl>
    </header>
  );
}

export function CourseStudyDay({
  course,
  day,
  lessons,
  notes: savedNotes,
  complete,
  onComplete,
  onOpenLab,
  checkpoints,
  assignmentDetails,
}: {
  course: string;
  day: CourseDay;
  lessons: Lesson[];
  notes?: string | null;
  complete: boolean;
  onComplete: (notes: string) => void;
  onOpenLab?: (slug: string) => void;
  checkpoints?: ReactNode;
  assignmentDetails?: ReactNode;
}) {
  const [tab, setTab] = useState<"lessons" | "assignment" | "interview">("lessons");
  const [notes, setNotes] = useState(savedNotes ?? "");
  const [editing, setEditing] = useState(false);
  const notesId = useId();
  const lab = day.labSlug;
  const watched = lessons.filter((lesson) => lesson.watched).length;

  return (
    <Card
      id="course-day-workspace"
      tabIndex={-1}
      elevation="raised"
      className="min-w-0 scroll-mt-20 space-y-4 p-3 sm:p-5"
    >
      <CourseDayHeader
        day={day}
        complete={complete}
        watched={watched}
        total={lessons.length}
      />

      <CourseTabs
        value={tab}
        onValueChange={setTab}
        label={course + " day views"}
        layoutId={course + "-day-views"}
        options={[
          ["lessons", "Lessons (" + lessons.length + ")"],
          ["assignment", "Assignment & outcomes"],
          ["interview", "Interview (" + day.interviewQuestions.length + ")"],
        ]}
      >
        <TabsContent value="lessons" className="mt-0 min-w-0 space-y-2.5">
          {!lessons.length && (
            <p className="text-sm text-[var(--text-secondary)]">
              No full lessons are assigned for this day. Check the assignment for the next
              step.
            </p>
          )}
          {lessons.map(
            ({
              key,
              title,
              position,
              channel,
              minutes,
              kind,
              difficulty,
              watched,
              isBookmarked,
              revisionDue,
              onToggle,
              onWatch,
              onToggleBookmark,
              onToggleRevision,
            }) => (
              <Card
                key={key}
                role="group"
                aria-label={title}
                elevation="base"
                className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 p-3 transition-colors hover:border-[var(--border-default)] sm:p-3.5"
              >
                <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3">
                  <Checkbox
                    checked={watched}
                    onCheckedChange={onToggle}
                    aria-label={
                      "Mark " + title + (watched ? " as unwatched" : " as watched")
                    }
                    containerClassName="mt-0.5 shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p
                      onClick={onWatch}
                      className={`cursor-pointer text-sm font-medium leading-snug [overflow-wrap:anywhere] transition-colors hover:text-[var(--accent)] ${
                        watched ? "line-through text-[var(--text-secondary)]" : "text-white"
                      }`}
                    >
                      {title}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-[var(--text-secondary)]">
                      {position != null && (
                        <span className="font-mono font-medium text-[var(--text-secondary)]">
                          #{position}
                        </span>
                      )}
                      <span>{channel}</span>
                      {minutes != null && <span>· {minutes} min</span>}
                      {difficulty && (
                        <Badge
                          variant="secondary"
                          className="capitalize text-[10px] px-1.5 py-0 font-medium"
                        >
                          {difficulty}
                        </Badge>
                      )}
                      {kind && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 font-medium"
                        >
                          {kind}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-center pl-7 sm:pl-0">
                  <Button
                    size="sm"
                    onClick={onWatch}
                    className="h-7.5 px-3 text-xs font-semibold bg-[#FF0000] text-white hover:bg-[#D90000]"
                  >
                    <Icon icon={PlayIcon} size={12} className="mr-1.5 fill-white shrink-0" />
                    Watch
                  </Button>
                  {onToggleBookmark && (
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`Bookmark ${title}`}
                      aria-pressed={isBookmarked}
                      onClick={onToggleBookmark}
                      className="h-7.5 w-7.5 border-[#2A2A2A] bg-[#161616] text-[#888888] hover:text-white aria-pressed:border-[#FF0000]/60 aria-pressed:bg-[#FF0000]/10 aria-pressed:text-[#FF4D4D]"
                    >
                      <Icon icon={Bookmark01Icon} size={14} />
                    </Button>
                  )}
                  {onToggleRevision && (
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`Review ${title}`}
                      aria-pressed={revisionDue}
                      onClick={onToggleRevision}
                      className="h-7.5 w-7.5 border-[#2A2A2A] bg-[#161616] text-[#888888] hover:text-white aria-pressed:border-[#FF0000]/60 aria-pressed:bg-[#FF0000]/10 aria-pressed:text-[#FF4D4D]"
                    >
                      <Icon icon={RotateRight01Icon} size={14} />
                    </Button>
                  )}
                </div>
              </Card>
            )
          )}
          {checkpoints}
        </TabsContent>

        <TabsContent value="assignment" className="mt-0 min-w-0">
          <div className="grid gap-3 @min-[48rem]:grid-cols-2">
            <Card className="min-w-0 space-y-3 p-3 sm:p-4">
              <h3 className="text-sm font-semibold">Learning outcomes</h3>
              <ul className="list-disc space-y-2 pl-4 text-sm text-[var(--text-secondary)] marker:text-[var(--accent)]">
                {day.learningOutcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </Card>
            <Card className="min-w-0 space-y-3 p-3 sm:p-4">
              <h3 className="text-sm font-semibold">Practical assignment</h3>
              <h4 className="text-sm font-medium">{day.practicalAssignment.title}</h4>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {day.practicalAssignment.description}
              </p>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {day.deliverable}
              </p>
              {assignmentDetails}
              {editing && (
                <div className="space-y-2">
                  <label htmlFor={notesId} className="text-sm font-medium">
                    Assignment notes
                  </label>
                  <Textarea
                    id={notesId}
                    rows={3}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {lab && onOpenLab && (
                  <Button size="sm" variant="outline" onClick={() => onOpenLab(lab)}>
                    <Icon icon={CpuIcon} size={14} />
                    Open lab
                  </Button>
                )}
                {editing ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNotes(savedNotes ?? "");
                        setEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        onComplete(notes);
                        setEditing(false);
                      }}
                    >
                      Save notes and complete
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                      {notes ? "Edit notes" : "Add notes"}
                    </Button>
                    <Button
                      size="sm"
                      variant={complete ? "outline" : "primary"}
                      disabled={complete}
                      onClick={() => onComplete(notes)}
                    >
                      <Icon icon={Tick02Icon} size={14} />
                      {complete ? "Day complete" : "Mark day complete"}
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interview" className="mt-0 min-w-0 space-y-2.5">
          {day.interviewQuestions.map((question) => (
            <Card key={question.id} className="min-w-0 p-3 sm:p-4">
              <details>
                <summary className="cursor-pointer text-sm font-medium [overflow-wrap:anywhere]">
                  {question.question}{" "}
                  <span className="ml-1 inline-block rounded border border-[var(--border-default)] px-1.5 text-xs capitalize text-[var(--text-secondary)]">
                    {question.importance}
                  </span>
                </summary>
                <p className="mt-3 border-t border-[var(--border-subtle)] pt-3 text-sm leading-relaxed whitespace-pre-line text-[var(--text-secondary)]">
                  {question.answer}
                </p>
              </details>
            </Card>
          ))}
        </TabsContent>
      </CourseTabs>
    </Card>
  );
}
