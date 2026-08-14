import { useState, type FormEvent } from "react";
import { ledgerApi } from "../../api/ledgerApi";
import { useAuth } from "../../hooks/useAuth";
import { useLedgerHealth } from "../../hooks/useLedgerHealth";
import { LoadingButton } from "../../components/LoadingButton";
import { ErrorMessage } from "../../components/ErrorMessage";
import { StatusBadge } from "../../components/StatusBadge";
import { fieldErrorFor, toFriendlyMessage } from "../../utils/errors";

type Mode = "login" | "register";

/**
 * Full-screen gate shown until the user is signed in. Every other endpoint
 * requires a bearer token, so there's nothing meaningful to show before this.
 */
export function AuthScreen({ notice }: { notice?: string | null }) {
  const { setSession } = useAuth();
  const { status } = useLedgerHealth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setClientError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setClientError(null);

    if (mode === "register" && password.length < 8) {
      setClientError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const call = mode === "login" ? ledgerApi.login : ledgerApi.register;
      const session = await call({ email: email.trim(), password });
      setSession(session);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  const emailError = fieldErrorFor(error, "email");
  const passwordError = fieldErrorFor(error, "password") ?? clientError ?? undefined;
  const bannerError =
    error && !emailError && !passwordError ? toFriendlyMessage(error) : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex items-center justify-center gap-2 text-center text-xs font-medium text-slate-500">
          <span>First spin-up may take a moment, please be patient.</span>
          <StatusBadge status={status} />
        </div>

        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 21h18M4 10h16M5 10l7-5 7 5M6 10v8M18 10v8M10 10v8M14 10v8" />
            </svg>
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Ledger-Core
            </h1>
            <p className="text-sm text-slate-500">Money-movement console</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <div
            className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1"
            role="tablist"
          >
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={`rounded-md py-1.5 text-sm font-semibold transition ${
                  mode === m
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {m === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          {notice && !error && (
            <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              {notice}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label-base">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`input-base ${emailError ? "input-error" : ""}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
              <ErrorMessage message={emailError} variant="inline" />
            </div>

            <div>
              <label htmlFor="password" className="label-base">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className={`input-base ${passwordError ? "input-error" : ""}`}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (clientError) setClientError(null);
                }}
                disabled={submitting}
              />
              <ErrorMessage message={passwordError} variant="inline" />
            </div>

            <ErrorMessage message={bannerError} />

            <LoadingButton
              type="submit"
              loading={submitting}
              disabled={!email.trim() || !password}
              className="w-full"
            >
              {mode === "login" ? "Sign in" : "Create account"}
            </LoadingButton>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          {mode === "login" ? "New here? " : "Already registered? "}
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            className="font-medium text-brand-700 hover:text-brand-800 hover:underline"
          >
            {mode === "login" ? "Create an account" : "Sign in instead"}
          </button>
        </p>
      </div>
    </div>
  );
}
