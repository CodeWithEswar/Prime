"use client";

import { useState, useMemo } from "react";
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
  Alert02Icon,
  CheckmarkBadge01Icon,
  PlayIcon,
  Route01Icon,
  HelpCircleIcon,
} from "@hugeicons/core-free-icons";
import {
  runBankersSafetyAlgorithm,
  requestResources,
  type BankersInput,
  type BankersSafetyResult,
  type ResourceRequestResult,
} from "@/domain/os";

const DEFAULT_BANKERS_INPUT: BankersInput = {
  numProcesses: 5,
  numResources: 3,
  available: [3, 3, 2],
  allocation: [
    [0, 1, 0], // P0
    [2, 0, 0], // P1
    [3, 0, 2], // P2
    [2, 1, 1], // P3
    [0, 0, 2], // P4
  ],
  max: [
    [7, 5, 3], // P0
    [3, 2, 2], // P1
    [9, 0, 2], // P2
    [2, 2, 2], // P3
    [4, 3, 3], // P4
  ],
};

export function BankersStudio() {
  const [input, setInput] = useState<BankersInput>(DEFAULT_BANKERS_INPUT);
  const [requestPid, setRequestPid] = useState<number>(1);
  const [requestVec, setRequestVec] = useState<number[]>([1, 0, 2]);
  const [requestFeedback, setRequestFeedback] = useState<ResourceRequestResult | null>(null);

  const safetyResult: BankersSafetyResult = useMemo(() => {
    return runBankersSafetyAlgorithm(input);
  }, [input]);

  const handleUpdateAllocation = (pIdx: number, rIdx: number, val: number) => {
    const nextAlloc = input.allocation.map((row, i) =>
      i === pIdx ? row.map((v, j) => (j === rIdx ? Math.max(0, val) : v)) : [...row]
    );
    setInput({ ...input, allocation: nextAlloc });
    setRequestFeedback(null);
  };

  const handleUpdateMax = (pIdx: number, rIdx: number, val: number) => {
    const nextMax = input.max.map((row, i) =>
      i === pIdx ? row.map((v, j) => (j === rIdx ? Math.max(0, val) : v)) : [...row]
    );
    setInput({ ...input, max: nextMax });
    setRequestFeedback(null);
  };

  const handleUpdateAvailable = (rIdx: number, val: number) => {
    const nextAvail = input.available.map((v, j) => (j === rIdx ? Math.max(0, val) : v));
    setInput({ ...input, available: nextAvail });
    setRequestFeedback(null);
  };

  const handleTestRequest = () => {
    const res = requestResources(input, requestPid, requestVec);
    setRequestFeedback(res);
  };

  return (
    <div className="space-y-6 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 text-white">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[#1A1A1A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF0000]/10 text-[#FF4D4D] border border-[#FF0000]/20">
              <Icon icon={Route01Icon} size={16} />
            </span>
            <h2 className="text-lg font-semibold text-white">Deadlock & Banker's Algorithm Studio</h2>
          </div>
          <p className="text-xs text-[#888888] mt-1">
            Compute Need matrix (Need = Max - Allocation), verify system safety, derive safe sequences, and simulate dynamic resource requests.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setInput(DEFAULT_BANKERS_INPUT);
            setRequestFeedback(null);
          }}
          className="h-8 border-[#262626] bg-[#141414] text-xs text-[#AAAAAA] hover:text-white hover:border-[#444444]"
        >
          <Icon icon={RefreshIcon} size={14} className="mr-1.5" />
          Reset Textbook Preset
        </Button>
      </div>

      {/* Safety Status Banner */}
      <div
        className={`flex items-center justify-between rounded-lg border p-4 ${
          safetyResult.isSafe
            ? "border-[#4ade80]/40 bg-[#4ade80]/10 text-[#4ade80]"
            : "border-[#FF0000]/40 bg-[#FF0000]/10 text-[#FF4D4D]"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon icon={safetyResult.isSafe ? CheckmarkBadge01Icon : Alert02Icon} size={20} />
          <div>
            <span className="text-sm font-bold uppercase tracking-wide block">
              {safetyResult.isSafe ? "System is in a SAFE State" : "System is in an UNSAFE State"}
            </span>
            <span className="text-xs opacity-80 block mt-0.5">
              {safetyResult.isSafe
                ? `Safe sequence found: <${safetyResult.safeSequence?.map((p) => `P${p}`).join(", ")}>`
                : `Deadlocked / Blocked processes: ${safetyResult.deadlockedProcesses?.map((p) => `P${p}`).join(", ")}`}
            </span>
          </div>
        </div>

        {safetyResult.isSafe && (
          <div className="flex items-center gap-1.5">
            {safetyResult.safeSequence?.map((p, idx) => (
              <Badge key={idx} variant="outline" className="border-[#4ade80] bg-[#4ade80]/20 text-[#4ade80] text-xs font-mono font-bold">
                P{p}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Available Vector Input */}
      <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-4 space-y-2">
        <label className="text-xs font-medium text-[#888888] uppercase tracking-wider block">
          Available Resource Vector [R0, R1, R2]
        </label>
        <div className="flex items-center gap-4">
          {input.available.map((val, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#888888]">R{idx}:</span>
              <input
                type="number"
                min={0}
                value={val}
                onChange={(e) => handleUpdateAvailable(idx, parseInt(e.target.value) || 0)}
                className="w-16 rounded border border-[#2A2A2A] bg-[#0A0A0A] px-2 py-1 text-xs text-white font-mono focus:border-[#FF0000] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Matrices Table: Allocation, Max, and Derived Need */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#888888] uppercase tracking-wider">
          Resource Allocation, Maximum Claim & Derived Need Matrix
        </label>
        <div className="overflow-x-auto rounded-lg border border-[#1F1F1F]">
          <table className="w-full text-left text-xs text-[#CCCCCC]">
            <thead className="bg-[#121212] text-[#888888] uppercase text-[10px] border-b border-[#1F1F1F]">
              <tr>
                <th className="py-2.5 px-3">PID</th>
                <th className="py-2.5 px-3">Allocation [R0, R1, R2]</th>
                <th className="py-2.5 px-3">Maximum [R0, R1, R2]</th>
                <th className="py-2.5 px-3 text-[#FF4D4D] font-bold">Derived Need [Max - Alloc]</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A] bg-[#0A0A0A] font-mono">
              {Array.from({ length: input.numProcesses }).map((_, pIdx) => {
                const needRow = safetyResult.need[pIdx] || [0, 0, 0];
                return (
                  <tr key={pIdx} className="hover:bg-[#121212]">
                    <td className="py-2 px-3 font-semibold text-white">P{pIdx}</td>
                    {/* Allocation */}
                    <td className="py-2 px-3">
                      <div className="flex gap-1.5">
                        {input.allocation[pIdx].map((v, rIdx) => (
                          <input
                            key={rIdx}
                            type="number"
                            min={0}
                            value={v}
                            onChange={(e) => handleUpdateAllocation(pIdx, rIdx, parseInt(e.target.value) || 0)}
                            className="w-12 rounded border border-[#222222] bg-[#141414] px-1.5 py-0.5 text-xs text-center text-white focus:border-[#FF0000] focus:outline-none"
                          />
                        ))}
                      </div>
                    </td>
                    {/* Maximum */}
                    <td className="py-2 px-3">
                      <div className="flex gap-1.5">
                        {input.max[pIdx].map((v, rIdx) => (
                          <input
                            key={rIdx}
                            type="number"
                            min={0}
                            value={v}
                            onChange={(e) => handleUpdateMax(pIdx, rIdx, parseInt(e.target.value) || 0)}
                            className="w-12 rounded border border-[#222222] bg-[#141414] px-1.5 py-0.5 text-xs text-center text-white focus:border-[#FF0000] focus:outline-none"
                          />
                        ))}
                      </div>
                    </td>
                    {/* Need */}
                    <td className="py-2 px-3 font-bold text-[#FF4D4D]">
                      [{needRow.join(", ")}]
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Resource Request Simulator */}
      <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-4 space-y-3">
        <label className="text-xs font-semibold text-white uppercase tracking-wider block">
          Resource Request Algorithm Test
        </label>
        <p className="text-xs text-[#888888]">
          Test whether granting an immediate request from a process will leave the system in a safe state:
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-[#CCCCCC]">Process:</span>
          <Select
            value={String(requestPid)}
            onValueChange={(val) => setRequestPid(parseInt(val, 10))}
          >
            <SelectTrigger className="h-8 w-20 border-[#2A2A2A] bg-[#0A0A0A] px-2 text-xs text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: input.numProcesses }).map((_, i) => (
                <SelectItem key={i} value={String(i)}>
                  P{i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-xs text-[#CCCCCC] ml-2">Request Vector [R0, R1, R2]:</span>
          {requestVec.map((val, idx) => (
            <input
              key={idx}
              type="number"
              min={0}
              value={val}
              onChange={(e) => {
                const next = [...requestVec];
                next[idx] = parseInt(e.target.value) || 0;
                setRequestVec(next);
              }}
              className="w-12 rounded border border-[#2A2A2A] bg-[#0A0A0A] px-1.5 py-1 text-xs text-center text-white font-mono focus:border-[#FF0000] focus:outline-none"
            />
          ))}

          <Button
            size="sm"
            onClick={handleTestRequest}
            className="h-8 bg-[#FF0000] hover:bg-[#D90000] text-xs font-semibold text-white"
          >
            Test Request
          </Button>
        </div>

        {requestFeedback && (
          <div
            className={`rounded-lg border p-3 text-xs mt-3 ${
              requestFeedback.canGrant
                ? "border-[#4ade80]/40 bg-[#4ade80]/10 text-[#4ade80]"
                : "border-[#FF0000]/40 bg-[#FF0000]/10 text-[#FF4D4D]"
            }`}
          >
            <span className="font-bold block mb-1">
              {requestFeedback.canGrant ? "REQUEST APPROVED" : "REQUEST REJECTED"}
            </span>
            <span>{requestFeedback.reason}</span>
          </div>
        )}
      </div>
    </div>
  );
}

