"use client";

import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Flowchart01Icon, AlertCircleIcon } from "@hugeicons/core-free-icons";
import type { CompetencyReadiness } from "@/domain/readiness";
import { ReadinessStatusBadge } from "./readiness-status";

interface CompetencyDependencyMapProps {
  competencies: CompetencyReadiness[];
  onSelectCompetency: (competency: CompetencyReadiness) => void;
}

interface DependencyChain {
  id: string;
  title: string;
  description: string;
  competencyIds: string[];
}

const CANONICAL_CHAINS: DependencyChain[] = [
  {
    id: "linear-pointers",
    title: "Linear & Pointer Sequences",
    description:
      "Array representations form the prerequisite baseline for two-pointer scans and sliding windows.",
    competencyIds: ["dsa-arrays", "dsa-two-pointers", "dsa-sliding-window"],
  },
  {
    id: "hierarchical-graphs",
    title: "Hierarchical & Graph Traversals",
    description:
      "Buffer stacks feed into recursive tree traversals, unlocking DAGs, cyclic graph algorithms, and DP.",
    competencyIds: ["dsa-stack-queue", "dsa-trees", "dsa-graphs", "dsa-dp"],
  },
  {
    id: "interval-search",
    title: "Logarithmic Boundaries & State Search",
    description:
      "Binary search and recursive state exploration branch from array indexing fundamentals.",
    competencyIds: ["dsa-arrays", "dsa-binary-search", "dsa-backtracking"],
  },
  {
    id: "systems-data",
    title: "Database Engines & Relational Data",
    description:
      "B-Tree storage engines and ACID transaction mechanics precede relational query optimization.",
    competencyIds: ["fund-dbms", "fund-sql"],
  },
  {
    id: "os-networking",
    title: "Systems Concurrency & Network Protocols",
    description:
      "OS process scheduling, thread synchronization, and memory layouts underpin distributed TCP/IP socket architectures.",
    competencyIds: ["fund-os", "fund-networks"],
  },
  {
    id: "interview-simulation",
    title: "Mock Interview Evolution",
    description:
      "Timed syntax and clean algorithmic code delivery precede architectural defense under senior scrutiny.",
    competencyIds: ["mock-coding", "mock-technical"],
  },
];

export function CompetencyDependencyMap({
  competencies,
  onSelectCompetency,
}: CompetencyDependencyMapProps) {
  const compMap = new Map<string, CompetencyReadiness>();
  for (const c of competencies) {
    compMap.set(c.competencyId, c);
  }

  return (
    <div className="space-y-3">
      <Card
        elevation="raised"
        className="p-3 text-xs text-[var(--text-secondary)] sm:p-4"
      >
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Icon
            icon={Flowchart01Icon}
            size={15}
            className="shrink-0 text-[var(--accent)]"
            aria-hidden="true"
          />
          Prerequisite chains
        </h2>
        <p className="mt-1 leading-relaxed">
          Start with earlier skills in each chain. Select a skill to inspect its evidence.
        </p>
      </Card>

      <div className="grid min-w-0 gap-3">
        {CANONICAL_CHAINS.map((chain) => {
          const chainItems = chain.competencyIds
            .map((id) => compMap.get(id))
            .filter((item): item is CompetencyReadiness => !!item);

          if (chainItems.length === 0) return null;

          return (
            <Card key={chain.id} elevation="raised" className="min-w-0 p-3 sm:p-4">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-white">{chain.title}</h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {chain.description}
                </p>
              </div>

              {/* Chain flow visualization */}
              <ol className="grid min-w-0 gap-2 @min-[32rem]:grid-cols-2 @min-[54rem]:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
                {chainItems.map((item, index) => {
                  const isBlockedByPrev =
                    index > 0 &&
                    chainItems[index - 1].status !== "evidence_aligned" &&
                    item.status === "not_assessed";

                  return (
                    <li key={item.competencyId} className="min-w-0">
                      {/* Node Box */}
                      <button
                        type="button"
                        onClick={() => onSelectCompetency(item)}
                        aria-haspopup="dialog"
                        className="flex h-full w-full min-w-0 flex-col rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-interactive)] p-2.5 text-left hover:bg-[var(--surface-hover)]"
                      >
                        <span className="flex w-full flex-wrap items-center justify-between gap-1">
                          <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                            Step {index + 1}
                          </span>
                          <ReadinessStatusBadge status={item.status} />
                        </span>

                        <span className="mt-1.5">
                          <span className="block text-xs font-semibold text-white">
                            {item.name}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-[var(--text-secondary)]">
                            {item.summary}
                          </span>
                        </span>

                        {isBlockedByPrev && (
                          <span className="mt-2 flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
                            <Icon
                              icon={AlertCircleIcon}
                              size={12}
                              className="shrink-0 text-[var(--accent)]"
                              aria-hidden="true"
                            />
                            Prior prerequisite incomplete
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
