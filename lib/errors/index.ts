/**
 * PRIME Error Taxonomy & Safe User-Facing Error Mapping
 * Prevents internal SQL, credentials, or stack traces from reaching client UI.
 */

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMIT_EXCEEDED"
  | "EXTERNAL_SERVICE_ERROR"
  | "INTERNAL_ERROR";

export interface AppErrorOptions {
  code: ErrorCode;
  message: string; // Internal logging message
  userMessage?: string; // Safe message presented to user
  statusCode?: number;
  details?: Record<string, unknown>;
  cause?: unknown;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly userMessage: string;
  readonly statusCode: number;
  readonly details?: Record<string, unknown>;

  constructor({
    code,
    message,
    userMessage,
    statusCode = 500,
    details,
    cause,
  }: AppErrorOptions) {
    super(message, { cause });
    this.name = "AppError";
    this.code = code;
    this.userMessage = userMessage ?? getDefaultUserMessage(code);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, userMessage?: string) {
    super({
      code: "VALIDATION_ERROR",
      message,
      userMessage: userMessage ?? "Invalid request data. Please check your inputs.",
      statusCode: 400,
      details,
    });
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(
    message = "Unauthenticated",
    userMessage = "You must be signed in to access this resource."
  ) {
    super({
      code: "AUTHENTICATION_ERROR",
      message,
      userMessage,
      statusCode: 401,
    });
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(
    message = "Forbidden",
    userMessage = "You do not have permission to perform this action."
  ) {
    super({
      code: "AUTHORIZATION_ERROR",
      message,
      userMessage,
      statusCode: 403,
    });
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource", userMessage?: string) {
    super({
      code: "NOT_FOUND",
      message: `${resource} not found`,
      userMessage: userMessage ?? `${resource} could not be found.`,
      statusCode: 404,
    });
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, userMessage?: string) {
    super({
      code: "CONFLICT",
      message,
      userMessage: userMessage ?? "A conflicting record already exists.",
      statusCode: 409,
    });
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfterSeconds = 60, userMessage?: string) {
    super({
      code: "RATE_LIMIT_EXCEEDED",
      message: `Rate limit exceeded. Retry after ${retryAfterSeconds}s`,
      userMessage: userMessage ?? "Too many requests. Please pause before trying again.",
      statusCode: 429,
      details: { retryAfterSeconds },
    });
    this.name = "RateLimitError";
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, userMessage?: string) {
    super({
      code: "EXTERNAL_SERVICE_ERROR",
      message: `External service error (${service}): ${message}`,
      userMessage:
        userMessage ??
        "An external integration error occurred. Please try again shortly.",
      statusCode: 502,
    });
    this.name = "ExternalServiceError";
  }
}

export class InternalError extends AppError {
  constructor(message = "Internal server error", cause?: unknown) {
    super({
      code: "INTERNAL_ERROR",
      message,
      userMessage: "An unexpected error occurred. Please try again later.",
      statusCode: 500,
      cause,
    });
    this.name = "InternalError";
  }
}

function getDefaultUserMessage(code: ErrorCode): string {
  switch (code) {
    case "VALIDATION_ERROR":
      return "The provided data is invalid.";
    case "AUTHENTICATION_ERROR":
      return "Please sign in to continue.";
    case "AUTHORIZATION_ERROR":
      return "Access denied.";
    case "NOT_FOUND":
      return "The requested item was not found.";
    case "CONFLICT":
      return "This operation conflicts with existing state.";
    case "RATE_LIMIT_EXCEEDED":
      return "Rate limit reached. Please wait a moment.";
    case "EXTERNAL_SERVICE_ERROR":
      return "A connected service encountered an issue.";
    case "INTERNAL_ERROR":
    default:
      return "An unexpected error occurred. Our team has been notified.";
  }
}

/**
 * Maps arbitrary thrown values safely to a sanitized user-facing error response.
 */
export function toSafeUserError(error: unknown): {
  code: ErrorCode;
  message: string;
  statusCode: number;
} {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.userMessage,
      statusCode: error.statusCode,
    };
  }

  // Never expose generic error messages or traces to the user
  return {
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred. Please try again later.",
    statusCode: 500,
  };
}
