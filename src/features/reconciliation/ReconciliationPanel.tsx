import { useState } from "react";
import { ledgerApi } from "../../api/ledgerApi";
import { useToast } from "../../components/Toast";
import { LoadingButton } from "../../components/LoadingButton";
import { ErrorMessage } from "../../components/ErrorMessage";
import { toFriendlyMessage } from "../../utils/errors";
import { formatMoneyDisplay } from "../../utils/money";
import type { ReconciliationBreak } from "../../types/ledger";

/** Money-valued columns get formatted through formatMoneyDisplay instead of raw String(). */
const MONEY_COLUMNS = new Set(["ledgerDerivedBalance", "storedBalance"]);

/**
 * Columns we render with friendly labels. The table also renders any extra
 * fields the API returns, so it adapts if the backend shape changes.
 */
const COLUMNS: { key: string; label: string }[] = [
  { key: "id", label: "Break ID" },
  { key: "accountId", label: "Account ID" },
  { key: "ledgerDerivedBalance", label: "Ledger balance" },
  { key: "storedBalance", label: "Stored balance" },
  { key: "status", label: "Status" },
  { key: "detectedAt", label: "Detected" },
  { key: "lastDetectedAt", label: "Last detected" },
  { key: "resolvedAt", label: "Resolved" },
];

/** Admin tools: trigger a reconciliation sweep and view detected breaks. */
export function ReconciliationPanel() {
  const toast = useToast();

  const [running, setRunning] = useState(false);
  const [loadingBreaks, setLoadingBreaks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [breaks, setBreaks] = useState<ReconciliationBreak[] | null>(null);

  async function runSweep() {
    setError(null);
    setRunning(true);
    try {
      await ledgerApi.runReconciliation();
      toast.show("Reconciliation sweep started.");
      await loadBreaks();
    } catch (err) {
      setError(toFriendlyMessage(err));
    } finally {
      setRunning(false);
    }
  }

  async function loadBreaks() {
    setError(null);
    setLoadingBreaks(true);
    try {
      const data = await ledgerApi.getReconciliationBreaks();
      setBreaks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(toFriendlyMessage(err));
    } finally {
      setLoadingBreaks(false);
    }
  }

  // Build the column set: known columns first, then any unexpected extras.
  const extraColumns =
    breaks && breaks.length
      ? Array.from(
          new Set(breaks.flatMap((b) => Object.keys(b))),
        ).filter((k) => !COLUMNS.some((c) => c.key === k))
      : [];
  const allColumns = [
    ...COLUMNS,
    ...extraColumns.map((k) => ({ key: k, label: k })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <LoadingButton loading={running} onClick={() => void runSweep()}>
          Run reconciliation sweep
        </LoadingButton>
        <LoadingButton
          variant="secondary"
          loading={loadingBreaks}
          onClick={() => void loadBreaks()}
        >
          Refresh breaks
        </LoadingButton>
      </div>

      <ErrorMessage message={error} />

      {breaks === null ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500">
          Run a sweep or refresh to load reconciliation breaks.
        </div>
      ) : breaks.length === 0 ? (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-6 py-8 text-center">
          <p className="text-sm font-semibold text-brand-800">
            No reconciliation breaks found.
          </p>
          <p className="mt-1 text-xs text-brand-700">
            Ledger-derived balances match stored balances.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {allColumns.map((c) => (
                  <th
                    key={c.key}
                    className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {breaks.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  {allColumns.map((c) => (
                    <td
                      key={c.key}
                      className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-slate-700"
                    >
                      {c.key === "status" ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            row.status === "OPEN"
                              ? "bg-red-50 text-red-700"
                              : "bg-brand-50 text-brand-800"
                          }`}
                        >
                          {formatCell(row.status)}
                        </span>
                      ) : MONEY_COLUMNS.has(c.key) ? (
                        formatMoneyDisplay(row[c.key] as string | number | undefined)
                      ) : (
                        formatCell(row[c.key])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
