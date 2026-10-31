/**
 * PRIME Structured Logging Architecture
 * Redacts secrets and sensitive credentials automatically.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  requestId?: string;
  operation?: string;
  userId?: string;
  durationMs?: number;
  worker?: string;
  errorCode?: string;
  [key: string]: unknown;
}

const REDACTED_KEYS = new Set([
  "password",
  "token",
  "authorization",
  "secret",
  "service_role",
  "serviceRoleKey",
  "apikey",
  "api_key",
  "cookie",
  "cookies",
  "access_token",
  "refresh_token",
]);

function redactSensitiveData(data: unknown): unknown {
  if (!data || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = redactSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function writeLog(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown
): void {
  const timestamp = new Date().toISOString();
  const sanitizedContext = context ? redactSensitiveData(context) : undefined;

  let errorDetails: Record<string, unknown> | undefined;
  if (error instanceof Error) {
    errorDetails = {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    };
  }

  const logPayload = {
    timestamp,
    level,
    message,
    ...(sanitizedContext as object),
    ...(errorDetails ? { error: errorDetails } : {}),
  };

  const output = JSON.stringify(logPayload);

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    case "debug":
      if (process.env.NODE_ENV === "development") {
        console.debug(output);
      }
      break;
    case "info":
    default:
      console.log(output);
      break;
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => writeLog("debug", message, context),
  info: (message: string, context?: LogContext) => writeLog("info", message, context),
  warn: (message: string, context?: LogContext, error?: unknown) =>
    writeLog("warn", message, context, error),
  error: (message: string, context?: LogContext, error?: unknown) =>
    writeLog("error", message, context, error),
};
