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
  Globe02Icon,
  CheckmarkBadge01Icon,
  RefreshIcon,
  ArrowRight01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import {
  simulateDNSResolution,
  type DNSRecordType,
  type DNSStep,
} from "@/domain/cn";

interface DNSExplorerStudioProps {
  onComplete?: () => void;
}

export function DNSExplorerStudio({ onComplete }: DNSExplorerStudioProps) {
  const [domain, setDomain] = useState("api.example.com");
  const [recordType, setRecordType] = useState<DNSRecordType>("A");
  const [isCached, setIsCached] = useState(false);
  const [completed, setCompleted] = useState(false);

  const steps = simulateDNSResolution(domain, recordType, isCached);

  const handleRun = () => {
    setCompleted(true);
    if (onComplete) onComplete();
  };

  const recordTypes: DNSRecordType[] = ["A", "AAAA", "CNAME", "MX", "TXT"];

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
              DNS Resolution Hierarchy & Cache Explorer
            </h3>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Iterative delegation from Root Nameservers to TLD and Authoritative DNS servers, or instant local cache hit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {completed && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
              <Icon icon={CheckmarkBadge01Icon} size={14} className="mr-1 inline" />
              Resolved
            </Badge>
          )}
          <Button
            size="sm"
            onClick={handleRun}
            className="bg-[#FF0000] text-white hover:bg-[#CC0000] font-medium"
          >
            Resolve Query
          </Button>
        </div>
      </div>

      {/* Query Controls */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 rounded-lg border border-[#1F1F1F] bg-black p-4">
        <div className="md:col-span-6">
          <label className="text-xs font-medium text-neutral-300">Target Hostname / Domain</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-[#2A2A2A] bg-[#111111] px-3 py-1.5 font-mono text-xs text-white focus:border-[#FF0000] focus:outline-none"
            placeholder="e.g. api.example.com"
          />
        </div>

        <div className="md:col-span-3">
          <label className="text-xs font-medium text-neutral-300">DNS Record Type</label>
          <div className="mt-1.5">
            <Select
              value={recordType}
              onValueChange={(val) => setRecordType(val as DNSRecordType)}
            >
              <SelectTrigger className="h-8 w-full border-[#2A2A2A] bg-[#111111] px-3 font-mono text-xs text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {recordTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t} Record
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="md:col-span-3 flex flex-col justify-end">
          <button
            type="button"
            onClick={() => setIsCached(!isCached)}
            className={`w-full rounded-md border px-3 py-2 text-xs font-medium transition-all ${
              isCached
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-white/10 bg-[#111111] text-neutral-400 hover:border-white/20 hover:text-white"
            }`}
          >
            {isCached ? "✓ Local Cache Hit (Simulated)" : "Cache Miss (Iterative Walk)"}
          </button>
        </div>
      </div>

      {/* Steps Hierarchy Walk */}
      <div className="space-y-3 rounded-lg border border-[#1F1F1F] bg-black p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
          Resolution Trace Steps ({steps.length} {steps.length === 1 ? "step" : "hops"})
        </div>

        {steps.map((st) => (
          <div
            key={st.step}
            className={`rounded-lg border p-4 transition-all ${
              st.isCacheHit
                ? "border-emerald-500/30 bg-emerald-500/5"
                : st.serverType === "AUTHORITATIVE"
                ? "border-[#FF0000]/30 bg-[#FF0000]/5"
                : "border-white/5 bg-[#111111]"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#FF4D4D]">Step {st.step}</span>
                <span className="text-xs font-semibold text-white">{st.serverName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-white/10 bg-white/5 font-mono text-[10px] text-neutral-300"
                >
                  {st.serverType}
                </Badge>
                {st.ttlRemainingSeconds > 0 && (
                  <span className="font-mono text-[10px] text-neutral-400">
                    TTL: {st.ttlRemainingSeconds}s
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2.5 space-y-1.5 font-mono text-xs">
              <div className="text-neutral-400">
                <span className="text-neutral-500">Query:</span> {st.query}
              </div>
              <div className="text-white">
                <span className="text-emerald-400 font-bold">Response:</span> {st.response}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

