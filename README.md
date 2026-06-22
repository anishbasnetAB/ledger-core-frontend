# Ledger-Core — Frontend Console

A clean, modern banking-style frontend for the **Ledger-Core** backend (a
Spring Boot + PostgreSQL money-movement service). It behaves as an **account
console**: pick an account to act as, then deposit, withdraw, transfer, look up
transfers, and run reconciliation.

> This is a learning/portfolio frontend focused on correctness under failure —
> idempotent transfers, string-based money handling, and graceful cold-start UX.

---

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check (tsc --noEmit) + production build to /dist
npm run preview  # serve the production build locally
npm run lint     # type-check only
```

Requires Node 18+ (developed on Node 24).

## Configure the backend URL

The base URL is read from an environment variable, falling back to the hosted
Render backend if unset.

1. Copy `.env.example` to `.env`.
2. Set:

   ```env
   VITE_API_BASE_URL=https://ledger-core.onrender.com
   ```

Resolution order lives in **`src/api/client.ts`**:
`VITE_API_BASE_URL` → fallback `https://ledger-core.onrender.com`. All requests
are sent to `${BASE}/api/...`.

> **Cold starts:** Render spins the backend down when idle, so the first request
> can take 30–60s. The status badge shows a **"Waking up…"** state and the
> about section explains the wait. The health check allows up to ~70s before
> reporting offline.

## Where the code lives

| Area | Path |
| --- | --- |
| **API client (fetch, errors, base URL)** | `src/api/client.ts` |
| **Typed endpoint wrappers** | `src/api/ledgerApi.ts` |
| Domain types | `src/types/ledger.ts` |
| Money validation/formatting | `src/utils/money.ts` |
| Typed API errors + friendly messages | `src/utils/errors.ts` |
| Idempotency-key generation | `src/utils/idempotency.ts` |
| Current-account state (+ localStorage) | `src/hooks/useCurrentAccount.ts` |
| Shared balance state | `src/hooks/useBalance.tsx` |
| Health/cold-start polling | `src/hooks/useLedgerHealth.ts` |
| Reusable UI | `src/components/` |
| Features (account, movement, transfers, reconciliation, auth) | `src/features/` |
| App shell + tab navigation | `src/App.tsx` |

The two files to read first for API work are `src/api/client.ts` and
`src/api/ledgerApi.ts`.

## How to add real auth later

The app was built so auth can drop in without a rewrite:

1. **Session source.** Replace `CurrentAccountProvider` in
   `src/hooks/useCurrentAccount.ts` with one backed by a real session (the
   logged-in user's account). Consumers call `useCurrentAccount()` and won't
   change.
2. **Login UI.** Swap `src/features/auth/FutureAuthPanel.tsx` (currently a
   disabled placeholder) for a real login/register form.
3. **Auth headers.** `apiClient` already supports custom headers (see the
   `Idempotency-Key` usage). Add an `Authorization` header centrally in
   `src/api/client.ts` (e.g. read a token from the session).
4. **Protected routes.** Gate tabs in `src/App.tsx` behind the session.

## What it does (feature map)

- **Account** — create an account (`POST /api/accounts`) and/or select an
  existing account by ID; selection persists in `localStorage`.
- **Dashboard** — balance card (`GET /api/accounts/{id}/balance`) with refresh
  and last-refreshed time.
- **Money Movement** — deposit / withdraw (`/deposit`, `/withdraw`) and transfer
  (`POST /api/transfers` with an `Idempotency-Key`). Balance auto-refreshes
  after every successful operation.
- **Transfer Lookup** — fetch a transfer by ID (`GET /api/transfers/{id}`).
- **Reconciliation** — run a sweep (`POST /api/admin/reconciliation/run`) and
  list breaks (`GET /api/admin/reconciliation/breaks`).
- **Future Auth** — non-functional placeholder.

### Idempotency-key lifecycle (transfers)

- A fresh UUID (`crypto.randomUUID()`, with a fallback) is generated per new
  transfer attempt and sent as the `Idempotency-Key` header.
- A failed/uncertain attempt **keeps the same key**, and a **Retry** button
  re-sends with it — so the backend won't double-apply.
- A **completed** transfer rotates to a new key for the next, distinct transfer.
- **409** → "this key was already used for a different transfer."
- **422** → insufficient funds / currency mismatch / business-rule message.

### Money handling

Amounts are kept as **strings** (e.g. `"100.00"`) and validated with a regex
(`src/utils/money.ts`): accepts `0.01`, `10.00`, `100`, `100.5`, `100.50`;
rejects `abc`, `-10`, `0`, `0.001`. Values are normalized to two decimals before
submit. Balances are **always** read from the backend and only formatted for
display — never computed on the frontend.

## Assumptions made

These were verified against the live backend on 2026-06-22:

1. **`GET /api/health`** returns `{ "status": "UP", "checkedAt": "..." }`. ✅ live.
2. **Balances/amounts arrive as JSON numbers** (e.g. `1776.00`), not strings.
   The UI accepts string **or** number and formats for display; inputs are still
   sent as strings, which the backend accepts. ✅ live.
3. **Transfers use `transferId`** (not `id`) in responses; the UI reads
   `transferId` and falls back to `id`. ✅ live.
4. **`POST /api/accounts` is not deployed yet** — it currently returns `404`
   (accounts `1` and `3` exist but were seeded). The create form is implemented
   exactly as specified and will work once the endpoint ships; until then it
   shows a friendly message pointing you to **"Select an existing account"**
   (try ID `1`). ✅ behavior verified.
5. Confirmed working: `deposit`, `withdraw`, `transfers` (201, with
   `Idempotency-Key`), `transfers/{id}`, `reconciliation/run`,
   `reconciliation/breaks`.

## Tech stack

React 18 · TypeScript · Vite 5 · Tailwind CSS 3. State via React Context +
hooks. No router yet (tabbed shell) — easy to add later.
