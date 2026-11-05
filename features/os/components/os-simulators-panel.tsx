"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import {
  CpuIcon,
  Clock01Icon,
  LockIcon,
  Route01Icon,
  Layers01Icon,
  DatabaseIcon,
} from "@hugeicons/core-free-icons";
import { ProcessStateLab } from "./simulators/process-state-lab";
import { CPUSchedulingStudio } from "./simulators/cpu-scheduling-studio";
import { SynchronizationStudio } from "./simulators/synchronization-studio";
import { BankersStudio } from "./simulators/bankers-studio";
import { PageReplacementStudio } from "./simulators/page-replacement-studio";
import { DiskSchedulingStudio } from "./simulators/disk-scheduling-studio";

interface OSSimulatorsPanelProps {
  activeLabSlug?: string;
  onRecordLabAttempt?: (labId: string, status: "attempted" | "completed" | "needs_revision", notes?: string) => void;
}

export function OSSimulatorsPanel({
  activeLabSlug = "process-state",
  onRecordLabAttempt,
}: OSSimulatorsPanelProps) {
  const [selectedLab, setSelectedLab] = useState<string>(activeLabSlug);

  const labs = [
    { id: "process-state", title: "Process State Lab", icon: CpuIcon },
    { id: "cpu-scheduling", title: "CPU Scheduling Studio", icon: Clock01Icon },
    { id: "synchronization", title: "Synchronization Studio", icon: LockIcon },
    { id: "bankers", title: "Banker's Algorithm", icon: Route01Icon },
    { id: "page-replacement", title: "Page Replacement", icon: Layers01Icon },
    { id: "disk-scheduling", title: "Disk Scheduling", icon: DatabaseIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Studio Selector Bar (Tabs) */}
      <Tabs value={selectedLab} onValueChange={setSelectedLab} className="w-full">
        <TabsList
          layoutId="os-simulators-panel-tabs"
          className="h-auto w-full justify-start gap-1.5 overflow-x-auto bg-[#0A0A0A] p-1.5 border border-[#1F1F1F] rounded-xl no-scrollbar flex-nowrap sm:flex-wrap"
        >
          {labs.map((lab) => (
            <TabsTrigger
              key={lab.id}
              value={lab.id}
              className="h-8 px-3 text-xs shrink-0 data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-[#FF0000] data-[state=active]:shadow-sm text-[#888888] hover:text-white"
            >
              <Icon icon={lab.icon} size={14} className="mr-1.5 shrink-0" />
              {lab.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Active Studio Rendering */}
      <div>
        {selectedLab === "process-state" && (
          <ProcessStateLab
            onComplete={() => onRecordLabAttempt?.("os-lab-process-state", "completed", "Verified 5-state lifecycle")}
          />
        )}
        {selectedLab === "cpu-scheduling" && <CPUSchedulingStudio />}
        {selectedLab === "synchronization" && <SynchronizationStudio />}
        {selectedLab === "bankers" && <BankersStudio />}
        {selectedLab === "page-replacement" && <PageReplacementStudio />}
        {selectedLab === "disk-scheduling" && <DiskSchedulingStudio />}
      </div>
    </div>
  );
}

