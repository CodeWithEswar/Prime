"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  CodeIcon,
  CheckmarkBadge01Icon,
  ArrowRight01Icon,
  Layers01Icon,
  HelpCircleIcon,
} from "@hugeicons/core-free-icons";
import { DESIGN_PATTERNS, type PatternDefinition } from "@/domain/oop";

interface PatternsStudioProps {
  onComplete?: () => void;
}

export function PatternsStudio({ onComplete }: PatternsStudioProps) {
  const [selectedPatternKey, setSelectedPatternKey] = useState<string>("factory");

  const pattern: PatternDefinition =
    DESIGN_PATTERNS[selectedPatternKey] || DESIGN_PATTERNS["factory"];

  const patternKeys = Object.keys(DESIGN_PATTERNS);

  const handleSelect = (key: string) => {
    setSelectedPatternKey(key);
    if (onComplete) onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1F1F1F] pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000]">
              Laboratory 10
            </span>
            <Badge variant="outline" className="border-[#262626] bg-[#141414] text-[#CCCCCC]">
              GoF Design Patterns
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Design Pattern Explorer & UML Architecture
          </h2>
        </div>
      </div>

      {/* Pattern Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#1A1A1A] pb-3">
        {patternKeys.map((k) => {
          const p = DESIGN_PATTERNS[k];
          return (
            <Button
              key={k}
              variant="outline"
              size="sm"
              onClick={() => handleSelect(k)}
              className={`border-[#262626] font-mono text-xs ${
                selectedPatternKey === k
                  ? "border-[#FF0000] bg-[#FF0000]/10 text-white font-bold"
                  : "bg-[#141414] text-[#CCCCCC] hover:text-white"
              }`}
            >
              {p.name} ({p.category})
            </Button>
          );
        })}
      </div>

      {/* Pattern Intent Header */}
      <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-4 text-xs">
        <span className="font-bold text-[#FF4D4D]">Design Intent: </span>
        <span className="text-[#CCCCCC]">{pattern.intent}</span>
      </div>

      {/* Main Grid: UML Structure vs Code & Trace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: UML Structure Graph (5 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              UML Class Relationships
            </span>
            <Badge variant="outline" className="text-xs text-green-400">
              {pattern.category}
            </Badge>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {pattern.umlNodes.map((node) => (
              <div
                key={node.id}
                className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-white"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{node.label}</span>
                  <Badge variant="outline" className="text-[10px] uppercase text-[#888888]">
                    {node.kind}
                  </Badge>
                </div>
              </div>
            ))}

            {pattern.umlEdges.length > 0 && (
              <div className="rounded border border-[#1A1A1A] bg-[#050505] p-3 text-[11px] text-[#888888]">
                <span className="text-white font-bold">Relationships:</span>
                <ul className="mt-1 space-y-1">
                  {pattern.umlEdges.map((e, idx) => (
                    <li key={idx}>
                      <span className="text-[#FF8080]">{e.from}</span> --[{e.relationship}]--&gt;{" "}
                      <span className="text-white">{e.to}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-[#1A1A1A] pt-4 text-[11px]">
            <div>
              <span className="font-bold text-green-400">When to use: </span>
              <span className="text-[#CCCCCC]">{pattern.whenToUse}</span>
            </div>
            <div className="pt-1">
              <span className="font-bold text-[#FF8080]">Common Pitfall: </span>
              <span className="text-[#CCCCCC]">{pattern.pitfalls}</span>
            </div>
          </div>
        </div>

        {/* Right: Code Implementation & Execution Steps (7 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Java Implementation Pattern
            </span>
          </div>

          <div className="rounded-lg border border-[#1F1F1F] bg-[#050505] p-3 font-mono text-[11px] text-[#CCCCCC]">
            <pre className="whitespace-pre-wrap">{pattern.codeSnippet}</pre>
          </div>

          <div className="space-y-2 border-t border-[#1A1A1A] pt-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Runtime Execution Trace
            </span>
            <div className="space-y-1.5 font-mono text-xs">
              {pattern.executionSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded border border-[#1F1F1F] bg-[#121212] p-2 text-[11px] text-[#CCCCCC]"
                >
                  <span className="font-bold text-[#FF0000]">{idx + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

