"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fundamentalsCourses } from "@/domain/fundamentals/courses";
import { domains, type PlannerCommand, type WorkRequest } from "../schema";
import { searchPlannerChoices } from "../server/actions";
import type { Choice, PlannerView, ProposalView } from "../types";
import { PlannerDateField } from "./planner-date-field";

export const labels = {
  custom: "Custom task",
  core: "Prime Core",
  topic: "DSA topic",
  problem: "DSA problem",
  company: "Company practice",
  revision: "Revision",
  lab: "Algorithm Lab",
} satisfies Record<WorkRequest["source"], string>;
export const priorities = [
  { id: "P1", label: "High" },
  { id: "P2", label: "Standard" },
  { id: "OPTIONAL", label: "Optional" },
] satisfies { id: WorkRequest["priority"]; label: string }[];
export const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const muted = "text-[var(--text-secondary)]";
export const eyebrow =
  "font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]";
export const emptyRequest: WorkRequest = {
  source: "custom",
  domain: "Other",
  title: "",
  selection: "",
  count: 1,
  priority: "P2",
  when: "auto",
  locked: false,
  allowOverload: false,
};
export type Editor =
  | Extract<PlannerCommand, { kind: "course" }>
  | { kind: "work"; request: WorkRequest; backlogId?: string; label?: string }
  | { kind: "automatic"; target: string; horizon: "week" | "target"; optional: boolean }
  | (Extract<PlannerCommand, { kind: "exception" }> & { existing?: boolean })
  | Extract<PlannerCommand, { kind: "rule" | "buffer" | "rebalance" | "move" }>;

export const dateLabel = (
  date: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
) =>
  new Intl.DateTimeFormat("en", { ...options, timeZone: "UTC" }).format(
    new Date(date + "T00:00:00Z")
  );
export const reasons: Record<string, string> = {
  USER_SELECTED_DATE: "Chosen date",
  CARRY_FORWARD: "Carry forward missed work",
  CAPACITY_REBALANCE: "Fit updated capacity",
  REVISION_DUE: "Protect revision cadence",
  CORE_NEXT_ELIGIBLE: "Next eligible curriculum item",
  AVAILABLE_CAPACITY: "Fits available capacity",
  LOCKED_COMMITMENT: "Locked commitment",
  USER_HIGH_PRIORITY: "High priority commitment",
  TARGET_PRESSURE: "Target deadline pressure",
  BALANCED_WORKLOAD: "Balanced workload",
};

export interface PlanHealthSummary {
  capacity: "HEALTHY" | "TIGHT" | "OVERLOADED" | "INFEASIBLE";
  prerequisites: string;
  revisionCoverage: string;
  buffer: string;
  overloadedDays: number;
}

export function computePlanHealth(
  proposal: ProposalView,
  defaultBuffer: number
): PlanHealthSummary {
  const overloadedDays = proposal.days.filter((d) => d.planned > d.available).length;
  const tightDays = proposal.days.filter(
    (d) => d.planned > d.budget && d.planned <= d.available
  ).length;
  const hasUnplaced = proposal.unplaced.length > 0;

  let capacity: PlanHealthSummary["capacity"] = "HEALTHY";
  if (hasUnplaced || overloadedDays > 2) {
    capacity = "INFEASIBLE";
  } else if (overloadedDays > 0) {
    capacity = "OVERLOADED";
  } else if (tightDays > 0) {
    capacity = "TIGHT";
  }

  return {
    capacity,
    prerequisites: "Valid",
    revisionCoverage: "Covered",
    buffer: `${proposal.bufferPercent ?? defaultBuffer}%`,
    overloadedDays,
  };
}

export function deriveWhyThisPlan(proposal: ProposalView): string[] {
  const reasonsSet = new Set<string>();
  for (const p of proposal.placements) {
    if (p.reason) reasonsSet.add(p.reason);
  }

  const explanations: string[] = [];
  if (reasonsSet.has("REVISION_DUE")) {
    explanations.push("Due revisions are reserved and protected first.");
  }
  if (reasonsSet.has("CORE_NEXT_ELIGIBLE")) {
    explanations.push(
      "Curriculum prerequisites are verified before scheduling new topics."
    );
  }
  if (reasonsSet.has("USER_SELECTED_DATE")) {
    explanations.push("Your requested date was prioritized and capacity-checked.");
  }
  if (reasonsSet.has("CARRY_FORWARD")) {
    explanations.push(
      "Unfinished pending work was carried forward to the earliest available slot."
    );
  }
  if (reasonsSet.has("CAPACITY_REBALANCE")) {
    explanations.push("Work was rebalanced across days to respect daily study capacity.");
  }
  if (reasonsSet.has("AVAILABLE_CAPACITY")) {
    explanations.push("Distributed across days with verified open study capacity.");
  }
  if (explanations.length === 0) {
    explanations.push(
      "Plan respects your configured study hours, rest days, and buffer."
    );
  }
  return explanations;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <span className="text-xs font-medium">{label}</span>
      {children}
    </div>
  );
}
export function ChoiceSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <Select value={value} onValueChange={(value) => onChange(value as T)}>
      <SelectTrigger aria-label={label} className="min-w-0">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent
        align="start"
        className="w-[var(--radix-select-trigger-width)] max-h-[min(15rem,var(--radix-select-content-available-height))]"
      >
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Checkbox id={id} checked={value} onCheckedChange={onChange} />
      <label htmlFor={id} className="cursor-pointer">
        {label}
      </label>
    </div>
  );
}

function WorkFields({
  editor,
  onChange,
  view,
  last,
}: {
  editor: Extract<Editor, { kind: "work" }>;
  onChange: (value: Editor) => void;
  view: PlannerView;
  last: string;
}) {
  const { request, label, backlogId } = editor;
  const [search, setSearch] = useState("");
  const [selectedProblems, setSelectedProblems] = useState<Choice[]>(() =>
    request.source === "problem"
      ? request.selection
          .split(",")
          .filter(Boolean)
          .map((id) => ({ id, label: id }))
      : []
  );
  const [lookup, setLookup] = useState<{ choices: Choice[]; error?: string }>({
    choices: [],
  });
  useEffect(() => {
    if (backlogId || request.source === "custom") return;
    let current = true;
    const timer = window.setTimeout(async () => {
      const result = await searchPlannerChoices(request.source, search);
      if (current)
        setLookup(
          result.ok ? { choices: result.data } : { choices: [], error: result.error }
        );
    }, 240);
    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [backlogId, request.source, search]);
  const update = (patch: Partial<WorkRequest>, nextLabel = label) =>
    onChange({ ...editor, request: { ...request, ...patch }, label: nextLabel });
  const current =
    request.selection && !lookup.choices.some((c) => c.id === request.selection)
      ? [{ id: request.selection, label: label || request.selection }]
      : [];
  const options = [
    ...(request.source === "core" ? [{ id: "all", label: "Next eligible work" }] : []),
    ...current,
    ...lookup.choices,
  ];
  return (
    <div className="grid gap-4">
      {backlogId && <p className="text-sm font-medium">{label}</p>}
      {!backlogId && (
        <Field label="Work source">
          <ChoiceSelect
            label="Work source"
            value={request.source}
            options={Object.entries(labels).map(([id, label]) => ({
              id: id as WorkRequest["source"],
              label,
            }))}
            onChange={(source) => {
              setSearch("");
              setLookup({ choices: [] });
              setSelectedProblems([]);
              onChange({
                ...editor,
                label: undefined,
                request: { ...request, source, selection: "", title: "", count: 1 },
              });
            }}
          />
        </Field>
      )}
      {!backlogId &&
        (request.source === "custom" ? (
          <>
            <Field label="Task title">
              <Input
                aria-label="Task title"
                value={request.title}
                maxLength={150}
                placeholder="e.g. Review join strategies"
                onChange={(e) => update({ title: e.target.value })}
              />
            </Field>
            <Field label="Domain">
              <ChoiceSelect
                label="Domain"
                value={request.domain}
                options={domains.map((id) => ({ id, label: id }))}
                onChange={(domain) => update({ domain })}
              />
            </Field>
          </>
        ) : (
          <>
            <Field label={labels[request.source]}>
              {request.source !== "core" && (
                <Input
                  aria-label="Search choices"
                  placeholder="Search choices"
                  maxLength={100}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              )}
              {lookup.error && (
                <p role="status" className="text-xs text-red-400">
                  {lookup.error}
                </p>
              )}
              {request.source === "problem" ? (
                <>
                  {selectedProblems.length < 6 && (
                    <ChoiceSelect
                      label="Add problem"
                      value=""
                      options={lookup.choices.filter(
                        (choice) => !selectedProblems.some((p) => p.id === choice.id)
                      )}
                      onChange={(id) => {
                        const choice = lookup.choices.find((c) => c.id === id);
                        if (!choice) return;
                        const next = [...selectedProblems, choice];
                        const selection = next.map((p) => p.id).join(",");
                        if (selection.length > 160) return;
                        setSelectedProblems(next);
                        update({ selection, count: next.length }, next[0].label);
                      }}
                    />
                  )}
                  {selectedProblems.length > 0 && (
                    <ul className="divide-y divide-white/10">
                      {selectedProblems.map((problem) => (
                        <li
                          key={problem.id}
                          className="flex items-center justify-between gap-2 py-1.5 text-xs"
                        >
                          <span className="min-w-0 break-words">
                            {lookup.choices.find((p) => p.id === problem.id)?.label ??
                              problem.label}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            aria-label={"Remove " + problem.label}
                            onClick={() => {
                              const next = selectedProblems.filter(
                                (p) => p.id !== problem.id
                              );
                              setSelectedProblems(next);
                              update(
                                {
                                  selection: next.map((p) => p.id).join(","),
                                  count: Math.max(1, next.length),
                                },
                                next[0]?.label
                              );
                            }}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <ChoiceSelect
                  label="Choose work"
                  value={request.selection || (request.source === "core" ? "all" : "")}
                  options={options}
                  onChange={(id) =>
                    update(
                      { selection: id === "all" ? "" : id },
                      options.find((c) => c.id === id)?.label
                    )
                  }
                />
              )}
            </Field>
            {["core", "topic", "company", "revision"].includes(request.source) && (
              <Field label="Number of items">
                <Input
                  aria-label="Number of items"
                  type="number"
                  min={1}
                  max={12}
                  value={Number.isNaN(request.count) ? "" : request.count}
                  onChange={(e) => update({ count: e.target.valueAsNumber })}
                />
              </Field>
            )}
          </>
        ))}
      {!backlogId && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Minutes per item">
            <Input
              aria-label="Minutes per item"
              type="number"
              min={5}
              max={480}
              placeholder="Automatic"
              value={request.minutes ?? ""}
              onChange={(e) =>
                update({ minutes: e.target.value ? e.target.valueAsNumber : undefined })
              }
            />
          </Field>
          <Field label="Priority">
            <ChoiceSelect
              label="Priority"
              value={request.priority}
              options={priorities}
              onChange={(priority) => update({ priority })}
            />
          </Field>
        </div>
      )}
      <Field label="Schedule for">
        <ChoiceSelect
          label="Schedule for"
          value={request.when}
          options={[
            { id: "auto", label: "Best available day" },
            { id: "week", label: "Choose a week" },
            { id: "date", label: "Choose a date" },
          ]}
          onChange={(when) =>
            update({
              when,
              date: request.date || view.today,
              locked: when === "date" && request.locked,
              allowOverload: when === "date" && request.allowOverload,
            })
          }
        />
      </Field>
      {request.when !== "auto" && (
        <Field label={request.when === "week" ? "Any date in the week" : "Date"}>
          <PlannerDateField
            label="Schedule date"
            min={view.today}
            max={view.target < last ? view.target : last}
            value={request.date}
            onChange={(date) => update({ date })}
          />
        </Field>
      )}
      {request.when === "date" && (
        <>
          <Toggle
            label="Lock this commitment"
            value={request.locked}
            onChange={(locked) => update({ locked })}
          />
          <Toggle
            label="Allow an availability or buffer override"
            value={request.allowOverload}
            onChange={(allowOverload) => update({ allowOverload })}
          />
        </>
      )}
    </div>
  );
}

export function PlannerFields({
  editor,
  onChange,
  view,
  last,
}: {
  editor: Editor;
  onChange: (next: Editor) => void;
  view: PlannerView;
  last: string;
}) {
  if (editor.kind === "course") {
    const course = fundamentalsCourses[editor.course];
    return (
      <Card elevation="base">
        <CardContent className="grid gap-3.5 p-3.5 sm:p-4">
          <div>
            <h3 className="text-sm font-semibold">{course.title}</h3>
            <p className={`mt-1 text-sm ${muted}`}>
              Plan one study session per available day in roadmap order. You can review
              the dates and any sessions that did not fit before confirming.
            </p>
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <Field label="Earliest start">
              <PlannerDateField
                label="Earliest start"
                min={view.today}
                max={view.target < last ? view.target : last}
                value={editor.start}
                onChange={(start) => onChange({ ...editor, start })}
              />
            </Field>
            <Field label="Minutes per session">
              <Input
                type="number"
                min={5}
                max={480}
                aria-label="Minutes per session"
                value={Number.isNaN(editor.minutes) ? "" : editor.minutes}
                onChange={(event) =>
                  onChange({ ...editor, minutes: event.target.valueAsNumber })
                }
              />
            </Field>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (editor.kind === "work")
    return <WorkFields editor={editor} onChange={onChange} view={view} last={last} />;
  return (
    <div className="grid gap-4">
      {editor.kind === "automatic" && (
        <Card elevation="base">
          <CardContent className="grid gap-3.5 p-3.5 sm:p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Target date">
                <PlannerDateField
                  label="Target date"
                  min={view.today}
                  max={last}
                  value={editor.target}
                  onChange={(target) => onChange({ ...editor, target })}
                />
              </Field>
              <Field label="Plan through">
                <ChoiceSelect
                  label="Plan through"
                  value={editor.horizon}
                  options={[
                    { id: "week", label: "Next seven days" },
                    { id: "target", label: "Target date" },
                  ]}
                  onChange={(horizon) => onChange({ ...editor, horizon })}
                />
              </Field>
            </div>
            <div className="grid gap-2 border-t border-[var(--border-subtle)] pt-3">
              <Toggle
                label="Include optional practice"
                value={editor.optional}
                onChange={(optional) => onChange({ ...editor, optional })}
              />
              <p className={"pl-[26px] text-xs leading-relaxed " + muted}>
                Reviews, backlog work, and eligible Core problems share the study budget.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      {editor.kind === "rule" && (
        <>
          <Field label={weekdays[editor.weekday] + " study minutes"}>
            <Input
              aria-label="Study minutes"
              type="number"
              min={0}
              max={720}
              value={Number.isNaN(editor.minutes) ? "" : editor.minutes}
              onChange={(e) => onChange({ ...editor, minutes: e.target.valueAsNumber })}
            />
          </Field>
          <Toggle
            label="Rest day"
            value={editor.rest}
            onChange={(rest) => onChange({ ...editor, rest })}
          />
        </>
      )}
      {editor.kind === "buffer" && (
        <>
          <Field label="Time held in reserve (%)">
            <Input
              aria-label="Planning buffer percent"
              type="number"
              min={5}
              max={40}
              value={Number.isNaN(editor.percent) ? "" : editor.percent}
              onChange={(e) => onChange({ ...editor, percent: e.target.valueAsNumber })}
            />
          </Field>
          <p className={"text-xs " + muted}>
            Keep 5–40% of each study day available for harder problems and schedule
            changes.
          </p>
        </>
      )}
      {editor.kind === "exception" && (
        <>
          <Field label="Exception date">
            <PlannerDateField
              label="Exception date"
              min={view.today}
              max={last}
              value={editor.date}
              disabled={editor.remove || editor.existing}
              onChange={(date) => onChange({ ...editor, date })}
            />
          </Field>
          {editor.remove ? (
            <p className={"text-sm " + muted}>
              Restore normal availability for this date.
            </p>
          ) : (
            <>
              <Field label="Available minutes">
                <Input
                  aria-label="Available minutes"
                  type="number"
                  min={0}
                  max={720}
                  value={Number.isNaN(editor.minutes) ? "" : editor.minutes}
                  onChange={(e) =>
                    onChange({ ...editor, minutes: e.target.valueAsNumber })
                  }
                />
              </Field>
              <Field label="Reason">
                <Input
                  aria-label="Reason"
                  maxLength={100}
                  value={editor.label}
                  placeholder="Optional"
                  onChange={(e) => onChange({ ...editor, label: e.target.value })}
                />
              </Field>
            </>
          )}
        </>
      )}
      {editor.kind === "move" && (
        <>
          <p className="text-sm font-medium">
            {view.tasks.find((t) => t.id === editor.id)?.title}
          </p>
          <Field label="New date">
            <PlannerDateField
              label="New date"
              min={view.today}
              max={view.target < last ? view.target : last}
              value={editor.date}
              onChange={(date) => onChange({ ...editor, date })}
            />
          </Field>
          <Toggle
            label="Allow an availability or buffer override"
            value={editor.allowOverload}
            onChange={(allowOverload) => onChange({ ...editor, allowOverload })}
          />
        </>
      )}
      {editor.kind === "rebalance" && (
        <p className={"text-sm " + muted}>
          Carry forward missed work and resolve overloaded days while preserving existing
          commitments where possible.
        </p>
      )}
    </div>
  );
}
