import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { loadSession, saveSession, clearSession, type Session } from "../api/session";

/**
 * Session state for the signed-in user. Every endpoint except health/register/
 * login requires this token, so the whole app gates on it (see App.tsx's
 * <Gate>). Mirrored to localStorage so a refresh doesn't sign the user out.
 */
interface AuthContextValue {
  session: Session | null;
  /** True when the session was just cleared automatically after a 401 (token expired/revoked). */
  expired: boolean;
  setSession: (session: Session) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(loadSession);
  const [expired, setExpired] = useState(false);

  // The API client fires this when any authenticated request comes back 401.
  useEffect(() => {
    function onUnauthorized() {
      setSessionState((prev) => {
        if (prev) setExpired(true);
        return null;
      });
    }
    window.addEventListener("ledger-core:unauthorized", onUnauthorized);
    return () =>
      window.removeEventListener("ledger-core:unauthorized", onUnauthorized);
  }, []);

  const setSession = useCallback((next: Session) => {
    saveSession(next);
    setSessionState(next);
    setExpired(false);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSessionState(null);
    setExpired(false);
  }, []);

  return (
    <AuthContext.Provider value={{ session, expired, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
