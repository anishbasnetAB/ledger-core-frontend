import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ledgerApi } from "../api/ledgerApi";
import { useCurrentAccount } from "./useCurrentAccount";
import type { BalanceResponse } from "../types/ledger";
import { toFriendlyMessage } from "../utils/errors";

/**
 * Holds the current account's balance in one place so the dashboard and the
 * deposit/withdraw/transfer forms stay in sync. After any successful money
 * movement, call `refresh()` to pull the authoritative balance from the
 * backend — we never compute balances on the frontend.
 */
interface BalanceContextValue {
  balance: BalanceResponse | null;
  loading: boolean;
  error: string | null;
  lastRefreshedAt: string | null;
  refresh: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextValue | null>(null);

export function BalanceProvider({ children }: { children: ReactNode }) {
  const { account } = useCurrentAccount();
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);

  const accountId = account?.id ?? null;

  const refresh = useCallback(async () => {
    if (accountId == null) {
      setBalance(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await ledgerApi.getBalance(accountId);
      setBalance(data);
      setLastRefreshedAt(new Date().toISOString());
    } catch (err) {
      setBalance(null);
      setError(toFriendlyMessage(err));
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  // Auto-load whenever the selected account changes.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <BalanceContext.Provider
      value={{ balance, loading, error, lastRefreshedAt, refresh }}
    >
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance(): BalanceContextValue {
  const ctx = useContext(BalanceContext);
  if (!ctx) throw new Error("useBalance must be used within a BalanceProvider");
  return ctx;
}
