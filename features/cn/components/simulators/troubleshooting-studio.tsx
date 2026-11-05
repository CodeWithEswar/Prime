"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  Alert02Icon,
  CheckmarkBadge01Icon,
  HelpCircleIcon,
  ArrowRight01Icon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import {
  TROUBLESHOOTING_SCENARIOS,
  gradeTroubleshootingAnswer,
} from "@/domain/cn";

interface TroubleshootingStudioProps {
  onComplete?: () => void;
}

export function TroubleshootingStudio({ onComplete }: TroubleshootingStudioProps) {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [activeDiagnosticCmd, setActiveDiagnosticCmd] = useState<string | null>(null);
  const [result, setResult] = useState<{ isCorrect: boolean; explanation: string } | null>(null);
  const [completedScenarios, setCompletedScenarios] = useState<Set<string>>(new Set());

  const scenario = TROUBLESHOOTING_SCENARIOS[selectedScenarioIndex];

  const handleSelectScenario = (index: number) => {
    setSelectedScenarioIndex(index);
    setSelectedOptionIndex(null);
    setActiveDiagnosticCmd(null);
    setResult(null);
  };

  const handleRunCommand = (cmd: string) => {
    setActiveDiagnosticCmd(cmd);
  };

  const handleSubmitDiagnosis = () => {
    if (selectedOptionIndex === null) return;
    const grade = gradeTroubleshootingAnswer(scenario.id, selectedOptionIndex);
    setResult(grade);

    if (grade.isCorrect) {
      setCompletedScenarios((prev) => new Set(prev).add(scenario.id));
      if (onComplete) onComplete();
    }
  };

  const diagCommands = Object.keys(scenario.availableDiagnostics);

  return (
    <div className="space-y-6 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 text-white">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[#1A1A1A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF0000]/10 text-[#FF4D4D] border border-[#FF0000]/20">
              <Icon icon={Alert02Icon} size={16} />
            </span>
            <h3 className="text-lg font-semibold text-white tracking-tight">
              Network Troubleshooting Engineering Workspace
            </h3>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Investigate 7 production failure scenarios with terminal diagnostics (ping, dig, arp, curl, ss).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs">
            Solved: {completedScenarios.size} / {TROUBLESHOOTING_SCENARIOS.length}
          </Badge>
        </div>
      </div>

      {/* Scenario Tabs */}
      <div className="flex flex-wrap gap-2">
        {TROUBLESHOOTING_SCENARIOS.map((sc, idx) => {
          const isCurrent = selectedScenarioIndex === idx;
          const isDone = completedScenarios.has(sc.id);

          return (
            <Button
              key={sc.id}
              size="sm"
              variant={isCurrent ? "primary" : "outline"}
              onClick={() => handleSelectScenario(idx)}
              className={`text-xs ${
                isCurrent
                  ? "bg-[#FF0000] text-white hover:bg-[#CC0000]"
                  : isDone
                  ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10"
                  : "border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {isDone && <Icon icon={CheckmarkBadge01Icon} size={14} className="mr-1 inline text-emerald-400" />}
              Scenario {idx + 1}
            </Button>
          );
        })}
      </div>

      {/* Scenario Detail Card */}
      <div className="space-y-4 rounded-lg border border-[#1F1F1F] bg-black p-5">
        <div>
          <span className="text-[10px] font-mono uppercase text-[#FF4D4D] font-bold">
            Incident #{selectedScenarioIndex + 1}
          </span>
          <h4 className="text-base font-semibold text-white mt-0.5">{scenario.title}</h4>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded border border-white/5 bg-[#111111] p-3.5">
            <div className="text-[10px] font-mono uppercase text-neutral-400">Observed Symptoms</div>
            <p className="mt-1 text-xs text-rose-300 leading-relaxed font-sans">{scenario.symptoms}</p>
          </div>
          <div className="rounded border border-white/5 bg-[#111111] p-3.5">
            <div className="text-[10px] font-mono uppercase text-neutral-400">Network Topology Context</div>
            <p className="mt-1 text-xs text-neutral-300 font-mono">{scenario.topologyDescription}</p>
          </div>
        </div>

        {/* Diagnostic Terminal Section */}
        <div className="space-y-2 rounded-lg border border-white/10 bg-[#0C0C0C] p-4 font-mono">
          <div className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
            <span>Terminal Diagnostic Console</span>
            <span className="text-[10px] text-neutral-500">Click a command to execute probe</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {diagCommands.map((cmd) => (
              <button
                key={cmd}
                onClick={() => handleRunCommand(cmd)}
                className={`rounded border px-2.5 py-1 text-xs transition-all ${
                  activeDiagnosticCmd === cmd
                    ? "border-[#FF0000] bg-[#FF0000]/20 text-white"
                    : "border-white/10 bg-[#161616] text-neutral-300 hover:border-white/20 hover:text-white"
                }`}
              >
                $ {cmd}
              </button>
            ))}
          </div>

          {activeDiagnosticCmd && (
            <div className="mt-3 rounded border border-white/5 bg-black p-3 text-xs">
              <div className="text-neutral-500 font-bold mb-1">$ {activeDiagnosticCmd}</div>
              <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                {scenario.availableDiagnostics[activeDiagnosticCmd]?.output}
              </pre>
            </div>
          )}
        </div>

        {/* Diagnosis Options */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
            Identify Root Cause Hypothesis
          </div>
          <div className="space-y-2">
            {scenario.options.map((opt, optIdx) => {
              const isSelected = selectedOptionIndex === optIdx;

              return (
                <div
                  key={optIdx}
                  onClick={() => setSelectedOptionIndex(optIdx)}
                  className={`cursor-pointer rounded-lg border p-3 text-xs transition-all ${
                    isSelected
                      ? "border-[#FF0000] bg-[#FF0000]/10 text-white font-medium"
                      : "border-[#1F1F1F] bg-[#111111] text-neutral-300 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        isSelected
                          ? "bg-[#FF0000] text-white"
                          : "bg-white/10 text-neutral-400"
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              disabled={selectedOptionIndex === null}
              onClick={handleSubmitDiagnosis}
              className="bg-[#FF0000] text-white hover:bg-[#CC0000] font-medium"
            >
              Verify Diagnosis
            </Button>
          </div>
        </div>

        {/* Result Feedback */}
        {result && (
          <div
            className={`rounded-lg border p-4 text-xs leading-relaxed ${
              result.isCorrect
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            <div className="font-bold mb-1">
              {result.isCorrect ? "✓ Accurate Diagnosis!" : "✗ Root Cause Mismatch"}
            </div>
            <div>{result.explanation}</div>
          </div>
        )}
      </div>
    </div>
  );
}
