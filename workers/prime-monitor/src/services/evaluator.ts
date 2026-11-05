import type {
  HealthObservation,
  ServiceState,
} from "../types/monitoring";

export interface EvaluatorConfig {
  outageConsecutiveFailures?: number; // default: 3
  recoveryConsecutiveSuccesses?: number; // default: 2
  degradedLatencyThresholdMs?: number; // default: 1200
  staleThresholdMinutes?: number; // default: 30
}

/**
 * Pure state machine evaluator for service availability.
 * Avoids jitter by requiring 3 consecutive failures for outage
 * and 2 consecutive successes for recovery.
 */
export function evaluateServiceState(
  observations: HealthObservation[],
  previousState: ServiceState = "unknown",
  config: EvaluatorConfig = {}
): {
  state: ServiceState;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  isStale: boolean;
} {
  const {
    outageConsecutiveFailures = 3,
    recoveryConsecutiveSuccesses = 2,
    degradedLatencyThresholdMs = 1200,
    staleThresholdMinutes = 30,
  } = config;

  if (observations.length === 0) {
    return {
      state: "unknown",
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      isStale: true,
    };
  }

  // Check freshness of last observation
  const lastObs = observations[observations.length - 1];
  const lastTime = new Date(lastObs.checkedAt).getTime();
  const now = Date.now();
  const isStale = now - lastTime > staleThresholdMinutes * 60 * 1000;

  if (isStale) {
    return {
      state: "unknown",
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      isStale: true,
    };
  }

  // Count trailing consecutive failures and successes
  let consecutiveFailures = 0;
  let consecutiveSuccesses = 0;

  for (let i = observations.length - 1; i >= 0; i--) {
    const obs = observations[i];
    if (obs.status === "up") {
      if (consecutiveFailures > 0) break;
      consecutiveSuccesses++;
    } else {
      if (consecutiveSuccesses > 0) break;
      consecutiveFailures++;
    }
  }

  // Outage state transition
  if (consecutiveFailures >= outageConsecutiveFailures) {
    return {
      state: "major_outage",
      consecutiveFailures,
      consecutiveSuccesses: 0,
      isStale: false,
    };
  }

  // Recovery confirmation logic:
  // If previously in outage, require `recoveryConsecutiveSuccesses` before clearing to operational
  if (
    previousState === "major_outage" ||
    previousState === "partial_outage"
  ) {
    if (consecutiveSuccesses < recoveryConsecutiveSuccesses) {
      return {
        state: previousState,
        consecutiveFailures,
        consecutiveSuccesses,
        isStale: false,
      };
    }
  }

  // Latency degradation check
  if (
    consecutiveSuccesses >= 1 &&
    lastObs.responseTimeMs !== null &&
    lastObs.responseTimeMs > degradedLatencyThresholdMs
  ) {
    return {
      state: "degraded",
      consecutiveFailures: 0,
      consecutiveSuccesses,
      isStale: false,
    };
  }

  if (consecutiveSuccesses >= 1) {
    return {
      state: "operational",
      consecutiveFailures: 0,
      consecutiveSuccesses,
      isStale: false,
    };
  }

  return {
    state: previousState !== "unknown" ? previousState : "unknown",
    consecutiveFailures,
    consecutiveSuccesses,
    isStale: false,
  };
}

/**
 * Aggregates individual service states into overall system state
 */
export function aggregateSystemState(serviceStates: ServiceState[]): ServiceState {
  if (serviceStates.length === 0) return "unknown";
  if (serviceStates.includes("major_outage")) return "major_outage";
  if (serviceStates.includes("partial_outage")) return "partial_outage";
  if (serviceStates.includes("degraded")) return "degraded";
  if (serviceStates.every((s) => s === "operational")) return "operational";
  if (serviceStates.some((s) => s === "operational")) return "degraded";
  return "unknown";
}

