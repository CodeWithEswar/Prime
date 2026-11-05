"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeIcon, Layers01Icon } from "@hugeicons/core-free-icons";
import { ClassObjectStudio } from "./simulators/class-object-studio";
import { ObjectLifecycleStudio } from "./simulators/object-lifecycle-studio";
import { InheritanceStudio } from "./simulators/inheritance-studio";
import { DispatchStudio } from "./simulators/dispatch-studio";
import { EncapsulationStudio } from "./simulators/encapsulation-studio";
import { InterfaceStudio } from "./simulators/interface-studio";
import { AccessStudio } from "./simulators/access-studio";
import { EqualityStudio } from "./simulators/equality-studio";
import { SolidStudio } from "./simulators/solid-studio";
import { PatternsStudio } from "./simulators/patterns-studio";
import type { UserOOPLabAttempt } from "@/domain/oop";

interface OOPLabPanelProps {
  activeLabSlug: string;
  onSelectLab: (slug: string) => void;
  labAttempts: Record<string, UserOOPLabAttempt>;
  onRecordAttempt: (labId: string, isSuccess?: boolean, notes?: string) => void;
}

export function OOPLabPanel({
  activeLabSlug,
  onSelectLab,
  labAttempts,
  onRecordAttempt,
}: OOPLabPanelProps) {
  const labsList = [
    { slug: "class-object", number: 1, title: "Class & Object Explorer" },
    { slug: "object-lifecycle", number: 2, title: "Object Lifecycle & References" },
    { slug: "inheritance", number: 3, title: "Inheritance Tree Builder" },
    { slug: "dispatch", number: 4, title: "Polymorphism Dispatch Simulator" },
    { slug: "encapsulation", number: 5, title: "Encapsulation Boundary Explorer" },
    { slug: "interface", number: 6, title: "Abstract Class vs Interface Lab" },
    { slug: "access", number: 7, title: "Access Modifier Matrix" },
    { slug: "equality", number: 8, title: "Java Memory & Equality Explorer" },
    { slug: "solid", number: 9, title: "SOLID Refactoring Studio" },
    { slug: "patterns", number: 10, title: "Design Pattern Explorer" },
  ];

  return (
    <div className="space-y-6">
      {/* Studio Header & Lab Selector Pills */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1F1F1F] pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000]">
              PRIME Interactive Laboratory
            </span>
            <Badge variant="outline" className="border-[#262626] bg-[#141414] text-[#CCCCCC]">
              10 Deterministic Simulators
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            OOP Engineering & System Architecture Laboratories
          </h2>
        </div>
      </div>

      {/* Lab Tabs Selector */}
      <Tabs value={activeLabSlug} onValueChange={onSelectLab} className="w-full">
        <TabsList
          layoutId="oop-lab-panel-tabs"
          className="h-auto w-full justify-start gap-1.5 overflow-x-auto bg-[#0A0A0A] p-1.5 border border-[#1F1F1F] rounded-xl no-scrollbar flex-nowrap sm:flex-wrap"
        >
          {labsList.map((lab) => {
            const isDone = Boolean(labAttempts[`oop-lab-${lab.slug}`]);

            return (
              <TabsTrigger
                key={lab.slug}
                value={lab.slug}
                className="h-8 px-3 text-xs shrink-0 data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-[#FF0000] data-[state=active]:shadow-sm text-[#888888] hover:text-white"
              >
                <span className="font-mono text-[10px] mr-1.5 text-[#FF4D4D]">
                  LAB {lab.number.toString().padStart(2, "0")}
                </span>
                {lab.title}
                {isDone && <span className="ml-1 text-green-400">✓</span>}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Dynamic Lab Studio Rendering */}
      <div className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-6">
        {activeLabSlug === "class-object" && (
          <ClassObjectStudio onComplete={() => onRecordAttempt("class-object", true)} />
        )}
        {activeLabSlug === "object-lifecycle" && (
          <ObjectLifecycleStudio onComplete={() => onRecordAttempt("object-lifecycle", true)} />
        )}
        {activeLabSlug === "inheritance" && (
          <InheritanceStudio onComplete={() => onRecordAttempt("inheritance", true)} />
        )}
        {activeLabSlug === "dispatch" && (
          <DispatchStudio onComplete={() => onRecordAttempt("dispatch", true)} />
        )}
        {activeLabSlug === "encapsulation" && (
          <EncapsulationStudio onComplete={() => onRecordAttempt("encapsulation", true)} />
        )}
        {activeLabSlug === "interface" && (
          <InterfaceStudio onComplete={() => onRecordAttempt("interface", true)} />
        )}
        {activeLabSlug === "access" && (
          <AccessStudio onComplete={() => onRecordAttempt("access", true)} />
        )}
        {activeLabSlug === "equality" && (
          <EqualityStudio onComplete={() => onRecordAttempt("equality", true)} />
        )}
        {activeLabSlug === "solid" && (
          <SolidStudio onComplete={() => onRecordAttempt("solid", true)} />
        )}
        {activeLabSlug === "patterns" && (
          <PatternsStudio onComplete={() => onRecordAttempt("patterns", true)} />
        )}
      </div>
    </div>
  );
}

