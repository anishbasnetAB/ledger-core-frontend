import { useCallback, useEffect, useRef, useState } from "react";
import { ledgerApi } from "../api/ledgerApi";

/**
 * Health status used to drive the backend status badge.
 *
 * Because Render cold-starts after inactivity, the first request can take
 * 30–60s. We surface a distinct "waking" state so the UI can reassure the user
 * instead of looking broken.
 */
export type HealthStatus = "checking" | "online" | "waking" | "offline";

/** After this long with no response, we assume the server is cold-starting. */
const WAKING_THRESHOLD_MS = 4000;
/** Give a cold start up to this long before declaring it offline. */
const REQUEST_TIMEOUT_MS = 70000;

interface UseLedgerHealth {
  status: HealthStatus;
  /** ISO timestamp of the last successful check, or null. */
  lastCheckedAt: string | null;
  /** Manually re-run the health check. */
  refresh: () => void;
}

export function useLedgerHealth(): UseLedgerHealth {
  const [status, setStatus] = useState<HealthStatus>("checking");
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const wakingTimer = useRef<number | null>(null);
  const requestId = useRef(0);
  const activeRequest = useRef<AbortController | null>(null);

  const check = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    activeRequest.current?.abort();
    if (wakingTimer.current) window.clearTimeout(wakingTimer.current);
    setStatus("checking");

    // If it's slow, optimistically show "waking up" rather than a dead state.
    wakingTimer.current = window.setTimeout(() => {
      setStatus((prev) => (prev === "checking" ? "waking" : prev));
    }, WAKING_THRESHOLD_MS);

    const controller = new AbortController();
    activeRequest.current = controller;
    const timeout = window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );

    try {
      await ledgerApi.health(controller.signal);
      if (currentRequestId !== requestId.current) return;
      setStatus("online");
      setLastCheckedAt(new Date().toISOString());
    } catch {
      if (currentRequestId !== requestId.current) return;
      setStatus("offline");
    } finally {
      if (currentRequestId === requestId.current) {
        if (wakingTimer.current) window.clearTimeout(wakingTimer.current);
        window.clearTimeout(timeout);
        activeRequest.current = null;
      }
    }
  }, []);

  useEffect(() => {
    check();
    return () => {
      requestId.current += 1;
      if (wakingTimer.current) window.clearTimeout(wakingTimer.current);
      activeRequest.current?.abort();
      activeRequest.current = null;
    };
  }, [check]);

  return { status, lastCheckedAt, refresh: check };
}
