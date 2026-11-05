import type { DailyRollup, HealthObservation } from "../types/monitoring";

/**
 * Calculates daily uptime rollups and 90-day availability history
 * strictly derived from monitored observations without data fabrication.
 */
export function calculateDailyRollups(
  serviceId: string,
  observations: HealthObservation[],
  daysCount: number = 90
): DailyRollup[] {
  // Group observations by UTC date (YYYY-MM-DD)
  const byDate = new Map<string, HealthObservation[]>();

  for (const obs of observations) {
    if (obs.serviceId !== serviceId) continue;
    const dateStr = obs.checkedAt.substring(0, 10);
    const list = byDate.get(dateStr) || [];
    list.push(obs);
    byDate.set(dateStr, list);
  }

  // Generate date sequence for the last N days up to today
  const rollups: DailyRollup[] = [];
  const now = new Date();

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    const dateKey = d.toISOString().substring(0, 10);
    const dayObs = byDate.get(dateKey) || [];

    if (dayObs.length === 0) {
      rollups.push({
        serviceId,
        date: dateKey,
        status: "no_data",
        successfulChecks: 0,
        failedChecks: 0,
        unknownChecks: 0,
        totalChecks: 0,
        uptimePercentage: 0,
        averageLatencyMs: 0,
        p95LatencyMs: 0,
      });
      continue;
    }

    let successful = 0;
    let failed = 0;
    let unknown = 0;
    const latencies: number[] = [];

    for (const obs of dayObs) {
      if (obs.status === "up") {
        successful++;
        if (typeof obs.responseTimeMs === "number" && obs.responseTimeMs >= 0) {
          latencies.push(obs.responseTimeMs);
        }
      } else if (obs.status === "down") {
        failed++;
      } else {
        unknown++;
      }
    }

    const total = successful + failed + unknown;
    const validChecks = successful + failed;
    const uptimePercentage =
      validChecks > 0 ? Number(((successful / validChecks) * 100).toFixed(2)) : 0;

    let avgLatency = 0;
    let p95Latency = 0;

    if (latencies.length > 0) {
      latencies.sort((a, b) => a - b);
      const sum = latencies.reduce((acc, v) => acc + v, 0);
      avgLatency = Math.round(sum / latencies.length);

      const p95Idx = Math.min(
        Math.floor(latencies.length * 0.95),
        latencies.length - 1
      );
      p95Latency = Math.round(latencies[p95Idx]);
    }

    let status: DailyRollup["status"] = "operational";
    if (validChecks === 0) {
      status = "no_data";
    } else if (uptimePercentage < 95) {
      status = "outage";
    } else if (uptimePercentage < 100 || avgLatency > 800) {
      status = "degraded";
    }

    rollups.push({
      serviceId,
      date: dateKey,
      status,
      successfulChecks: successful,
      failedChecks: failed,
      unknownChecks: unknown,
      totalChecks: total,
      uptimePercentage,
      averageLatencyMs: avgLatency,
      p95LatencyMs: p95Latency,
    });
  }

  return rollups;
}

/**
 * Calculates aggregate uptime percentage for specific rolling windows (24h, 7d, 30d, 90d)
 */
export function calculateWindowUptime(
  observations: HealthObservation[],
  serviceId: string,
  hoursWindow: number
): number {
  const cutoff = Date.now() - hoursWindow * 60 * 60 * 1000;
  let successful = 0;
  let failed = 0;

  for (const obs of observations) {
    if (obs.serviceId !== serviceId) continue;
    const obsTime = new Date(obs.checkedAt).getTime();
    if (obsTime < cutoff) continue;

    if (obs.status === "up") {
      successful++;
    } else if (obs.status === "down") {
      failed++;
    }
  }

  const valid = successful + failed;
  if (valid === 0) return 0;
  return Number(((successful / valid) * 100).toFixed(2));
}
