import { useState, type FormEvent } from "react";
import { useCurrentAccount } from "../../hooks/useCurrentAccount";
import { useBalance } from "../../hooks/useBalance";
import { useToast } from "../../components/Toast";
import { MoneyInput } from "../../components/MoneyInput";
import { LoadingButton } from "../../components/LoadingButton";
import { ErrorMessage } from "../../components/ErrorMessage";
import { normalizeMoney, validateMoney } from "../../utils/money";
import { ApiError, fieldErrorFor, toFriendlyMessage } from "../../utils/errors";
import { generateIdempotencyKey } from "../../utils/idempotency";

interface MovementFormProps {
  /** "deposit" or "withdraw". */
  kind: "deposit" | "withdraw";
  /** Calls the matching ledgerApi endpoint. */
  action: (accountId: number, amount: string, idempotencyKey: string) => Promise<unknown>;
  submitLabel: string;
  helperText: string;
}

/**
 * Shared form for deposit and withdraw — same shape, different endpoint.
 * Amounts are kept as strings and normalized to two decimals before submit.
 * On success the shared balance is refreshed from the backend.
 */
export function MovementForm({
  kind,
  action,
  submitLabel,
  helperText,
}: MovementFormProps) {
  const { account } = useCurrentAccount();
  const { refresh } = useBalance();
  const toast = useToast();

  const [amount, setAmount] = useState("");
  const [clientError, setClientError] = useState<string | undefined>();
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(generateIdempotencyKey);
  const [attemptSignature, setAttemptSignature] = useState<string | null>(null);

  const disabled = !account;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setClientError(undefined);

    if (!account) return;

    const validation = validateMoney(amount);
    if (!validation.valid) {
      setClientError(validation.error);
      return;
    }

    const normalized = normalizeMoney(amount);
    const signature = `${account.id}:${normalized}`;
    const key = attemptSignature === signature
      ? idempotencyKey
      : generateIdempotencyKey();
    if (attemptSignature !== signature) {
      setAttemptSignature(signature);
      setIdempotencyKey(key);
    }
    setSubmitting(true);
    try {
      await action(account.id, normalized, key);
      await refresh();
      toast.show(
        `${kind === "deposit" ? "Deposited" : "Withdrew"} ${normalized} ${
          account.currency ?? ""
        }`.trim() + ".",
      );
      setAmount("");
      setAttemptSignature(null);
      setIdempotencyKey(generateIdempotencyKey());
    } catch (err) {
      setError(err);
      // Surface insufficient-funds (422) prominently for withdrawals.
      if (err instanceof ApiError && err.status === 422) {
        toast.show(toFriendlyMessage(err), "error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const amountFieldError = fieldErrorFor(error, "amount") ?? clientError;
  const bannerError =
    error && !fieldErrorFor(error, "amount") ? toFriendlyMessage(error) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <MoneyInput
        label="Amount"
        value={amount}
        onChange={(v) => {
          setAmount(v);
          if (clientError) setClientError(undefined);
        }}
        onBlur={() => {
          if (amount && validateMoney(amount).valid) {
            setAmount(normalizeMoney(amount));
          }
        }}
        error={amountFieldError}
        helperText={helperText}
        disabled={disabled || submitting}
      />

      <ErrorMessage message={bannerError} />

      <LoadingButton
        type="submit"
        loading={submitting}
        variant={kind === "withdraw" ? "secondary" : "primary"}
        disabled={disabled || !amount}
        className="w-full"
      >
        {submitLabel}
      </LoadingButton>

      {disabled && (
        <p className="text-center text-xs text-ui-400">
          Select an account first.
        </p>
      )}
    </form>
  );
}
