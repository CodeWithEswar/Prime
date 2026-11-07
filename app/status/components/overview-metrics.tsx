import type { PublicStatusSnapshot } from "@/workers/prime-monitor/src/types/monitoring";

interface OverviewMetricsProps {
  snapshot: PublicStatusSnapshot | null;
}

export function OverviewMetrics({ snapshot }: OverviewMetricsProps) {
  const backendService =
    snapshot?.services.find((s) => s.id === "backend-db") ||
    snapshot?.services[0];

  const uptime24h = backendService?.uptimePercentage24h ?? 0;
  const uptime7d = backendService?.uptimePercentage7d ?? 0;
  const uptime30d = backendService?.uptimePercentage30d ?? 0;
  const currentLatency = backendService?.lastResponseTimeMs;
  const activeIncidentsCount = snapshot?.activeIncidents?.length ?? 0;

  const metrics = [
    {
      label: "24h Availability",
      value: uptime24h > 0 ? `${uptime24h.toFixed(1)}%` : "100%",
      sub: "Rolling 24 hours",
      statusColor: uptime24h >= 99 || uptime24h === 0 ? "text-emerald-400" : "text-amber-400",
    },
    {
      label: "7d Uptime",
      value: uptime7d > 0 ? `${uptime7d.toFixed(1)}%` : "100%",
      sub: "Past 7 days",
      statusColor: uptime7d >= 99 || uptime7d === 0 ? "text-emerald-400" : "text-amber-400",
    },
    {
      label: "30d Uptime",
      value: uptime30d > 0 ? `${uptime30d.toFixed(1)}%` : "100%",
      sub: "Past 30 days",
      statusColor: uptime30d >= 99 || uptime30d === 0 ? "text-emerald-400" : "text-amber-400",
    },
    {
      label: "Backend Latency",
      value: typeof currentLatency === "number" ? `${currentLatency} ms` : "—",
      sub: "Live probe response time",
      statusColor:
        typeof currentLatency === "number" && currentLatency < 1200
          ? "text-neutral-100"
          : "text-amber-400",
    },
    {
      label: "Active Incidents",
      value: activeIncidentsCount.toString(),
      sub: activeIncidentsCount === 0 ? "Normal operation" : "Investigating",
      statusColor:
        activeIncidentsCount === 0 ? "text-emerald-400" : "text-red-400 font-semibold",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 sm:gap-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-lg border border-neutral-800/80 bg-[#0A0A0A]/90 p-3.5 sm:p-4 transition-all hover:border-neutral-700 hover:bg-neutral-900/40 shadow-sm relative overflow-hidden"
        >
          <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-medium">
            {metric.label}
          </div>
          <div className={`mt-2 font-mono text-lg sm:text-xl font-bold tracking-tight ${metric.statusColor}`}>
            {metric.value}
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] text-neutral-400 font-sans truncate">
            {metric.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
