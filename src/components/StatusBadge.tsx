import type { HealthStatus } from "../hooks/useLedgerHealth";

interface StatusBadgeProps {
  status: HealthStatus;
}

const CONFIG: Record<
  HealthStatus,
  { label: string; dot: string; text: string; bg: string; pulse?: boolean }
> = {
  checking: {
    label: "Checking…",
    dot: "bg-slate-400",
    text: "text-slate-600",
    bg: "bg-slate-100",
    pulse: true,
  },
  waking: {
    label: "Waking up…",
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
    pulse: true,
  },
  online: {
    label: "Online",
    dot: "bg-brand-600",
    text: "text-brand-800",
    bg: "bg-brand-50",
    pulse: true,
  },
  offline: {
    label: "Offline",
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50",
  },
};

/** Small pill showing the backend health state. */
export function StatusBadge({ status }: StatusBadgeProps) {
  const c = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${c.bg} ${c.text}`}
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2">
        {c.pulse && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${c.dot}`}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${c.dot}`} />
      </span>
      {c.label}
    </span>
  );
}
