import { ApiError } from "../utils/errors";
import type { ApiErrorBody } from "../types/ledger";
import { loadSession, clearSession } from "./session";

/**
 * Base URL resolution:
 *   1. VITE_API_BASE_URL (build/runtime env)
 *   2. fallback to the hosted Render backend
 * Trailing slashes are trimmed so we can safely join paths.
 */
const FALLBACK_BASE_URL = "https://ledger-core.onrender.com";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || FALLBACK_BASE_URL
).replace(/\/+$/, "");

const isDev = import.meta.env.DEV;

export interface RequestOptions {
  /** Extra headers, e.g. an Idempotency-Key. */
  headers?: Record<string, string>;
  /** Parsed automatically into a JSON body. */
  body?: unknown;
  /** AbortSignal for cancellation / timeouts. */
  signal?: AbortSignal;
}

type Method = "GET" | "POST";

/** Endpoints that work without a token — never attach a stale/expired one. */
const PUBLIC_PATHS = new Set(["/health", "/auth/login", "/auth/register"]);

/**
 * Core request function. Always talks to `${API_BASE_URL}/api${path}`.
 *
 * - Attaches `Authorization: Bearer <token>` for every non-public endpoint.
 * - Serializes the body to JSON and sets Content-Type.
 * - Parses JSON responses safely (tolerates empty bodies).
 * - Throws a typed `ApiError` for non-2xx responses and network failures.
 * - On a 401 from an authenticated endpoint, clears the stored session and
 *   fires `ledger-core:unauthorized` so the app can drop back to login.
 */
async function request<T>(
  method: Method,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = `${API_BASE_URL}/api${path}`;
  const isPublic = PUBLIC_PATHS.has(path);

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers,
  };

  if (!isPublic) {
    const session = loadSession();
    if (session) headers.Authorization = `Bearer ${session.token}`;
  }

  let bodyInit: string | undefined;
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    bodyInit = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: bodyInit,
      signal: options.signal,
    });
  } catch (err) {
    // Network error, DNS failure, CORS, or an aborted request.
    if (isDev) console.error(`[api] network error ${method} ${url}`, err);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Request was cancelled.", 0);
    }
    throw new ApiError("Network request failed.", 0);
  }

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    const errorBody = (data ?? {}) as ApiErrorBody;
    const message =
      errorBody.message ||
      errorBody.error ||
      `Request failed with status ${response.status}`;
    if (isDev) {
      console.error(`[api] ${response.status} ${method} ${url}`, errorBody);
    }
    if (response.status === 401 && !isPublic) {
      clearSession();
      window.dispatchEvent(new Event("ledger-core:unauthorized"));
    }
    throw new ApiError(
      message,
      response.status,
      errorBody.fieldErrors ?? [],
      errorBody,
    );
  }

  return data as T;
}

/** Parse a JSON body without throwing on empty/non-JSON responses. */
async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    // Non-JSON payload (rare). Return the raw text so callers can inspect it.
    return { message: text } satisfies ApiErrorBody;
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, { ...options, body }),
};
