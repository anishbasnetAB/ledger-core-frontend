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

export function AppHeader({ status, lastCheckedAt, onRefreshHealth, account, session, onLogout }: AppHeaderProps) {
  return (
    <header className="workspace-header">
      <div className="workspace-width px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="brand-mark flex h-12 w-12 shrink-0 items-center justify-center" aria-hidden="true">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M4 10h16M5 10l7-5 7 5M6 10v8M18 10v8M10 10v8M14 10v8" />
              </svg>
            </span>
            <div className="min-w-0">
              <h1 className="brand-name">Ledger-Core</h1>
              <p className="brand-subtitle">Money-movement console</p>
            </div>
          </div>
          <div className="header-tools flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="account-context">
              <span className="context-label">Current account</span>
              <span className="context-value">{account ? `#${account.id}${account.ownerName ? ` (${account.ownerName})` : ""}` : "None selected"}</span>
            </div>
            <button type="button" onClick={onRefreshHealth} title="Re-check backend status" aria-label="Re-check backend status" className="health-action">
              <StatusBadge status={status} />
            </button>
            {session && <div className="user-context">
              <span className="user-email">{session.email}</span>
              {session.role === "ADMIN" && <span className="admin-label">Admin</span>}
              <button type="button" onClick={onLogout} className="signout-action">Sign out</button>
            </div>}
          </div>
        </div>
        <div className="header-meta">
          <details className="about-details">
            <summary>About this project</summary>
            <div className="about-copy">
              <p><strong>Ledger-Core</strong> is a production-style money movement platform built with Java, Spring Boot, and PostgreSQL, focused on transaction safety, data integrity, and reliable financial operations.</p>
              <p>It supports secure account management and transfers with JWT authentication, ACID transactions, optimistic locking, idempotency, double-entry bookkeeping, and an immutable ledger. The system also includes automated reconciliation, Redis caching and rate limiting, and Kafka-based event processing with idempotent consumers.</p>
            </div>
          </details>
          {status === "waking" && <p className="service-notice">The backend may be waking up. This can take 30 to 60 seconds after inactivity.</p>}
          {lastCheckedAt && status === "online" && <p className="health-time">Backend verified {new Date(lastCheckedAt).toLocaleTimeString()}.</p>}
        </div>
      </div>
    </header>
  );
}
