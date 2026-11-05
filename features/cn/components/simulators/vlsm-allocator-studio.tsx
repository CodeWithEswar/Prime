"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  Layers01Icon,
  CheckmarkBadge01Icon,
  Alert02Icon,
  PlusSignIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { allocateVLSM, type VLSMDemand } from "@/domain/cn";

interface VLSMAllocatorStudioProps {
  onComplete?: () => void;
}

export function VLSMAllocatorStudio({ onComplete }: VLSMAllocatorStudioProps) {
  const [baseIp, setBaseIp] = useState("192.168.0.0");
  const [basePrefix, setBasePrefix] = useState(24);
  const [demands, setDemands] = useState<VLSMDemand[]>([
    { name: "Engineering Department", requiredHosts: 120 },
    { name: "Sales & Support", requiredHosts: 25 },
    { name: "Executive Suite", requiredHosts: 10 },
    { name: "Core WAN Router Link", requiredHosts: 2 },
  ]);

  const [newName, setNewName] = useState("");
  const [newHosts, setNewHosts] = useState("");

  const result = allocateVLSM(baseIp, basePrefix, demands);

  const handleAddDemand = () => {
    if (!newName.trim() || !newHosts.trim()) return;
    const hosts = parseInt(newHosts, 10);
    if (isNaN(hosts) || hosts <= 0) return;

    setDemands([...demands, { name: newName.trim(), requiredHosts: hosts }]);
    setNewName("");
    setNewHosts("");
    if (onComplete) onComplete();
  };

  const handleRemoveDemand = (index: number) => {
    setDemands(demands.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setDemands([
      { name: "Engineering Department", requiredHosts: 120 },
      { name: "Sales & Support", requiredHosts: 25 },
      { name: "Executive Suite", requiredHosts: 10 },
      { name: "Core WAN Router Link", requiredHosts: 2 },
    ]);
  };

  return (
    <div className="space-y-6 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 text-white">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[#1A1A1A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF0000]/10 text-[#FF4D4D] border border-[#FF0000]/20">
              <Icon icon={Layers01Icon} size={16} />
            </span>
            <h3 className="text-lg font-semibold text-white tracking-tight">
              VLSM Allocator (Largest-First Rule)
            </h3>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Variable Length Subnet Masking engine with prefix sizing, boundary alignment, and zero fragmentation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!result.overflow ? (
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
              <Icon icon={CheckmarkBadge01Icon} size={14} className="mr-1 inline" />
              Valid Allocation
            </Badge>
          ) : (
            <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs">
              <Icon icon={Alert02Icon} size={14} className="mr-1 inline" />
              Subnet Overflow
            </Badge>
          )}
          <Button size="sm" variant="outline" onClick={handleReset} className="border-white/10 text-xs hover:bg-white/5">
            Reset Default
          </Button>
        </div>
      </div>

      {/* Base Network Configuration */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 rounded-lg border border-[#1F1F1F] bg-black p-4">
        <div>
          <label className="text-xs font-medium text-neutral-300">Base Major Network IP</label>
          <input
            type="text"
            value={baseIp}
            onChange={(e) => setBaseIp(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-[#2A2A2A] bg-[#111111] px-3 py-1.5 font-mono text-xs text-white focus:border-[#FF0000] focus:outline-none"
          />
        </div>
        <div>
          <div className="flex justify-between">
            <label className="text-xs font-medium text-neutral-300">Base Prefix Length</label>
            <span className="font-mono text-xs text-[#FF4D4D] font-bold">/{basePrefix}</span>
          </div>
          <input
            type="range"
            min={16}
            max={28}
            value={basePrefix}
            onChange={(e) => setBasePrefix(parseInt(e.target.value, 10))}
            className="mt-3 w-full accent-[#FF0000]"
          />
        </div>
      </div>

      {/* Demand Input Form */}
      <div className="rounded-lg border border-[#1F1F1F] bg-black p-4 space-y-3">
        <div className="text-xs font-semibold text-neutral-300">Add Subnet Demand</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Subnet Name (e.g. Guest WiFi)"
            className="sm:col-span-6 rounded-md border border-[#2A2A2A] bg-[#111111] px-3 py-1.5 text-xs text-white focus:border-[#FF0000] focus:outline-none"
          />
          <input
            type="number"
            value={newHosts}
            onChange={(e) => setNewHosts(e.target.value)}
            placeholder="Required Hosts (e.g. 50)"
            className="sm:col-span-4 rounded-md border border-[#2A2A2A] bg-[#111111] px-3 py-1.5 font-mono text-xs text-white focus:border-[#FF0000] focus:outline-none"
          />
          <Button
            size="sm"
            onClick={handleAddDemand}
            className="sm:col-span-2 bg-[#FF0000] text-white hover:bg-[#CC0000] text-xs font-medium"
          >
            <Icon icon={PlusSignIcon} size={14} className="mr-1 inline" />
            Add
          </Button>
        </div>
      </div>

      {/* Error / Overflow Warning */}
      {result.overflow && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-300 flex items-start gap-2">
          <Icon icon={Alert02Icon} size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-red-200">Capacity Exceeded</div>
            <div className="mt-0.5">{result.errorMessage}</div>
          </div>
        </div>
      )}

      {/* Allocation Table */}
      <div className="overflow-x-auto rounded-lg border border-[#1F1F1F] bg-black">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-[#1F1F1F] bg-[#111111] text-[11px] uppercase tracking-wider text-neutral-400">
              <th className="px-4 py-3">Subnet / Name</th>
              <th className="px-4 py-3">Demanded</th>
              <th className="px-4 py-3">Allocated Hosts</th>
              <th className="px-4 py-3">Prefix</th>
              <th className="px-4 py-3">Subnet ID</th>
              <th className="px-4 py-3">Usable Range</th>
              <th className="px-4 py-3">Broadcast</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {result.allocations.map((alloc, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-sans font-medium text-white">{alloc.name}</td>
                <td className="px-4 py-3 text-neutral-300">{alloc.requiredHosts}</td>
                <td className="px-4 py-3 text-emerald-400 font-bold">{alloc.allocatedHosts}</td>
                <td className="px-4 py-3 text-[#FF4D4D] font-bold">/{alloc.prefixLength}</td>
                <td className="px-4 py-3 text-white">{alloc.networkAddress}</td>
                <td className="px-4 py-3 text-neutral-300">
                  {alloc.firstUsableIp} – {alloc.lastUsableIp}
                </td>
                <td className="px-4 py-3 text-neutral-400">{alloc.broadcastAddress}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleRemoveDemand(idx)}
                    className="text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    <Icon icon={Delete02Icon} size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-xs text-neutral-400 pt-2 font-mono">
        <div>Total Subnets Allocated: {result.allocations.length}</div>
        <div>Remaining Unallocated Addresses: {result.remainingCapacityHosts}</div>
      </div>
    </div>
  );
}

