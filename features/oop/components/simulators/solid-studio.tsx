"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  CodeIcon,
  CheckmarkBadge01Icon,
  AlertCircleIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { SOLID_SCENARIOS, type SolidScenario } from "@/domain/oop";

interface SolidStudioProps {
  onComplete?: () => void;
}

export function SolidStudio({ onComplete }: SolidStudioProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("solid-srp");

  const scenario: SolidScenario =
    SOLID_SCENARIOS.find((s) => s.id === selectedScenarioId) || SOLID_SCENARIOS[0];

  const handleSelect = (id: string) => {
    setSelectedScenarioId(id);
    if (onComplete) onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1F1F1F] pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000]">
              Laboratory 09
            </span>
            <Badge variant="outline" className="border-[#262626] bg-[#141414] text-[#CCCCCC]">
              System Architecture
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            SOLID Principles Refactoring Studio
          </h2>
        </div>
      </div>

      {/* Scenario Tabs (SRP, OCP, LSP, ISP, DIP) */}
      <div className="flex flex-wrap gap-2 border-b border-[#1A1A1A] pb-3">
        {SOLID_SCENARIOS.map((s) => (
          <Button
            key={s.id}
            variant="outline"
            size="sm"
            onClick={() => handleSelect(s.id)}
            className={`border-[#262626] font-mono text-xs ${
              selectedScenarioId === s.id
                ? "border-[#FF0000] bg-[#FF0000]/10 text-white font-bold"
                : "bg-[#141414] text-[#CCCCCC] hover:text-white"
            }`}
          >
            {s.shortCode}: {s.name}
          </Button>
        ))}
      </div>

      {/* Principle Directive */}
      <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-4 text-xs">
        <span className="font-bold text-[#FF4D4D]">{scenario.shortCode} Directive: </span>
        <span className="text-[#CCCCCC]">{scenario.principleDescription}</span>
      </div>

      {/* Side-by-Side: Violation vs Refactored */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Code Smell Violation (6 cols) */}
        <div className="space-y-3 rounded-xl border border-[#FF0000]/30 bg-[#0A0A0A] p-5 lg:col-span-6">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <div className="flex items-center gap-2">
              <Icon icon={AlertCircleIcon} size={16} className="text-[#FF4D4D]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#FF8080]">
                Violation: {scenario.violationTitle}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-[#221010] bg-[#050505] p-3 font-mono text-[11px] text-[#E0A0A0]">
            <pre className="whitespace-pre-wrap">{scenario.violationSnippet}</pre>
          </div>

          <div className="rounded border border-[#1F1F1F] bg-[#121212] p-3 text-[11px] text-[#AAAAAA]">
            <span className="font-bold text-[#FF8080]">Why it fails: </span>
            {scenario.violationProblem}
          </div>
        </div>

        {/* Right: Refactored Clean Architecture (6 cols) */}
        <div className="space-y-3 rounded-xl border border-green-500/30 bg-[#0A0A0A] p-5 lg:col-span-6">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <div className="flex items-center gap-2">
              <Icon icon={CheckmarkBadge01Icon} size={16} className="text-green-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-green-300">
                Solution: {scenario.refactoredTitle}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-[#0F1E12] bg-[#050505] p-3 font-mono text-[11px] text-[#A0E0B0]">
            <pre className="whitespace-pre-wrap">{scenario.refactoredSnippet}</pre>
          </div>

          <div className="rounded border border-[#1F1F1F] bg-[#121212] p-3 text-[11px] text-[#AAAAAA]">
            <span className="font-bold text-green-400">Architectural Trade-offs:</span>
            <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[#CCCCCC]">
              {scenario.tradeOffs.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom: Interview Defense Summary */}
      <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-4 text-xs">
        <div className="flex items-center gap-2 font-bold text-white">
          <Icon icon={CodeIcon} size={16} className="text-[#FF0000]" />
          <span>Staff Engineering Interview Defense:</span>
        </div>
        <p className="mt-2 text-[#CCCCCC] leading-relaxed">{scenario.interviewDefense}</p>
      </div>
    </div>
  );
}

