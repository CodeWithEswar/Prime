"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  Globe02Icon,
  CheckmarkBadge01Icon,
  ArrowRight01Icon,
  CpuIcon,
} from "@hugeicons/core-free-icons";
import { simulateHTTPLifecycle, type HTTPLifecycleStage } from "@/domain/cn";

interface HTTPLifecycleStudioProps {
  onComplete?: () => void;
}

export function HTTPLifecycleStudio({ onComplete }: HTTPLifecycleStudioProps) {
  const [httpVersion, setHttpVersion] = useState<"HTTP/1.1" | "HTTP/2" | "HTTP/3">("HTTP/3");
  const [url, setUrl] = useState("https://api.prime.dev/v1/metrics");
  const [completed, setCompleted] = useState(false);

  const stages: HTTPLifecycleStage[] = simulateHTTPLifecycle(url, httpVersion);
  const totalDuration = stages.reduce((acc, s) => acc + s.durationMs, 0);

  const handleVersionChange = (v: "HTTP/1.1" | "HTTP/2" | "HTTP/3") => {
    setHttpVersion(v);
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
              HTTP Request Lifecycle & Protocol Explorer
            </h3>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Compare HTTP/1.1 pipelining head-of-line blocking vs HTTP/2 binary multiplexing vs HTTP/3 QUIC (over UDP).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs">
            Total Time: {totalDuration} ms
          </Badge>
          <div className="flex rounded-lg border border-[#222222] bg-black p-0.5">
            <button
              onClick={() => handleVersionChange("HTTP/1.1")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                httpVersion === "HTTP/1.1"
                  ? "bg-[#FF0000] text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              HTTP/1.1
            </button>
            <button
              onClick={() => handleVersionChange("HTTP/2")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                httpVersion === "HTTP/2"
                  ? "bg-[#FF0000] text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              HTTP/2
            </button>
            <button
              onClick={() => handleVersionChange("HTTP/3")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                httpVersion === "HTTP/3"
                  ? "bg-[#FF0000] text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              HTTP/3 (QUIC)
            </button>
          </div>
        </div>
      </div>

      {/* Protocol Architecture Comparison Callout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-lg border border-[#1F1F1F] bg-black p-4">
        <div className="rounded border border-white/5 bg-[#111111] p-3">
          <div className="text-[10px] font-mono uppercase text-neutral-400">Transport & Security</div>
          <div className="mt-1 font-mono text-xs font-bold text-white">
            {httpVersion === "HTTP/3" ? "QUIC (UDP) + Integrated TLS 1.3" : "TCP (Port 443) + TLS Record Layer"}
          </div>
        </div>

        <div className="rounded border border-white/5 bg-[#111111] p-3">
          <div className="text-[10px] font-mono uppercase text-neutral-400">Multiplexing Mechanism</div>
          <div className="mt-1 font-mono text-xs font-bold text-emerald-400">
            {httpVersion === "HTTP/3"
              ? "Independent QUIC Streams (Zero HoL Blocking)"
              : httpVersion === "HTTP/2"
              ? "Single TCP Stream Multiplex (TCP HoL Risk)"
              : "Sequential / Domain Sharding Required"}
          </div>
        </div>

        <div className="rounded border border-white/5 bg-[#111111] p-3">
          <div className="text-[10px] font-mono uppercase text-neutral-400">Handshake Latency RTT</div>
          <div className="mt-1 font-mono text-xs font-bold text-[#FF4D4D]">
            {httpVersion === "HTTP/3" ? "1-RTT (or 0-RTT on resumption)" : "2-RTT (TCP SYN + TLS 1.3)"}
          </div>
        </div>
      </div>

      {/* Lifecycle Stage Breakdown */}
      <div className="space-y-3 rounded-lg border border-[#1F1F1F] bg-black p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
          End-to-End Execution Stages ({stages.length} stages)
        </div>

        {stages.map((st) => (
          <div
            key={st.stageNumber}
            className="rounded-lg border border-white/5 bg-[#111111] p-4 transition-all hover:border-white/15"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#FF4D4D]">
                  Stage {st.stageNumber}
                </span>
                <span className="text-xs font-semibold text-white">{st.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-white/10 bg-white/5 font-mono text-[10px] text-neutral-300"
                >
                  {st.protocol}
                </Badge>
                <span className="font-mono text-xs text-emerald-400 font-bold">
                  {st.durationMs} ms
                </span>
              </div>
            </div>

            <p className="mt-2 text-xs text-neutral-300 leading-relaxed">{st.summary}</p>

            <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-white/5">
              {Object.entries(st.details).map(([k, v]) => (
                <span
                  key={k}
                  className="rounded border border-white/10 bg-black/60 px-2 py-1 font-mono text-[11px] text-neutral-300"
                >
                  <span className="text-neutral-500">{k}:</span> {v}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

