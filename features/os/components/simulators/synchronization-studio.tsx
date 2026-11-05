"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import {
  RefreshIcon,
  Alert02Icon,
  CheckmarkBadge01Icon,
  ArrowRight01Icon,
  LockIcon,
} from "@hugeicons/core-free-icons";
import {
  createPetersonState,
  stepPeterson,
  createBoundedBuffer,
  produceItem,
  consumeItem,
  createDiningPhilosophers,
  pickForks,
  releaseForks,
  type PetersonState,
  type BoundedBufferState,
  type DiningPhilosophersState,
} from "@/domain/os";

export function SynchronizationStudio() {
  const [activeSubTab, setActiveSubTab] = useState<"peterson" | "buffer" | "philosophers">("peterson");

  // 1. Peterson State
  const [peterson, setPeterson] = useState<PetersonState>(createPetersonState());
  const [invertedPeterson, setInvertedPeterson] = useState(false);
  const [petersonLog, setPetersonLog] = useState<string[]>([]);

  // 2. Bounded Buffer State
  const [buffer, setBuffer] = useState<BoundedBufferState>(() => createBoundedBuffer(5));
  const [nextItemId, setNextItemId] = useState(1);

  // 3. Dining Philosophers State
  const [philosophers, setPhilosophers] = useState<DiningPhilosophersState>(createDiningPhilosophers());
  const [philoStrategy, setPhiloStrategy] = useState<"NAIVE_LEFT_FIRST" | "ASYMMETRIC">("NAIVE_LEFT_FIRST");

  // Handlers: Peterson
  const handlePetersonStep = (pid: 0 | 1) => {
    const res = stepPeterson(peterson, pid, invertedPeterson);
    setPeterson(res.nextState);
    setPetersonLog((prev) => [res.explanation, ...prev.slice(0, 7)]);
  };

  const handlePetersonReset = () => {
    setPeterson(createPetersonState());
    setPetersonLog([]);
  };

  // Handlers: Bounded Buffer
  const handleProduce = () => {
    const res = produceItem(buffer, nextItemId);
    setBuffer(res.nextState);
    if (res.success) setNextItemId((id) => id + 1);
  };

  const handleConsume = () => {
    const res = consumeItem(buffer);
    setBuffer(res.nextState);
  };

  const handleBufferReset = () => {
    setBuffer(createBoundedBuffer(5));
    setNextItemId(1);
  };

  // Handlers: Philosophers
  const handlePhiloPick = (idx: number) => {
    const res = pickForks(philosophers, idx, philoStrategy);
    setPhilosophers(res.nextState);
  };

  const handlePhiloRelease = (idx: number) => {
    const res = releaseForks(philosophers, idx);
    setPhilosophers(res.nextState);
  };

  const handlePhiloReset = () => {
    setPhilosophers(createDiningPhilosophers());
  };

  return (
    <div className="space-y-6 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 text-white">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[#1A1A1A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF0000]/10 text-[#FF4D4D] border border-[#FF0000]/20">
              <Icon icon={LockIcon} size={16} />
            </span>
            <h2 className="text-lg font-semibold text-white">Process Synchronization Studio</h2>
          </div>
          <p className="text-xs text-[#888888] mt-1">
            Simulate critical sections, race conditions, semaphores, and classic concurrency problems with verifiable state machines.
          </p>
        </div>

        {/* Sub-tab selection (Tabs) */}
        <Tabs
          value={activeSubTab}
          onValueChange={(val) => setActiveSubTab(val as "peterson" | "buffer" | "philosophers")}
        >
          <TabsList className="h-8 gap-1 bg-[#141414] p-0.5 border border-[#262626] rounded-lg">
            <TabsTrigger
              value="peterson"
              className="h-7 text-xs data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-[#FF0000] text-[#888888]"
            >
              Peterson's Algorithm
            </TabsTrigger>
            <TabsTrigger
              value="buffer"
              className="h-7 text-xs data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-[#FF0000] text-[#888888]"
            >
              Bounded Buffer
            </TabsTrigger>
            <TabsTrigger
              value="philosophers"
              className="h-7 text-xs data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-[#FF0000] text-[#888888]"
            >
              Dining Philosophers
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 1. PETERSON'S ALGORITHM */}
      {activeSubTab === "peterson" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#888888]">Mode:</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setInvertedPeterson(!invertedPeterson);
                  handlePetersonReset();
                }}
                className={`h-7 text-xs ${
                  invertedPeterson
                    ? "border-[#FF0000] text-[#FF4D4D] bg-[#FF0000]/10"
                    : "border-[#333333] text-[#CCCCCC]"
                }`}
              >
                {invertedPeterson ? "Buggy Inverted (Triggers Race Condition)" : "Standard Correct Peterson"}
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePetersonReset}
              className="h-7 text-xs border-[#262626] bg-[#141414] text-[#888888]"
            >
              <Icon icon={RefreshIcon} size={13} className="mr-1" />
              Reset
            </Button>
          </div>

          {/* Peterson Violation Banner */}
          {peterson.violation && (
            <div className="flex items-center gap-2 rounded-lg border border-[#FF0000] bg-[#FF0000]/15 p-3 text-xs font-bold text-[#FF4D4D]">
              <Icon icon={Alert02Icon} size={16} />
              <span>{peterson.violation}</span>
            </div>
          )}

          {/* Critical Section Visualizer */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Process 0 */}
            <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Process P0</span>
                <Badge variant="outline" className={peterson.flags[0] ? "border-[#FF0000] text-[#FF4D4D]" : ""}>
                  flag[0] = {peterson.flags[0] ? "TRUE" : "FALSE"}
                </Badge>
              </div>
              <p className="text-[11px] text-[#777777]">
                PC Step: {peterson.pc[0] === 0 ? "Entry" : peterson.pc[0] === 1 ? "Set Turn" : peterson.pc[0] === 2 ? "Wait Loop" : "In Critical Section"}
              </p>
              <Button
                size="sm"
                onClick={() => handlePetersonStep(0)}
                className="w-full h-8 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-xs text-white border border-[#333333]"
              >
                Step P0 Instruction
              </Button>
            </div>

            {/* Shared Critical Section */}
            <div className="flex flex-col items-center justify-center rounded-lg border border-[#2F2F2F] bg-[#0E0E0E] p-4 text-center">
              <span className="text-[10px] font-semibold text-[#888888] uppercase tracking-wider">
                SHARED CRITICAL SECTION
              </span>
              <div className="mt-2 text-base font-bold font-mono">
                {peterson.criticalSection !== null ? (
                  <span className="text-[#4ade80]">OCCUPIED BY P{peterson.criticalSection}</span>
                ) : (
                  <span className="text-[#666666]">EMPTY / IDLE</span>
                )}
              </div>
              <span className="mt-2 text-[10px] text-[#888888]">
                turn = <span className="font-mono text-white font-bold">{peterson.turn}</span>
              </span>
            </div>

            {/* Process 1 */}
            <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Process P1</span>
                <Badge variant="outline" className={peterson.flags[1] ? "border-[#FF0000] text-[#FF4D4D]" : ""}>
                  flag[1] = {peterson.flags[1] ? "TRUE" : "FALSE"}
                </Badge>
              </div>
              <p className="text-[11px] text-[#777777]">
                PC Step: {peterson.pc[1] === 0 ? "Entry" : peterson.pc[1] === 1 ? "Set Turn" : peterson.pc[1] === 2 ? "Wait Loop" : "In Critical Section"}
              </p>
              <Button
                size="sm"
                onClick={() => handlePetersonStep(1)}
                className="w-full h-8 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-xs text-white border border-[#333333]"
              >
                Step P1 Instruction
              </Button>
            </div>
          </div>

          {/* Peterson Trace */}
          <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3">
            <span className="text-[10px] font-semibold text-[#888888] uppercase block mb-1.5">
              Instruction Execution Trace
            </span>
            <div className="space-y-1 text-xs font-mono text-[#CCCCCC]">
              {petersonLog.length === 0 ? (
                <span className="text-[#555555]">Step P0 or P1 to execute concurrent statements.</span>
              ) : (
                petersonLog.map((log, i) => (
                  <div key={i} className="text-[11px]">
                    → {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. BOUNDED BUFFER */}
      {activeSubTab === "buffer" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleProduce}
                className="h-8 bg-[#1A1A1A] hover:bg-[#252525] text-xs text-white border border-[#333333]"
              >
                Produce Item #{nextItemId}
              </Button>
              <Button
                size="sm"
                onClick={handleConsume}
                className="h-8 bg-[#1A1A1A] hover:bg-[#252525] text-xs text-white border border-[#333333]"
              >
                Consume Item
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBufferReset}
              className="h-7 text-xs border-[#262626] bg-[#141414] text-[#888888]"
            >
              <Icon icon={RefreshIcon} size={13} className="mr-1" />
              Reset Buffer
            </Button>
          </div>

          {/* Semaphores meter */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-center">
              <span className="text-[10px] font-semibold text-[#888888] uppercase">mutex (binary)</span>
              <span className="mt-1 block text-lg font-bold text-white font-mono">{buffer.mutex}</span>
            </div>
            <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-center">
              <span className="text-[10px] font-semibold text-[#888888] uppercase">empty (counting)</span>
              <span className="mt-1 block text-lg font-bold text-[#FF4D4D] font-mono">{buffer.empty}</span>
            </div>
            <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-center">
              <span className="text-[10px] font-semibold text-[#888888] uppercase">full (counting)</span>
              <span className="mt-1 block text-lg font-bold text-[#4ade80] font-mono">{buffer.full}</span>
            </div>
          </div>

          {/* Visual Buffer Slots */}
          <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-4">
            <span className="text-xs font-medium text-[#888888] block mb-3 uppercase tracking-wider">
              Circular Shared Buffer Slots (Capacity {buffer.bufferCapacity})
            </span>
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: buffer.bufferCapacity }).map((_, slotIdx) => {
                const item = buffer.buffer[slotIdx];
                const isOccupied = item !== undefined;

                return (
                  <div
                    key={slotIdx}
                    className={`flex h-16 flex-col items-center justify-center rounded-lg border text-xs font-mono ${
                      isOccupied
                        ? "border-[#FF0000] bg-[#FF0000]/15 text-white font-bold"
                        : "border-dashed border-[#2A2A2A] bg-[#0A0A0A] text-[#555555]"
                    }`}
                  >
                    <span>Slot {slotIdx}</span>
                    <span className="text-sm mt-0.5">{isOccupied ? `Item #${item}` : "Empty"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. DINING PHILOSOPHERS */}
      {activeSubTab === "philosophers" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#888888]">Strategy:</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setPhiloStrategy(philoStrategy === "NAIVE_LEFT_FIRST" ? "ASYMMETRIC" : "NAIVE_LEFT_FIRST");
                  handlePhiloReset();
                }}
                className={`h-7 text-xs ${
                  philoStrategy === "ASYMMETRIC"
                    ? "border-[#4ade80] text-[#4ade80] bg-[#4ade80]/10"
                    : "border-[#FF0000] text-[#FF4D4D] bg-[#FF0000]/10"
                }`}
              >
                {philoStrategy === "NAIVE_LEFT_FIRST" ? "Naive Left-First (Can Deadlock)" : "Asymmetric (Deadlock-Free)"}
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePhiloReset}
              className="h-7 text-xs border-[#262626] bg-[#141414] text-[#888888]"
            >
              <Icon icon={RefreshIcon} size={13} className="mr-1" />
              Reset Table
            </Button>
          </div>

          {/* Deadlock banner */}
          {philosophers.isDeadlocked && (
            <div className="flex items-center gap-2 rounded-lg border border-[#FF0000] bg-[#FF0000]/15 p-3 text-xs font-bold text-[#FF4D4D]">
              <Icon icon={Alert02Icon} size={16} />
              <span>
                CIRCULAR WAIT DEADLOCK DETECTED! All 5 philosophers hold their left fork and are waiting for their right fork indefinitely.
              </span>
            </div>
          )}

          {/* Philosophers Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            {philosophers.philosophers.map((status, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-3 text-center transition-all ${
                  status === "EATING"
                    ? "border-[#4ade80] bg-[#4ade80]/15"
                    : status === "HUNGRY"
                    ? "border-[#FF0000] bg-[#FF0000]/10"
                    : "border-[#1F1F1F] bg-[#121212]"
                }`}
              >
                <span className="text-xs font-bold text-white block">Philosopher {idx}</span>
                <span
                  className={`text-[10px] font-semibold mt-1 block uppercase ${
                    status === "EATING"
                      ? "text-[#4ade80]"
                      : status === "HUNGRY"
                      ? "text-[#FF4D4D]"
                      : "text-[#777777]"
                  }`}
                >
                  {status}
                </span>

                <div className="mt-3 flex flex-col gap-1.5">
                  <Button
                    size="sm"
                    onClick={() => handlePhiloPick(idx)}
                    disabled={status === "EATING"}
                    className="h-6 text-[10px] bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white border border-[#333333] disabled:opacity-20"
                  >
                    Pick Forks
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handlePhiloRelease(idx)}
                    disabled={status === "THINKING"}
                    className="h-6 text-[10px] bg-[#141414] hover:bg-[#1F1F1F] text-[#AAAAAA] border border-[#262626] disabled:opacity-20"
                  >
                    Release
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

