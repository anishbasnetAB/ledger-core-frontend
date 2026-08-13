import { StatusBadge } from "./StatusBadge";
import type { HealthStatus } from "../hooks/useLedgerHealth";
import type { CurrentAccountInfo } from "../hooks/useCurrentAccount";
import type { Session } from "../api/session";

interface AppHeaderProps {
  status: HealthStatus;
  lastCheckedAt: string | null;
  onRefreshHealth: () => void;
  account: CurrentAccountInfo | null;
  session: Session | null;
  onLogout: () => void;
}

/**
 * The project header / about area. Designed with deliberate room to grow:
 * drop additional paragraphs into the `.about` block below as the project's
 * story expands — the layout will simply flow.
 */
export function AppHeader({
  status,
  lastCheckedAt,
  onRefreshHealth,
  account,
  session,
  onLogout,
}: AppHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 21h18M4 10h16M5 10l7-5 7 5M6 10v8M18 10v8M10 10v8M14 10v8" />
              </svg>
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Ledger-Core
              </h1>
              <p className="text-sm text-slate-500">Money-movement console</p>
            </div>
          </div>

          {/* Live indicators */}
          <div className="flex flex-wrap items-center gap-3">
            {session && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {session.email}
                {session.role === "ADMIN" && (
                  <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-800">
                    Admin
                  </span>
                )}
                <button
                  type="button"
                  onClick={onLogout}
                  className="ml-1 font-medium text-slate-400 underline-offset-2 hover:text-red-600 hover:underline"
                >
                  Sign out
                </button>
              </span>
            )}
            {account ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                <span className="h-2 w-2 rounded-full bg-brand-500" />
                Account #{account.id}
                {account.ownerName ? ` · ${account.ownerName}` : ""}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                No account selected
              </span>
            )}
            <button
              type="button"
              onClick={onRefreshHealth}
              title="Re-check backend status"
              className="rounded-full transition hover:opacity-80"
            >
              <StatusBadge status={status} />
            </button>
          </div>
        </div>

        {/* About section — leave room here for more project explanation later. */}
        <div className="about mt-6 max-w-3xl space-y-3">
          <p className="text-sm leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-800">Ledger-Core</span> is
            a backend money-movement service built with Spring Boot and
            PostgreSQL. It demonstrates banking-style correctness guarantees such
            as atomic transactions, double-entry bookkeeping, idempotent
            transfers, concurrency-safe account updates, append-only ledger
            history, and automated balance reconciliation.
          </p>
          <p className="text-sm leading-relaxed text-slate-500">
            This is a learning and portfolio project focused on correctness under
            failure, not just CRUD.
          </p>
          {/* Add more project explanation paragraphs here as the project grows. */}

          {status === "waking" && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              The backend may be waking up. This can take 30–60 seconds after
              inactivity — thanks for your patience.
            </p>
          )}
          {lastCheckedAt && status === "online" && (
            <p className="text-xs text-slate-400">
              Backend last verified at{" "}
              {new Date(lastCheckedAt).toLocaleTimeString()}.
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
