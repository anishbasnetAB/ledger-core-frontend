import { useState, type FormEvent } from "react";
import { ledgerApi } from "../../api/ledgerApi";
import { useCurrentAccount } from "../../hooks/useCurrentAccount";
import { useToast } from "../../components/Toast";
import { LoadingButton } from "../../components/LoadingButton";
import { ErrorMessage } from "../../components/ErrorMessage";
import { fieldErrorFor, toFriendlyMessage } from "../../utils/errors";

const DEMO_CURRENCY = "CAD";

/** Create a new account, then auto-select it as the current account. */
export function AccountCreate() {
  const { setAccount } = useCurrentAccount();
  const toast = useToast();

  const [ownerName, setOwnerName] = useState("");
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
        currency: DEMO_CURRENCY,
      });
      setCreatedId(account.id);
      setAccount({
        id: account.id,
        ownerName: account.ownerName ?? ownerName.trim(),
        currency: account.currency ?? DEMO_CURRENCY,
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
  const bannerError =
    error && !nameError && !currencyError ? toFriendlyMessage(error) : null;

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
        <input
          id="currency"
          type="text"
          className={`input-base ${currencyError ? "input-error" : ""}`}
          value={DEMO_CURRENCY}
          readOnly
          disabled={submitting}
        />
        <p className="helper-text">CAD only for the demo.</p>
        <ErrorMessage message={currencyError} variant="inline" />
      </div>

      <ErrorMessage message={bannerError} />

      <LoadingButton type="submit" loading={submitting} disabled={!ownerName.trim()}>
        Create account
      </LoadingButton>

      {createdId !== null && (
        <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-800">
          Created account ID <span className="font-mono">#{createdId}</span> and is now
          selected as your current account.
        </p>
      )}
    </form>
  );
}
