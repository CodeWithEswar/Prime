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
  GitForkIcon,
  CheckmarkBadge01Icon,
  Alert02Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import {
  runDijkstra,
  runBellmanFord,
  SAMPLE_TOPOLOGY_NODES,
  SAMPLE_TOPOLOGY_EDGES,
  type RoutingAlgorithmResult,
} from "@/domain/cn";

interface RoutingAlgorithmsStudioProps {
  onComplete?: () => void;
}

export function RoutingAlgorithmsStudio({ onComplete }: RoutingAlgorithmsStudioProps) {
  const [algorithm, setAlgorithm] = useState<"DIJKSTRA" | "BELLMAN_FORD">("DIJKSTRA");
  const [sourceNode, setSourceNode] = useState<string>("Router-A");
  const [completed, setCompleted] = useState(false);

  const result: RoutingAlgorithmResult =
    algorithm === "DIJKSTRA"
      ? runDijkstra(SAMPLE_TOPOLOGY_NODES, SAMPLE_TOPOLOGY_EDGES, sourceNode)
      : runBellmanFord(SAMPLE_TOPOLOGY_NODES, SAMPLE_TOPOLOGY_EDGES, sourceNode);

  const handleRun = (algo: "DIJKSTRA" | "BELLMAN_FORD") => {
    setAlgorithm(algo);
    setCompleted(true);
    if (onComplete) onComplete();
  };

  return (
    <div className="space-y-6 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 text-white">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[#1A1A1A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF0000]/10 text-[#FF4D4D] border border-[#FF0000]/20">
              <Icon icon={GitForkIcon} size={16} />
            </span>
            <h3 className="text-lg font-semibold text-white tracking-tight">
              Routing Algorithms Studio (Dijkstra vs Bellman-Ford)
            </h3>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Compare Link-State (OSPF Dijkstra) and Distance-Vector (RIP Bellman-Ford) routing convergence with edge relaxation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {completed && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
              <Icon icon={CheckmarkBadge01Icon} size={14} className="mr-1 inline" />
              Converged
            </Badge>
          )}
          <div className="flex rounded-lg border border-[#222222] bg-black p-0.5">
            <button
              onClick={() => handleRun("DIJKSTRA")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                algorithm === "DIJKSTRA"
                  ? "bg-[#FF0000] text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Dijkstra (Link-State)
            </button>
            <button
              onClick={() => handleRun("BELLMAN_FORD")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                algorithm === "BELLMAN_FORD"
                  ? "bg-[#FF0000] text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Bellman-Ford (Distance-Vector)
            </button>
          </div>
        </div>
      </div>

      {/* Network Topology & Source Node Selector */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 rounded-lg border border-[#1F1F1F] bg-black p-4">
        <div className="md:col-span-4">
          <label className="text-xs font-medium text-neutral-300">Origin / Source Router</label>
          <div className="mt-1.5">
            <Select value={sourceNode} onValueChange={setSourceNode}>
              <SelectTrigger className="h-8 w-full border-[#2A2A2A] bg-[#111111] px-3 font-mono text-xs text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_TOPOLOGY_NODES.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.name} ({n.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="md:col-span-8 flex flex-col justify-center">
          <div className="text-xs font-medium text-neutral-400 mb-1">Topology Links & Costs:</div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_TOPOLOGY_EDGES.map((e, idx) => (
              <span
                key={idx}
                className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-neutral-300"
              >
                {e.from} ↔ {e.to} (Cost: <span className="text-[#FF4D4D] font-bold">{e.weight}</span>)
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Final Shortest Distances Grid */}
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Computed Shortest Distance & Next Hop Table
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SAMPLE_TOPOLOGY_NODES.map((node) => {
            const dist = result.shortestDistances[node.id];
            const prev = result.previousHops[node.id];

            return (
              <div key={node.id} className="rounded-lg border border-white/10 bg-black p-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">{node.name}</span>
                  <span className="font-mono text-[10px] text-neutral-400">{node.id}</span>
                </div>
                <div className="mt-2 font-mono text-xl font-bold text-emerald-400">
                  {dist === Infinity ? "∞" : dist} <span className="text-xs text-neutral-500">metric</span>
                </div>
                <div className="mt-1 text-[11px] text-neutral-400 font-mono">
                  Previous Hop: <span className="text-white">{prev ?? "Origin"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Trace Relaxation Table */}
      <div className="overflow-x-auto rounded-lg border border-[#1F1F1F] bg-black p-4 space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Algorithmic Step Trace & Edge Relaxations
        </div>

        <div className="space-y-2">
          {result.stepTrace.map((st) => (
            <div
              key={st.step}
              className="flex flex-col sm:flex-row sm:items-center justify-between rounded-md border border-white/5 bg-[#111111] p-3 text-xs font-mono"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#FF4D4D]">Step {st.step}:</span>
                <span className="text-white font-sans">{st.explanation}</span>
              </div>
              <div className="mt-1 sm:mt-0 text-[11px] text-neutral-400">
                Current Node: <span className="text-emerald-400">{st.currentNode}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

