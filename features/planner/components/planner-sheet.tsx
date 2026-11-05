"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  computePlanHealth,
  dateLabel,
  deriveWhyThisPlan,
  eyebrow,
  muted,
  PlannerFields,
  reasons,
  weekdays,
  type Editor,
} from "./planner-fields";
import type { PlannerView, ProposalView } from "../types";

export function PlannerDialog({
  editor,
  view,
  last,
  proposal,
  error,
  busy,
  onChange,
  onClose,
  onPreview,
  onBack,
  onConfirm,
  onSave,
}: {
  editor: Editor | null;
  view: PlannerView;
  last: string;
  proposal: ProposalView | null;
  error: string;
  busy: boolean;
  onChange: (next: Editor) => void;
  onClose: () => void;
  onPreview: () => void;
  onBack: () => void;
  onConfirm: () => void;
  onSave: () => void;
}) {
  const days = new Map(view.days.map((day) => [day.date, day]));
  const workload =
    proposal?.days.filter(
      (d) =>
        d.planned !== days.get(d.date)?.planned ||
        d.available !== days.get(d.date)?.available ||
        d.rest !== days.get(d.date)?.rest
    ) ?? [];
  const changes = proposal?.placements ?? [];
  const added = changes.filter((p) => !("moveId" in p)).length;

  const isRule = editor?.kind === "rule";
  const weekdayName = isRule ? weekdays[editor.weekday] : "";
  const titles = {
    work: "Plan Work",
    course: "Schedule Roadmap",
    automatic: "Automatic Plan",
    move: "Move Commitment",
    rebalance: "Rebalance Schedule",
    buffer: "Edit Planning Buffer",
    exception: "Edit Date Exception",
    rule: isRule ? `Edit ${weekdayName} Timing` : "Edit Weekly Availability",
  };
  const descriptions = {
    work: "Schedule new study commitments or add them to your backlog.",
    course: "Place curriculum milestones into your daily preparation runway.",
    automatic: "Set target date and distribute remaining tasks across your capacity.",
    move: "Reschedule this commitment to a new date.",
    rebalance: "Redistribute pending workload to restore balanced capacity.",
    buffer: "Adjust capacity reserve held for harder problems and overruns.",
    exception: "Override your normal scheduled study capacity for a specific date.",
    rule: isRule
      ? `Set study minutes and rest day status for ${weekdayName}.`
      : "Configure weekly recurring study hours and rest days.",
  };

  const title = editor ? titles[editor.kind] : "Planner";
  const isCompact =
    editor?.kind === "buffer" ||
    editor?.kind === "rule" ||
    editor?.kind === "exception";

  return (
    <Dialog
      open={Boolean(editor)}
      onOpenChange={(value) => {
        if (!value && !busy) onClose();
      }}
    >
      <DialogContent
        className={cn(
          "fixed left-[50%] top-[50%] z-50 flex flex-col gap-0 p-0 overflow-hidden bg-[#0A0A0A] border border-[#262626] shadow-2xl transition-all duration-200 ease-out translate-x-[-50%] translate-y-[-50%] w-[calc(100%-2rem)] max-h-[88vh] rounded-xl sm:rounded-2xl",
          isCompact && !proposal ? "max-w-md sm:max-w-md" : "max-w-lg sm:max-w-xl"
        )}
      >
        <DialogHeader className="border-b border-[#1F1F1F] bg-[#0E0E0E]/90 px-4 py-4 pr-12 sm:px-6">
          <p className={eyebrow}>
            {proposal
              ? "Planner · Review Impact"
              : editor?.kind === "buffer" || editor?.kind === "rule"
                ? "Availability · Setup"
                : "Planner · Setup"}
          </p>
          <DialogTitle className="text-base sm:text-lg font-bold text-white">
            {proposal?.title ?? title}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#888888]">
            {proposal
              ? "Review the impact before applying it to your schedule."
              : editor
                ? descriptions[editor.kind]
                : "Preview changes to your preparation schedule."}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          {proposal ? (
            <div className="grid gap-3">
              <Card elevation="base">
                <CardContent className="flex flex-wrap gap-x-5 gap-y-1 p-3 text-sm font-mono">
                  <span className="font-semibold text-white">{added} added</span>
                  <span className="text-[#AAAAAA]">{changes.length - added} moved</span>
                  {proposal.unplaced.length > 0 ? (
                    <span className="text-[#FF0000] font-semibold">
                      {proposal.unplaced.length} unplaced
                    </span>
                  ) : (
                    <span className="text-[#666666]">
                      {proposal.unplaced.length} unplaced
                    </span>
                  )}
                </CardContent>
              </Card>

              {/* Plan Health Operational Assessment */}
              {(() => {
                const health = computePlanHealth(proposal, view.bufferPercent);
                const whyThisPlan = deriveWhyThisPlan(proposal);
                return (
                  <>
                    <div className="rounded-md border border-[#222222] bg-[#0A0A0A] p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-2">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                          PLAN HEALTH
                        </span>
                        <span
                          className={
                            "font-mono text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border " +
                            (health.capacity === "HEALTHY"
                              ? "border-[#4CAF50]/40 text-[#4CAF50] bg-[#4CAF50]/10"
                              : health.capacity === "TIGHT"
                                ? "border-[#FFA116]/40 text-[#FFA116] bg-[#FFA116]/10"
                                : "border-[#FF0000]/40 text-[#FF0000] bg-[#FF0000]/10")
                          }
                        >
                          {health.capacity}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <span className="text-[#666666] block text-[10px] uppercase">
                            Prerequisites
                          </span>
                          <span className="text-white font-medium">
                            {health.prerequisites}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#666666] block text-[10px] uppercase">
                            Revision Coverage
                          </span>
                          <span className="text-white font-medium">
                            {health.revisionCoverage}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#666666] block text-[10px] uppercase">
                            Buffer
                          </span>
                          <span className="text-white font-medium">{health.buffer}</span>
                        </div>
                        <div>
                          <span className="text-[#666666] block text-[10px] uppercase">
                            Overloaded Days
                          </span>
                          <span
                            className={
                              health.overloadedDays > 0
                                ? "text-[#FF0000] font-bold"
                                : "text-white font-medium"
                            }
                          >
                            {health.overloadedDays}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Why This Plan */}
                    <div className="rounded-md border border-[#1A1A1A] bg-[#070707] p-3 space-y-1.5 text-xs">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#888888] font-bold block">
                        WHY THIS PLAN?
                      </span>
                      <ul className="space-y-1 text-[#CCCCCC] list-disc list-inside text-xs font-sans">
                        {whyThisPlan.map((reason, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                );
              })()}

              {proposal.target && (
                <p className="text-sm font-mono text-[#AAAAAA]">
                  Target date ·{" "}
                  <span className="text-white font-bold">
                    {dateLabel(proposal.target, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </p>
              )}
              {proposal.bufferPercent && (
                <p className="text-sm font-mono text-[#AAAAAA]">
                  Planning buffer · {view.bufferPercent}% to {proposal.bufferPercent}%
                </p>
              )}
              {changes.length > 0 && (
                <ul className="divide-y divide-white/10">
                  {changes.map((p, i) => (
                    <li key={i} className="py-2 text-sm">
                      <p className="break-words font-medium">{p.title}</p>
                      <p className={"text-xs " + muted}>
                        {"from" in p ? dateLabel(p.from) + " to " : ""}
                        {dateLabel(p.date)} · {p.minutes} min ·{" "}
                        {reasons[p.reason] ?? p.reason}
                        {p.locked ? " · Locked" : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              {workload.length > 0 && (
                <Card elevation="base">
                  <CardHeader className="p-3">
                    <CardTitle>Daily impact</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2 px-3 pb-3 text-xs">
                    {workload.map((d) => (
                      <div key={d.date} className="flex flex-wrap justify-between gap-2">
                        <span>
                          {dateLabel(d.date)}
                          {d.rest ? " · Rest" : ""}
                        </span>
                        <span className={muted}>
                          {days.get(d.date)?.planned ?? 0} to {d.planned} planned ·{" "}
                          {d.budget} budget min
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              {proposal.warnings.length > 0 && (
                <div className="space-y-2 rounded-md border border-red-500/25 bg-red-500/5 p-3 text-xs">
                  <p className="font-semibold text-red-300">Needs attention</p>
                  <ul className="list-disc space-y-1 pl-4">
                    {proposal.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                  {proposal.unplaced.length > 0 && (
                    <p className={muted}>
                      Unplaced work · {proposal.unplaced.join(", ")}
                    </p>
                  )}
                </div>
              )}
              {!changes.length && !proposal.warnings.length && (
                <p className={"text-sm " + muted}>
                  {proposal.id
                    ? "This updates your settings. Existing commitments keep their dates."
                    : "No schedule changes are needed."}
                </p>
              )}
            </div>
          ) : (
            editor && (
              <fieldset disabled={busy}>
                <PlannerFields
                  editor={editor}
                  view={view}
                  last={last}
                  onChange={onChange}
                />
              </fieldset>
            )
          )}
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>
        <DialogFooter className="flex flex-row items-center justify-end gap-2 border-t border-[#1F1F1F] bg-[#0E0E0E]/90 px-4 py-3 sm:px-6">
          <Button variant="outline" size="sm" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          {proposal ? (
            <>
              <Button variant="secondary" size="sm" disabled={busy} onClick={onBack}>
                Back to setup
              </Button>
              <Button
                size="sm"
                disabled={!proposal.id}
                loading={busy}
                onClick={onConfirm}
                className="bg-[#FF0000] text-white hover:bg-[#CC0000] font-semibold"
              >
                Confirm changes
              </Button>
            </>
          ) : (
            <>
              {editor?.kind === "work" && !editor.backlogId && (
                <Button variant="secondary" size="sm" disabled={busy} onClick={onSave}>
                  Save to backlog
                </Button>
              )}
              <Button
                size="sm"
                loading={busy}
                onClick={onPreview}
                className="bg-[#FF0000] text-white hover:bg-[#CC0000] font-semibold"
              >
                Preview changes
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { PlannerDialog as PlannerSheet };
