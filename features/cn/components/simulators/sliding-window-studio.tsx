"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  Layers01Icon,
  CheckmarkBadge01Icon,
  Alert02Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import {
  simulateSlidingWindow,
  type ARQProtocolType,
  type ARQSimulationResult,
} from "@/domain/cn";

interface SlidingWindowStudioProps {
  onComplete?: () => void;
}

export function SlidingWindowStudio({ onComplete }: SlidingWindowStudioProps) {
  const [protocol, setProtocol] = useState<ARQProtocolType>("GO_BACK_N");
  const [totalPackets, setTotalPackets] = useState<number>(6);
  const [windowSize, setWindowSize] = useState<number>(4);
  const [lostPacketSeq, setLostPacketSeq] = useState<number>(2);

  const result: ARQSimulationResult = simulateSlidingWindow(
    protocol,
    totalPackets,
    protocol === "STOP_AND_WAIT" ? 1 : windowSize,
    lostPacketSeq
  );

  const handleProtocolChange = (p: ARQProtocolType) => {
    setProtocol(p);
    if (onComplete) onComplete();
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
              ARQ / Sliding Window Protocols Laboratory
            </h3>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Compare Stop-and-Wait, Go-Back-N, and Selective Repeat under network packet drops and retransmission timeouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-[#FF0000]/10 text-[#FF4D4D] border border-[#FF0000]/20 font-mono text-xs">
            Efficiency: {result.efficiencyPercentage}%
          </Badge>
          <div className="flex rounded-lg border border-[#222222] bg-black p-0.5">
            <button
              onClick={() => handleProtocolChange("STOP_AND_WAIT")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                protocol === "STOP_AND_WAIT"
                  ? "bg-[#FF0000] text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Stop & Wait
            </button>
            <button
              onClick={() => handleProtocolChange("GO_BACK_N")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                protocol === "GO_BACK_N"
                  ? "bg-[#FF0000] text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Go-Back-N
            </button>
            <button
              onClick={() => handleProtocolChange("SELECTIVE_REPEAT")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                protocol === "SELECTIVE_REPEAT"
                  ? "bg-[#FF0000] text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Selective Repeat
            </button>
          </div>
        </div>
      </div>

      {/* Control Sliders */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-lg border border-[#1F1F1F] bg-black p-4">
        <div>
          <div className="flex justify-between">
            <label className="text-xs font-medium text-neutral-300">Total Packets</label>
            <span className="font-mono text-xs text-[#FF4D4D] font-bold">{totalPackets}</span>
          </div>
          <input
            type="range"
            min={3}
            max={10}
            value={totalPackets}
            onChange={(e) => setTotalPackets(parseInt(e.target.value, 10))}
            className="mt-3 w-full accent-[#FF0000]"
          />
        </div>

        <div>
          <div className="flex justify-between">
            <label className="text-xs font-medium text-neutral-300">
              Window Size (N) {protocol === "STOP_AND_WAIT" && "(Locked at 1)"}
            </label>
            <span className="font-mono text-xs text-emerald-400 font-bold">
              {protocol === "STOP_AND_WAIT" ? 1 : windowSize}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={6}
            disabled={protocol === "STOP_AND_WAIT"}
            value={protocol === "STOP_AND_WAIT" ? 1 : windowSize}
            onChange={(e) => setWindowSize(parseInt(e.target.value, 10))}
            className="mt-3 w-full accent-[#FF0000] disabled:opacity-40"
          />
        </div>

        <div>
          <div className="flex justify-between">
            <label className="text-xs font-medium text-neutral-300">Simulate Lost Packet Seq</label>
            <span className="font-mono text-xs text-amber-400 font-bold">Packet #{lostPacketSeq}</span>
          </div>
          <input
            type="range"
            min={0}
            max={totalPackets - 1}
            value={lostPacketSeq}
            onChange={(e) => setLostPacketSeq(parseInt(e.target.value, 10))}
            className="mt-3 w-full accent-amber-500"
          />
        </div>
      </div>

      {/* Theoretical Comparison Callout */}
      <div className="rounded-lg border border-white/10 bg-[#111111] p-4 text-xs text-neutral-300">
        <span className="font-bold text-white uppercase tracking-wider text-[11px] block mb-1">
          Protocol Behavior Comparison
        </span>
        {protocol === "STOP_AND_WAIT" && (
          <p>
            Stop-and-Wait has a window of size 1. The sender must wait for an explicit ACK after transmitting each frame before advancing, resulting in high propagation latency penalties on high-bandwidth-delay products.
          </p>
        )}
        {protocol === "GO_BACK_N" && (
          <p>
            Go-Back-N uses cumulative ACKs. If packet #{lostPacketSeq} is dropped, the receiver discards all subsequent out-of-order packets. When the sender's timer expires for #{lostPacketSeq}, the sender must <span className="text-[#FF4D4D] font-bold">go back and retransmit all in-flight frames</span>.
          </p>
        )}
        {protocol === "SELECTIVE_REPEAT" && (
          <p>
            Selective Repeat maintains independent ACKs and receiver buffering. The receiver accepts out-of-order frames within its window. On timeout, the sender <span className="text-emerald-400 font-bold">retransmits ONLY the lost packet</span>, preserving already-received packets.
          </p>
        )}
      </div>

      {/* Timeline Event Trace */}
      <div className="space-y-2 rounded-lg border border-[#1F1F1F] bg-black p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          Packet Transmission Timeline & Sliding Window Bounds
        </div>

        <div className="space-y-2">
          {result.trace.map((evt) => {
            const isLoss = evt.type === "LOST_PACKET";
            const isTimeout = evt.type === "TIMEOUT_RETRANSMIT";
            const isAck = evt.type === "ACK";

            return (
              <div
                key={evt.step}
                className={`flex flex-col sm:flex-row sm:items-center justify-between rounded-md border p-2.5 text-xs font-mono transition-all ${
                  isLoss
                    ? "border-red-500/40 bg-red-500/10 text-red-300"
                    : isTimeout
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                    : isAck
                    ? "border-emerald-500/30 bg-emerald-500/5 text-neutral-200"
                    : "border-white/5 bg-[#111111] text-neutral-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-neutral-500 font-bold">#{evt.step}</span>
                  <Badge
                    className={
                      isLoss
                        ? "bg-red-500/20 text-red-300 border-red-500/30 text-[10px]"
                        : isTimeout
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]"
                        : isAck
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]"
                        : "bg-white/10 text-white text-[10px]"
                    }
                  >
                    {evt.type}
                  </Badge>
                  <span className="font-sans text-white text-xs">{evt.description}</span>
                </div>

                <div className="mt-1 sm:mt-0 text-[11px] text-neutral-400">
                  Sender Window: [{evt.senderWindow[0]}..{evt.senderWindow[1]}]
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

