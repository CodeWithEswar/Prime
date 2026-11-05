import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { TargetReadinessResult } from "@/domain/readiness";

const domains = [
  ["dsa", "DSA"],
  ["fundamentals", "Fundamentals"],
  ["aptitude", "Aptitude"],
  ["mock", "Mocks"],
] as const;

export function ReadinessEvidenceSummary({ data }: { data: TargetReadinessResult }) {
  const metrics = [
    { label: "Core Requirements", value: `${data.coreCoveragePercentage}%` },
    { label: "Evidence Aligned", value: data.alignedCount },
    { label: "In Development", value: data.developingCount },
    { label: "Needs Attention", value: data.needsAttentionCount },
  ];

  return (
    <Card elevation="raised" className="overflow-hidden">
      {data.companyEmphasis && (
        <div className="space-y-1.5 border-b border-[var(--border-subtle)] bg-[var(--accent-muted)] px-3 py-2.5 text-xs sm:px-4">
          <Badge variant="outline" className="border-[var(--accent-border)] text-white">
            {data.companyEmphasis.name} emphasis
          </Badge>
          <p className="text-[var(--text-secondary)]">
            {data.companyEmphasis.description}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Company emphasis uses PRIME-defined preparation guidance.
          </p>
        </div>
      )}
      <dl
        aria-label="Readiness summary"
        className="grid grid-cols-2 gap-px bg-[var(--border-subtle)] @min-[36rem]:grid-cols-4"
      >
        {metrics.map(({ label, value }, index) => (
          <div
            key={label}
            className="min-w-0 bg-[var(--surface-raised)] px-3 py-2.5 sm:px-4"
          >
            <dt className="text-xs leading-snug text-[var(--text-secondary)]">{label}</dt>
            <dd className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              {index === 3 && data.needsAttentionCount > 0 && (
                <span
                  aria-hidden="true"
                  className="size-1.5 self-center rounded-full bg-[var(--accent)]"
                />
              )}
              <strong className="font-mono text-xl font-semibold tabular-nums sm:text-2xl">
                {value}
              </strong>
              {index === 0 && (
                <span className="text-[11px] text-[var(--text-secondary)]">
                  {data.assessedCount}/{data.totalCompetencies} assessed
                </span>
              )}
              {index === 0 && (
                <Progress
                  value={data.coreCoveragePercentage}
                  size="sm"
                  aria-hidden="true"
                />
              )}
            </dd>
          </div>
        ))}
      </dl>
      <dl
        aria-label="Assessed by domain"
        className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[var(--border-subtle)] px-3 py-2.5 @min-[36rem]:grid-cols-4 sm:px-4"
      >
        {domains.map(([key, label]) => (
          <div
            key={key}
            className="flex flex-wrap items-baseline justify-between gap-x-2 text-xs"
          >
            <dt className="text-[var(--text-secondary)]">{label}</dt>
            <dd className="font-mono tabular-nums">
              {data.domainSummaries[key]?.assessed ?? 0}/
              {data.domainSummaries[key]?.total ?? 0}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
