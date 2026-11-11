import { useState, type FormEvent } from "react";
import { ledgerApi } from "../../api/ledgerApi";
import { useCurrentAccount } from "../../hooks/useCurrentAccount";
import { useBalance } from "../../hooks/useBalance";
import { useToast } from "../../components/Toast";
import { MoneyInput } from "../../components/MoneyInput";
import { LoadingButton } from "../../components/LoadingButton";
import { ErrorMessage } from "../../components/ErrorMessage";
import { formatMoneyDisplay, normalizeMoney, validateMoney } from "../../utils/money";
import { ApiError, fieldErrorFor, toFriendlyMessage } from "../../utils/errors";
import { generateIdempotencyKey } from "../../utils/idempotency";
import type { Transfer } from "../../types/ledger";

/**
 * Move money between accounts.
 *
 * Idempotency-Key lifecycle:
 *  - One key is generated up front for the current transfer attempt.
 *  - A failed/uncertain attempt keeps the SAME key so "Retry" is safe — the
 *    backend will not double-apply the transfer.
 *  - A completed transfer rotates to a FRESH key for the next, distinct transfer.
 */
export function TransferForm() {
  const { account } = useCurrentAccount();
  const { refresh } = useBalance();
  const toast = useToast();

  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(generateIdempotencyKey);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [clientError, setClientError] = useState<string | undefined>();
  const [result, setResult] = useState<Transfer | null>(null);
  /** True once an attempt has failed — enables the same-key retry button. */
  const [canRetry, setCanRetry] = useState(false);

  const disabled = !account;

  function rotateKey() {
    setIdempotencyKey(generateIdempotencyKey());
  }

  async function submitTransfer() {
    if (!account) return;
    setError(null);
    setClientError(undefined);

    const destId = Number(destination.trim());
    if (!Number.isInteger(destId) || destId <= 0) {
      setClientError("Enter a valid destination account ID.");
      return;
    }
    if (destId === account.id) {
      setClientError("Destination must be different from the source account.");
      return;
    }
    const validation = validateMoney(amount);
    if (!validation.valid) {
      setError({ fieldErrors: [{ field: "amount", message: validation.error }] });
      return;
    }

    const normalized = normalizeMoney(amount);
    setSubmitting(true);
    try {
      const transfer = await ledgerApi.createTransfer(
        {
          sourceAccountId: account.id,
          destinationAccountId: destId,
          amount: normalized,
        },
        idempotencyKey,
      );
      setResult(transfer);
      setCanRetry(false);
      await refresh();
      toast.show(`Transferred ${normalized} to account #${destId}.`);
      // Completed → rotate to a fresh key and clear the form for the next one.
      rotateKey();
      setAmount("");
      setDestination("");
    } catch (err) {
      setError(err);
      setResult(null);
      // Keep the same key so the user can safely retry the same transfer.
      setCanRetry(true);
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void submitTransfer();
  }

  const amountError =
    fieldErrorFor(error, "amount") ??
    (clientError && clientError.includes("amount") ? clientError : undefined);
  const destError =
    fieldErrorFor(error, "destinationAccountId") ??
    (clientError && !clientError.includes("amount") ? clientError : undefined);

  const bannerError =
    error && !fieldErrorFor(error, "amount") && !destError
      ? bannerForError(error)
      : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-ui-50 px-4 py-3 text-sm">
        <span className="text-ui-500">Source account: </span>
        {account ? (
          <span className="font-semibold text-ui-900">#{account.id}</span>
        ) : (
          <span className="text-ui-400">none selected</span>
        )}
      </div>

      <div>
        <label htmlFor="destination" className="label-base">
          Destination account ID
        </label>
        <input
          id="destination"
          type="text"
          inputMode="numeric"
          className={`input-base ${destError ? "input-error" : ""}`}
          placeholder="e.g. 2"
          value={destination}
          onChange={(e) => {
            setDestination(e.target.value.replace(/[^\d]/g, ""));
            if (clientError) setClientError(undefined);
          }}
          disabled={disabled || submitting}
        />
        <ErrorMessage message={destError} variant="inline" />
      </div>

      <MoneyInput
        label="Amount"
        value={amount}
        onChange={(v) => {
          setAmount(v);
          if (error) setError(null);
        }}
        onBlur={() => {
          if (amount && validateMoney(amount).valid) {
            setAmount(normalizeMoney(amount));
          }
        }}
        error={amountError}
        disabled={disabled || submitting}
      />

      {/* Idempotency key visibility — useful for a correctness-focused project. */}
      <div className="flex items-center justify-between rounded-lg border border-ui-200 bg-white px-3 py-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-ui-500">Idempotency-Key</p>
          <p className="truncate font-mono text-xs text-ui-700" title={idempotencyKey}>
            {idempotencyKey}
          </p>
        </div>
        <button
          type="button"
          onClick={rotateKey}
          disabled={submitting}
          className="ml-3 shrink-0 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
          title="Generate a new key (starts a brand-new transfer)"
        >
          New key
        </button>
      </div>

      <ErrorMessage message={bannerError} />

      <div className="flex gap-2">
        <LoadingButton
          type="submit"
          loading={submitting}
          disabled={disabled || !destination || !amount}
          className="flex-1"
        >
          Send transfer
        </LoadingButton>
        {canRetry && (
          <LoadingButton
            type="button"
            variant="secondary"
            loading={submitting}
            onClick={() => void submitTransfer()}
            title="Retry safely with the same idempotency key"
          >
            Retry
          </LoadingButton>
        )}
      </div>

      {disabled && (
        <p className="text-center text-xs text-ui-400">
          Select an account first.
        </p>
      )}

      {result && (
        <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
          <p className="font-semibold">Transfer complete</p>
          <p className="mt-1 text-xs">
            ID #{String(result.transferId ?? result.id ?? "—")};{" "}
            {formatMoneyDisplay(result.amount)}
            {result.status ? `, ${result.status}` : ""}
          </p>
        </div>
      )}
    </form>
  );
}

/** Map transfer-specific statuses to clear, contextual messages. */
function bannerForError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return "This idempotency key was already used for a different transfer. Click “New key” to start a fresh transfer.";
    }
    if (error.status === 422) {
      return `Transfer rejected: ${error.message || "insufficient funds, currency mismatch, or a business rule was violated."}`;
    }
  }
  return toFriendlyMessage(error);
}
