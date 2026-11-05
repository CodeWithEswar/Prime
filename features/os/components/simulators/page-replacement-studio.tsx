"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Layers01Icon,
} from "@hugeicons/core-free-icons";
import {
  simulatePageReplacement,
  checkBeladysAnomaly,
  translateAddress,
  type PageReplacementAlgorithm,
} from "@/domain/os";

const DEFAULT_REF_STRING = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1];
const BELADY_REF_STRING = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5];

export function PageReplacementStudio() {
  const [refStringInput, setRefStringInput] = useState<string>(DEFAULT_REF_STRING.join(", "));
  const [numFrames, setNumFrames] = useState<number>(3);
  const [algorithm, setAlgorithm] = useState<PageReplacementAlgorithm>("FIFO");

  // Address translation state
  const [logicalAddr, setLogicalAddr] = useState<number>(8316);
  const [pageSize, setPageSize] = useState<number>(4096);

  const parsedRefString = useMemo(() => {
    return refStringInput
      .split(/[\s,]+/)
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));
  }, [refStringInput]);

  const simulation = useMemo(() => {
    return simulatePageReplacement(parsedRefString, numFrames, algorithm);
  }, [parsedRefString, numFrames, algorithm]);

  const beladyTest = useMemo(() => {
    return checkBeladysAnomaly(parsedRefString, 3, 4);
  }, [parsedRefString]);

  const translation = useMemo(() => {
    // Simple demo page table: page 2 -> frame 5, page 0 -> frame 3
    const mockPageTable = { 0: 3, 1: 8, 2: 5, 3: 1 };
    const mockTLB = { 2: 5 };
    return translateAddress(logicalAddr, pageSize, mockPageTable, mockTLB);
  }, [logicalAddr, pageSize]);

  return (
    <div className="space-y-6 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 text-white">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[#1A1A1A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF0000]/10 text-[#FF4D4D] border border-[#FF0000]/20">
              <Icon icon={Layers01Icon} size={16} />
            </span>
            <h2 className="text-lg font-semibold text-white">Memory & Page Replacement Studio</h2>
          </div>
          <p className="text-xs text-[#888888] mt-1">
            Simulate FIFO, LRU, and Optimal page replacement algorithms, investigate Bélády's Anomaly, and trace virtual-to-physical address translation.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRefStringInput(BELADY_REF_STRING.join(", "));
              setAlgorithm("FIFO");
              setNumFrames(3);
            }}
            className="h-8 border-[#262626] bg-[#141414] text-xs text-[#CCCCCC] hover:text-white"
          >
            Load Bélády Anomaly Preset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRefStringInput(DEFAULT_REF_STRING.join(", "));
              setNumFrames(3);
            }}
            className="h-8 border-[#262626] bg-[#141414] text-xs text-[#AAAAAA] hover:text-white"
          >
            <Icon icon={RefreshIcon} size={14} className="mr-1.5" />
            Reset Default
          </Button>
        </div>
      </div>

      {/* Algorithm & Frame Selection (Tabs) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-medium text-[#888888] uppercase tracking-wider block">
            Replacement Algorithm
          </label>
          <Tabs
            value={algorithm}
            onValueChange={(val) => setAlgorithm(val as PageReplacementAlgorithm)}
            className="w-full"
          >
            <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-[#121212] p-1 border border-[#262626] rounded-lg no-scrollbar flex-nowrap sm:flex-wrap">
              {(["FIFO", "LRU", "OPTIMAL"] as PageReplacementAlgorithm[]).map((alg) => (
                <TabsTrigger
                  key={alg}
                  value={alg}
                  className="h-7 px-3 text-xs shrink-0 data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-[#FF0000] text-[#888888] hover:text-white"
                >
                  {alg === "OPTIMAL" ? "Optimal (Bélády MIN)" : alg}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-[#888888] uppercase tracking-wider block">
            Number of Page Frames in RAM ({numFrames} frames)
          </label>
          <Tabs
            value={String(numFrames)}
            onValueChange={(val) => setNumFrames(Number(val))}
            className="w-full"
          >
            <TabsList className="h-8 gap-1 bg-[#121212] p-0.5 border border-[#262626] rounded-lg">
              {[2, 3, 4, 5, 6].map((f) => (
                <TabsTrigger
                  key={f}
                  value={String(f)}
                  className="h-7 w-9 text-xs font-mono data-[state=active]:bg-[#1E1E1E] data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-[#FF0000] text-[#888888]"
                >
                  {f}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Reference String Input */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#888888] uppercase tracking-wider block">
          Page Reference String
        </label>
        <input
          type="text"
          value={refStringInput}
          onChange={(e) => setRefStringInput(e.target.value)}
          placeholder="e.g. 7, 0, 1, 2, 0, 3, 0, 4..."
          className="w-full rounded-lg border border-[#2A2A2A] bg-[#121212] px-3 py-2 text-xs font-mono text-white focus:border-[#FF0000] focus:outline-none"
        />
      </div>

      {/* Bélády's Anomaly Detection Banner */}
      {beladyTest.isAnomaly && (
        <div className="flex items-center gap-2 rounded-lg border border-[#FF0000] bg-[#FF0000]/15 p-3 text-xs font-bold text-[#FF4D4D]">
          <Icon icon={Alert02Icon} size={16} />
          <span>{beladyTest.explanation}</span>
        </div>
      )}

      {/* Metrics Rail */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-center">
          <span className="text-[10px] font-semibold text-[#888888] uppercase">Total Page Faults</span>
          <span className="mt-1 block text-lg font-bold text-[#FF4D4D] font-mono">
            {simulation.totalPageFaults}
          </span>
        </div>
        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-center">
          <span className="text-[10px] font-semibold text-[#888888] uppercase">Total Page Hits</span>
          <span className="mt-1 block text-lg font-bold text-[#4ade80] font-mono">
            {simulation.totalPageHits}
          </span>
        </div>
        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-center">
          <span className="text-[10px] font-semibold text-[#888888] uppercase">Hit Ratio</span>
          <span className="mt-1 block text-lg font-bold text-white font-mono">
            {simulation.hitRatio}%
          </span>
        </div>
        <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3 text-center">
          <span className="text-[10px] font-semibold text-[#888888] uppercase">Fault Ratio</span>
          <span className="mt-1 block text-lg font-bold text-[#FF4D4D] font-mono">
            {simulation.faultRatio}%
          </span>
        </div>
      </div>

      {/* Step-by-Step Frames Grid */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#888888] uppercase tracking-wider block">
          Frame Allocation Trace ({simulation.steps.length} reference accesses)
        </label>
        <div className="overflow-x-auto rounded-lg border border-[#1F1F1F] bg-[#121212] p-3">
          <div className="flex gap-2">
            {simulation.steps.map((st) => (
              <div key={st.step} className="flex flex-col items-center min-w-[42px]">
                {/* Requested Page */}
                <span className="text-xs font-bold font-mono text-white mb-1.5">{st.page}</span>

                {/* Frames column */}
                <div className="flex flex-col gap-1 w-full">
                  {st.frames.map((pageInFrame, fIdx) => (
                    <div
                      key={fIdx}
                      className={`flex h-7 items-center justify-center rounded border text-xs font-mono ${
                        pageInFrame === st.page
                          ? "border-[#4ade80] bg-[#4ade80]/20 text-[#4ade80] font-bold"
                          : pageInFrame !== null
                          ? "border-[#2A2A2A] bg-[#1A1A1A] text-white"
                          : "border-dashed border-[#222222] bg-[#0A0A0A] text-[#444444]"
                      }`}
                    >
                      {pageInFrame !== null ? pageInFrame : "-"}
                    </div>
                  ))}
                </div>

                {/* Status indicator */}
                <span
                  className={`mt-2 text-[10px] font-bold ${
                    st.isFault ? "text-[#FF4D4D]" : "text-[#4ade80]"
                  }`}
                >
                  {st.isFault ? "FAULT" : "HIT"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Memory Address Translation Widget */}
      <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-4 space-y-3">
        <label className="text-xs font-semibold text-white uppercase tracking-wider block">
          Paging Hardware & Address Translation Explorer
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <span className="text-[11px] text-[#888888] block">Logical Address (Bytes):</span>
            <input
              type="number"
              value={logicalAddr}
              onChange={(e) => setLogicalAddr(parseInt(e.target.value) || 0)}
              className="w-full rounded border border-[#2A2A2A] bg-[#0A0A0A] px-2 py-1 text-xs text-white font-mono focus:border-[#FF0000] focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] text-[#888888] block">Page Size:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => setPageSize(parseInt(val, 10))}
            >
              <SelectTrigger className="h-8 w-full border-[#2A2A2A] bg-[#0A0A0A] px-2 text-xs text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1024">1024 Bytes (1 KB)</SelectItem>
                <SelectItem value="4096">4096 Bytes (4 KB)</SelectItem>
                <SelectItem value="8192">8192 Bytes (8 KB)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-xs pt-2">
          <div className="rounded border border-[#1A1A1A] bg-[#0A0A0A] p-2">
            <span className="text-[#666666] block text-[10px]">PAGE NUMBER (p)</span>
            <span className="text-white font-bold">{translation.pageNumber}</span>
          </div>
          <div className="rounded border border-[#1A1A1A] bg-[#0A0A0A] p-2">
            <span className="text-[#666666] block text-[10px]">OFFSET (d)</span>
            <span className="text-white font-bold">{translation.offset}</span>
          </div>
          <div className="rounded border border-[#1A1A1A] bg-[#0A0A0A] p-2">
            <span className="text-[#666666] block text-[10px]">TLB STATUS</span>
            <span className={translation.tlbHit ? "text-[#4ade80] font-bold" : "text-[#FF4D4D]"}>
              {translation.tlbHit ? "TLB HIT" : "TLB MISS"}
            </span>
          </div>
          <div className="rounded border border-[#1A1A1A] bg-[#0A0A0A] p-2">
            <span className="text-[#666666] block text-[10px]">PHYSICAL ADDRESS</span>
            <span className="text-[#FF4D4D] font-bold">
              {translation.physicalAddress !== null ? translation.physicalAddress : "Page Fault (Invalid)"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

