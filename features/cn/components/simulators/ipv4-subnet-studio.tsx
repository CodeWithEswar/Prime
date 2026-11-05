"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  CalculatorIcon,
  CheckmarkBadge01Icon,
  InformationCircleIcon,
  CpuIcon,
} from "@hugeicons/core-free-icons";
import { calculateIPv4Subnet, type SubnetCalculationResult } from "@/domain/cn";

interface IPv4SubnetStudioProps {
  onComplete?: () => void;
}

export function IPv4SubnetStudio({ onComplete }: IPv4SubnetStudioProps) {
  const [ip, setIp] = useState("192.168.1.50");
  const [prefix, setPrefix] = useState<number>(24);
  const [error, setError] = useState<string | null>(null);

  let result: SubnetCalculationResult | null = null;
  try {
    result = calculateIPv4Subnet(ip, prefix);
  } catch (err) {
    // Keep error state
  }

  const handleIpChange = (newIp: string) => {
    setIp(newIp);
    setError(null);
  };

  const handlePrefixChange = (newPrefix: number) => {
    setPrefix(newPrefix);
    if (onComplete) onComplete();
  };

  const quickPresets = [
    { label: "Home LAN (/24)", ip: "192.168.1.1", prefix: 24 },
    { label: "Campus Core (/16)", ip: "172.16.0.1", prefix: 16 },
    { label: "Enterprise (/8)", ip: "10.0.0.1", prefix: 8 },
    { label: "P2P Link (/31 RFC 3021)", ip: "10.254.0.1", prefix: 31 },
    { label: "Host Route (/32)", ip: "198.51.100.1", prefix: 32 },
    { label: "Small Office (/27)", ip: "192.168.10.15", prefix: 27 },
  ];

  return (
    <div className="space-y-6 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 text-white">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-[#1A1A1A] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF0000]/10 text-[#FF4D4D] border border-[#FF0000]/20">
              <Icon icon={CalculatorIcon} size={16} />
            </span>
            <h3 className="text-lg font-semibold text-white tracking-tight">
              IPv4 & CIDR Subnet Calculator
            </h3>
          </div>
          <p className="mt-1 text-xs text-neutral-400">
            Bitwise 32-bit subnet arithmetic, host capacities, RFC 1918 private detection, and RFC 3021 point-to-point links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {result && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
              <Icon icon={CheckmarkBadge01Icon} size={14} className="mr-1 inline" />
              Calculated
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
          Quick Network Archetypes
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPresets.map((p) => (
            <Button
              key={p.label}
              size="sm"
              variant="outline"
              onClick={() => {
                setIp(p.ip);
                setPrefix(p.prefix);
                if (onComplete) onComplete();
              }}
              className="border-white/10 text-xs hover:border-white/20 hover:bg-white/5"
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 rounded-lg border border-[#1F1F1F] bg-black p-4">
        <div className="md:col-span-7">
          <label className="text-xs font-medium text-neutral-300">IPv4 Host Address</label>
          <input
            type="text"
            value={ip}
            onChange={(e) => handleIpChange(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-[#2A2A2A] bg-[#111111] px-3 py-2 font-mono text-sm text-white focus:border-[#FF0000] focus:outline-none"
            placeholder="e.g. 192.168.1.1"
          />
        </div>

        <div className="md:col-span-5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-neutral-300">CIDR Prefix (/{prefix})</label>
            <span className="font-mono text-xs text-[#FF4D4D] font-bold">/{prefix}</span>
          </div>
          <input
            type="range"
            min={0}
            max={32}
            value={prefix}
            onChange={(e) => handlePrefixChange(parseInt(e.target.value, 10))}
            className="mt-3 w-full accent-[#FF0000]"
          />
        </div>
      </div>

      {/* Output Results */}
      {result ? (
        <div className="space-y-4">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-black p-3.5">
              <div className="text-[10px] font-mono uppercase text-neutral-400">Network Address</div>
              <div className="mt-1 font-mono text-base font-bold text-white">{result.networkAddress}</div>
              <div className="mt-0.5 text-[11px] text-neutral-500">Subnet identifier</div>
            </div>

            <div className="rounded-lg border border-white/10 bg-black p-3.5">
              <div className="text-[10px] font-mono uppercase text-neutral-400">Broadcast Address</div>
              <div className="mt-1 font-mono text-base font-bold text-white">{result.broadcastAddress}</div>
              <div className="mt-0.5 text-[11px] text-neutral-500">All-host destination</div>
            </div>

            <div className="rounded-lg border border-white/10 bg-black p-3.5">
              <div className="text-[10px] font-mono uppercase text-neutral-400">Usable Host Capacity</div>
              <div className="mt-1 font-mono text-base font-bold text-emerald-400">
                {result.usableHosts.toLocaleString()} hosts
              </div>
              <div className="mt-0.5 text-[11px] text-neutral-500">
                Total: {result.totalAddresses.toLocaleString()} addresses
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-black p-3.5">
              <div className="text-[10px] font-mono uppercase text-neutral-400">Classification</div>
              <div className="mt-1 flex items-center gap-1.5">
                <Badge className={result.isPrivate ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}>
                  {result.isPrivate ? "RFC 1918 Private" : "Public Routable"}
                </Badge>
                <Badge variant="outline" className="border-white/10 text-neutral-300 font-mono">
                  Class {result.ipClass}
                </Badge>
              </div>
              <div className="mt-1 text-[11px] text-neutral-500">
                {result.isSpecialRoute ? (prefix === 31 ? "RFC 3021 Point-to-Point" : "Single Host Route") : "Standard Subnet"}
              </div>
            </div>
          </div>

          {/* Detailed Range & Mask Specification */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-[#1F1F1F] bg-black p-4 space-y-3">
              <div className="text-xs font-semibold text-white">Usable Host IP Range</div>
              <div className="rounded border border-white/5 bg-[#111111] p-3 font-mono text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">First Usable Host:</span>
                  <span className="text-white font-bold">{result.firstUsableIp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Last Usable Host:</span>
                  <span className="text-white font-bold">{result.lastUsableIp}</span>
                </div>
              </div>
              {result.isSpecialRoute && prefix === 31 && (
                <div className="rounded border border-amber-500/20 bg-amber-500/5 p-2 text-xs text-amber-300">
                  <span className="font-bold">RFC 3021 Note:</span> In /31 subnets, both addresses are usable host endpoints with zero addresses wasted on broadcast.
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[#1F1F1F] bg-black p-4 space-y-3">
              <div className="text-xs font-semibold text-white">Mask Specifications</div>
              <div className="rounded border border-white/5 bg-[#111111] p-3 font-mono text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Subnet Mask:</span>
                  <span className="text-white font-bold">{result.subnetMask}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Wildcard Mask:</span>
                  <span className="text-[#FF4D4D] font-bold">{result.wildcardMask}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Binary Representation */}
          <div className="rounded-lg border border-[#1F1F1F] bg-black p-4 space-y-2">
            <div className="text-xs font-semibold text-neutral-300">32-Bit Binary Representation</div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded bg-[#111111] px-3 py-1.5 border border-white/5">
                <span className="text-neutral-400">IP Address:</span>
                <span className="text-white tracking-wider">{result.binaryIpAddress}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded bg-[#111111] px-3 py-1.5 border border-white/5">
                <span className="text-neutral-400">Subnet Mask:</span>
                <span className="text-emerald-400 tracking-wider">{result.binarySubnetMask}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400">
          Invalid IPv4 format. Please enter four octets between 0 and 255 separated by dots.
        </div>
      )}
    </div>
  );
}

