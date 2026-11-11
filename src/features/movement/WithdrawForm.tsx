import { ledgerApi } from "../../api/ledgerApi";
import { MovementForm } from "./MovementForm";

/** Withdraw from the current account. POST /api/accounts/{id}/withdraw */
export function WithdrawForm() {
  return (
    <MovementForm
      kind="withdraw"
      action={(id, amount, key) => ledgerApi.withdraw(id, amount, key)}
      submitLabel="Withdraw"
      helperText=""
    />
  );
}
