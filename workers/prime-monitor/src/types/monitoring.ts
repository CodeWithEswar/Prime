/**
 * PRIME Infrastructure Monitoring & Public Status System Types
 */

export type ServiceState =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "major_outage"
  | "maintenance"
  | "unknown";

export type IncidentSeverity = "critical" | "major" | "minor";

export type IncidentStatus =
  | "investigating"
  | "identified"
  | "monitoring"
  | "resolved";

export interface HealthObservation {
  serviceId: string;
  scheduledAt: string;
  checkedAt: string;
  status: "up" | "down" | "unknown";
  responseTimeMs: number | null;
  httpStatus: number | null;
  errorCode: string | null;
}

export interface MonitorService {
  id: string;
  slug: string;
  displayName: string;
  description: string;
  enabled: boolean;
  status: ServiceState;
  uptimePercentage24h: number;
  uptimePercentage7d: number;
  uptimePercentage30d: number;
  uptimePercentage90d: number;
  lastCheckedAt: string | null;
  lastResponseTimeMs: number | null;
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  status: IncidentStatus;
  message: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  serviceId: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  startedAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  updates: IncidentUpdate[];
}

export interface DailyRollup {
  serviceId: string;
  date: string; // YYYY-MM-DD
  status: "operational" | "degraded" | "outage" | "no_data";
  successfulChecks: number;
  failedChecks: number;
  unknownChecks: number;
  totalChecks: number;
  uptimePercentage: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
}

export interface PublicStatusSnapshot {
  status: ServiceState;
  summary: string;
  services: MonitorService[];
  lastCheckedAt: string | null;
  lastAttemptedAt: string | null;
  coverage: {
    totalChecks24h: number;
    successRate24h: number;
    isFresh: boolean;
    windowMinutes: number;
  };
  activeIncidents: Incident[];
  recentObservations: HealthObservation[];
  dailyRollups: DailyRollup[];
  environment: string;
  generatedAt: string;
}

export interface MonitorWorkerEnv {
  ENVIRONMENT: "development" | "preview" | "production";
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  STATUS_KV?: any;
  DB?: any;
  ALERT_INTERNAL_SECRET?: string;
  APP_URL?: string;
  ALERT_EMAIL_RECIPIENT?: string;
}
