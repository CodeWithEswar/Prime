"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  PlayIcon,
  RefreshIcon,
  CpuIcon,
  Alert02Icon,
  CheckmarkBadge01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import {
  ProcessStateSimulator,
  type ProcessState,
  type ProcessTransitionEvent,
} from "@/domain/os";

interface ProcessStateLabProps {
  onComplete?: () => void;
}

export function ProcessStateLab({ onComplete }: ProcessStateLabProps) {
  const [simulator] = useState(() => new ProcessStateSimulator());
  const [pcb, setPcb] = useState(simulator.pcb);
  const [logs, setLogs] = useState(simulator.logs);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAction = (event: ProcessTransitionEvent, label: string) => {
    setErrorMessage(null);
    const res = simulator.transition(event, label);
    setPcb({ ...simulator.pcb });
    setLogs([...simulator.logs]);

    if (!res.success) {
      setErrorMessage(res.error || "Invalid transition");
    } else if (simulator.pcb.state === "Terminated" && onComplete) {
      onComplete();
    }
  };

  const handleReset = () => {
    simulator.reset();
    setPcb({ ...simulator.pcb });
    setLogs([]);
    setErrorMessage(null);
  };

  const states: ProcessState[] = ["New", "Ready", "Running", "Waiting", "Terminated"];

  return (
    <div className="space-y-6 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 text-white">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[#1A1A1A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF0000]/10 text-[#FF4D4D] border border-[#FF0000]/20">
              <Icon icon={CpuIcon} size={16} />
            </span>
            <h2 className="text-lg font-semibold text-white">Process State Machine Laboratory</h2>
          </div>
          <p className="text-xs text-[#888888] mt-1">
            Simulate 5-state process lifecycle transitions, observe Process Control Block (PCB) register updates, and test scheduler events.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="h-8 border-[#262626] bg-[#141414] text-xs text-[#AAAAAA] hover:text-white hover:border-[#444444]"
        >
          <Icon icon={RefreshIcon} size={14} className="mr-1.5" />
          Reset PCB
        </Button>
      </div>

      {/* State Machine Visualizer */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {states.map((st) => {
          const isActive = pcb.state === st;
          return (
            <div
              key={st}
              className={`relative flex flex-col items-center justify-center rounded-lg border p-4 transition-all ${
                isActive
                  ? "border-[#FF0000] bg-[#FF0000]/10 shadow-[0_0_15px_rgba(255,0,0,0.15)]"
                  : "border-[#1F1F1F] bg-[#121212] opacity-70"
              }`}
            >
              {isActive && (
                <span className="absolute -top-2 right-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF0000] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF0000]" />
                </span>
              )}
              <span className={`text-xs font-semibold ${isActive ? "text-[#FF4D4D]" : "text-[#777777]"}`}>
                STATE
              </span>
              <span className="mt-1 text-sm font-bold text-white">{st}</span>
              <span className="mt-1 text-[10px] text-[#666666]">
                {st === "New" && "Being created"}
                {st === "Ready" && "Waiting in queue"}
                {st === "Running" && "Active on CPU"}
                {st === "Waiting" && "Blocked on I/O"}
                {st === "Terminated" && "Exited"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Event Action Controls */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#888888] uppercase tracking-wider">
          Trigger Operating System Transition Event
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => handleAction("admit", "Admit process to Ready queue")}
            disabled={pcb.state !== "New"}
            className="h-8 bg-[#1A1A1A] hover:bg-[#252525] text-xs text-white border border-[#2A2A2A] disabled:opacity-30"
          >
            Admit (New → Ready)
          </Button>
          <Button
            size="sm"
            onClick={() => handleAction("dispatch", "Dispatcher allocates CPU slice")}
            disabled={pcb.state !== "Ready"}
            className="h-8 bg-[#1A1A1A] hover:bg-[#252525] text-xs text-white border border-[#2A2A2A] disabled:opacity-30"
          >
            Dispatch (Ready → Running)
          </Button>
          <Button
            size="sm"
            onClick={() => handleAction("timeout", "Timer interrupt expires slice")}
            disabled={pcb.state !== "Running"}
            className="h-8 bg-[#1A1A1A] hover:bg-[#252525] text-xs text-white border border-[#2A2A2A] disabled:opacity-30"
          >
            Timer Interrupt (Running → Ready)
          </Button>
          <Button
            size="sm"
            onClick={() => handleAction("io_wait", "Process blocks on I/O syscall")}
            disabled={pcb.state !== "Running"}
            className="h-8 bg-[#1A1A1A] hover:bg-[#252525] text-xs text-white border border-[#2A2A2A] disabled:opacity-30"
          >
            I/O Wait (Running → Waiting)
          </Button>
          <Button
            size="sm"
            onClick={() => handleAction("io_completion", "I/O device completes transfer")}
            disabled={pcb.state !== "Waiting"}
            className="h-8 bg-[#1A1A1A] hover:bg-[#252525] text-xs text-white border border-[#2A2A2A] disabled:opacity-30"
          >
            I/O Done (Waiting → Ready)
          </Button>
          <Button
            size="sm"
            onClick={() => handleAction("exit", "exit() system call issued")}
            disabled={pcb.state !== "Running"}
            className="h-8 bg-[#FF0000]/10 hover:bg-[#FF0000]/20 text-xs text-[#FF4D4D] border border-[#FF0000]/30 disabled:opacity-30"
          >
            Terminate (Running → Terminated)
          </Button>
        </div>
      </div>

      {/* Error alert if invalid transition attempted */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-[#FF0000]/30 bg-[#FF0000]/10 px-4 py-2.5 text-xs text-[#FF4D4D]">
          <Icon icon={Alert02Icon} size={15} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Process Control Block (PCB) Inspector */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-4">
          <div className="flex items-center justify-between border-b border-[#222222] pb-2 mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Process Control Block (PCB #{pcb.pid})
            </h3>
            <Badge
              variant="outline"
              className={
                pcb.state === "Running"
                  ? "border-[#FF0000] text-[#FF4D4D]"
                  : "border-[#333333] text-[#888888]"
              }
            >
              {pcb.state}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded border border-[#1A1A1A] bg-[#0A0A0A] p-2">
              <span className="text-[#666666] block text-[10px]">PROGRAM COUNTER (PC)</span>
              <span className="font-mono text-white">0x{pcb.programCounter.toString(16).toUpperCase()}</span>
            </div>
            <div className="rounded border border-[#1A1A1A] bg-[#0A0A0A] p-2">
              <span className="text-[#666666] block text-[10px]">ACCUMULATOR (RAX)</span>
              <span className="font-mono text-white">{pcb.cpuRegisters.RAX}</span>
            </div>
            <div className="rounded border border-[#1A1A1A] bg-[#0A0A0A] p-2">
              <span className="text-[#666666] block text-[10px]">STACK POINTER (RSP)</span>
              <span className="font-mono text-white">0x{pcb.cpuRegisters.RSP.toString(16).toUpperCase()}</span>
            </div>
            <div className="rounded border border-[#1A1A1A] bg-[#0A0A0A] p-2">
              <span className="text-[#666666] block text-[10px]">MEMORY BASE - LIMIT</span>
              <span className="font-mono text-white">
                0x{pcb.memoryBase.toString(16)} - 0x{pcb.memoryLimit.toString(16)}
              </span>
            </div>
            <div className="rounded border border-[#1A1A1A] bg-[#0A0A0A] p-2">
              <span className="text-[#666666] block text-[10px]">OPEN FILE DESCRIPTORS</span>
              <span className="font-mono text-white">{pcb.openFilesCount} (stdin, stdout, stderr)</span>
            </div>
            <div className="rounded border border-[#1A1A1A] bg-[#0A0A0A] p-2">
              <span className="text-[#666666] block text-[10px]">SCHEDULER PRIORITY</span>
              <span className="font-mono text-white">Level {pcb.priority}</span>
            </div>
          </div>
        </div>

        {/* Transition Log */}
        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-4 flex flex-col">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA] border-b border-[#222222] pb-2 mb-3">
            Kernel Event Log ({logs.length} transitions)
          </h3>
          <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[170px] pr-1">
            {logs.length === 0 ? (
              <p className="text-xs text-[#555555] italic">No events recorded yet. Trigger an action above.</p>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex items-start justify-between rounded p-1.5 text-[11px] ${
                    log.success ? "border border-[#1A1A1A] bg-[#0A0A0A]" : "border border-[#FF0000]/20 bg-[#FF0000]/5"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#555555]">#{idx + 1}</span>
                    <span className="font-mono font-semibold text-white">{log.event}</span>
                    <span className="text-[#777777]">({log.fromState} → {log.toState})</span>
                  </div>
                  <span className={log.success ? "text-[#4ade80]" : "text-[#FF4D4D]"}>
                    {log.success ? "OK" : "DENIED"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

