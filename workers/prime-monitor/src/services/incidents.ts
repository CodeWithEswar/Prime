import type {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentUpdate,
  ServiceState,
} from "../types/monitoring";

/**
 * Synchronizes incidents with automated service evaluation transitions.
 * Creates machine-generated incidents upon sustained failure and auto-resolves
 * upon verified recovery.
 */
export function syncIncidentsWithState(
  serviceId: string,
  serviceName: string,
  currentState: ServiceState,
  activeIncidents: Incident[],
  historyIncidents: Incident[],
  now: string = new Date().toISOString()
): {
  active: Incident[];
  history: Incident[];
  newIncidentCreated?: Incident;
  incidentResolved?: Incident;
} {
  const active = [...activeIncidents];
  const history = [...historyIncidents];

  const existingActiveIndex = active.findIndex(
    (inc) => inc.serviceId === serviceId && inc.status !== "resolved"
  );
  const existingActive = existingActiveIndex >= 0 ? active[existingActiveIndex] : null;

  // Case 1: Outage or severe degradation -> open incident if none active
  if (currentState === "major_outage" || currentState === "partial_outage") {
    if (!existingActive) {
      const severity: IncidentSeverity =
        currentState === "major_outage" ? "critical" : "major";
      const incidentId = `inc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newInc: Incident = {
        id: incidentId,
        serviceId,
        title: `${serviceName} Service Disruption`,
        severity,
        status: "investigating",
        startedAt: now,
        resolvedAt: null,
        createdAt: now,
        updatedAt: now,
        updates: [
          {
            id: `upd_${Date.now()}_init`,
            incidentId,
            status: "investigating",
            message:
              "Automated health monitor detected consecutive probe failures. Service disruption confirmed.",
            createdAt: now,
          },
        ],
      };
      active.push(newInc);
      return { active, history, newIncidentCreated: newInc };
    }
  }

  // Case 2: Degraded latency -> open minor incident if none active
  if (currentState === "degraded") {
    if (!existingActive) {
      const incidentId = `inc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newInc: Incident = {
        id: incidentId,
        serviceId,
        title: `${serviceName} Elevated Query Latency`,
        severity: "minor",
        status: "monitoring",
        startedAt: now,
        resolvedAt: null,
        createdAt: now,
        updatedAt: now,
        updates: [
          {
            id: `upd_${Date.now()}_init`,
            incidentId,
            status: "monitoring",
            message:
              "Automated probe latency exceeded SLA threshold (>1200ms). Monitoring system performance.",
            createdAt: now,
          },
        ],
      };
      active.push(newInc);
      return { active, history, newIncidentCreated: newInc };
    }
  }

  // Case 3: Recovery to operational -> resolve any active incidents
  if (currentState === "operational" && existingActive) {
    const resolvedInc: Incident = {
      ...existingActive,
      status: "resolved",
      resolvedAt: now,
      updatedAt: now,
      updates: [
        ...existingActive.updates,
        {
          id: `upd_${Date.now()}_res`,
          incidentId: existingActive.id,
          status: "resolved",
          message:
            "Automated health probes verified complete recovery. Response times and database connectivity nominal.",
          createdAt: now,
        },
      ],
    };

    active.splice(existingActiveIndex, 1);
    history.unshift(resolvedInc);

    return {
      active,
      history,
      incidentResolved: resolvedInc,
    };
  }

  return { active, history };
}
