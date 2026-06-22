/**
 * Placeholder for future authentication. Intentionally non-functional — there
 * are no users, sessions, or login endpoints on the backend yet. When auth
 * lands, this panel can be replaced by a real login/register flow, and the
 * `useCurrentAccount` hook can be swapped for a session-backed provider.
 */
export function FutureAuthPanel() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            Coming soon
          </span>
          <h3 className="text-sm font-semibold text-slate-800">
            Login &amp; Register
          </h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Authentication is planned. The backend currently has no users,
          sessions, or login endpoints. For now, use the account selector to act
          as an account.
        </p>
      </div>

      {/* Disabled mock form, purely illustrative of the future UX. */}
      <fieldset
        disabled
        aria-hidden="true"
        className="space-y-3 opacity-60"
        title="Authentication is not available yet"
      >
        <div>
          <label className="label-base">Email</label>
          <input
            type="email"
            className="input-base"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="label-base">Password</label>
          <input type="password" className="input-base" placeholder="••••••••" />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 cursor-not-allowed rounded-lg bg-slate-300 px-4 py-2 text-sm font-semibold text-white"
          >
            Sign in
          </button>
          <button
            type="button"
            className="flex-1 cursor-not-allowed rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500"
          >
            Register
          </button>
        </div>
      </fieldset>
    </div>
  );
}
