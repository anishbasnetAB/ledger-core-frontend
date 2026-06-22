import { apiClient } from "./client";
import type {
  Account,
  BalanceResponse,
  CreateAccountRequest,
  CreateTransferRequest,
  ReconciliationBreak,
  Transfer,
} from "../types/ledger";

/**
 * Typed wrappers around every Ledger-Core endpoint. This is the single place
 * that knows about backend paths and shapes — components call these functions
 * and never touch fetch directly.
 */
export const ledgerApi = {
  /** GET /api/health — liveness probe (used for the cold-start status badge). */
  health(signal?: AbortSignal): Promise<unknown> {
    return apiClient.get<unknown>("/health", { signal });
  },

  /** POST /api/accounts — create a new account. */
  createAccount(body: CreateAccountRequest): Promise<Account> {
    return apiClient.post<Account>("/accounts", body);
  },

  /** GET /api/accounts/{id}/balance — current balance for an account. */
  getBalance(accountId: number, signal?: AbortSignal): Promise<BalanceResponse> {
    return apiClient.get<BalanceResponse>(`/accounts/${accountId}/balance`, {
      signal,
    });
  },

  /** POST /api/accounts/{id}/deposit — credit an account. */
  deposit(accountId: number, amount: string): Promise<unknown> {
    return apiClient.post<unknown>(`/accounts/${accountId}/deposit`, { amount });
  },

  /** POST /api/accounts/{id}/withdraw — debit an account. */
  withdraw(accountId: number, amount: string): Promise<unknown> {
    return apiClient.post<unknown>(`/accounts/${accountId}/withdraw`, {
      amount,
    });
  },

  /**
   * POST /api/transfers — move money between accounts.
   * The idempotency key is sent as a header and should be reused on retry.
   */
  createTransfer(
    body: CreateTransferRequest,
    idempotencyKey: string,
  ): Promise<Transfer> {
    return apiClient.post<Transfer>("/transfers", body, {
      headers: { "Idempotency-Key": idempotencyKey },
    });
  },

  /** GET /api/transfers/{id} — look up a single transfer. */
  getTransfer(transferId: string): Promise<Transfer> {
    return apiClient.get<Transfer>(`/transfers/${encodeURIComponent(transferId)}`);
  },

  /** POST /api/admin/reconciliation/run — trigger a reconciliation sweep. */
  runReconciliation(): Promise<unknown> {
    return apiClient.post<unknown>("/admin/reconciliation/run");
  },

  /** GET /api/admin/reconciliation/breaks — list reconciliation breaks. */
  getReconciliationBreaks(): Promise<ReconciliationBreak[]> {
    return apiClient.get<ReconciliationBreak[]>("/admin/reconciliation/breaks");
  },
};
