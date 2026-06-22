import { useState, type FormEvent } from "react";
import { ledgerApi } from "../../api/ledgerApi";
import { LoadingButton } from "../../components/LoadingButton";
import { ErrorMessage } from "../../components/ErrorMessage";
import { ApiError, toFriendlyMessage } from "../../utils/errors";
import { formatMoneyDisplay } from "../../utils/money";
import type { Transfer } from "../../types/ledger";

/** Fields we render with friendly labels; everything else is shown generically. */
const KNOWN_FIELDS: { key: keyof Transfer; label: string }[] = [
  { key: "transferId", label: "Transfer ID" },
  { key: "id", label: "Transfer ID" },
  { key: "sourceAccountId", label: "Source account" },
  { key: "destinationAccountId", label: "Destination account" },
  { key: "amount", label: "Amount" },
  { key: "currency", label: "Currency" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created" },
];

/** Look up a single transfer by ID. GET /api/transfers/{id} */
export function TransferLookup() {
  const [idInput, setIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transfer, setTransfer] = useState<Transfer | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setTransfer(null);

    const id = idInput.trim();
    if (!id) {
      setError("Enter a transfer ID.");
      return;
    }

    setLoading(true);
    try {
      const result = await ledgerApi.getTransfer(id);
      setTransfer(result);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError(`No transfer found with ID “${id}”.`);
      } else {
        setError(toFriendlyMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="transferId" className="label-base">
            Transfer ID
          </label>
          <div className="flex gap-2">
            <input
              id="transferId"
              type="text"
              inputMode="numeric"
              className={`input-base ${error ? "input-error" : ""}`}
              placeholder="e.g. 42"
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              disabled={loading}
            />
            <LoadingButton
              type="submit"
              loading={loading}
              variant="secondary"
              disabled={!idInput.trim()}
            >
              Fetch
            </LoadingButton>
          </div>
        </div>
        <ErrorMessage message={error} variant="inline" />
      </form>

      {transfer && (
        <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {KNOWN_FIELDS.filter((f) => transfer[f.key] !== undefined).map((f) => (
            <div
              key={String(f.key)}
              className="flex items-center justify-between gap-4 px-4 py-2.5"
            >
              <dt className="text-xs font-medium text-slate-500">{f.label}</dt>
              <dd className="font-mono text-sm text-slate-900">
                {f.key === "amount"
                  ? formatMoneyDisplay(transfer.amount)
                  : String(transfer[f.key])}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
