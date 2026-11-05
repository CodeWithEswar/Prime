import { badgeVariants } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CompetencyReadiness } from "@/domain/readiness";
import { ReadinessStatusBadge } from "./readiness-status";

const domains = [
  ["dsa", "Data Structures & Algorithms"],
  ["fundamentals", "Computer Science Fundamentals"],
  ["aptitude", "Aptitude & Problem Solving"],
  ["mock", "Interview Practice & Mocks"],
] as const;

interface ReadinessLandscapeProps {
  competencies: CompetencyReadiness[];
  selectedCompetencyId?: string;
  onSelectCompetency: (competency: CompetencyReadiness) => void;
}

export function ReadinessLandscape({
  competencies,
  selectedCompetencyId,
  onSelectCompetency,
}: ReadinessLandscapeProps) {
  return (
    <div className="space-y-5">
      {domains.map(([domain, title]) => {
        const items = competencies.filter((item) => item.domain === domain);
        if (!items.length) return null;
        const aligned = items.filter((item) => item.status === "evidence_aligned").length;

        return (
          <section key={domain} className="space-y-2">
            <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h2 className="text-sm font-semibold">{title}</h2>
              <p className="font-mono text-xs text-[var(--text-secondary)]">
                {aligned}/{items.length} aligned
              </p>
            </header>
            <Card elevation="raised" className="overflow-hidden">
              <ul className="grid gap-px bg-[var(--border-subtle)] @min-[40rem]:grid-cols-2">
                {items.map((item) => (
                  <li
                    key={item.competencyId}
                    className="min-w-0 bg-[var(--surface-raised)]"
                  >
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      data-selected={selectedCompetencyId === item.competencyId}
                      onClick={() => onSelectCompetency(item)}
                      className="grid w-full min-w-0 gap-1.5 px-3 py-2.5 text-left hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent)] data-[selected=true]:bg-[var(--accent-muted)] sm:px-4"
                    >
                      <span className="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1">
                        <span className="min-w-0 text-sm font-semibold [overflow-wrap:anywhere]">
                          {item.name}
                        </span>
                        <ReadinessStatusBadge status={item.status} />
                      </span>
                      <span className="text-xs leading-relaxed text-[var(--text-secondary)]">
                        {item.status === "not_assessed"
                          ? "No evidence yet"
                          : item.supportingEvidence[0] || item.summary}
                      </span>
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={badgeVariants({
                            variant: "outline",
                            className: "px-1.5 py-0 text-[10px] capitalize",
                          })}
                        >
                          {item.importance}
                        </span>
                        {item.algorithmLabSlug && (
                          <span
                            className={badgeVariants({
                              variant: "secondary",
                              className: "px-1.5 py-0 text-[10px]",
                            })}
                          >
                            Lab
                          </span>
                        )}
                        {item.confidence !== "insufficient" && (
                          <span className="text-xs text-[var(--text-secondary)]">
                            {item.confidence} confidence
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        );
      })}
    </div>
  );
}
