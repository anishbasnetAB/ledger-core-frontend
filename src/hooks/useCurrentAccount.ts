import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./useAuth";

/**
 * The "current account" is the account the console is acting as, scoped to the
 * signed-in user so one user's selection cannot leak into another session.
 *
 * State lives in React context and is mirrored to a user-scoped localStorage
 * entry so a refresh does not lose the selection.
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

function loadStored(storageKey: string | null): CurrentAccountInfo | null {
  if (!storageKey) return null;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CurrentAccountInfo;
    return typeof parsed?.id === "number" ? parsed : null;
  } catch {
    return null;
  }
}

export function CurrentAccountProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const storageKey = session
    ? `${STORAGE_KEY}:${session.email.toLowerCase()}`
    : null;
  const [account, setAccountState] = useState<CurrentAccountInfo | null>(
    () => loadStored(storageKey),
  );
  const persistedKey = useRef(storageKey);

  useEffect(() => {
    setAccountState(loadStored(storageKey));
  }, [storageKey]);

  useEffect(() => {
    // A session switch loads the new user's account in the effect above. Do
    // not persist the previous user's in-memory selection under the new key.
    if (persistedKey.current !== storageKey) {
      persistedKey.current = storageKey;
      return;
    }
    if (!storageKey) return;
    try {
      if (account) {
        localStorage.setItem(storageKey, JSON.stringify(account));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {
      // Ignore storage errors (e.g. private mode) — state still works in-memory.
    }
  }, [account, storageKey]);

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
