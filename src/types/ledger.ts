/**
 * Shared API types for Ledger-Core.
 *
 * Money values are intentionally kept as `string` everywhere they cross the
 * wire (e.g. "100.00"). We never do floating-point math on money in the
 * frontend — the backend is always the source of truth for balances.
 */

/** A 3-letter currency code, e.g. "CAD", "USD". */
export type CurrencyCode = string;

/** Response shape from POST /api/accounts. */
export interface Account {
  id: number;
  ownerName: string;
  currency: CurrencyCode;
  /** Some backends include the opening balance; treated as optional. */
  balance?: string;
  createdAt?: string;
}

/** Request body for POST /api/accounts. */
export interface CreateAccountRequest {
  ownerName: string;
  currency: CurrencyCode;
}

/**
 * Response shape from GET /api/accounts/{id}/balance (and the body returned by
 * deposit/withdraw). Note: the live backend returns `balance` as a JSON number
 * (e.g. 1776.00). We accept string | number and only ever format it for
 * display — we never do arithmetic on it.
 */
export interface BalanceResponse {
  accountId: number;
  balance: string | number;
  currency: CurrencyCode;
}

/** Request body for deposit / withdraw. Amount stays a string. */
export interface AmountRequest {
  amount: string;
}

/** Request body for POST /api/transfers. */
export interface CreateTransferRequest {
  sourceAccountId: number;
  destinationAccountId: number;
  amount: string;
}

/**
 * Response shape from POST /api/transfers and GET /api/transfers/{id}.
 * The live backend uses `transferId`; we keep `id` too for forward-compat.
 * `amount` may arrive as a number — format for display only.
 */
export interface Transfer {
  transferId?: number | string;
  id?: number | string;
  sourceAccountId: number;
  destinationAccountId: number;
  amount: string | number;
  currency?: CurrencyCode;
  status?: string;
  createdAt?: string;
  [key: string]: unknown;
}

/** A single reconciliation break row. Extra fields are preserved. */
export interface ReconciliationBreak {
  accountId?: number;
  ledgerBalance?: string;
  storedBalance?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/** A single field-level validation error from the backend. */
export interface FieldError {
  field: string;
  message: string;
}

/** The consistent error envelope returned by the backend. */
export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  fieldErrors?: FieldError[];
}
