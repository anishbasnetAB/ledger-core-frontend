import { useState, type FormEvent } from "react";
import { ledgerApi } from "../../api/ledgerApi";
import { useCurrentAccount } from "../../hooks/useCurrentAccount";
import { useToast } from "../../components/Toast";
import { LoadingButton } from "../../components/LoadingButton";
import { ErrorMessage } from "../../components/ErrorMessage";
import { toFriendlyMessage } from "../../utils/errors";

/**
 * Select an existing account by ID. We verify the ID by fetching its balance
 * before selecting, so the user gets immediate feedback if it doesn't exist.
 */
export function AccountSelector() {
  const { account, setAccount, clearAccount } = useCurrentAccount();
  const toast = useToast();

  const [idInput, setIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const id = Number(idInput.trim());
    if (!Number.isInteger(id) || id <= 0) {
      setError("Enter a valid numeric account ID.");
      return;
    }

    setLoading(true);
    try {
      // Confirm the account exists (and grab its currency) before selecting.
      const balance = await ledgerApi.getBalance(id);
      setAccount({ id, currency: balance.currency });
      toast.show(`Switched to account #${id}.`);
      setIdInput("");
    } catch (err) {
      setError(toFriendlyMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="accountId" className="label-base">
            Existing account ID
          </label>
          <div className="flex gap-2">
            <input
              id="accountId"
              type="text"
              inputMode="numeric"
              className={`input-base ${error ? "input-error" : ""}`}
              placeholder="e.g. 1"
              value={idInput}
              onChange={(e) => setIdInput(e.target.value.replace(/[^\d]/g, ""))}
              disabled={loading}
            />
            <LoadingButton
              type="submit"
              loading={loading}
              variant="secondary"
              disabled={!idInput.trim()}
            >
              Select
            </LoadingButton>
          </div>
          <p className="helper-text">
            We verify the ID against the backend before selecting it.
          </p>
        </div>
        <ErrorMessage message={error} variant="inline" />
      </form>

      {account && (
        <div className="flex items-center justify-between rounded-lg border border-ui-200 bg-ui-50 px-4 py-3">
          <div className="text-sm">
            <span className="text-ui-500">Current account: </span>
            <span className="font-semibold text-ui-900">#{account.id}</span>
            {account.ownerName && (
              <span className="text-ui-500"> · {account.ownerName}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              clearAccount();
              toast.show("Cleared current account.", "info");
            }}
            className="text-xs font-medium text-ui-500 underline-offset-2 hover:text-red-600 hover:underline"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
