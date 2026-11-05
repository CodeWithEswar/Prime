"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  Shield01Icon,
  CheckmarkBadge01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import {
  evaluateAccess,
  type AccessModifier,
  type AccessScope,
} from "@/domain/oop";

interface AccessStudioProps {
  onComplete?: () => void;
}

export function AccessStudio({ onComplete }: AccessStudioProps) {
  const [selectedModifier, setSelectedModifier] = useState<AccessModifier>("protected");
  const [selectedScope, setSelectedScope] = useState<AccessScope>("diff_package_subclass");
  const [receiverIsSubtype, setReceiverIsSubtype] = useState<boolean>(true);

  const result = evaluateAccess(selectedModifier, selectedScope, receiverIsSubtype);

  const modifiers: AccessModifier[] = ["public", "protected", "default", "private"];
  const scopes: Array<{ id: AccessScope; label: string }> = [
    { id: "same_class", label: "Same Class" },
    { id: "same_package", label: "Same Package (Subclass or Other)" },
    { id: "diff_package_subclass", label: "Different Package (Subclass)" },
    { id: "diff_package_unrelated", label: "Different Package (Unrelated Class)" },
  ];

  const handleSelectModifier = (m: AccessModifier) => {
    setSelectedModifier(m);
    if (onComplete) onComplete();
  };

  const handleSelectScope = (s: AccessScope) => {
    setSelectedScope(s);
    if (onComplete) onComplete();
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1F1F1F] pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000]">
              Laboratory 07
            </span>
            <Badge variant="outline" className="border-[#262626] bg-[#141414] text-[#CCCCCC]">
              Access Control & JLS §6.6.2
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Access Modifier Matrix & Protected Receiver Rule
          </h2>
        </div>
      </div>

      {/* Main Grid: Matrix Selectors vs Result Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Interactive Selectors (6 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-6">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Access Configuration
            </span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="text-[11px] text-[#888888]">1. Select Member Access Modifier:</label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {modifiers.map((m) => (
                  <Button
                    key={m}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectModifier(m)}
                    className={`border-[#262626] ${
                      selectedModifier === m
                        ? "border-[#FF0000] bg-[#FF0000]/10 text-white font-bold"
                        : "bg-[#141414] text-[#CCCCCC]"
                    }`}
                  >
                    {m}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] text-[#888888]">2. Select Caller Context (Scope):</label>
              <div className="mt-2 space-y-1.5">
                {scopes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectScope(s.id)}
                    className={`w-full rounded border p-2.5 text-left text-xs transition-all ${
                      selectedScope === s.id
                        ? "border-[#FF0000] bg-[#1A0A0A] text-white font-bold"
                        : "border-[#1F1F1F] bg-[#121212] text-[#888888] hover:border-[#333333]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedScope === "diff_package_subclass" && selectedModifier === "protected" && (
              <div className="rounded border border-[#262626] bg-[#0F0F0F] p-3">
                <span className="text-[11px] font-bold text-[#FF8080]">
                  Protected Receiver Expression Check (JLS §6.6.2):
                </span>
                <div className="mt-2 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="receiver"
                      checked={receiverIsSubtype}
                      onChange={() => setReceiverIsSubtype(true)}
                    />
                    <span className="text-white">this.field / SubClass.field</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="receiver"
                      checked={!receiverIsSubtype}
                      onChange={() => setReceiverIsSubtype(false)}
                    />
                    <span className="text-[#FF8080]">arbitrary SuperClass ref</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Validation Inspector (6 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-6">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Access Validation Result
            </span>
            <Badge
              variant="outline"
              className={result.allowed ? "border-green-500/40 text-green-400" : "border-[#FF0000]/40 text-[#FF8080]"}
            >
              {result.allowed ? "ACCESS GRANTED" : "ACCESS DENIED (COMPILE ERROR)"}
            </Badge>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div
              className={`rounded-lg border p-4 ${
                result.allowed
                  ? "border-green-500/30 bg-green-500/10 text-green-300"
                  : "border-[#FF0000]/40 bg-[#FF0000]/10 text-[#FF8080]"
              }`}
            >
              <div className="flex items-start gap-2">
                <Icon icon={result.allowed ? CheckmarkBadge01Icon : AlertCircleIcon} size={18} className="mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <div className="font-bold">{result.allowed ? "Legal Access" : "Illegal Access Detected"}</div>
                  <div className="text-[11px] leading-relaxed text-[#CCCCCC]">{result.explanation}</div>
                </div>
              </div>
            </div>

            <div className="rounded border border-[#1F1F1F] bg-[#121212] p-3 text-[11px] text-[#888888]">
              <span className="text-white font-bold">Authority: </span>
              <span>{result.jlsReference} (Java Language Specification)</span>
            </div>

            <div className="rounded border border-[#1F1F1F] bg-[#050505] p-3 text-[11px] text-[#CCCCCC]">
              <span className="text-[#FF8080] font-bold">Interview Note:</span> Candidates often forget that `protected` does not grant indiscriminate access across packages. It requires the accessing expression to be of the subclass's own type.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

