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
      {/* Top Nav Bar — Fixed responsive height and clean mobile wrap */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 transition-opacity hover:opacity-90 max-w-[200px] sm:max-w-none"
        >
          <PrimeLogo size="md" variant="white" />
          <span className="text-[11px] font-mono tracking-widest text-neutral-400 border-l border-neutral-800 pl-2.5 uppercase">
            Status
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900/60 px-2.5 py-1 text-xs text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white disabled:opacity-50"
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
            className="inline-flex items-center gap-1 text-xs text-neutral-400 transition-colors hover:text-white"
          >
            <Icon icon={ArrowLeft01Icon} size={14} />
            <span className="hidden xs:inline">Back to PRIME</span>
          </Link>
        </div>
      </div>

      {/* Main Status Headline Banner */}
      <div
        className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 sm:p-7 ${statusConfig.accentBorder} ${statusConfig.glowBg} backdrop-blur-xl shadow-2xl`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusConfig.dotClass}`} />
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-white truncate">
                {statusConfig.label}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400">
              Automated 5-minute health probes &amp; live edge latency tracking.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-lg border border-neutral-800/80 bg-black/60 px-3 py-2 text-xs">
            <span className="text-neutral-500 uppercase tracking-wider text-[10px]">Verified:</span>
            <span className="font-mono text-neutral-200">{formattedCheckedTime}</span>
            {!isFresh && (
              <span className="text-[10px] text-amber-400 font-medium ml-1">
                (Delayed)
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
