"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  Globe02Icon,
  ArrowRight01Icon,
  CheckmarkBadge01Icon,
  RefreshIcon,
  Shield01Icon,
  CpuIcon,
} from "@hugeicons/core-free-icons";
import { simulatePacketJourney, type JourneyHop } from "@/domain/cn";

interface PacketJourneyStudioProps {
  onComplete?: () => void;
}

export function PacketJourneyStudio({ onComplete }: PacketJourneyStudioProps) {
  const [targetUrl, setTargetUrl] = useState("https://api.prime.dev");
  const [hops, setHops] = useState<JourneyHop[]>(() => simulatePacketJourney("https://api.prime.dev"));
  const [activeHopIndex, setActiveHopIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  const activeHop = hops[activeHopIndex];

  const handleSimulate = () => {
    const res = simulatePacketJourney(targetUrl || "https://api.prime.dev");
    setHops(res);
    setActiveHopIndex(0);
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
              <Icon icon={Globe02Icon} size={16} />
            </span>
            <h3 className="text-lg font-semibold text-white tracking-tight">
              Packet Journey Visualizer
            </h3>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            End-to-end traversal across client, DNS resolver, ARP gateway, NAT, BGP autonomous backbones, and server ingress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {completed && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
              <Icon icon={CheckmarkBadge01Icon} size={14} className="mr-1 inline" />
              Route Traversed
            </Badge>
          )}
          <Button
            size="sm"
            onClick={handleSimulate}
            className="bg-[#FF0000] text-white hover:bg-[#CC0000] font-medium"
          >
            Trace Journey
          </Button>
        </div>
      </div>

      {/* URL Input */}
      <div className="rounded-lg border border-[#1F1F1F] bg-black p-4">
        <label className="text-xs font-medium text-neutral-300">Destination Web Address</label>
        <div className="mt-2 flex gap-3">
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="flex-1 rounded-md border border-[#2A2A2A] bg-[#111111] px-3 py-1.5 font-mono text-xs text-white focus:border-[#FF0000] focus:outline-none"
            placeholder="https://example.com"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => setTargetUrl("https://api.prime.dev")}
            className="border-white/10 text-xs hover:bg-white/5"
          >
            Default
          </Button>
        </div>
      </div>

      {/* Step Indicators Rail */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {hops.map((hop, idx) => {
          const isActive = activeHopIndex === idx;
          const isPassed = activeHopIndex > idx;

          return (
            <button
              key={hop.id}
              onClick={() => setActiveHopIndex(idx)}
              className={`rounded-lg border p-2.5 text-left transition-all ${
                isActive
                  ? "border-[#FF0000] bg-[#FF0000]/10 text-white shadow-sm"
                  : isPassed
                  ? "border-emerald-500/30 bg-emerald-500/5 text-neutral-300"
                  : "border-[#1F1F1F] bg-black/50 text-neutral-400 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold">Hop {idx + 1}</span>
                {isPassed && <Icon icon={CheckmarkBadge01Icon} size={12} className="text-emerald-400" />}
              </div>
              <div className="mt-1 truncate text-xs font-medium text-white">{hop.component}</div>
              <div className="mt-0.5 truncate font-mono text-[10px] text-neutral-400">{hop.protocol}</div>
            </button>
          );
        })}
      </div>

      {/* Active Hop Detailed Card */}
      {activeHop && (
        <div className="rounded-lg border border-[#1F1F1F] bg-black p-5 space-y-4">
          <div className="flex flex-col justify-between gap-2 border-b border-[#1A1A1A] pb-3 sm:flex-row sm:items-center">
            <div>
              <span className="font-mono text-xs text-[#FF4D4D] font-bold">{activeHop.stageName}</span>
              <h4 className="text-base font-semibold text-white">{activeHop.component}</h4>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-white/10 bg-white/5 font-mono text-xs">
                {activeHop.protocol}
              </Badge>
              <Badge className="bg-[#FF0000]/10 text-[#FF4D4D] border border-[#FF0000]/20 font-mono text-xs">
                {activeHop.layer}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded border border-white/5 bg-[#0C0C0C] p-3">
              <div className="text-[10px] font-mono uppercase text-neutral-400">Source Address / Endpoint</div>
              <div className="mt-1 font-mono text-xs text-white">{activeHop.sourceAddress}</div>
            </div>
            <div className="rounded border border-white/5 bg-[#0C0C0C] p-3">
              <div className="text-[10px] font-mono uppercase text-neutral-400">Next Destination / Endpoint</div>
              <div className="mt-1 font-mono text-xs text-emerald-400">{activeHop.destAddress}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-neutral-300">Operational Mechanism</div>
            <p className="text-xs leading-relaxed text-neutral-300 bg-[#111111] p-3 rounded border border-white/10">
              {activeHop.description}
            </p>
          </div>

          <div className="rounded border border-white/10 bg-[#0E0E0E] p-3 font-mono text-xs text-neutral-200">
            <span className="text-[#FF4D4D] font-bold">Network Action:</span> {activeHop.action}
          </div>

          <div className="flex justify-between pt-2">
            <Button
              size="sm"
              variant="outline"
              disabled={activeHopIndex === 0}
              onClick={() => setActiveHopIndex((prev) => Math.max(0, prev - 1))}
              className="border-white/10 text-xs hover:bg-white/5"
            >
              Previous Hop
            </Button>
            <Button
              size="sm"
              disabled={activeHopIndex === hops.length - 1}
              onClick={() => setActiveHopIndex((prev) => Math.min(hops.length - 1, prev + 1))}
              className="bg-[#FF0000] text-white hover:bg-[#CC0000] text-xs font-medium"
            >
              Next Hop
              <Icon icon={ArrowRight01Icon} size={14} className="ml-1 inline" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

