"use client";

import { Alert02Icon, AiChat01Icon, Target02Icon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { TopicMasteryResult } from "@/domain/mastery";
import type { CoreProblemMetadata } from "../types";
import { ProblemEvidenceRow } from "./problem-evidence-row";

export interface EvidenceLensProps {
  topic: TopicMasteryResult | null;
  coreMetadata: Record<string, CoreProblemMetadata>;
  className?: string;
  onAsk?: (trigger: HTMLElement) => void;
}

const eyebrow =
  "text-[10px] font-medium uppercase tracking-[0.13em] text-[var(--text-secondary)]";
const muted = "text-[var(--text-secondary)]";

export function EvidenceLens({
  topic,
  coreMetadata,
  className,
  onAsk,
}: EvidenceLensProps) {
  if (!topic) {
    return (
      <Card elevation="base" className={className}>
        <CardContent className="grid justify-items-center gap-2 px-4 py-8 text-center">
          <Icon icon={Target02Icon} size={24} className={muted} aria-hidden="true" />
          <h3 className="text-sm font-semibold">Select a skill</h3>
          <p className={"text-xs " + muted}>Choose a skill to inspect its evidence.</p>
        </CardContent>
      </Card>
    );
  }

  const solves = topic.problemMasteries.reduce(
    (sum, p) => sum + p.requirements.independentEvidenceCount,
    0
  );
  const reviews = topic.problemMasteries.reduce(
    (sum, p) => sum + p.requirements.successfulRevisionCount,
    0
  );
  const longest = topic.problemMasteries.reduce(
    (max, p) => Math.max(max, p.requirements.longestSuccessfulIntervalDays),
    0
  );
  const repeated = topic.problemMasteries.filter(
    (p) => p.evidence.repetition >= 75
  ).length;
  const metrics = [
    {
      label: "Independence",
      value: solves,
      detail: solves === 1 ? "independent solve" : "independent solves",
    },
    {
      label: "Retention",
      value: reviews,
      detail: reviews === 1 ? "successful review" : "successful reviews",
    },
    {
      label: "Repetition",
      value: repeated,
      detail:
        repeated === 1 ? "problem with repeat evidence" : "problems with repeat evidence",
    },
    {
      label: "Longest interval",
      value: longest ? longest + " days" : "—",
      detail: longest ? "verified recall" : "Awaiting verified recall",
    },
  ];
  const next =
    topic.blockers[0] ??
    (topic.level === "mastered"
      ? "Maintain recall through your scheduled reviews."
      : topic.level === "proficient"
        ? "Complete a longer-interval review to strengthen recall."
        : "Solve the remaining Core problems independently.");

  return (
    <Card
      elevation="base"
      className={cn("min-w-0", className)}
      role="region"
      aria-label={`Evidence Lens for ${topic.topicName}`}
    >
      <CardContent className="grid gap-4 p-3 sm:p-4">
        <header className="grid gap-2 border-b border-[var(--border-subtle)] pb-3">
          <p className={eyebrow}>Evidence lens</p>
          <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 className="min-w-0 break-words text-xl font-semibold tracking-tight">
              {topic.topicName}
            </h2>
            <Badge
              variant="outline"
              className={cn("capitalize", "badge-level-" + topic.level)}
            >
              {topic.level}
            </Badge>
          </div>
          <div className={"flex flex-wrap items-center gap-x-4 gap-y-1 text-xs " + muted}>
            <span className="tabular-nums">Evidence {topic.score} / 100</span>
            <span>
              <strong className="font-medium tabular-nums text-white">
                {topic.evidenceCoverage.practicedCount} / {topic.requiredProblems}
              </strong>{" "}
              Core practiced
            </span>
            <span>
              {topic.masteredProblems} mastered · {topic.proficientProblems} proficient
            </span>
          </div>
        </header>

        <Card elevation="raised">
          <CardContent className="space-y-1.5 p-3">
            <h3 className={eyebrow}>Next evidence</h3>
            <p className="text-sm leading-relaxed">{next}</p>
          </CardContent>
        </Card>

        <section className="grid gap-2">
          <h3 className="text-sm font-medium">Evidence breakdown</h3>
          <div className="grid min-w-0 grid-cols-2 gap-2">
            {metrics.map(({ label, value, detail }) => (
              <Card key={label} elevation="base" className="min-w-0">
                <CardContent className="grid gap-1 p-2.5">
                  <p className={"text-xs " + muted}>{label}</p>
                  <p className="text-sm font-semibold tabular-nums">{value}</p>
                  <p className={"text-xs " + muted}>{detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {topic.strengths.length > 0 && (
          <section className="grid gap-2">
            <h3 className="text-sm font-medium">Demonstrated strengths</h3>
            <ul className={"list-disc space-y-1 pl-4 text-xs leading-relaxed " + muted}>
              {topic.strengths.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </section>
        )}

        {topic.blockers.length > 1 && (
          <section className="grid gap-2">
            <h3 className="flex items-center gap-1.5 text-sm font-medium">
              <Icon
                icon={Alert02Icon}
                size={14}
                className="text-red-400"
                aria-hidden="true"
              />{" "}
              Evidence gaps
            </h3>
            <ul className={"list-disc space-y-1 pl-4 text-xs leading-relaxed " + muted}>
              {topic.blockers.slice(1).map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="grid gap-2 border-t border-[var(--border-subtle)] pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium">
              Core problems{" "}
              <span className={muted}>({topic.problemMasteries.length})</span>
            </h3>
            {onAsk && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(event) => onAsk(event.currentTarget)}
              >
                <Icon icon={AiChat01Icon} size={14} aria-hidden="true" /> Explain this
                skill
              </Button>
            )}
          </div>
          <div className="grid gap-1.5">
            {topic.problemMasteries.map((p, idx) => (
              <ProblemEvidenceRow
                key={p.problemId}
                mastery={p}
                metadata={coreMetadata[p.problemId]}
                sequenceIndex={idx}
              />
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
