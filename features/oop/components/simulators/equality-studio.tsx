"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  RefreshIcon,
  CheckmarkBadge01Icon,
  AlertCircleIcon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";
import {
  compareObjects,
  createInitialHashMapSimulation,
  mutateHashMapKey,
  type MemoryObject,
  type HashMapSimulationState,
} from "@/domain/oop";

interface EqualityStudioProps {
  onComplete?: () => void;
}

export function EqualityStudio({ onComplete }: EqualityStudioProps) {
  const [objA] = useState<MemoryObject>({
    id: "obj-a",
    className: "Student",
    fields: { id: 101, name: "Alice" },
    memoryAddress: "0x7f11aa",
  });

  const [objB, setObjB] = useState<MemoryObject>({
    id: "obj-b",
    className: "Student",
    fields: { id: 101, name: "Alice" },
    memoryAddress: "0x7f22bb", // Different memory address!
  });

  const [mapState, setMapState] = useState<HashMapSimulationState>(createInitialHashMapSimulation);
  const [newKeyId, setNewKeyId] = useState<number>(205);

  const equalityResult = compareObjects(objA, objB);

  const handleMakeIdenticalReference = () => {
    setObjB({ ...objA });
    if (onComplete) onComplete();
  };

  const handleMakeDistinctReference = () => {
    setObjB({
      id: "obj-b",
      className: "Student",
      fields: { id: 101, name: "Alice" },
      memoryAddress: "0x7f22bb",
    });
  };

  const handleMutateKey = () => {
    const updated = mutateHashMapKey(mapState, newKeyId);
    setMapState(updated);
    if (onComplete) onComplete();
  };

  const handleResetMap = () => {
    setMapState(createInitialHashMapSimulation());
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1F1F1F] pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#FF0000]">
              Laboratory 08
            </span>
            <Badge variant="outline" className="border-[#262626] bg-[#141414] text-[#CCCCCC]">
              Object Contracts & Hashing
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            == Identity, equals(), hashCode() Contract & Mutable Map Key Hazard
          </h2>
        </div>
      </div>

      {/* Main Grid: Comparison vs HashMap Hazard */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Identity vs Equality Comparison (6 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-6">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Reference Comparison: objA vs objB
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMakeIdenticalReference}
                className="border-[#262626] bg-[#141414] text-[11px] text-white"
              >
                objB = objA (Alias)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMakeDistinctReference}
                className="border-[#262626] bg-[#141414] text-[11px] text-white"
              >
                objB = new Student()
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3">
              <div className="font-bold text-[#FF8080]">objA (Heap)</div>
              <div className="text-[10px] text-[#888888]">{objA.memoryAddress}</div>
              <div className="mt-2 text-[#CCCCCC]">id: {objA.fields.id}</div>
              <div className="text-[#CCCCCC]">name: &quot;{objA.fields.name}&quot;</div>
              <div className="mt-2 text-[10px] text-[#666666]">hashCode: {equalityResult.leftHashCode}</div>
            </div>

            <div className="rounded-lg border border-[#1F1F1F] bg-[#121212] p-3">
              <div className="font-bold text-green-400">objB (Heap)</div>
              <div className="text-[10px] text-[#888888]">{objB.memoryAddress}</div>
              <div className="mt-2 text-[#CCCCCC]">id: {objB.fields.id}</div>
              <div className="text-[#CCCCCC]">name: &quot;{objB.fields.name}&quot;</div>
              <div className="mt-2 text-[10px] text-[#666666]">hashCode: {equalityResult.rightHashCode}</div>
            </div>
          </div>

          <div className="rounded-lg border border-[#1F1F1F] bg-[#161616] p-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#222222] pb-2">
              <span className="text-white">objA == objB (Memory Identity)</span>
              <span className={equalityResult.doubleEqualsResult ? "text-green-400 font-bold" : "text-[#FF8080] font-bold"}>
                {equalityResult.doubleEqualsResult ? "true" : "false"}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-b border-[#222222] pb-2">
              <span className="text-white">objA.equals(objB) (Logical Equivalence)</span>
              <span className={equalityResult.equalsMethodResult ? "text-green-400 font-bold" : "text-[#FF8080] font-bold"}>
                {equalityResult.equalsMethodResult ? "true" : "false"}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-white">hashCode Agreement Contract</span>
              <span className={equalityResult.hashCodeContractSatisfied ? "text-green-400 font-bold" : "text-[#FF0000] font-bold"}>
                {equalityResult.hashCodeContractSatisfied ? "SATISFIED" : "VIOLATED"}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-[#888888]">{equalityResult.explanation}</div>
        </div>

        {/* Right: Mutable Key Hazard in HashMap (6 cols) */}
        <div className="space-y-4 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 lg:col-span-6">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA]">
              Mutable HashMap Key Hazard
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetMap}
              className="border-[#262626] bg-[#141414] text-[10px] text-[#CCCCCC]"
            >
              <Icon icon={RefreshIcon} size={12} className="mr-1" />
              Reset Map
            </Button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#888888]">Key id:</span>
              <span className="font-bold text-white">{mapState.keyObject.id}</span>
              <input
                type="number"
                value={newKeyId}
                onChange={(e) => setNewKeyId(parseInt(e.target.value) || 0)}
                className="w-20 rounded border border-[#262626] bg-[#121212] px-2 py-1 text-white"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleMutateKey}
                className="bg-[#FF0000] text-xs text-white hover:bg-[#D90000]"
              >
                Mutate Key!
              </Button>
            </div>

            {/* Visual Buckets */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {mapState.buckets.map((b) => {
                const hasEntries = b.entries.length > 0;
                return (
                  <div
                    key={b.bucketIndex}
                    className={`rounded border p-2 text-center ${
                      hasEntries
                        ? "border-[#FF0000] bg-[#1A0A0A] text-white"
                        : "border-[#1A1A1A] bg-[#121212] text-[#666666]"
                    }`}
                  >
                    <div className="text-[10px] uppercase">Bucket {b.bucketIndex}</div>
                    <div className="mt-1 text-xs font-bold">
                      {hasEntries ? "1 Entry" : "Empty"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lookup Result Box */}
            <div
              className={`rounded border p-3 ${
                mapState.lookupResult
                  ? "border-green-500/30 bg-green-500/10 text-green-300"
                  : "border-[#FF0000]/40 bg-[#FF0000]/10 text-[#FF8080]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>map.get(key) Lookup Result:</span>
                <span className="font-bold">{mapState.lookupResult ? mapState.lookupResult : "null (LOST ENTRY!)"}</span>
              </div>
              <div className="mt-2 text-[10px] leading-relaxed text-[#CCCCCC]">{mapState.statusMessage}</div>
            </div>

            <div className="rounded border border-[#1F1F1F] bg-[#121212] p-3 text-[11px] text-[#CCCCCC]">
              <span className="font-bold text-[#FF8080]">Golden Rule:</span> Never use mutable fields in `hashCode()` or `equals()` for objects serving as HashMap keys!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

