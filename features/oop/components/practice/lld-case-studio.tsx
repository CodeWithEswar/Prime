"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  CodeIcon,
  CheckmarkBadge01Icon,
  Layers01Icon,
  Task01Icon,
  FileEditIcon,
} from "@hugeicons/core-free-icons";
import type { OOPLLDCase, UserOOPDesignAttempt } from "@/domain/oop";

interface LLDCaseStudioProps {
  cases: OOPLLDCase[];
  attempts: Record<string, UserOOPDesignAttempt>;
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
  onRecordAttempt?: (
    caseId: string,
    selfAssessment: "proficient" | "adequate" | "needs_review",
    notes: string
  ) => void;
}

export function LLDCaseStudio({
  cases,
  attempts,
  activeCaseId,
  onSelectCase,
  onRecordAttempt,
}: LLDCaseStudioProps) {
  const selectedCase = cases.find((c) => c.id === activeCaseId) || cases[0];
  const currentAttempt = attempts[selectedCase.id];

  const [notes, setNotes] = useState(currentAttempt?.notes || "");
  const [assessment, setAssessment] = useState<"proficient" | "adequate" | "needs_review">(
    currentAttempt?.selfAssessment || "proficient"
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    if (onRecordAttempt) {
      onRecordAttempt(selectedCase.id, assessment, notes);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1F1F1F] pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000]">
              Interview System Design
            </span>
            <Badge variant="outline" className="border-[#262626] bg-[#141414] text-[#CCCCCC]">
              10 Canonical LLD Cases
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Low-Level Design (LLD) Studio & Evaluation Rubrics
          </h2>
        </div>
      </div>

      {/* Case Pills Carousel/Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {cases.map((c) => {
          const isSelected = c.id === selectedCase.id;
          const isDone = Boolean(attempts[c.id]);
          return (
            <button
              key={c.id}
              onClick={() => onSelectCase(c.id)}
              className={`shrink-0 rounded-lg border px-3 py-2 text-left transition-all ${
                isSelected
                  ? "border-[#FF0000] bg-[#1A0A0A] text-white font-bold"
                  : "border-[#1F1F1F] bg-[#121212] text-[#888888] hover:border-[#333333]"
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <span>Case {c.caseNumber}</span>
                {isDone && <span className="text-green-400">✓</span>}
              </div>
              <div className="mt-0.5 max-w-[140px] truncate text-[11px] text-[#CCCCCC]">
                {c.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Case Specification vs Design Workspace & Rubric */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Requirements & Relationships (7 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#FF4D4D]">
                Case {selectedCase.caseNumber}
              </span>
              <h3 className="text-lg font-bold text-white">{selectedCase.title}</h3>
            </div>
            <Badge variant="outline" className="text-xs text-[#CCCCCC]">
              {selectedCase.interviewFrequency} Frequency
            </Badge>
          </div>

          <p className="text-xs text-[#CCCCCC] leading-relaxed">{selectedCase.summary}</p>

          {/* Entities */}
          <div className="space-y-2 border-t border-[#1A1A1A] pt-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Core Domain Entities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedCase.entities.map((ent) => (
                <Badge
                  key={ent}
                  variant="outline"
                  className="border-[#262626] bg-[#141414] font-mono text-[11px] text-white"
                >
                  class {ent}
                </Badge>
              ))}
            </div>
          </div>

          {/* Relationships */}
          <div className="space-y-2 border-t border-[#1A1A1A] pt-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Structural Relationships & Patterns
            </span>
            <ul className="space-y-1.5 font-mono text-xs text-[#888888]">
              {selectedCase.relationships.map((rel, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#FF4D4D]">&gt;</span>
                  <span className="text-[#CCCCCC]">{rel}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Constraints & Extension Points */}
          <div className="grid grid-cols-1 gap-4 border-t border-[#1A1A1A] pt-3 sm:grid-cols-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF8080]">
                Engineering Constraints
              </span>
              <ul className="mt-1.5 list-disc pl-4 space-y-1 text-[11px] text-[#AAAAAA]">
                {selectedCase.constraints.map((con, idx) => (
                  <li key={idx}>{con}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-green-400">
                Extension Points (OCP)
              </span>
              <ul className="mt-1.5 list-disc pl-4 space-y-1 text-[11px] text-[#AAAAAA]">
                {selectedCase.extensionPoints.map((ext, idx) => (
                  <li key={idx}>{ext}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Self-Assessment & Design Notes (5 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Candidate Evaluation Rubric
            </span>
            <Icon icon={Task01Icon} size={16} className="text-[#888888]" />
          </div>

          {/* Rubric Checklist */}
          <div className="space-y-2 rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-xs text-[#CCCCCC]">
            {selectedCase.evaluationRubric.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <Icon icon={CheckmarkBadge01Icon} size={15} className="mt-0.5 text-green-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* User Design Notes & Solution Sketch */}
          <div className="space-y-2 border-t border-[#1A1A1A] pt-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Your Design Notes & Entity Sketch
            </label>
            <textarea
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record your class responsibilities, interfaces, or UML ideas here..."
              className="w-full rounded border border-[#262626] bg-[#121212] p-2.5 font-mono text-xs text-white placeholder:text-[#555555] focus:border-[#FF0000] focus:outline-none"
            />
          </div>

          {/* Self Assessment Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Self Assessment
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAssessment("proficient")}
                className={`rounded border p-2 text-center text-xs font-mono transition-all ${
                  assessment === "proficient"
                    ? "border-green-500 bg-green-500/10 text-green-300 font-bold"
                    : "border-[#262626] bg-[#141414] text-[#888888]"
                }`}
              >
                Proficient
              </button>
              <button
                type="button"
                onClick={() => setAssessment("adequate")}
                className={`rounded border p-2 text-center text-xs font-mono transition-all ${
                  assessment === "adequate"
                    ? "border-amber-500 bg-amber-500/10 text-amber-300 font-bold"
                    : "border-[#262626] bg-[#141414] text-[#888888]"
                }`}
              >
                Adequate
              </button>
              <button
                type="button"
                onClick={() => setAssessment("needs_review")}
                className={`rounded border p-2 text-center text-xs font-mono transition-all ${
                  assessment === "needs_review"
                    ? "border-[#FF0000] bg-[#FF0000]/10 text-[#FF8080] font-bold"
                    : "border-[#262626] bg-[#141414] text-[#888888]"
                }`}
              >
                Needs Review
              </button>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            className="w-full bg-[#FF0000] text-white hover:bg-[#D90000]"
          >
            <Icon icon={FileEditIcon} size={14} className="mr-1.5" />
            {savedSuccess ? "Saved Successfully!" : "Save Case Solution & Rubric"}
          </Button>
        </div>
      </div>
    </div>
  );
}

