"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import {
  PlayIcon,
  RefreshIcon,
  Clock01Icon,
  CpuIcon,
  PlusSignIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import {
  simulateCPUScheduling,
  type CPUSchedulingAlgorithm,
  type ProcessInput,
} from "@/domain/os";

const DEFAULT_PROCESSES: ProcessInput[] = [
  { pid: "P1", arrivalTime: 0, burstTime: 8, priority: 3 },
  { pid: "P2", arrivalTime: 1, burstTime: 4, priority: 1 },
  { pid: "P3", arrivalTime: 2, burstTime: 9, priority: 4 },
  { pid: "P4", arrivalTime: 3, burstTime: 5, priority: 2 },
];

export function CPUSchedulingStudio() {
  const [algorithm, setAlgorithm] = useState<CPUSchedulingAlgorithm>("FCFS");
  const [timeQuantum, setTimeQuantum] = useState<number>(2);
  const [processes, setProcesses] = useState<ProcessInput[]>(DEFAULT_PROCESSES);

  const simulation = useMemo(() => {
    return simulateCPUScheduling(processes, algorithm, timeQuantum);
  }, [processes, algorithm, timeQuantum]);

  const handleAddProcess = () => {
    const nextNum = processes.length + 1;
    setProcesses([
      ...processes,
      { pid: `P${nextNum}`, arrivalTime: nextNum - 1, burstTime: 4, priority: 2 },
    ]);
  };

  const handleDeleteProcess = (index: number) => {
    if (processes.length <= 1) return;
    setProcesses(processes.filter((_, i) => i !== index));
  };

  const handleUpdateProcess = (index: number, field: keyof ProcessInput, val: number) => {
    const next = [...processes];
    next[index] = { ...next[index], [field]: Math.max(0, val) };
    setProcesses(next);
  };

  // Color mapping for Gantt blocks
  const pidColors: Record<string, string> = {
    P1: "bg-red-950/80 border-red-600/70 text-red-200",
    P2: "bg-neutral-800 border-neutral-600 text-neutral-100",
    P3: "bg-zinc-900 border-zinc-700 text-zinc-200",
    P4: "bg-neutral-900 border-neutral-700 text-neutral-300",
    P5: "bg-red-900/60 border-red-500/60 text-red-200",
    IDLE: "bg-neutral-950 border-dashed border-neutral-800 text-neutral-500",
  };

  const algorithms: Array<{ id: CPUSchedulingAlgorithm; name: string }> = [
    { id: "FCFS", name: "FCFS" },
    { id: "SJF_NON_PREEMPTIVE", name: "SJF (Non-Preemptive)" },
    { id: "SRTF", name: "SRTF (Preemptive SJF)" },
    { id: "PRIORITY_NON_PREEMPTIVE", name: "Priority (Non-Preemptive)" },
    { id: "PRIORITY_PREEMPTIVE", name: "Priority (Preemptive)" },
    { id: "ROUND_ROBIN", name: "Round Robin" },
  ];

  return (
    <div className="space-y-6 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 text-white">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[#1A1A1A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF0000]/10 text-[#FF4D4D] border border-[#FF0000]/20">
              <Icon icon={Clock01Icon} size={16} />
            </span>
            <h2 className="text-lg font-semibold text-white">CPU Scheduling Studio</h2>
          </div>
          <p className="text-xs text-[#888888] mt-1">
            Simulate and compare CPU scheduling algorithms with exact Gantt timelines, turnaround times, and context switch traces.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setProcesses(DEFAULT_PROCESSES)}
          className="h-8 border-[#262626] bg-[#141414] text-xs text-[#AAAAAA] hover:text-white hover:border-[#444444]"
        >
          <Icon icon={RefreshIcon} size={14} className="mr-1.5" />
          Reset Textbook Preset
        </Button>
      </div>

      {/* Algorithm Selector (Tabs) */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#888888] uppercase tracking-wider block">
          Scheduling Algorithm
        </label>
        <Tabs
          value={algorithm}
          onValueChange={(val) => setAlgorithm(val as CPUSchedulingAlgorithm)}
          className="w-full"
        >
          <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-[#121212] p-1 border border-[#262626] rounded-lg no-scrollbar flex-nowrap sm:flex-wrap">
            {algorithms.map((alg) => (
              <TabsTrigger
                key={alg.id}
                value={alg.id}
                className="h-7 px-3 text-xs shrink-0 data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-[#FF0000] text-[#888888] hover:text-white"
              >
                {alg.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Quantum control for Round Robin */}
      {algorithm === "ROUND_ROBIN" && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#262626] bg-[#121212] p-3">
          <span className="text-xs font-medium text-[#CCCCCC]">Time Quantum (q):</span>
          <Tabs
            value={String(timeQuantum)}
            onValueChange={(val) => setTimeQuantum(Number(val))}
          >
            <TabsList className="h-8 gap-1 bg-[#1A1A1A] p-0.5 border border-[#2A2A2A] rounded-lg">
              {[1, 2, 3, 4, 5].map((q) => (
                <TabsTrigger
                  key={q}
                  value={String(q)}
                  className="h-7 w-8 text-xs font-mono data-[state=active]:bg-[#262626] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-[#FF0000] text-[#888888]"
                >
                  {q}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <span className="text-[11px] text-[#777777]">units</span>
        </div>
      )}

      {/* Process Table Inputs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[#888888] uppercase tracking-wider">
            Process Workload Table
          </label>
          <Button
            size="sm"
            onClick={handleAddProcess}
            className="h-7 border border-[#262626] bg-[#141414] text-[11px] text-[#CCCCCC] hover:text-white"
          >
            <Icon icon={PlusSignIcon} size={13} className="mr-1" />
            Add Process
          </Button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#1F1F1F]">
          <table className="w-full text-left text-xs text-[#CCCCCC]">
            <thead className="bg-[#121212] text-[#888888] uppercase text-[10px] border-b border-[#1F1F1F]">
              <tr>
                <th className="py-2.5 px-3">PID</th>
                <th className="py-2.5 px-3">Arrival Time (AT)</th>
                <th className="py-2.5 px-3">Burst Time (BT)</th>
                <th className="py-2.5 px-3">Priority (Lower = Higher)</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A] bg-[#0A0A0A]">
              {processes.map((p, idx) => (
                <tr key={idx} className="hover:bg-[#121212]">
                  <td className="py-2 px-3 font-semibold text-white">{p.pid}</td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min={0}
                      value={p.arrivalTime}
                      onChange={(e) => handleUpdateProcess(idx, "arrivalTime", parseInt(e.target.value) || 0)}
                      className="w-20 rounded border border-[#2A2A2A] bg-[#141414] px-2 py-1 text-xs text-white focus:border-[#FF0000] focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min={1}
                      value={p.burstTime}
                      onChange={(e) => handleUpdateProcess(idx, "burstTime", parseInt(e.target.value) || 1)}
                      className="w-20 rounded border border-[#2A2A2A] bg-[#141414] px-2 py-1 text-xs text-white focus:border-[#FF0000] focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min={0}
                      value={p.priority ?? 0}
                      onChange={(e) => handleUpdateProcess(idx, "priority", parseInt(e.target.value) || 0)}
                      className="w-20 rounded border border-[#2A2A2A] bg-[#141414] px-2 py-1 text-xs text-white focus:border-[#FF0000] focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProcess(idx)}
                      disabled={processes.length <= 1}
                      className="h-6 w-6 p-0 text-[#666666] hover:text-[#FF4D4D] disabled:opacity-20"
                    >
                      <Icon icon={Delete02Icon} size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gantt Chart Visualizer */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#888888] uppercase tracking-wider">
          Execution Gantt Chart Timeline
        </label>
        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-4">
          <div className="flex w-full overflow-x-auto py-2">
            {simulation.ganttChart.map((block, idx) => {
              const duration = block.endTime - block.startTime;
              const colorClass = pidColors[block.pid] || "bg-[#1F1F1F] border-[#333333] text-white";

              return (
                <div
                  key={idx}
                  style={{ minWidth: `${Math.max(48, duration * 24)}px` }}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`flex h-12 w-full items-center justify-center rounded border text-xs font-bold ${colorClass}`}
                  >
                    {block.pid}
                  </div>
                  <div className="flex w-full justify-between px-1 text-[10px] text-[#666666] mt-1 font-mono">
                    <span>{block.startTime}</span>
                    <span>{block.endTime}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Metrics Rail */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-center">
          <span className="text-[10px] font-semibold text-[#888888] uppercase">Avg Turnaround</span>
          <span className="mt-1 block text-lg font-bold text-white font-mono">
            {simulation.averageTurnaroundTime} ms
          </span>
        </div>
        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-center">
          <span className="text-[10px] font-semibold text-[#888888] uppercase">Avg Waiting Time</span>
          <span className="mt-1 block text-lg font-bold text-white font-mono">
            {simulation.averageWaitingTime} ms
          </span>
        </div>
        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-center">
          <span className="text-[10px] font-semibold text-[#888888] uppercase">Avg Response Time</span>
          <span className="mt-1 block text-lg font-bold text-white font-mono">
            {simulation.averageResponseTime} ms
          </span>
        </div>
        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-center">
          <span className="text-[10px] font-semibold text-[#888888] uppercase">CPU Utilization</span>
          <span className="mt-1 block text-lg font-bold text-[#4ade80] font-mono">
            {simulation.cpuUtilization}%
          </span>
        </div>
        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-center">
          <span className="text-[10px] font-semibold text-[#888888] uppercase">Context Switches</span>
          <span className="mt-1 block text-lg font-bold text-[#FF4D4D] font-mono">
            {simulation.totalContextSwitches}
          </span>
        </div>
      </div>

      {/* Per-Process Results Table */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#888888] uppercase tracking-wider">
          Calculated Per-Process Metrics
        </label>
        <div className="overflow-x-auto rounded-lg border border-[#1F1F1F]">
          <table className="w-full text-left text-xs text-[#CCCCCC]">
            <thead className="bg-[#121212] text-[#888888] uppercase text-[10px] border-b border-[#1F1F1F]">
              <tr>
                <th className="py-2.5 px-3">PID</th>
                <th className="py-2.5 px-3">Arrival (AT)</th>
                <th className="py-2.5 px-3">Burst (BT)</th>
                <th className="py-2.5 px-3">Completion (CT)</th>
                <th className="py-2.5 px-3">Turnaround (CT - AT)</th>
                <th className="py-2.5 px-3">Waiting (TAT - BT)</th>
                <th className="py-2.5 px-3">Response Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A] bg-[#0A0A0A] font-mono">
              {simulation.results.map((r) => (
                <tr key={r.pid} className="hover:bg-[#121212]">
                  <td className="py-2 px-3 font-semibold text-white">{r.pid}</td>
                  <td className="py-2 px-3">{r.arrivalTime}</td>
                  <td className="py-2 px-3">{r.burstTime}</td>
                  <td className="py-2 px-3 font-semibold text-white">{r.completionTime}</td>
                  <td className="py-2 px-3 text-[#FF4D4D] font-bold">{r.turnaroundTime}</td>
                  <td className="py-2 px-3 text-[#CCCCCC]">{r.waitingTime}</td>
                  <td className="py-2 px-3 text-[#999999]">{r.responseTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

