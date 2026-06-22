import { useState, type FormEvent } from "react";
import { ledgerApi } from "../../api/ledgerApi";
import { useCurrentAccount } from "../../hooks/useCurrentAccount";
import { useToast } from "../../components/Toast";
import { LoadingButton } from "../../components/LoadingButton";
import { ErrorMessage } from "../../components/ErrorMessage";
import { ApiError, fieldErrorFor, toFriendlyMessage } from "../../utils/errors";

const COMMON_CURRENCIES = ["CAD", "USD", "EUR", "GBP"];

/**
 * Create a new account, then auto-select it as the current account.
 * There is no auth — this is just provisioning an account to act as.
 */
export function AccountCreate() {
  const { setAccount } = useCurrentAccount();
  const toast = useToast();

  const [ownerName, setOwnerName] = useState("");
  const [currency, setCurrency] = useState("CAD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCreatedId(null);

    if (!ownerName.trim()) {
      setError(new Error("Owner name is required."));
      return;
    }

    setSubmitting(true);
    try {
      const account = await ledgerApi.createAccount({
        ownerName: ownerName.trim(),
        currency: currency.trim().toUpperCase(),
      });
      setCreatedId(account.id);
      setAccount({
        id: account.id,
        ownerName: account.ownerName ?? ownerName.trim(),
        currency: account.currency ?? currency,
      });
      toast.show(`Account #${account.id} created and selected.`);
      setOwnerName("");
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  const nameError = fieldErrorFor(error, "ownerName");
  const currencyError = fieldErrorFor(error, "currency");

  // The deployed backend currently has no create-account endpoint (404).
  // Guide the user to the selector instead of showing a bare "Not found".
  let bannerError: string | null = null;
  if (error && !nameError && !currencyError) {
    bannerError =
      error instanceof ApiError && error.status === 404
        ? "Account creation isn't available on the backend yet. Use “Select an existing account” to enter an account ID (e.g. 1) and begin."
        : toFriendlyMessage(error);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="ownerName" className="label-base">
          Owner name
        </label>
        <input
          id="ownerName"
          type="text"
          className={`input-base ${nameError ? "input-error" : ""}`}
          placeholder="e.g. Alice"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          disabled={submitting}
        />
        <ErrorMessage message={nameError} variant="inline" />
      </div>

      <div>
        <label htmlFor="currency" className="label-base">
          Currency
        </label>
        <select
          id="currency"
          className={`input-base ${currencyError ? "input-error" : ""}`}
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          disabled={submitting}
        >
          {COMMON_CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <p className="helper-text">3-letter currency code. Defaults to CAD.</p>
        <ErrorMessage message={currencyError} variant="inline" />
      </div>

      <ErrorMessage message={bannerError} />

      <LoadingButton type="submit" loading={submitting} disabled={!ownerName.trim()}>
        Create account
      </LoadingButton>

      {createdId !== null && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          Created account ID <span className="font-mono">#{createdId}</span> — now
          selected as your current account.
        </p>
      )}
    </form>
  );
}
