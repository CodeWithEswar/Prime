"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import {
  RefreshIcon,
  PlayIcon,
  DatabaseIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import {
  simulateDiskScheduling,
  type DiskDirection,
  type DiskSchedulingAlgorithm,
} from "@/domain/os";

const DEFAULT_REQUESTS = [98, 183, 37, 122, 14, 124, 65, 67];

export function DiskSchedulingStudio() {
  const [requestsInput, setRequestsInput] = useState<string>(DEFAULT_REQUESTS.join(", "));
  const [initialHead, setInitialHead] = useState<number>(53);
  const [direction, setDirection] = useState<DiskDirection>("UP");
  const [algorithm, setAlgorithm] = useState<DiskSchedulingAlgorithm>("SCAN");
  const maxCylinders = 200;

  const parsedRequests = useMemo(() => {
    return requestsInput
      .split(/[\s,]+/)
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));
  }, [requestsInput]);

  const simulation = useMemo(() => {
    return simulateDiskScheduling(parsedRequests, initialHead, algorithm, direction, maxCylinders);
  }, [parsedRequests, initialHead, algorithm, direction, maxCylinders]);

  const algorithms: Array<{ id: DiskSchedulingAlgorithm; name: string }> = [
    { id: "FCFS", name: "FCFS" },
    { id: "SSTF", name: "SSTF" },
    { id: "SCAN", name: "SCAN (Elevator)" },
    { id: "C_SCAN", name: "C-SCAN" },
    { id: "LOOK", name: "LOOK" },
    { id: "C_LOOK", name: "C-LOOK" },
  ];

  return (
    <div className="space-y-6 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 text-white">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[#1A1A1A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF0000]/10 text-[#FF4D4D] border border-[#FF0000]/20">
              <Icon icon={DatabaseIcon} size={16} />
            </span>
            <h2 className="text-lg font-semibold text-white">Disk Scheduling Studio</h2>
          </div>
          <p className="text-xs text-[#888888] mt-1">
            Simulate hard disk arm movement trajectories and compare seek distances across FCFS, SSTF, SCAN, C-SCAN, LOOK, and C-LOOK.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setRequestsInput(DEFAULT_REQUESTS.join(", "));
            setInitialHead(53);
            setDirection("UP");
            setAlgorithm("SCAN");
          }}
          className="h-8 border-[#262626] bg-[#141414] text-xs text-[#AAAAAA] hover:text-white"
        >
          <Icon icon={RefreshIcon} size={14} className="mr-1.5" />
          Reset Textbook Preset
        </Button>
      </div>

      {/* Algorithm selector (Tabs) */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#888888] uppercase tracking-wider block">
          Disk Scheduling Algorithm
        </label>
        <Tabs
          value={algorithm}
          onValueChange={(val) => setAlgorithm(val as DiskSchedulingAlgorithm)}
          className="w-full"
        >
          <TabsList
            layoutId="disk-sched-algo-tabs"
            className="h-auto w-full justify-start gap-1 overflow-x-auto bg-[#121212] p-1 border border-[#262626] rounded-lg no-scrollbar flex-nowrap sm:flex-wrap"
          >
            {algorithms.map((alg) => (
              <TabsTrigger
                key={alg.id}
                value={alg.id}
                className="h-7 px-3 text-xs rounded-md shrink-0 data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-[#FF0000] text-[#888888] hover:text-white transition-colors"
              >
                {alg.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Controls: Initial Head, Direction, Requests */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#888888] uppercase tracking-wider block">
            Initial Head Position (0 - {maxCylinders - 1})
          </label>
          <input
            type="number"
            min={0}
            max={maxCylinders - 1}
            value={initialHead}
            onChange={(e) => setInitialHead(parseInt(e.target.value) || 0)}
            className="w-full rounded border border-[#2A2A2A] bg-[#121212] px-2 py-1.5 text-xs text-white font-mono focus:border-[#FF0000] focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#888888] uppercase tracking-wider block">
            Initial Arm Direction
          </label>
          <Tabs
            value={direction}
            onValueChange={(val) => setDirection(val as DiskDirection)}
            className="w-full"
          >
            <TabsList
              layoutId="disk-sched-dir-tabs"
              className="grid grid-cols-2 h-8 w-full bg-[#121212] p-0.5 border border-[#2A2A2A] rounded-lg"
            >
              <TabsTrigger
                value="UP"
                className="h-7 text-xs rounded data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-[#FF0000] text-[#888888] transition-colors"
              >
                Towards {maxCylinders - 1} (UP)
              </TabsTrigger>
              <TabsTrigger
                value="DOWN"
                className="h-7 text-xs rounded data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-[#FF0000] text-[#888888] transition-colors"
              >
                Towards 0 (DOWN)
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-1.5 sm:col-span-1">
          <label className="text-xs font-medium text-[#888888] uppercase tracking-wider block">
            Track Cylinder Requests
          </label>
          <input
            type="text"
            value={requestsInput}
            onChange={(e) => setRequestsInput(e.target.value)}
            className="w-full rounded border border-[#2A2A2A] bg-[#121212] px-2 py-1.5 text-xs text-white font-mono focus:border-[#FF0000] focus:outline-none"
          />
        </div>
      </div>

      {/* Metrics Rail */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-center">
          <span className="text-[10px] font-semibold text-[#888888] uppercase">Total Head Movement</span>
          <span className="mt-1 block text-lg font-bold text-[#FF4D4D] font-mono">
            {simulation.totalHeadMovement} cylinders
          </span>
        </div>
        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-center">
          <span className="text-[10px] font-semibold text-[#888888] uppercase">Average Seek Distance</span>
          <span className="mt-1 block text-lg font-bold text-white font-mono">
            {simulation.averageSeekDistance}
          </span>
        </div>
        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-center">
          <span className="text-[10px] font-semibold text-[#888888] uppercase">Requests Serviced</span>
          <span className="mt-1 block text-lg font-bold text-[#4ade80] font-mono">
            {simulation.requests.length}
          </span>
        </div>
        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-center">
          <span className="text-[10px] font-semibold text-[#888888] uppercase">Arm Sweeps</span>
          <span className="mt-1 block text-lg font-bold text-[#CCCCCC] font-mono">
            {simulation.trajectory.length - 1} steps
          </span>
        </div>
      </div>

      {/* Trajectory Sequence Badges */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#888888] uppercase tracking-wider block">
          Seek Order Trajectory
        </label>
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 font-mono text-xs">
          {simulation.trajectory.map((cylinder, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <Badge
                variant="outline"
                className={`text-xs ${
                  idx === 0
                    ? "border-[#888888] text-[#888888]"
                    : cylinder === 0 || cylinder === maxCylinders - 1
                    ? "border-[#444444] text-[#666666]"
                    : "border-[#FF0000] text-[#FF4D4D] font-bold"
                }`}
              >
                {cylinder}
                {idx === 0 && " (Start)"}
              </Badge>
              {idx < simulation.trajectory.length - 1 && (
                <Icon icon={ArrowRight01Icon} size={12} className="text-[#555555]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Visual SVG Head Trajectory Chart */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#888888] uppercase tracking-wider block">
          Head Trajectory Graph (0 to {maxCylinders - 1} Cylinders)
        </label>
        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-4">
          <svg className="w-full h-44" viewBox="0 0 800 160">
            {/* Background grid lines for 0, 50, 100, 150, 199 */}
            {[0, 50, 100, 150, 199].map((c) => {
              const x = (c / (maxCylinders - 1)) * 760 + 20;
              return (
                <g key={c}>
                  <line x1={x} y1={10} x2={x} y2={130} stroke="#222222" strokeDasharray="3 3" />
                  <text x={x} y={150} fill="#555555" fontSize={10} textAnchor="middle">
                    {c}
                  </text>
                </g>
              );
            })}

            {/* Trajectory Polyline */}
            {simulation.trajectory.length > 1 && (
              <polyline
                fill="none"
                stroke="#FF0000"
                strokeWidth={2}
                points={simulation.trajectory
                  .map((c, idx) => {
                    const x = (c / (maxCylinders - 1)) * 760 + 20;
                    const y = ((idx / (simulation.trajectory.length - 1)) * 110) + 15;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
            )}

            {/* Circle markers */}
            {simulation.trajectory.map((c, idx) => {
              const x = (c / (maxCylinders - 1)) * 760 + 20;
              const y = ((idx / (simulation.trajectory.length - 1)) * 110) + 15;
              const isStart = idx === 0;

              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r={isStart ? 5 : 3.5}
                  fill={isStart ? "#FFFFFF" : "#FF0000"}
                  stroke="#000000"
                  strokeWidth={1}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

