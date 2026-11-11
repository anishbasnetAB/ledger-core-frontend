import type { HealthStatus } from "../hooks/useLedgerHealth";

interface StatusBadgeProps { status: HealthStatus; }

const LABELS: Record<HealthStatus, string> = {
  checking: "Checking…",
  waking: "Waking up…",
  online: "Online",
  offline: "Offline",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge status-${status}`} role="status" aria-live="polite">{LABELS[status]}</span>;
}
