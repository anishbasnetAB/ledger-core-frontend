/**
 * Session (JWT) storage. Kept separate from the auth React context so the
 * plain API client (client.ts) can read/clear it without depending on React.
 */

export interface Session {
  token: string;
  email: string;
  role: "USER" | "ADMIN";
}

const STORAGE_KEY = "ledger-core.session";

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    return typeof parsed?.token === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage errors (e.g. private mode) — session still works in-memory.
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
