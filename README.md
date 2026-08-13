# Ledger-Core — Frontend Console

A clean, modern banking-style frontend for the **Ledger-Core** backend (a
Spring Boot + PostgreSQL money-movement service). Sign in or register, pick an
account to act as, then deposit, withdraw, transfer, look up transfers, and
(as an admin) run reconciliation.

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
| Session (JWT) state | `src/hooks/useAuth.tsx` + `src/api/session.ts` |
| Reusable UI | `src/components/` |
| Features (account, movement, transfers, reconciliation, auth) | `src/features/` |
| App shell + tab navigation | `src/App.tsx` |

The two files to read first for API work are `src/api/client.ts` and
`src/api/ledgerApi.ts`.

## Auth

Every endpoint except health/register/login requires a bearer token, so the
whole app gates on it (`<Gate>` in `src/App.tsx`):

- **Sign in / register** — `src/features/auth/AuthScreen.tsx`, backed by
  `POST /api/auth/login` and `/register`. The returned `{ token, email, role }`
  is stored via `src/api/session.ts` (localStorage) and mirrored into
  `useAuth()`'s React state.
- **Bearer header** — attached automatically to every non-public request in
  `src/api/client.ts`. Nothing else needs to think about it.
- **Session expiry** — a 401 from any authenticated endpoint clears the stored
  session and fires a `ledger-core:unauthorized` window event; `useAuth`
  listens and drops the app back to the login screen with a short notice.
  Tokens last 24h server-side and there's no refresh endpoint, so this is the
  normal way a long-lived tab re-prompts for login.
- **Roles** — `USER` (default) and `ADMIN`. The Reconciliation tab only
  renders for `ADMIN` sessions; a `USER` never sees it (the backend would
  403 it anyway).

## What it does (feature map)

- **Account** — open an account (`POST /api/accounts`) and/or select an
  existing account by ID; selection persists in `localStorage`.
- **Dashboard** — balance card (`GET /api/accounts/{id}/balance`) with refresh
  and last-refreshed time.
- **Money Movement** — deposit / withdraw (`/deposit`, `/withdraw`) and transfer
  (`POST /api/transfers` with an `Idempotency-Key`). Balance auto-refreshes
  after every successful operation.
- **Transfer Lookup** — fetch a transfer by ID (`GET /api/transfers/{id}`).
- **Reconciliation** *(ADMIN only)* — run a sweep
  (`POST /api/admin/reconciliation/run`) and list breaks
  (`GET /api/admin/reconciliation/breaks`).

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

1. **`GET /api/health`** returns `{ "status": "UP", "checkedAt": "..." }`, and
   stays unauthenticated (used to warm the Render instance before login).
2. **Balances/amounts arrive as JSON numbers** (e.g. `1776.00`), not strings.
   The UI accepts string **or** number and formats for display; inputs are
   still sent as strings, which the backend accepts.
3. **Transfers use `transferId`** (not `id`) in responses; the UI reads
   `transferId` and falls back to `id`.
4. **Reconciliation breaks** use `ledgerDerivedBalance` / `storedBalance` /
   `status` (`OPEN` | `RESOLVED`) / `detectedAt` / `lastDetectedAt` /
   `resolvedAt`, per the backend's documented shape.

## Tech stack

React 18 · TypeScript · Vite 5 · Tailwind CSS 3. State via React Context +
hooks. No router yet (tabbed shell) — easy to add later.
