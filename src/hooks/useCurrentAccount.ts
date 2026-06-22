import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * The "current account" is the account the console is acting as. There is no
 * real auth yet, so this is simply a selected account id plus a little known
 * metadata (owner/currency) that we cache for nicer display.
 *
 * State lives in React context and is mirrored to localStorage so a refresh
 * does not lose the selection. When real auth arrives, this provider can be
 * swapped for a session-backed one without touching consumers.
 */

export interface CurrentAccountInfo {
  id: number;
  ownerName?: string;
  currency?: string;
}

interface CurrentAccountContextValue {
  account: CurrentAccountInfo | null;
  setAccount: (account: CurrentAccountInfo) => void;
  clearAccount: () => void;
}

const STORAGE_KEY = "ledger-core.currentAccount";

const CurrentAccountContext = createContext<CurrentAccountContextValue | null>(
  null,
);

function loadInitial(): CurrentAccountInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CurrentAccountInfo;
    return typeof parsed?.id === "number" ? parsed : null;
  } catch {
    return null;
  }
}

export function CurrentAccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccountState] = useState<CurrentAccountInfo | null>(
    loadInitial,
  );

  useEffect(() => {
    try {
      if (account) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors (e.g. private mode) — state still works in-memory.
    }
  }, [account]);

  const setAccount = useCallback((next: CurrentAccountInfo) => {
    setAccountState(next);
  }, []);

  const clearAccount = useCallback(() => setAccountState(null), []);

  const value = useMemo(
    () => ({ account, setAccount, clearAccount }),
    [account, setAccount, clearAccount],
  );

  return createElement(CurrentAccountContext.Provider, { value }, children);
}

export function useCurrentAccount(): CurrentAccountContextValue {
  const ctx = useContext(CurrentAccountContext);
  if (!ctx) {
    throw new Error(
      "useCurrentAccount must be used within a CurrentAccountProvider",
    );
  }
  return ctx;
}
