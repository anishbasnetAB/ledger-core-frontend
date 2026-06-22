import type { ApiErrorBody, FieldError } from "../types/ledger";

/**
 * A typed error thrown by the API client for any non-OK response or network
 * failure. UI code can branch on `status` and read `fieldErrors` to render
 * inline validation messages.
 */
export class ApiError extends Error {
  /** HTTP status, or 0 for network / connection errors. */
  readonly status: number;
  /** Field-level validation errors, when present. */
  readonly fieldErrors: FieldError[];
  /** The raw parsed error body, for debugging. */
  readonly body?: ApiErrorBody;

  constructor(
    message: string,
    status: number,
    fieldErrors: FieldError[] = [],
    body?: ApiErrorBody,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.body = body;
  }

  /** True when this is a network/connection failure (not an HTTP response). */
  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

/**
 * Turn any thrown value into a human-friendly message. Keeps raw stack traces
 * out of the UI while still being useful.
 */
export function toFriendlyMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isNetworkError) {
      return "Could not reach the backend. It may be waking up — please wait a moment and try again.";
    }
    return error.message || defaultMessageForStatus(error.status);
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

/** Friendly fallback text for a status code with no specific message. */
export function defaultMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return "The request was invalid. Please check your input.";
    case 404:
      return "Not found.";
    case 409:
      return "This idempotency key was already used for a different transfer.";
    case 422:
      return "This action violates a business rule (for example, insufficient funds or a currency mismatch).";
    case 500:
      return "The server hit an unexpected error. Please try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/** Pull the message for a specific field out of an error, if any. */
export function fieldErrorFor(
  error: unknown,
  field: string,
): string | undefined {
  if (error instanceof ApiError) {
    return error.fieldErrors.find((f) => f.field === field)?.message;
  }
  return undefined;
}
