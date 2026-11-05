"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  computePlanHealth,
  dateLabel,
  deriveWhyThisPlan,
  eyebrow,
  muted,
  PlannerFields,
  reasons,
  type Editor,
} from "./planner-fields";
import type { PlannerView, ProposalView } from "../types";

export function PlannerSheet({
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
  const titles = {
    work: "Plan work",
    course: "Schedule roadmap",
    automatic: "Automatic plan",
    move: "Move commitment",
    rebalance: "Rebalance schedule",
    buffer: "Edit planning buffer",
    exception: "Edit date exception",
    rule: "Edit weekly availability",
  };
  const title = editor ? titles[editor.kind] : "Planner";
  return (
    <Sheet
      open={Boolean(editor)}
      onOpenChange={(value) => {
        if (!value && !busy) onClose();
      }}
    >
      <SheetContent className="left-0 right-auto flex h-dvh w-dvw flex-col gap-0 p-0 sm:left-auto sm:right-0 sm:w-full sm:max-w-lg">
        <SheetHeader className="border-b border-white/10 px-4 py-4 pr-12 sm:px-6 sm:pr-12">
          <p className={eyebrow}>Planner · {proposal ? "Review" : "Setup"}</p>
          <SheetTitle>{proposal?.title ?? title}</SheetTitle>
          <SheetDescription>
            {proposal
              ? "Review the impact before applying it to your schedule."
              : editor?.kind === "automatic"
                ? "Set your target and choose how far ahead to plan."
                : "Preview changes to your preparation schedule."}
          </SheetDescription>
        </SheetHeader>
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
        <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
          {proposal ? (
            <>
              <Button variant="secondary" disabled={busy} onClick={onBack}>
                Back to setup
              </Button>
              <Button disabled={!proposal.id} loading={busy} onClick={onConfirm}>
                Confirm changes
              </Button>
            </>
          ) : (
            <>
              {editor?.kind === "work" && !editor.backlogId && (
                <Button variant="secondary" disabled={busy} onClick={onSave}>
                  Save to backlog
                </Button>
              )}
              <Button loading={busy} onClick={onPreview}>
                Preview changes
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
