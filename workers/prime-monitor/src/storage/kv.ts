import type {
  DailyRollup,
  HealthObservation,
  Incident,
  PublicStatusSnapshot,
} from "../types/monitoring";

const KEY_SNAPSHOT = "snapshot:latest";
const KEY_OBSERVATIONS = "observations:recent";
const KEY_ROLLUPS = "rollups:daily";
const KEY_INCIDENTS_ACTIVE = "incidents:active";
const KEY_INCIDENTS_HISTORY = "incidents:history";

// In-memory fallback store for development/unit testing
const memoryStore = new Map<string, string>();

async function kvGet<T>(kv: any, key: string): Promise<T | null> {
  try {
    if (kv && typeof kv.get === "function") {
      const raw = await kv.get(key, "text");
      if (!raw) return null;
      return JSON.parse(raw) as T;
    }
  } catch {
    // fallback to memory
  }
  const mem = memoryStore.get(key);
  if (!mem) return null;
  try {
    return JSON.parse(mem) as T;
  } catch {
    return null;
  }
}

async function kvPut<T>(
  kv: any,
  key: string,
  value: T,
  ttlSeconds?: number
): Promise<void> {
  const json = JSON.stringify(value);
  try {
    if (kv && typeof kv.put === "function") {
      if (ttlSeconds) {
        await kv.put(key, json, { expirationTtl: ttlSeconds });
      } else {
        await kv.put(key, json);
      }
      return;
    }
  } catch {
    // fallback to memory
  }
  memoryStore.set(key, json);
}

export async function getLatestSnapshot(
  kv: any
): Promise<PublicStatusSnapshot | null> {
  return kvGet<PublicStatusSnapshot>(kv, KEY_SNAPSHOT);
}

export async function saveLatestSnapshot(
  kv: any,
  snapshot: PublicStatusSnapshot
): Promise<void> {
  await kvPut(kv, KEY_SNAPSHOT, snapshot);
}

export async function getRecentObservations(
  kv: any,
  limit: number = 288
): Promise<HealthObservation[]> {
  const list = (await kvGet<HealthObservation[]>(kv, KEY_OBSERVATIONS)) || [];
  return list.slice(-limit);
}

export async function appendObservation(
  kv: any,
  observation: HealthObservation,
  maxRetention: number = 1000
): Promise<void> {
  const list = (await kvGet<HealthObservation[]>(kv, KEY_OBSERVATIONS)) || [];
  list.push(observation);
  const trimmed = list.slice(-maxRetention);
  await kvPut(kv, KEY_OBSERVATIONS, trimmed);
}

export async function getDailyRollups(kv: any): Promise<DailyRollup[]> {
  return (await kvGet<DailyRollup[]>(kv, KEY_ROLLUPS)) || [];
}

export async function saveDailyRollups(
  kv: any,
  rollups: DailyRollup[]
): Promise<void> {
  await kvPut(kv, KEY_ROLLUPS, rollups);
}

export async function getActiveIncidents(kv: any): Promise<Incident[]> {
  return (await kvGet<Incident[]>(kv, KEY_INCIDENTS_ACTIVE)) || [];
}

export async function getIncidentHistory(kv: any): Promise<Incident[]> {
  return (await kvGet<Incident[]>(kv, KEY_INCIDENTS_HISTORY)) || [];
}

export async function saveIncidents(
  kv: any,
  active: Incident[],
  history: Incident[]
): Promise<void> {
  await kvPut(kv, KEY_INCIDENTS_ACTIVE, active);
  await kvPut(kv, KEY_INCIDENTS_HISTORY, history);
}

export async function checkAndSetAlertCooldown(
  kv: any,
  alertKey: string,
  cooldownSeconds: number = 3600
): Promise<boolean> {
  const fullKey = `alert:cooldown:${alertKey}`;
  const existing = await kvGet<{ sentAt: number }>(kv, fullKey);
  const now = Date.now();
  if (existing && now - existing.sentAt < cooldownSeconds * 1000) {
    return false; // In cooldown
  }
  await kvPut(kv, fullKey, { sentAt: now }, cooldownSeconds);
  return true; // Cooldown allowed
}

