import { useCurrentAccount } from "../../hooks/useCurrentAccount";
import { useBalance } from "../../hooks/useBalance";
import { LoadingButton } from "../../components/LoadingButton";
import { ErrorMessage } from "../../components/ErrorMessage";
import { formatMoneyDisplay } from "../../utils/money";

/**
 * Read-only summary of the selected account: ID, balance and currency, plus a
 * refresh control and the time of the last refresh.
 */
export function AccountDashboard() {
  const { account } = useCurrentAccount();
  const { balance, loading, error, lastRefreshedAt, refresh } = useBalance();

  if (!account) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
        <p className="text-sm font-medium text-slate-600">
          Select an account to view balance.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Create an account or enter an existing account ID to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-brand-200">
            Available balance
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium">
            Account #{account.id}
          </span>
        </div>

        <div className="mt-3 min-h-[2.5rem]">
          {loading && !balance ? (
            <div className="h-9 w-44 animate-pulse rounded bg-white/20" />
          ) : balance ? (
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold tracking-tight">
                {formatMoneyDisplay(balance.balance)}
              </span>
              <span className="text-lg font-medium text-brand-200">
                {balance.currency}
              </span>
            </div>
          ) : (
            <span className="text-2xl font-semibold text-brand-200">—</span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-brand-200">
          <span>
            {lastRefreshedAt
              ? `Last refreshed ${new Date(lastRefreshedAt).toLocaleTimeString()}`
              : "Not refreshed yet"}
          </span>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 font-medium text-white transition hover:bg-white/20 disabled:opacity-50"
          >
            <svg
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 11-2.64-6.36M21 3v6h-6" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
          <dt className="text-xs text-slate-500">Account ID</dt>
          <dd className="mt-0.5 font-mono font-semibold text-slate-900">
            #{account.id}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
          <dt className="text-xs text-slate-500">Currency</dt>
          <dd className="mt-0.5 font-semibold text-slate-900">
            {balance?.currency ?? account.currency ?? "—"}
          </dd>
        </div>
      </div>

      {/* Hidden control kept for keyboard users / explicit re-fetch. */}
      <LoadingButton
        variant="ghost"
        loading={loading}
        onClick={() => void refresh()}
        className="w-full"
      >
        Refresh balance
      </LoadingButton>
    </div>
  );
}
