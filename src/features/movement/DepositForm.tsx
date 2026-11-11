import { ledgerApi } from "../../api/ledgerApi";
import { MovementForm } from "./MovementForm";

/** Deposit into the current account. POST /api/accounts/{id}/deposit */
export function DepositForm() {
  return (
    <MovementForm
      kind="deposit"
      action={(id, amount, key) => ledgerApi.deposit(id, amount, key)}
      submitLabel="Deposit"
      helperText="Examples: 100, 100.5, 100.50. Credited to your account."
    />
  );
}
