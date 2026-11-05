"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import {
  RefreshIcon,
  Add01Icon,
  Layers01Icon,
  Delete02Icon,
  Exchange01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import {
  createInitialLifecycleState,
  allocateNewHeapObject,
  aliasReference,
  nullifyReference,
  type LifecycleState,
} from "@/domain/oop";

interface ObjectLifecycleStudioProps {
  onComplete?: () => void;
}

export function ObjectLifecycleStudio({ onComplete }: ObjectLifecycleStudioProps) {
  const [state, setState] = useState<LifecycleState>(createInitialLifecycleState);
  const [selectedTargetVar, setSelectedTargetVar] = useState<string>("refB");
  const [selectedSourceVar, setSelectedSourceVar] = useState<string>("refA");

  const handleAllocate = () => {
    const next = allocateNewHeapObject(state, selectedTargetVar, "BankAccount", {
      accountNumber: `ACC-${Math.floor(Math.random() * 900) + 100}`,
      balance: Math.floor(Math.random() * 800) + 200,
    });
    setState(next);
    if (onComplete) onComplete();
  };

  const handleAlias = () => {
    const next = aliasReference(state, selectedSourceVar, selectedTargetVar);
    setState(next);
    if (onComplete) onComplete();
  };

  const handleNullify = (varName: string) => {
    const next = nullifyReference(state, varName);
    setState(next);
    if (onComplete) onComplete();
  };

  const handleReset = () => {
    setState(createInitialLifecycleState());
  };

  const gcEligibleCount = state.heap.filter((h) => h.gcEligible).length;

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1F1F1F] pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000]">
              Laboratory 02
            </span>
            <Badge variant="outline" className="border-[#262626] bg-[#141414] text-[#CCCCCC]">
              JVM Memory & Lifecycle
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Object Lifecycle, Reference Aliasing & GC Reachability
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-[#262626] bg-[#141414] text-[#CCCCCC] hover:text-white"
          >
            <Icon icon={RefreshIcon} size={14} className="mr-1.5" />
            Reset State
          </Button>
        </div>
      </div>

      {/* Main Grid: Stack vs Heap vs Event Log */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Stack Reference Variables (4 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Call Stack (Frame References)
            </span>
            <Badge variant="outline" className="font-mono text-[11px] text-[#FF4D4D]">
              Thread Stack
            </Badge>
          </div>

          <div className="space-y-3">
            {state.stack.map((v) => {
              const targetObj = state.heap.find((h) => h.id === v.pointsToHeapId);
              return (
                <div
                  key={v.name}
                  className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 font-mono text-xs text-white"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#FF8080]">{v.name}</span>
                    <button
                      onClick={() => handleNullify(v.name)}
                      disabled={v.pointsToHeapId === null}
                      className="text-[11px] text-[#888888] hover:text-[#FF0000] disabled:opacity-30"
                    >
                      <Icon icon={Delete02Icon} size={14} className="inline mr-1" />
                      nullify
                    </button>
                  </div>
                  <div className="mt-2 text-[11px] text-[#888888]">
                    points to:{" "}
                    {targetObj ? (
                      <span className="font-bold text-white">
                        {targetObj.label}@{targetObj.memoryAddress}
                      </span>
                    ) : (
                      <span className="text-[#FF4D4D]">null</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Controls */}
          <div className="space-y-3 border-t border-[#1A1A1A] pt-4 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Reference Operations
            </span>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Select
                  value={selectedTargetVar}
                  onValueChange={setSelectedTargetVar}
                >
                  <SelectTrigger className="h-8 w-24 border-[#262626] bg-[#161616] px-2.5 text-xs text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {state.stack.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAllocate}
                  className="flex-1 bg-[#FF0000] text-white hover:bg-[#D90000]"
                >
                  <Icon icon={Add01Icon} size={14} className="mr-1" />
                  new BankAccount()
                </Button>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <span className="text-[#888888]">Alias:</span>
                <Select
                  value={selectedTargetVar}
                  onValueChange={setSelectedTargetVar}
                >
                  <SelectTrigger className="h-8 w-24 border-[#262626] bg-[#161616] px-2.5 text-xs text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {state.stack.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-[#888888]">=</span>
                <Select
                  value={selectedSourceVar}
                  onValueChange={setSelectedSourceVar}
                >
                  <SelectTrigger className="h-8 w-24 border-[#262626] bg-[#161616] px-2.5 text-xs text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {state.stack.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAlias}
                  className="border-[#262626] bg-[#1A1A1A] text-white hover:border-[#FF0000]"
                >
                  <Icon icon={Exchange01Icon} size={14} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Heap Memory & GC Status (5 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              JVM Heap Memory ({state.heap.length} Objects)
            </span>
            <Badge
              variant="outline"
              className={
                gcEligibleCount > 0
                  ? "border-[#FF0000]/40 text-[#FF8080]"
                  : "border-green-500/40 text-green-400"
              }
            >
              {gcEligibleCount} GC Eligible
            </Badge>
          </div>

          <div className="space-y-3">
            {state.heap.map((obj) => (
              <div
                key={obj.id}
                className={`rounded-lg border p-4 transition-all ${
                  obj.gcEligible
                    ? "border-dashed border-[#FF0000]/60 bg-[#1A0A0A]/70"
                    : "border-[#1F1F1F] bg-[#121212]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon={Layers01Icon}
                      size={16}
                      className={obj.gcEligible ? "text-[#FF4D4D]" : "text-green-400"}
                    />
                    <span className="font-mono text-xs font-bold text-white">
                      {obj.label}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#888888]">
                    {obj.memoryAddress}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#1F1F1F] pt-2 font-mono text-[11px] text-[#CCCCCC]">
                  {Object.entries(obj.data).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-[#888888]">{k}:</span> {v}
                    </div>
                  ))}
                </div>

                {obj.gcEligible && (
                  <div className="mt-3 flex items-center gap-1.5 border-t border-[#FF0000]/20 pt-2 text-[10px] text-[#FF8080]">
                    <Icon icon={AlertCircleIcon} size={14} />
                    <span>Unreachable: 0 stack references. Eligible for Garbage Collection.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Event Timeline & GC Contract (3 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Event Timeline
            </span>
          </div>

          <div className="h-64 space-y-2 overflow-y-auto font-mono text-[11px] text-[#888888]">
            {state.events.map((ev, i) => (
              <div key={i} className="border-b border-[#141414] pb-1.5">
                <span className="text-[#FF4D4D]">&gt;</span> {ev}
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-[11px] text-[#CCCCCC]">
            <span className="font-bold text-[#FF8080]">JVM Invariant:</span> GC timing is non-deterministic. An unreachable object is eligible for collection, but the JVM reclaims memory only when required.
          </div>
        </div>
      </div>
    </div>
  );
}

