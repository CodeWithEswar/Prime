import { checkSupabaseHealth } from "../checks/supabase";
import {
  aggregateSystemState,
  evaluateServiceState,
} from "./evaluator";
import { syncIncidentsWithState } from "./incidents";
import {
  calculateDailyRollups,
  calculateWindowUptime,
} from "./rollups";
import {
  appendObservation,
  getActiveIncidents,
  getDailyRollups,
  getIncidentHistory,
  getLatestSnapshot,
  getRecentObservations,
  saveDailyRollups,
  saveIncidents,
  saveLatestSnapshot,
} from "../storage/kv";
import { recordObservationD1 } from "../storage/d1";
import { dispatchOperationalAlert } from "./alerts";
import type {
  HealthObservation,
  MonitorService,
  MonitorWorkerEnv,
  PublicStatusSnapshot,
} from "../types/monitoring";

/**
 * Main cycle that performs probes, computes state transitions, updates incidents,
 * creates rollups, and publishes the cached public snapshot to KV.
 */
export async function executeMonitoringCycle(
  env: MonitorWorkerEnv,
  scheduledTime?: number
): Promise<PublicStatusSnapshot> {
  const nowStr = new Date().toISOString();
  const scheduledAt = scheduledTime
    ? new Date(scheduledTime).toISOString()
    : nowStr;

  // 1. Perform Backend DB Probe
  const supabaseObs = await checkSupabaseHealth({
    supabaseUrl: env.SUPABASE_URL,
    apiKey: env.SUPABASE_ANON_KEY,
    scheduledAt,
    serviceId: "backend-db",
    timeoutMs: 5000,
  });

  // 2. Persist observation to KV (and optional D1)
  await appendObservation(env.STATUS_KV, supabaseObs);
  if (env.DB) {
    await recordObservationD1(env.DB, supabaseObs);
  }

  // 3. Load historical context from KV
  const recentObservations = await getRecentObservations(env.STATUS_KV, 500);
  const activeIncidents = await getActiveIncidents(env.STATUS_KV);
  const historyIncidents = await getIncidentHistory(env.STATUS_KV);
  const previousSnapshot = await getLatestSnapshot(env.STATUS_KV);

  const prevDbService = previousSnapshot?.services.find(
    (s) => s.id === "backend-db"
  );
  const prevDbState = prevDbService?.status || "unknown";

  // 4. Evaluate service state
  const dbEval = evaluateServiceState(
    recentObservations.filter((o) => o.serviceId === "backend-db"),
    prevDbState,
    {
      outageConsecutiveFailures: 3,
      recoveryConsecutiveSuccesses: 2,
      degradedLatencyThresholdMs: 1200,
      staleThresholdMinutes: 30,
    }
  );

  // 5. Synchronize incidents
  const incidentResult = syncIncidentsWithState(
    "backend-db",
    "Backend Infrastructure",
    dbEval.state,
    activeIncidents,
    historyIncidents,
    nowStr
  );

  // Optimization: Only write to incidents KV when state actually changes
  if (incidentResult.newIncidentCreated || incidentResult.incidentResolved) {
    await saveIncidents(
      env.STATUS_KV,
      incidentResult.active,
      incidentResult.history
    );
  }

  // 6. Handle alerts on state transitions
  if (incidentResult.newIncidentCreated) {
    await dispatchOperationalAlert(env, {
      type: dbEval.state === "degraded" ? "degradation" : "outage",
      serviceId: "backend-db",
      title: incidentResult.newIncidentCreated.title,
      message: `System transitioned to ${dbEval.state}. Consecutive failures: ${dbEval.consecutiveFailures}.`,
      severity: incidentResult.newIncidentCreated.severity,
      timestamp: nowStr,
    });
  } else if (incidentResult.incidentResolved) {
    await dispatchOperationalAlert(env, {
      type: "recovery",
      serviceId: "backend-db",
      title: "Backend Infrastructure Restored",
      message: "Probes nominal. Consecutive successful checks verified recovery.",
      severity: "minor",
      timestamp: nowStr,
    });
  }

  // 7. Calculate 90-day rollups
  const dailyRollups = calculateDailyRollups(
    "backend-db",
    recentObservations,
    90
  );
  
  // Optimization: Daily rollups are already embedded in the public snapshot.
  // Only write to standalone rollups:daily key during the midnight run or on cold start.
  const isDailyRun = scheduledTime && new Date(scheduledTime).getUTCHours() === 0 && new Date(scheduledTime).getUTCMinutes() < 15;
  if (isDailyRun || !previousSnapshot?.dailyRollups?.length) {
    await saveDailyRollups(env.STATUS_KV, dailyRollups);
  }

  // 8. Calculate rolling uptime metrics
  const uptime24h = calculateWindowUptime(recentObservations, "backend-db", 24);
  const uptime7d = calculateWindowUptime(recentObservations, "backend-db", 24 * 7);
  const uptime30d = calculateWindowUptime(recentObservations, "backend-db", 24 * 30);
  const uptime90d = calculateWindowUptime(recentObservations, "backend-db", 24 * 90);

  const backendService: MonitorService = {
    id: "backend-db",
    slug: "backend-infrastructure",
    displayName: "Backend Infrastructure",
    description: "Database engine, authentication, and core API services",
    enabled: true,
    status: dbEval.state,
    uptimePercentage24h: uptime24h,
    uptimePercentage7d: uptime7d,
    uptimePercentage30d: uptime30d,
    uptimePercentage90d: uptime90d,
    lastCheckedAt: supabaseObs.checkedAt,
    lastResponseTimeMs: supabaseObs.responseTimeMs,
  };

  const services: MonitorService[] = [backendService];

  // 9. Overall system status
  const overallStatus = aggregateSystemState(services.map((s) => s.status));

  // Determine summary message
  let summary = "All Systems Operational";
  if (overallStatus === "major_outage") {
    summary = "Major Infrastructure Outage Detected";
  } else if (overallStatus === "partial_outage") {
    summary = "Partial Service Outage";
  } else if (overallStatus === "degraded") {
    summary = "Degraded Performance Detected";
  } else if (overallStatus === "unknown") {
    summary = "Monitoring Data Unavailable or Delayed";
  }

  const last24hObs = recentObservations.filter(
    (o) => Date.now() - new Date(o.checkedAt).getTime() < 24 * 3600 * 1000
  );
  const successful24h = last24hObs.filter((o) => o.status === "up").length;
  const successRate24h =
    last24hObs.length > 0
      ? Number(((successful24h / last24hObs.length) * 100).toFixed(1))
      : 100;

  const snapshot: PublicStatusSnapshot = {
    status: overallStatus,
    summary,
    services,
    lastCheckedAt: supabaseObs.checkedAt,
    lastAttemptedAt: nowStr,
    coverage: {
      totalChecks24h: last24hObs.length,
      successRate24h,
      isFresh: !dbEval.isStale,
      windowMinutes: 5,
    },
    activeIncidents: incidentResult.active,
    recentObservations: recentObservations.slice(-60), // Return last 60 for chart
    dailyRollups,
    environment: env.ENVIRONMENT || "production",
    generatedAt: nowStr,
  };

  // 10. Cache snapshot to KV
  await saveLatestSnapshot(env.STATUS_KV, snapshot);

  return snapshot;
}
