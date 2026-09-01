import { ledgerApi } from "../../api/ledgerApi";
import { MovementForm } from "./MovementForm";

/** Withdraw from the current account. POST /api/accounts/{id}/withdraw */
export function WithdrawForm() {
  return (
    <MovementForm
      kind="withdraw"
      action={(id, amount) => ledgerApi.withdraw(id, amount)}
      submitLabel="Withdraw"
      helperText=""
    />
  );
}
