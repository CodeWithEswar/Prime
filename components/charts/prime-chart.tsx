"use client";
import { useId, type ReactNode } from "react";
export function PrimeChart({
  title,
  summary,
  value,
  children,
}: {
  title: string;
  summary: string;
  value?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <figure
      className="prime-chart"
      aria-labelledby={id}
      aria-describedby={`${id}-summary`}
    >
      <div className="prime-chart-heading">
        <figcaption id={id}>{title}</figcaption>
        {value && <strong className="prime-chart-value">{value}</strong>}
      </div>
      <p id={`${id}-summary`} className="prime-chart-summary">
        {summary}
      </p>
      <div className="prime-chart-plot">{children}</div>
      <span className="prime-chart-hint">
        Use arrow keys or select a point for details.
      </span>
    </figure>
  );
}
export function PrimeChartTooltip({
  active,
  title,
  lines,
}: {
  active?: boolean;
  title: string;
  lines: string[];
}) {
  return active ? (
    <div className="prime-chart-tooltip">
      <div className="prime-chart-tooltip-header">
        <span className="prime-chart-tooltip-beacon" />
        <strong>{title}</strong>
      </div>
      <div className="prime-chart-tooltip-body">
        {lines.map((line, i) => (
          <span
            key={i}
            className={
              i === 0 ? "prime-chart-tooltip-val" : "prime-chart-tooltip-meta"
            }
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  ) : null;
}
