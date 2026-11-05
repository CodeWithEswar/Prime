"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Add01Icon,
  AiChat01Icon,
  Calendar03Icon,
  Clock01Icon,
  LockKeyIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useAI } from "@/features/ai/ai-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addDays, daysBetween } from "@/domain/planning/capacity";
import {
  countsTowardsPlan,
  weekStart,
  type ScheduledWork,
} from "@/domain/planning/control";
import type { WorkRequest } from "../schema";
import {
  confirmPlanner,
  editPlannerBacklog,
  previewPlanner,
  savePlannerBacklog,
  setPlannerLock,
} from "../server/actions";
import type { PlannerView, ProposalView } from "../types";
import {
  ChoiceSelect,
  dateLabel,
  emptyRequest,
  eyebrow,
  labels,
  muted,
  priorities,
  reasons,
  weekdays,
  type Editor,
} from "./planner-fields";
import type { FundamentalsCourse } from "@/domain/fundamentals/courses";
import { PlannerSheet } from "./planner-sheet";
import { PlannerRunwayDialog } from "./planner-runway-dialog";

const splitHeader = "flex-row flex-wrap items-center justify-between gap-3 space-y-0";
export function PlannerWorkspace({
  view,
  initialDate,
  initialWork,
  initialMove,
  initialCourse,
  newWork,
}: {
  view: PlannerView;
  initialDate?: string;
  initialWork?: WorkRequest;
  initialMove?: string;
  initialCourse?: FundamentalsCourse;
  newWork: boolean;
}) {
  const router = useRouter();
  const ai = useAI();
  const aiBusy =
    ai &&
    [
      "connecting",
      "streaming",
      "tool_requested",
      "tool_running",
      "confirmation_required",
      "resuming",
    ].includes(ai.state);
  const [date, setDate] = useState(initialDate ?? view.today);
  const [tab, setTab] = useState(initialDate || initialMove ? "week" : "timeline");
  const [editor, setEditor] = useState<Editor | null>(() => {
    if (
      initialMove &&
      view.tasks.some(
        (task) => task.id === initialMove && task.status === "pending" && !task.locked
      )
    ) {
      return {
        kind: "move",
        id: initialMove,
        date: initialDate ?? addDays(view.today, 1),
        allowOverload: false,
      };
    }
    if (initialCourse)
      return {
        kind: "course",
        course: initialCourse,
        start: initialDate ?? view.today,
        minutes: 45,
      };
    if (initialWork || newWork)
      return {
        kind: "work",
        request: initialWork ?? {
          ...emptyRequest,
          ...(initialDate ? { when: "date", date: initialDate } : {}),
        },
      };
    return null;
  });
  const [proposal, setProposal] = useState<ProposalView | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, start] = useTransition();
  const [customizingRunway, setCustomizingRunway] = useState(false);
  const totalDays = daysBetween(view.start, view.target);
  const last =
    view.target > addDays(view.today, 89) ? view.target : addDays(view.today, 89);
  const day = view.days.find((d) => d.date === date);
  const monday = weekStart(date);
  const week = view.days.filter((d) => d.date >= monday && d.date <= addDays(monday, 6));
  const near = view.days.slice(0, 7).filter((d) => d.date <= view.target);
  const missed = view.tasks.filter((t) => t.date < view.today && t.status === "pending");
  const selected = view.tasks.filter(
    (t) => t.date === date && countsTowardsPlan(t.status)
  );
  const weekTasks = view.tasks.filter(
    (t) => t.date >= monday && t.date <= addDays(monday, 6) && countsTowardsPlan(t.status)
  );
  const total = (key: "planned" | "budget") => near.reduce((sum, d) => sum + d[key], 0);

  function open(next: Editor | null) {
    setEditor(next);
    setProposal(null);
    setError("");
    setNotice("");
  }
  function mutate(
    run: () => Promise<{ ok: true } | { ok: false; error: string }>,
    message: string,
    close = false
  ) {
    setError("");
    setNotice("");
    start(async () => {
      const result = await run();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (close) open(null);
      setNotice(message);
      router.refresh();
    });
  }
  function preview() {
    if (!editor) return;
    setError("");
    start(async () => {
      const result = await previewPlanner(editor);
      if (result.ok) setProposal(result.data);
      else setError(result.error);
    });
  }

  function dayButton(day: PlannerView["days"][number], compact = false) {
    const load = day.available
      ? Math.min(100, (day.planned / day.available) * 100)
      : day.planned
        ? 100
        : 0;
    const isToday = day.date === view.today;
    const isSelected = date === day.date;
    return (
      <Button
        key={day.date}
        variant="outline"
        aria-label={
          dateLabel(day.date, { weekday: "long", month: "long", day: "numeric" }) +
          (day.rest ? ", rest day" : ", " + day.planned + " minutes planned")
        }
        aria-pressed={isSelected}
        title={dateLabel(day.date) + " · " + day.planned + " min"}
        onClick={() => {
          setDate(day.date);
          setTab("week");
        }}
        className={
          (compact
            ? "relative h-7 min-w-0 overflow-hidden px-0 text-[10px] "
            : "relative h-12 min-w-0 flex-col gap-0.5 overflow-hidden px-0 ") +
          (isSelected
            ? "border-[#FF0000] ring-1 ring-[#FF0000] bg-[#161616] text-white shadow-[0_0_8px_rgba(255,0,0,0.3)] z-10"
            : "border-[#1F1F1F] bg-[#0A0A0A] hover:border-[#333333]")
        }
      >
        {compact ? (
          Number(day.date.slice(-2))
        ) : (
          <>
            <span className={eyebrow + (isToday ? " text-[#FF0000]" : "")}>
              {dateLabel(day.date, { weekday: "short" })}
            </span>
            <span className={isToday ? "font-bold text-[#FF0000]" : ""}>
              {Number(day.date.slice(-2))}
            </span>
          </>
        )}
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-white/5">
          <span
            className={
              day.planned > day.budget
                ? "block h-full bg-[#FF0000]"
                : "block h-full bg-white/50"
            }
            style={{ width: load + "%" }}
          />
        </span>
      </Button>
    );
  }

  function taskRow(task: ScheduledWork) {
    return (
      <li
        key={task.id}
        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-white/10 py-3"
      >
        <div className="min-w-0">
          <p className="break-words text-sm font-medium">{task.title}</p>
          <p className={"mt-1 text-xs " + muted}>
            {task.minutes} min · {task.priority} · {task.status.replaceAll("_", " ")}
            {task.locked ? " · Locked" : ""}
            {task.reason && reasons[task.reason] ? " · " + reasons[task.reason] : ""}
            {task.originalDate && task.originalDate !== task.date
              ? " · Originally " + dateLabel(task.originalDate)
              : ""}
          </p>
        </div>
        {task.status === "pending" && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              aria-pressed={task.locked}
              onClick={() =>
                mutate(
                  () => setPlannerLock(task.id, !task.locked),
                  task.locked ? "Commitment unlocked." : "Commitment locked."
                )
              }
            >
              <Icon icon={LockKeyIcon} size={13} />
              {task.locked ? "Unlock" : "Lock"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={busy || task.locked}
              onClick={() =>
                open({
                  kind: "move",
                  id: task.id,
                  date: task.date < view.today ? view.today : addDays(task.date, 1),
                  allowOverload: false,
                })
              }
            >
              Move
            </Button>
          </div>
        )}
      </li>
    );
  }

  const daysRemaining = Math.max(
    0,
    Math.round(
      (new Date(view.target + "T00:00:00Z").getTime() -
        new Date(view.today + "T00:00:00Z").getTime()) /
        86400000
    )
  );
  const trajectory = view.feasibility?.status ?? "on_track";
  const trajectoryText = trajectory.replace("_", " ").toUpperCase();
  const isAtRisk = trajectory === "at_risk" || trajectory === "infeasible";

  const planWork = (fixed: boolean) =>
    open({
      kind: "work",
      request: { ...emptyRequest, ...(fixed ? { when: "date", date } : {}) },
    });
  return (
    <div className="grid min-w-0 gap-5 pb-8">
      <Card className="relative overflow-hidden border-[#222222] bg-[#0A0A0A]">
        <CardContent className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-5 p-4 sm:p-6">
          <div className="min-w-0 space-y-2 w-full sm:w-auto">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#888888]">
                PREPARATION PLAN
              </span>
              <span className="text-[#333333]">/</span>
              <span className="font-mono text-xs sm:text-sm font-semibold uppercase tracking-wider text-white truncate">
                {view.role}
              </span>
              <span className="text-[#333333]">·</span>
              <span
                className={
                  "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border shrink-0 " +
                  (isAtRisk
                    ? "border-[#FF0000]/40 text-[#FF0000] bg-[#FF0000]/10"
                    : "border-[#262626] text-[#AAAAAA] bg-[#0E0E0E]")
                }
              >
                {trajectoryText}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs font-mono text-[#888888] pt-1">
              <span>
                {dateLabel(view.start, { month: "short", day: "numeric" }).toUpperCase()} —{" "}
                {dateLabel(view.target, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }).toUpperCase()}
              </span>
              <span className="text-[#333333]">·</span>
              <span className="font-bold text-white">
                {daysRemaining} DAYS REMAINING
              </span>
              <span className="text-[#333333]">·</span>
              <button
                type="button"
                onClick={() => setCustomizingRunway(true)}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-[#262626] hover:border-[#444444] bg-[#111111] hover:bg-[#191919] text-[#CCCCCC] hover:text-white transition-colors cursor-pointer select-none"
                title="Customize preparation runway"
              >
                <Icon icon={Calendar03Icon} size={11} className="text-[#FF0000]" />
                <span>{totalDays}-DAY RUNWAY</span>
              </button>
              <span className="text-[#333333]">·</span>
              <span>{view.timezone.replaceAll("_", " ")}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
            {ai?.enabled && (
              <Button
                variant="outline"
                disabled={Boolean(aiBusy)}
                className="w-full sm:w-auto justify-center h-9 text-xs font-medium border-[#262626] bg-[#0E0E0E] text-[#E0E0E0] hover:text-white hover:border-[#383838]"
                onClick={(e) => {
                  const context = { type: "planner" as const, date };
                  if (ai.reference.type !== context.type || ai.reference.date !== date) {
                    ai.newConversation(context);
                  }
                  ai.setOpen(true, e.currentTarget, context);
                }}
              >
                <Icon icon={AiChat01Icon} size={15} />
                <span>Plan with AI</span>
              </Button>
            )}
            <Button
              variant="outline"
              className={`${ai?.enabled ? "w-full" : "col-span-2"} sm:w-auto justify-center h-9 text-xs font-medium border-[#262626] bg-[#0E0E0E] text-[#E0E0E0] hover:text-white hover:border-[#383838]`}
              onClick={() =>
                open({
                  kind: "automatic",
                  target:
                    view.target < view.today ? view.today : view.target,
                  horizon: "week",
                  optional: false,
                })
              }
            >
              <span>Automatic plan</span>
            </Button>
            <Button
              className="col-span-2 sm:col-span-1 sm:w-auto justify-center h-9 bg-[#FF0000] text-white hover:bg-[#CC0000] font-semibold text-xs font-mono shadow-[0_0_12px_rgba(255,0,0,0.35)] cursor-pointer"
              onClick={() => planWork(tab === "week" && date <= view.target)}
            >
              <Icon icon={Add01Icon} size={15} />
              <span>Plan work</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {[
          {
            label: "Next 7 days",
            value: total("planned") + " / " + total("budget") + " min",
            detail: "Planned time / study budget",
            icon: Clock01Icon,
          },
          {
            label: "Target outlook",
            value: view.feasibility?.status.replaceAll("_", " ") ?? "Unavailable",
            detail: view.feasibility
              ? Math.round(view.feasibility.remainingCoreMinutes / 60) +
                " hours of Core work remaining"
              : "Curriculum estimate unavailable",
            icon: Calendar03Icon,
          },
          {
            label: "Missed commitments",
            value: missed.length.toString(),
            detail: missed.length
              ? "Review before carrying work forward"
              : "All caught up",
            icon: Settings01Icon,
          },
        ].map(({ label, value, detail, icon }) => (
          <Card
            elevation="base"
            key={label}
            className="min-w-0 last:col-span-2 sm:last:col-span-1"
          >
            <CardContent className="space-y-1.5 p-3.5">
              <p className={"flex items-center gap-2 " + eyebrow}>
                <Icon icon={icon} size={14} className="shrink-0 text-red-400" />
                {label}
              </p>
              <p className="break-words text-lg font-semibold capitalize tabular-nums">
                {value}
              </p>
              <p className={"text-xs " + muted}>{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {notice && (
        <p role="status" className="text-sm">
          {notice}
        </p>
      )}
      {error && !editor && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <Tabs value={tab} onValueChange={setTab} className="min-w-0">
        <TabsList
          variant="segmented"
          layoutId="planner-workspace"
          className="grid w-full grid-cols-4 sm:inline-flex sm:w-auto"
        >
          {["Timeline", "Week", "Backlog", "Availability"].map((label) => (
            <TabsTrigger
              key={label}
              value={label.toLowerCase()}
              className="min-w-0 px-1.5 text-xs sm:px-3"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="timeline" className="grid gap-4 pt-2">
          <Card elevation="base">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 space-y-0">
              <div>
                <CardTitle>{totalDays}-day timeline</CardTitle>
                <CardDescription>
                  The next seven days are your near-term commitments across your {totalDays}-day preparation runway. Select a day to inspect its workload.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="self-start sm:self-auto h-7 px-2.5 text-xs font-mono text-[#AAAAAA] hover:text-white border-[#262626] hover:border-[#444] rounded bg-[#0A0A0A] hover:bg-[#161616] transition-colors gap-1.5"
                onClick={() => setCustomizingRunway(true)}
              >
                <Icon icon={Calendar03Icon} size={13} className="text-[#FF0000]" />
                Customize runway
              </Button>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-2">
                {Array.from(
                  { length: Math.max(1, Math.ceil(view.days.length / 7)) },
                  (_, i) => view.days.slice(i * 7, i * 7 + 7)
                ).filter((days) => days.length > 0).map((days, i) => (
                  <div
                    className="min-w-0 rounded-md border border-white/10 p-2"
                    key={days[0]?.date ?? i}
                  >
                    <p className={eyebrow + " mb-2"}>
                      {i === 0 ? "Commitments" : "Week " + (i + 1)}{" "}
                      <span className="ml-1 normal-case tracking-normal">
                        {dateLabel(days[0].date)}
                      </span>
                    </p>
                    <div className="grid grid-cols-7 gap-1">
                      {days.map((d) => dayButton(d, true))}
                    </div>
                  </div>
                ))}
              </div>
              {view.feasibility?.recommendations[0] && (
                <p className={"text-xs " + muted}>
                  {view.feasibility.recommendations[0]}
                </p>
              )}
            </CardContent>
          </Card>
          {view.milestones.length > 0 && (
            <Card elevation="base">
              <CardHeader>
                <CardTitle>Core milestones</CardTitle>
                <CardDescription>
                  Capacity estimates from your remaining curriculum, current commitments,
                  and revision reserve.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul>
                  {view.milestones.map((stage) => (
                    <li
                      key={stage.slug}
                      className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 py-2.5 text-sm"
                    >
                      <span>
                        {stage.name}{" "}
                        <span className={"ml-2 text-xs " + muted}>
                          {stage.completed}/{stage.total} required
                        </span>
                      </span>
                      <span className={"text-xs " + muted}>
                        {stage.completed >= stage.total
                          ? "Complete"
                          : stage.estimate
                            ? "Est. " + dateLabel(stage.estimate)
                            : "Outside current capacity"}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          <Card elevation="base">
            <CardHeader className={splitHeader}>
              <div className="space-y-2">
                <CardTitle>Missed work</CardTitle>
                <CardDescription>
                  Review pending commitments and capacity conflicts.
                </CardDescription>
              </div>
              <Button variant="secondary" onClick={() => open({ kind: "rebalance" })}>
                Preview rebalance
              </Button>
            </CardHeader>
            <CardContent>
              {missed.length ? (
                <ul>{missed.map(taskRow)}</ul>
              ) : (
                <p className={"text-sm " + muted}>No pending work from previous days.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="week" className="grid gap-4 pt-2">
          <Card elevation="base">
            <CardHeader className={splitHeader}>
              <div className="space-y-1">
                <CardTitle>Week of {dateLabel(monday)}</CardTitle>
                <CardDescription>
                  Weekly commitment board · Daily study budget, rest days, and
                  commitments.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={monday <= view.today}
                  onClick={() =>
                    setDate(
                      addDays(monday, -7) < view.today ? view.today : addDays(monday, -7)
                    )
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={addDays(monday, 7) > last}
                  onClick={() => setDate(addDays(monday, 7))}
                >
                  Next
                </Button>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={"/calendar?date=" + date + "&month=" + date.slice(0, 7)}>
                    Calendar
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid grid-cols-7 gap-1.5">
                {week.map((d) => dayButton(d))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#1A1A1A] text-xs font-mono">
                <span className="text-[#AAAAAA]">
                  {weekTasks.filter((t) => t.type === "dsa_problem").length} DSA ·{" "}
                  {weekTasks.filter((t) => t.type === "revision").length} reviews ·{" "}
                  {
                    weekTasks.filter(
                      (t) => t.type !== "dsa_problem" && t.type !== "revision"
                    ).length
                  }{" "}
                  other commitments
                </span>
                <span className="text-[#888888]">
                  {week.reduce((sum, d) => sum + d.planned, 0)}m planned of{" "}
                  {week.reduce((sum, d) => sum + d.available, 0)}m capacity
                </span>
              </div>
            </CardContent>
          </Card>
          <Card
            elevation="base"
            className="border-[#FF0000]/60 ring-1 ring-[#FF0000]/40 shadow-[0_0_12px_rgba(255,0,0,0.15)]"
          >
            <CardHeader className={splitHeader}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF0000] shadow-[0_0_6px_rgba(255,0,0,0.9)]" />
                  <CardTitle>
                    {dateLabel(date, { weekday: "long", month: "short", day: "numeric" })}
                  </CardTitle>
                  {date === view.today && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF0000]/15 text-[#FF0000] border border-[#FF0000]/40 uppercase">
                      TODAY
                    </span>
                  )}
                </div>
                <CardDescription>
                  {date > view.target ? "After your target · " : ""}
                  {day?.rest ? "Rest day · " : ""}
                  {day?.planned ?? 0} planned · {day?.budget ?? 0} budget ·{" "}
                  {day?.available ?? 0} available min
                </CardDescription>
              </div>
              <Button
                size="sm"
                disabled={date > view.target}
                onClick={() => planWork(true)}
              >
                <Icon icon={Add01Icon} size={14} />
                Plan this day
              </Button>
            </CardHeader>
            <CardContent>
              {selected.length ? (
                <ul>{selected.map(taskRow)}</ul>
              ) : (
                <p className={"text-sm " + muted}>
                  {day?.rest
                    ? "Scheduled rest day. Recovery prevents cognitive fatigue."
                    : "No commitments on this day."}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="backlog" className="pt-2">
          <Card elevation="base">
            <CardHeader className={splitHeader}>
              <div className="space-y-1">
                <CardTitle>Preparation backlog</CardTitle>
                <CardDescription>
                  Keep work here until you’re ready to assign it a date.
                </CardDescription>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  open({
                    kind: "work",
                    request: { ...emptyRequest, when: "auto" },
                  })
                }
              >
                <Icon icon={Add01Icon} size={14} />
                Add to backlog
              </Button>
            </CardHeader>
            <CardContent>
              {view.backlog.length ? (
                <ul>
                  {view.backlog.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-3"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-[#181818] border border-[#262626] text-[#AAAAAA]">
                            {item.request.domain}
                          </span>
                          <p className="break-words text-sm font-medium text-white">
                            {item.title}
                          </p>
                        </div>
                        <p className={"text-xs " + muted}>
                          {labels[item.request.source]} · {item.request.count} requested ·{" "}
                          <span className="font-mono text-[#AAAAAA]">
                            ~
                            {item.request.minutes
                              ? item.request.minutes * item.request.count
                              : item.request.count * 35}
                            m
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="w-25">
                          <ChoiceSelect
                            label={"Priority for " + item.title}
                            value={item.request.priority}
                            options={priorities}
                            onChange={(priority) =>
                              mutate(
                                () => editPlannerBacklog(item.id, priority),
                                "Backlog priority updated."
                              )
                            }
                          />
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            open({
                              kind: "work",
                              request: item.request,
                              backlogId: item.id,
                              label: item.title,
                            })
                          }
                        >
                          Schedule
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          aria-label={"Remove " + item.title}
                          onClick={() =>
                            mutate(
                              () => editPlannerBacklog(item.id, "cancelled"),
                              "Removed from backlog."
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={"text-sm " + muted}>
                  No unscheduled work. Keep preparation items here until you’re ready to
                  schedule them.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="availability" className="grid gap-4 pt-2 lg:grid-cols-2">
          <Card elevation="base">
            <CardHeader>
              <CardTitle>Weekly availability</CardTitle>
              <CardDescription>
                Set recurring study hours and rest days. Preview the impact before saving.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#222222] bg-[#0E0E0E] px-3 py-2 text-sm">
                <span>
                  Planning buffer{" "}
                  <span className="ml-1 font-mono font-bold text-white">
                    {view.bufferPercent}%
                  </span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => open({ kind: "buffer", percent: view.bufferPercent })}
                >
                  Edit buffer
                </Button>
              </div>
              <ul>
                {view.rules.map((rule) => {
                  const maxDailyMinutes = Math.max(
                    ...view.rules.map((r) => r.minutes),
                    360
                  );
                  const ruleLoad = rule.rest
                    ? 0
                    : Math.round((rule.minutes / maxDailyMinutes) * 100);
                  return (
                    <li
                      key={rule.weekday}
                      className="flex items-center justify-between gap-3 border-t border-[#1A1A1A] py-2.5 text-sm"
                    >
                      <div className="min-w-[90px]">
                        <span className="font-medium text-white">
                          {weekdays[rule.weekday]}
                        </span>
                      </div>

                      <div className="flex-1 max-w-[140px] hidden sm:block">
                        <div className="h-1.5 w-full bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
                          {!rule.rest && (
                            <div
                              className="h-full bg-white/50 rounded-full"
                              style={{ width: `${ruleLoad}%` }}
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={
                            "font-mono text-xs " +
                            (rule.rest
                              ? "text-[#888888] uppercase"
                              : "text-white font-semibold")
                          }
                        >
                          {rule.rest
                            ? "Rest"
                            : `${Math.floor(rule.minutes / 60)}h ${rule.minutes % 60 ? (rule.minutes % 60) + "m" : ""}`}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={"Edit " + weekdays[rule.weekday]}
                          onClick={() => open({ kind: "rule", ...rule })}
                        >
                          Edit
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
          <Card elevation="base">
            <CardHeader className={splitHeader}>
              <div className="space-y-1">
                <CardTitle>Date exceptions</CardTitle>
                <CardDescription>
                  Override a single day’s normal availability.
                </CardDescription>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  open({ kind: "exception", date, minutes: 0, label: "", remove: false })
                }
              >
                <Icon icon={Add01Icon} size={14} />
                Add exception
              </Button>
            </CardHeader>
            <CardContent>
              {view.exceptions.length ? (
                <ul>
                  {view.exceptions.map((item) => (
                    <li
                      key={item.date}
                      className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1A1A1A] py-2.5 text-sm"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">
                            {dateLabel(item.date)}
                          </span>
                          <span className="text-[#333333]">·</span>
                          <span
                            className={
                              "font-mono text-xs " +
                              (item.minutes === 0
                                ? "text-[#FF0000] font-semibold"
                                : "text-[#AAAAAA]")
                            }
                          >
                            {item.minutes ? `${item.minutes} min` : "Unavailable"}
                          </span>
                        </div>
                        {item.label && <p className={"text-xs " + muted}>{item.label}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            open({
                              kind: "exception",
                              ...item,
                              existing: true,
                              remove: false,
                            })
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            open({ kind: "exception", ...item, remove: true })
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={"text-sm " + muted}>No date exceptions in this window.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <PlannerSheet
        editor={editor}
        view={view}
        last={last}
        proposal={proposal}
        error={error}
        busy={busy}
        onChange={setEditor}
        onClose={() => open(null)}
        onPreview={preview}
        onBack={() => {
          setProposal(null);
          setError("");
        }}
        onConfirm={() => {
          if (proposal?.id) {
            const id = proposal.id;
            mutate(() => confirmPlanner(id), "Schedule updated.", true);
          }
        }}
        onSave={() => {
          if (editor?.kind === "work")
            mutate(
              () => savePlannerBacklog(editor.request, editor.label),
              "Saved to backlog.",
              true
            );
        }}
      />
      <PlannerRunwayDialog
        open={customizingRunway}
        onOpenChange={setCustomizingRunway}
        startDate={view.start}
        currentTargetDate={view.target}
        today={view.today}
        onSuccess={(msg) => {
          setNotice(msg);
          router.refresh();
        }}
      />
    </div>
  );
}
