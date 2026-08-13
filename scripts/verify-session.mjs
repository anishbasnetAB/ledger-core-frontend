// Framework-free smoke test for src/api/session.ts's storage guards.
// Run: node scripts/verify-session.mjs
// No test runner in this project yet — this is a plain assert script, not a
// suite. Add vitest if/when more of the app needs real test coverage.
import assert from "node:assert/strict";

// Minimal in-memory localStorage shim so the module's try/catch paths run
// exactly as they do in a browser, without needing jsdom.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => void store.set(k, v),
  removeItem: (k) => void store.delete(k),
};

const { loadSession, saveSession, clearSession } = await import(
  "../src/api/session.ts"
);

// No session yet.
assert.equal(loadSession(), null);

// Round-trip a real session.
const session = { token: "abc.def.ghi", email: "a@b.com", role: "ADMIN" };
saveSession(session);
assert.deepEqual(loadSession(), session);

// Malformed JSON in storage must not throw — treated as no session.
store.set("ledger-core.session", "{not json");
assert.equal(loadSession(), null);

// Valid JSON but missing a token must also be rejected.
store.set("ledger-core.session", JSON.stringify({ email: "a@b.com" }));
assert.equal(loadSession(), null);

clearSession();
assert.equal(loadSession(), null);

console.log("verify-session: all checks passed");
