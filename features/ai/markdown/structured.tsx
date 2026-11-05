"use client";
import { z } from "zod";
import type { ReactNode } from "react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { AIControl } from "../components/ai-control";
import "./structured.css";
export const technicalBlockSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("complexity"),
      time: z.string().max(160),
      space: z.string().max(160),
      explanation: z.string().max(1000).optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("algorithm"),
      steps: z
        .array(
          z
            .object({
              title: z.string().max(160),
              detail: z.string().max(600).optional(),
            })
            .strict()
        )
        .min(1)
        .max(12),
    })
    .strict(),
  z
    .object({
      kind: z.literal("correction"),
      statement: z.string().max(1500),
      correction: z.string().max(3000),
      improved: z.string().max(3000),
    })
    .strict(),
  z
    .object({
      kind: z.literal("callout"),
      tone: z.enum(["note", "important", "warning"]),
      title: z.string().max(100),
      body: z.string().max(3000),
    })
    .strict(),
]);
export type TechnicalBlock = z.infer<typeof technicalBlockSchema>;
export function HintTrace({
  level,
  children,
  onNext,
}: {
  level?: number;
  children: ReactNode;
  onNext?: () => void;
}) {
  return (
    <section
      className="prime-hint-trace"
      aria-label={level ? `Hint level ${level}` : "Progressive hint"}
    >
      <span className="prime-technical-label">
        Hint{level ? ` ${String(level).padStart(2, "0")}` : ""}
      </span>
      {children}
      {onNext && (!level || level < 5) && (
        <AIControl icon={Add01Icon} onClick={onNext}>
          Reveal next hint
        </AIControl>
      )}
    </section>
  );
}
export function TechnicalContent({ block }: { block: TechnicalBlock }) {
  const parsed = technicalBlockSchema.safeParse(block);
  if (!parsed.success) return null;
  const value = parsed.data;
  if (value.kind === "complexity")
    return (
      <section className="prime-complexity">
        <span className="prime-technical-label">Complexity</span>
        <dl>
          <div>
            <dt>Time</dt>
            <dd>{value.time}</dd>
          </div>
          <div>
            <dt>Space</dt>
            <dd>{value.space}</dd>
          </div>
        </dl>
        {value.explanation && <p>{value.explanation}</p>}
      </section>
    );
  if (value.kind === "algorithm")
    return (
      <section className="prime-algorithm">
        <span className="prime-technical-label">Algorithm</span>
        <ol>
          {value.steps.map((step, i) => (
            <li key={i}>
              <strong>{step.title}</strong>
              {step.detail && <p>{step.detail}</p>}
            </li>
          ))}
        </ol>
      </section>
    );
  if (value.kind === "correction")
    return (
      <section className="prime-correction">
        <span className="prime-technical-label">Correction</span>
        <dl>
          <dt>Your statement</dt>
          <dd>{value.statement}</dd>
          <dt>What needs correction</dt>
          <dd>{value.correction}</dd>
          <dt>Interview-ready</dt>
          <dd>{value.improved}</dd>
        </dl>
      </section>
    );
  return (
    <aside className="prime-callout" data-tone={value.tone}>
      <span className="prime-technical-label">{value.tone}</span>
      <h3>{value.title}</h3>
      <p>{value.body}</p>
    </aside>
  );
}
