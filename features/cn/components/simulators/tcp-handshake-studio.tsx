"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  ArrowRight01Icon,
  CheckmarkBadge01Icon,
  RefreshIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import {
  simulateTCPHandshake,
  simulateTCPTeardown,
  type TCPHandshakeStep,
} from "@/domain/cn";

interface TCPHandshakeStudioProps {
  onComplete?: () => void;
}

export function TCPHandshakeStudio({ onComplete }: TCPHandshakeStudioProps) {
  const [mode, setMode] = useState<"handshake" | "teardown">("handshake");
  const [clientISN, setClientISN] = useState<number>(1000);
  const [serverISN, setServerISN] = useState<number>(5000);
  const [completed, setCompleted] = useState(false);

  const steps =
    mode === "handshake"
      ? simulateTCPHandshake(clientISN, serverISN)
      : simulateTCPTeardown(clientISN + 500, serverISN + 1200);

  const handleSimulate = () => {
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
              <Icon icon={Shield01Icon} size={16} />
            </span>
            <h3 className="text-lg font-semibold text-white tracking-tight">
              TCP 3-Way Handshake & Connection Teardown
            </h3>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Interactive RFC 793 state machine diagram, ISN synchronization, cumulative ACKs, and TIME_WAIT (2MSL).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {completed && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
              <Icon icon={CheckmarkBadge01Icon} size={14} className="mr-1 inline" />
              Verified
            </Badge>
          )}
          <div className="flex rounded-lg border border-[#222222] bg-black p-0.5">
            <button
              onClick={() => {
                setMode("handshake");
                handleSimulate();
              }}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                mode === "handshake"
                  ? "bg-[#FF0000] text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              3-Way Handshake
            </button>
            <button
              onClick={() => {
                setMode("teardown");
                handleSimulate();
              }}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                mode === "teardown"
                  ? "bg-[#FF0000] text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              4-Way Teardown
            </button>
          </div>
        </div>
      </div>

      {/* ISN Input Controls (For Handshake) */}
      {mode === "handshake" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-lg border border-[#1F1F1F] bg-black p-4">
          <div>
            <label className="text-xs font-medium text-neutral-300">Client Initial Sequence Number (ISN)</label>
            <input
              type="number"
              value={clientISN}
              onChange={(e) => setClientISN(parseInt(e.target.value, 10) || 1000)}
              className="mt-1.5 w-full rounded-md border border-[#2A2A2A] bg-[#111111] px-3 py-1.5 font-mono text-xs text-white focus:border-[#FF0000] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-300">Server Initial Sequence Number (ISN)</label>
            <input
              type="number"
              value={serverISN}
              onChange={(e) => setServerISN(parseInt(e.target.value, 10) || 5000)}
              className="mt-1.5 w-full rounded-md border border-[#2A2A2A] bg-[#111111] px-3 py-1.5 font-mono text-xs text-white focus:border-[#FF0000] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Ladder Diagram View */}
      <div className="space-y-4 rounded-lg border border-[#1F1F1F] bg-black p-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-3 font-mono text-xs font-bold text-neutral-300">
          <div className="text-left w-36">CLIENT (Host)</div>
          <div className="text-center flex-1">TRANSMISSION CHANNEL</div>
          <div className="text-right w-36">SERVER (Daemon)</div>
        </div>

        {/* Steps */}
        <div className="space-y-6 pt-2">
          {steps.map((st) => {
            const isClientSender = st.sender === "client";
            const flagKeys = Object.keys(st.flags).filter((k) => (st.flags as any)[k]);

            return (
              <div key={st.step} className="space-y-2">
                <div className="flex items-center justify-between font-mono text-xs">
                  {/* Client State */}
                  <div className="w-36 text-left">
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-neutral-300 border border-white/10">
                      {st.clientState}
                    </span>
                  </div>

                  {/* Packet Traversing Arrow */}
                  <div className="flex-1 px-4">
                    <div
                      className={`relative flex items-center justify-center rounded-lg border py-2 px-3 shadow-sm ${
                        isClientSender
                          ? "border-[#FF0000]/30 bg-[#FF0000]/10 text-white"
                          : "border-blue-500/30 bg-blue-500/10 text-white"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                        <span className="font-bold text-[#FF4D4D]">Step {st.step}:</span>
                        <div className="flex gap-1">
                          {flagKeys.map((f) => (
                            <Badge
                              key={f}
                              className={
                                f === "SYN"
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                  : f === "FIN"
                                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              }
                            >
                              {f}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-neutral-300">
                          Seq=<span className="font-bold text-white">{st.seq}</span>
                        </span>
                        {st.ack > 0 && (
                          <span className="text-neutral-300">
                            Ack=<span className="font-bold text-emerald-400">{st.ack}</span>
                          </span>
                        )}
                      </div>

                      {/* Direction Arrow */}
                      <span className="absolute right-2 text-xs font-mono text-neutral-400">
                        {isClientSender ? "➔" : "⬅"}
                      </span>
                    </div>
                  </div>

                  {/* Server State */}
                  <div className="w-36 text-right">
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-neutral-300 border border-white/10">
                      {st.serverState}
                    </span>
                  </div>
                </div>

                <div className="mx-36 text-[11px] text-neutral-400 font-sans italic bg-[#111111] p-2 rounded border border-white/5">
                  {st.explanation}
                </div>
              </div>
            );
          })}
        </div>

        {/* Final State Banner */}
        <div className="mt-4 rounded border border-white/10 bg-[#111111] p-3 text-center text-xs">
          {mode === "handshake" ? (
            <span className="text-emerald-400 font-bold">
              ✓ Both endpoints in ESTABLISHED state. Full-duplex byte streams active.
            </span>
          ) : (
            <span className="text-amber-400 font-bold">
              ✓ Active closer in TIME_WAIT (2MSL: 60s) to absorb lingering delayed segments before final CLOSED state.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

