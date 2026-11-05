import type {
  DailyRollup,
  HealthObservation,
  Incident,
} from "../types/monitoring";

/**
 * Cloudflare D1 Storage Driver (Optional secondary persistent store)
 * When D1 binding `env.DB` is provisioned, this stores durable history across 90+ days.
 * If D1 is not provisioned, methods gracefully resolve as no-ops.
 */

export async function initD1Schema(db: any): Promise<void> {
  if (!db || typeof db.exec !== "function") return;

  const schema = `
    CREATE TABLE IF NOT EXISTS monitor_services (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      description TEXT,
      enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS monitor_observations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id TEXT NOT NULL,
      scheduled_at TEXT NOT NULL,
      checked_at TEXT NOT NULL,
      status TEXT NOT NULL,
      response_time_ms REAL,
      http_status INTEGER,
      error_code TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_obs_service_date 
      ON monitor_observations(service_id, checked_at);

    CREATE TABLE IF NOT EXISTS monitor_incidents (
      id TEXT PRIMARY KEY,
      service_id TEXT NOT NULL,
      title TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at TEXT NOT NULL,
      resolved_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS monitor_incident_updates (
      id TEXT PRIMARY KEY,
      incident_id TEXT NOT NULL,
      status TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(incident_id) REFERENCES monitor_incidents(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS monitor_daily_rollups (
      service_id TEXT NOT NULL,
      date TEXT NOT NULL,
      successful_checks INTEGER NOT NULL,
      failed_checks INTEGER NOT NULL,
      unknown_checks INTEGER NOT NULL,
      total_checks INTEGER NOT NULL,
      uptime_percentage REAL NOT NULL,
      average_latency_ms REAL NOT NULL,
      p95_latency_ms REAL NOT NULL,
      PRIMARY KEY(service_id, date)
    );
  `;

  try {
    await db.exec(schema);
  } catch (err) {
    console.warn("D1 schema init error:", err);
  }
}

export async function recordObservationD1(
  db: any,
  obs: HealthObservation
): Promise<void> {
  if (!db || typeof db.prepare !== "function") return;
  try {
    await db
      .prepare(
        `INSERT INTO monitor_observations (service_id, scheduled_at, checked_at, status, response_time_ms, http_status, error_code)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        obs.serviceId,
        obs.scheduledAt,
        obs.checkedAt,
        obs.status,
        obs.responseTimeMs,
        obs.httpStatus,
        obs.errorCode
      )
      .run();
  } catch (err) {
    console.warn("D1 record observation error:", err);
  }
}

