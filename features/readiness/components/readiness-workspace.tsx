"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { badgeVariants } from "@/components/ui/badge";
import type { TargetReadinessResult, CompetencyReadiness } from "@/domain/readiness";
import { useReadiness } from "../hooks/use-readiness";
import { ReadinessHeader } from "./readiness-header";
import { ReadinessEvidenceSummary } from "./readiness-evidence-summary";
import { ReadinessLandscape } from "./readiness-landscape";
import { EvidenceMatrix } from "./evidence-matrix";
import { ReadinessGapsList } from "./readiness-gaps-list";
import { CompetencyInspector } from "./competency-inspector";
import { CompetencyDependencyMap } from "./competency-dependency-map";
import { ReadinessTrajectory } from "./readiness-trajectory";
import { TargetComparisonModal } from "./target-comparison-modal";
import { ReadinessAiBar } from "./readiness-ai-bar";

const views = [
  ["landscape", "Landscape"],
  ["matrix", "Evidence Matrix"],
  ["dependencies", "Dependency Map"],
  ["trajectory", "Evidence Trajectory"],
  ["gaps", "Priority Gaps"],
] as const;

interface ReadinessWorkspaceProps {
  initialData: TargetReadinessResult;
}

export function ReadinessWorkspace({ initialData }: ReadinessWorkspaceProps) {
  const [profileId, setProfileId] = React.useState<string>(initialData.profile.id);
  const [companyId, setCompanyId] = React.useState<string>("all");
  const [activeTab, setActiveTab] = React.useState<string>("landscape");
  const [isCompareOpen, setIsCompareOpen] = React.useState<boolean>(false);
  const [selectedCompetency, setSelectedCompetency] =
    React.useState<CompetencyReadiness | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = React.useState<boolean>(false);
  const inspectorTrigger = React.useRef<HTMLElement | null>(null);
  const compareTrigger = React.useRef<HTMLButtonElement | null>(null);

  const { data = initialData, isFetching } = useReadiness(
    initialData,
    profileId,
    companyId === "all" ? undefined : companyId
  );

  const handleSelectCompetency = (competency: CompetencyReadiness) => {
    inspectorTrigger.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelectedCompetency(competency);
    setIsInspectorOpen(true);
  };

  const handleProfileChange = (newProfileId: string) => {
    setProfileId(newProfileId);
    setSelectedCompetency(null);
    setIsInspectorOpen(false);
  };

  const handleCompanyChange = (newCompanyId: string) => {
    setCompanyId(newCompanyId);
    setSelectedCompetency(null);
    setIsInspectorOpen(false);
  };

  return (
    <div className="@container min-w-0 space-y-4 sm:space-y-5" aria-busy={isFetching}>
      {/* Target Profile and Status Header */}
      <ReadinessHeader
        currentProfileId={profileId}
        currentCompanyId={companyId}
        onProfileChange={handleProfileChange}
        onCompanyChange={handleCompanyChange}
        onOpenCompare={(trigger) => {
          compareTrigger.current = trigger;
          setIsCompareOpen(true);
        }}
        overallAlignment={data.overallAlignment}
      />

      {/* Aggregate Evidence Metrics & Domain Summary */}
      <ReadinessEvidenceSummary data={data} />

      {/* PRIME AI Quick Actions Bar */}
      <ReadinessAiBar profileId={profileId} />

      {/* Main Workspace Navigation & Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0 space-y-4">
        <TabsList
          aria-label="Readiness views"
          layoutId="readiness-views"
          className="grid grid-cols-2 gap-1 @min-[36rem]:grid-cols-5 @min-[49rem]:gap-3"
        >
          {views.map(([id, label]) => (
            <TabsTrigger
              key={id}
              value={id}
              className="min-h-9 min-w-0 whitespace-normal rounded-t-[var(--radius-sm)] px-1 py-2 text-xs leading-tight last:col-span-2 data-[state=active]:bg-[var(--accent-muted)] @min-[36rem]:last:col-span-1"
            >
              <span className="inline-flex flex-wrap items-center justify-center gap-1">
                {label}
                {id === "gaps" && data.gaps.length > 0 && (
                  <span
                    className={badgeVariants({
                      variant: "outline",
                      className: "px-1 py-0 text-[10px]",
                    })}
                  >
                    {data.gaps.length}
                  </span>
                )}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {isFetching && (
          <p role="status" className="text-xs text-[var(--text-secondary)]">
            Updating readiness evidence…
          </p>
        )}

        <TabsContent value="landscape" className="mt-0 focus-visible:outline-none">
          <ReadinessLandscape
            competencies={data.competencies}
            selectedCompetencyId={selectedCompetency?.competencyId}
            onSelectCompetency={handleSelectCompetency}
          />
        </TabsContent>

        <TabsContent value="matrix" className="mt-0 focus-visible:outline-none">
          <EvidenceMatrix
            competencies={data.competencies}
            onSelectCompetency={handleSelectCompetency}
          />
        </TabsContent>

        <TabsContent value="dependencies" className="mt-0 focus-visible:outline-none">
          <CompetencyDependencyMap
            competencies={data.competencies}
            onSelectCompetency={handleSelectCompetency}
          />
        </TabsContent>

        <TabsContent value="trajectory" className="mt-0 focus-visible:outline-none">
          <ReadinessTrajectory trajectory={data.trajectory} />
        </TabsContent>

        <TabsContent value="gaps" className="mt-0 focus-visible:outline-none">
          <ReadinessGapsList gaps={data.gaps} />
        </TabsContent>
      </Tabs>

      {/* Slide-over Competency Inspector Sheet */}
      <CompetencyInspector
        competency={selectedCompetency}
        open={isInspectorOpen}
        onOpenChange={setIsInspectorOpen}
        onRestoreFocus={() => inspectorTrigger.current?.focus()}
      />

      {/* Target Comparison Modal */}
      <TargetComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        currentProfileId={profileId}
        comparisons={data.comparisons}
        onSelectProfile={handleProfileChange}
        onRestoreFocus={() => compareTrigger.current?.focus()}
      />
    </div>
  );
}
