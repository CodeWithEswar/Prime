"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  Layers01Icon,
  ArrowRight01Icon,
  CheckmarkBadge01Icon,
  RefreshIcon,
  InformationCircleIcon,
  Shield01Icon,
  CpuIcon,
} from "@hugeicons/core-free-icons";
import {
  simulateEncapsulation,
  OSI_LAYERS_DATA,
  type OSILayerNumber,
  type EncapsulationStep,
} from "@/domain/cn";

interface OSITCPIPStudioProps {
  onComplete?: () => void;
}

export function OSITCPIPStudio({ onComplete }: OSITCPIPStudioProps) {
  const [selectedLayer, setSelectedLayer] = useState<OSILayerNumber>(7);
  const [payloadText, setPayloadText] = useState("GET /api/v1/metrics HTTP/1.1");
  const [steps, setSteps] = useState<EncapsulationStep[]>(() =>
    simulateEncapsulation("GET /api/v1/metrics HTTP/1.1")
  );
  const [completed, setCompleted] = useState(false);

  const layerInfo = OSI_LAYERS_DATA[selectedLayer];

  const handleSimulate = () => {
    const res = simulateEncapsulation(payloadText || "Hello Networks");
    setSteps(res);
    setCompleted(true);
    if (onComplete) onComplete();
  };

  const layerOrder: OSILayerNumber[] = [7, 6, 5, 4, 3, 2, 1];

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
              OSI & TCP/IP Protocol Stack Visualizer
            </h3>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Explore 7-layer encapsulation and decapsulation, protocol mapping, and PDU transformations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {completed && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
              <Icon icon={CheckmarkBadge01Icon} size={14} className="mr-1 inline" />
              Encapsulation Verified
            </Badge>
          )}
          <Button
            size="sm"
            onClick={handleSimulate}
            className="bg-[#FF0000] text-white hover:bg-[#CC0000] font-medium"
          >
            Run Encapsulation
          </Button>
        </div>
      </div>

      {/* Payload Input */}
      <div className="rounded-lg border border-[#1F1F1F] bg-black p-4">
        <label className="text-xs font-medium text-neutral-300">Application Payload Message</label>
        <div className="mt-2 flex gap-3">
          <input
            type="text"
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            className="flex-1 rounded-md border border-[#2A2A2A] bg-[#111111] px-3 py-1.5 font-mono text-xs text-white focus:border-[#FF0000] focus:outline-none"
            placeholder="Enter HTTP payload or application data..."
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPayloadText("GET /api/v1/metrics HTTP/1.1")}
            className="border-white/10 text-xs hover:bg-white/5"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Main Grid: Layer Selector + Detailed Inspection */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Layer Stack (7 columns) */}
        <div className="space-y-2 lg:col-span-7">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
            Protocol Stack (Encapsulation Flow: Top → Down)
          </div>
          {layerOrder.map((layerNum) => {
            const data = OSI_LAYERS_DATA[layerNum];
            const isSelected = selectedLayer === layerNum;
            const step = steps.find((s) => s.layer === layerNum);

            return (
              <div
                key={layerNum}
                onClick={() => setSelectedLayer(layerNum)}
                className={`group cursor-pointer rounded-lg border p-3 transition-all ${
                  isSelected
                    ? "border-[#FF0000] bg-[#FF0000]/5 shadow-sm"
                    : "border-[#1F1F1F] bg-black/60 hover:border-white/20 hover:bg-black"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded text-xs font-mono font-bold ${
                        isSelected
                          ? "bg-[#FF0000] text-white"
                          : "bg-white/10 text-neutral-300 group-hover:bg-white/20"
                      }`}
                    >
                      L{layerNum}
                    </span>
                    <div>
                      <div className="text-xs font-medium text-white">{data.name}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        PDU: <span className="text-neutral-200">{data.pdu}</span> · TCP/IP:{" "}
                        <span className="text-neutral-300">{data.tcpipEquivalent}</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-white/10 bg-white/5 text-[10px] font-mono text-neutral-300"
                  >
                    {data.protocols.slice(0, 3).join(", ")}
                  </Badge>
                </div>

                {step && (
                  <div className="mt-2.5 rounded border border-white/5 bg-[#0C0C0C] p-2 font-mono text-[11px] text-neutral-300">
                    <span className="text-[#FF4D4D] font-semibold">Header Added:</span>{" "}
                    {step.headerAdded}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detailed Layer Inspection (5 columns) */}
        <div className="space-y-4 rounded-lg border border-[#1F1F1F] bg-black p-5 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#FF4D4D]">Layer {selectedLayer}</span>
              <h4 className="text-sm font-semibold text-white">{layerInfo.name}</h4>
            </div>
            <Badge className="bg-[#FF0000]/10 text-[#FF4D4D] border border-[#FF0000]/20 font-mono text-xs">
              {layerInfo.pdu}
            </Badge>
          </div>

          <div>
            <div className="text-xs font-medium text-neutral-400 mb-1.5">Core Responsibilities</div>
            <ul className="space-y-1 text-xs text-neutral-300">
              {layerInfo.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#FF0000]">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-medium text-neutral-400 mb-1.5">Standard Protocols</div>
            <div className="flex flex-wrap gap-1.5">
              {layerInfo.protocols.map((proto) => (
                <span
                  key={proto}
                  className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-neutral-200"
                >
                  {proto}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-neutral-400 mb-1.5">Hardware & Operating Devices</div>
            <div className="flex flex-wrap gap-1.5">
              {layerInfo.devices.map((dev) => (
                <span
                  key={dev}
                  className="rounded border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 font-mono text-[11px] text-emerald-400"
                >
                  {dev}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded border border-white/10 bg-[#111111] p-3 text-xs text-neutral-300">
            <div className="font-semibold text-white mb-1">TCP/IP Mapping</div>
            Maps to the <span className="text-[#FF4D4D] font-mono">{layerInfo.tcpipEquivalent}</span> of the 4-layer DoD Internet Architecture.
          </div>
        </div>
      </div>
    </div>
  );
}

