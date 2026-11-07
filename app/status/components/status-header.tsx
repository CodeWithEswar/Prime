"use client";

import Link from "next/link";
import { PrimeLogo } from "@/components/branding";
import { Icon } from "@/components/ui/icon";
import {
  ArrowLeft01Icon,
  RefreshIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import type { PublicStatusSnapshot, ServiceState } from "@/workers/prime-monitor/src/types/monitoring";

interface StatusHeaderProps {
  snapshot: PublicStatusSnapshot | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function StatusHeader({ snapshot, isLoading, onRefresh }: StatusHeaderProps) {
  const status: ServiceState = snapshot?.status || "unknown";
  const isFresh = snapshot?.coverage?.isFresh ?? false;

  const statusConfig = {
    operational: {
      label: "All Systems Operational",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      dotClass: "bg-emerald-500 animate-pulse",
      icon: CheckmarkCircle02Icon,
      accentBorder: "border-emerald-500/30",
      glowBg: "from-emerald-950/20 via-neutral-950 to-neutral-950",
    },
    degraded: {
      label: "Degraded Performance Detected",
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      dotClass: "bg-amber-500 animate-pulse",
      icon: AlertCircleIcon,
      accentBorder: "border-amber-500/30",
      glowBg: "from-amber-950/20 via-neutral-950 to-neutral-950",
    },
    partial_outage: {
      label: "Partial Service Disruption",
      badgeClass: "bg-red-500/10 text-red-400 border-red-500/20",
      dotClass: "bg-red-500 animate-pulse",
      icon: AlertCircleIcon,
      accentBorder: "border-red-500/30",
      glowBg: "from-red-950/25 via-neutral-950 to-neutral-950",
    },
    major_outage: {
      label: "Major Infrastructure Outage",
      badgeClass: "bg-red-500/10 text-red-400 border-red-500/20",
      dotClass: "bg-red-500 animate-pulse",
      icon: AlertCircleIcon,
      accentBorder: "border-red-500/40",
      glowBg: "from-red-950/30 via-neutral-950 to-neutral-950",
    },
    maintenance: {
      label: "Under Scheduled Maintenance",
      badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      dotClass: "bg-sky-500",
      icon: Clock01Icon,
      accentBorder: "border-sky-500/30",
      glowBg: "from-sky-950/20 via-neutral-950 to-neutral-950",
    },
    unknown: {
      label: "Monitoring Data Delayed",
      badgeClass: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
      dotClass: "bg-neutral-500",
      icon: Clock01Icon,
      accentBorder: "border-neutral-800",
      glowBg: "from-neutral-900/40 via-neutral-950 to-neutral-950",
    },
  }[status];

  const formattedCheckedTime = snapshot?.lastCheckedAt
    ? new Date(snapshot.lastCheckedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "Unavailable";

  return (
    <header className="w-full space-y-6 pt-2 sm:pt-4">
      {/* Top Nav Bar — Precision architectural header with developer metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 transition-opacity hover:opacity-90 max-w-[200px] sm:max-w-none"
          >
            <PrimeLogo size="md" variant="white" />
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded border border-neutral-800 bg-neutral-900/60 px-2 py-0.5 text-[10px] font-mono tracking-widest text-neutral-300 uppercase">
            Status &amp; Telemetry
          </span>
          <div className="hidden md:inline-flex items-center gap-1.5 rounded border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span>EDGE TELEMETRY LIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded border border-neutral-800 bg-neutral-900/80 px-2.5 py-1 text-xs font-mono text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white disabled:opacity-50"
            title="Refresh status snapshot"
          >
            <Icon
              icon={RefreshIcon}
              size={13}
              className={isLoading ? "animate-spin" : ""}
            />
            <span>Refresh</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded border border-neutral-800/80 bg-neutral-900/40 px-2.5 py-1 text-xs text-neutral-400 transition-colors hover:border-neutral-700 hover:text-white"
          >
            <Icon icon={ArrowLeft01Icon} size={14} />
            <span className="hidden xs:inline">Back to PRIME</span>
          </Link>
        </div>
      </div>

      {/* Main Status Headline Banner — Architectural Obsidian Container */}
      <div
        className={`relative overflow-hidden rounded-lg border bg-gradient-to-br p-5 sm:p-6 ${statusConfig.accentBorder} ${statusConfig.glowBg} backdrop-blur-xl shadow-2xl`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3 shrink-0 items-center justify-center">
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${statusConfig.dotClass.replace("animate-pulse", "")}`} />
                <span className={`relative inline-flex h-2 w-2 rounded-full ${statusConfig.dotClass.replace("animate-pulse", "")}`} />
              </span>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white truncate">
                {statusConfig.label}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 font-sans">
              Automated 5-minute health probes &amp; live edge latency tracking.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2.5 rounded border border-neutral-800/90 bg-black/70 px-3 py-2 text-xs font-mono shadow-inner">
            <span className="text-neutral-500 uppercase tracking-wider text-[10px] font-semibold">Verified:</span>
            <span className="text-neutral-200 font-bold">{formattedCheckedTime}</span>
            {!isFresh && (
              <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1 py-0.2 text-[9px] text-amber-400 font-bold uppercase ml-1">
                Delayed
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
