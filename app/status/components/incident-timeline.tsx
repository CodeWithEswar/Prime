"use client";

import { useState } from "react";
import type { Incident } from "@/workers/prime-monitor/src/types/monitoring";
import { Icon } from "@/components/ui/icon";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

interface IncidentTimelineProps {
  activeIncidents: Incident[];
  pastIncidents: Incident[];
}

export function IncidentTimeline({
  activeIncidents,
  pastIncidents,
}: IncidentTimelineProps) {
  const [expandedIncidentIds, setExpandedIncidentIds] = useState<Set<string>>(
    new Set()
  );

  const toggleExpand = (id: string) => {
    setExpandedIncidentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getSeverityBadge = (sev: Incident["severity"]) => {
    switch (sev) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/40";
      case "major":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Incidents Section */}
      {activeIncidents && activeIncidents.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Active Incident Detected
          </div>

          {activeIncidents.map((incident) => (
            <div
              key={incident.id}
              className="rounded-lg border border-red-500/30 bg-red-950/20 p-5 backdrop-blur-sm"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider border ${getSeverityBadge(
                      incident.severity
                    )}`}
                  >
                    {incident.severity}
                  </span>
                  <h4 className="text-base font-medium text-white">{incident.title}</h4>
                </div>
                <div className="font-mono text-xs text-neutral-400">
                  Started: {new Date(incident.startedAt).toLocaleString()}
                </div>
              </div>

              {/* Updates stream */}
              <div className="mt-4 space-y-3 border-t border-red-500/20 pt-3">
                {incident.updates.map((update) => (
                  <div key={update.id} className="text-xs">
                    <div className="flex items-center gap-2 text-neutral-400">
                      <span className="font-mono uppercase text-red-300">
                        {update.status}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-[11px]">
                        {new Date(update.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1 text-neutral-200">{update.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Incident History Section */}
      <div className="rounded-lg border border-neutral-800/80 bg-neutral-950/70 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-neutral-800/60 pb-4">
          <div>
            <h3 className="text-base font-medium text-white">Incident History</h3>
            <p className="text-xs text-neutral-400">
              Verified records of outages, performance degradations, and recoveries
            </p>
          </div>
          <span className="font-mono text-xs text-neutral-500">Past 90 Days</span>
        </div>

        <div className="mt-6">
          {pastIncidents && pastIncidents.length > 0 ? (
            <div className="space-y-4">
              {pastIncidents.map((incident) => {
                const isExpanded = expandedIncidentIds.has(incident.id);
                return (
                  <div
                    key={incident.id}
                    className="rounded border border-neutral-800/80 bg-neutral-900/40 p-4 transition-colors hover:border-neutral-700/80"
                  >
                    <div
                      className="flex cursor-pointer items-center justify-between"
                      onClick={() => toggleExpand(incident.id)}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          icon={CheckmarkCircle02Icon}
                          size={16}
                          className="text-emerald-400"
                        />
                        <span className="text-sm font-medium text-white">
                          {incident.title}
                        </span>
                        <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 uppercase">
                          Resolved
                        </span>
                      </div>
                      <div className="font-mono text-xs text-neutral-400">
                        {incident.resolvedAt
                          ? new Date(incident.resolvedAt).toLocaleDateString()
                          : new Date(incident.startedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 space-y-2 border-t border-neutral-800/60 pt-3 text-xs text-neutral-300">
                        {incident.updates.map((update) => (
                          <div key={update.id} className="space-y-0.5">
                            <span className="font-mono text-[11px] text-neutral-400">
                              {new Date(update.createdAt).toLocaleString()} ·{" "}
                              <strong className="capitalize text-neutral-300">
                                {update.status}
                              </strong>
                            </span>
                            <p className="text-neutral-200">{update.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-neutral-400">
              <Icon
                icon={CheckmarkCircle02Icon}
                size={24}
                className="text-neutral-600 mb-2"
              />
              <p className="text-neutral-300">No operational incidents reported in the past 90 days.</p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                All database probes and application endpoints operated within normal SLA parameters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
