import { useState } from "react";
import {
  CurrentAccountProvider,
  useCurrentAccount,
} from "./hooks/useCurrentAccount";
import { BalanceProvider } from "./hooks/useBalance";
import { ToastProvider } from "./components/Toast";
import { useLedgerHealth } from "./hooks/useLedgerHealth";
import { AppHeader } from "./components/AppHeader";
import { Card } from "./components/Card";

import { AccountCreate } from "./features/account/AccountCreate";
import { AccountSelector } from "./features/account/AccountSelector";
import { AccountDashboard } from "./features/account/AccountDashboard";
import { DepositForm } from "./features/movement/DepositForm";
import { WithdrawForm } from "./features/movement/WithdrawForm";
import { TransferForm } from "./features/movement/TransferForm";
import { TransferLookup } from "./features/transfers/TransferLookup";
import { ReconciliationPanel } from "./features/reconciliation/ReconciliationPanel";
import { FutureAuthPanel } from "./features/auth/FutureAuthPanel";

/** Tabs are data-driven so adding a future page is a one-line change. */
const TABS = [
  { id: "account", label: "Account" },
  { id: "dashboard", label: "Dashboard" },
  { id: "movement", label: "Money Movement" },
  { id: "lookup", label: "Transfer Lookup" },
  { id: "reconciliation", label: "Reconciliation" },
  { id: "auth", label: "Future Auth" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function App() {
  return (
    <ToastProvider>
      <CurrentAccountProvider>
        <BalanceProvider>
          <Shell />
        </BalanceProvider>
      </CurrentAccountProvider>
    </ToastProvider>
  );
}

function Shell() {
  const { status, lastCheckedAt, refresh } = useLedgerHealth();
  const { account } = useCurrentAccount();
  const [tab, setTab] = useState<TabId>("account");

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader
        status={status}
        lastCheckedAt={lastCheckedAt}
        onRefreshHealth={refresh}
        account={account}
      />

      {/* Tab navigation */}
      <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto" role="tablist">
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "text-brand-700"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t.label}
                  {active && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {tab === "account" && <AccountTab />}
        {tab === "dashboard" && <DashboardTab />}
        {tab === "movement" && <MovementTab />}
        {tab === "lookup" && <LookupTab />}
        {tab === "reconciliation" && <ReconciliationTab />}
        {tab === "auth" && <AuthTab />}
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-2 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
        Ledger-Core console · Learning &amp; portfolio project · Backend may
        cold-start after inactivity.
      </footer>
    </div>
  );
}

/* ----------------------------- Tab contents ----------------------------- */

function AccountTab() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card
        title="Create an account"
        description="Provision a new account to act as. There is no sign-up — this just creates an account record."
      >
        <AccountCreate />
      </Card>
      <Card
        title="Select an existing account"
        description="Enter an account ID to make it your current account."
      >
        <AccountSelector />
      </Card>
    </div>
  );
}

function DashboardTab() {
  return (
    <div className="mx-auto max-w-xl">
      <Card title="Account dashboard" description="Live balance from the backend.">
        <AccountDashboard />
      </Card>
    </div>
  );
}

function MovementTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Deposit" description="Add funds to the current account.">
          <DepositForm />
        </Card>
        <Card title="Withdraw" description="Remove funds from the current account.">
          <WithdrawForm />
        </Card>
      </div>
      <Card
        title="Transfer"
        description="Move money to another account with a safe, retryable idempotency key."
      >
        <div className="mx-auto max-w-lg">
          <TransferForm />
        </div>
      </Card>
    </div>
  );
}

function LookupTab() {
  return (
    <div className="mx-auto max-w-xl">
      <Card
        title="Transfer details lookup"
        description="Fetch a transfer by its ID."
      >
        <TransferLookup />
      </Card>
    </div>
  );
}

function ReconciliationTab() {
  return (
    <Card
      title="Reconciliation"
      description="Run a balance reconciliation sweep and inspect any breaks between ledger-derived and stored balances."
    >
      <ReconciliationPanel />
    </Card>
  );
}

function AuthTab() {
  return (
    <div className="mx-auto max-w-xl">
      <Card title="Authentication" description="Planned for a future release.">
        <FutureAuthPanel />
      </Card>
    </div>
  );
}
