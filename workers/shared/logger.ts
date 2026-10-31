/**
 * Worker-Compatible Structured Logger
 */
export function workerLog(
  worker: string,
  level: "info" | "warn" | "error",
  message: string,
  meta?: Record<string, unknown>
): void {
  const payload = {
    timestamp: new Date().toISOString(),
    worker,
    level,
    message,
    ...meta,
  };
  const json = JSON.stringify(payload);
  if (level === "error") {
    console.error(json);
  } else if (level === "warn") {
    console.warn(json);
  } else {
    console.log(json);
  }
}
